const express = require('express');
const app = express();
const pool = require('./db');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));

app.get('/', (req, res)=> {
    res.render('home');
});


app.get('/login', (req, res)=> {
    if(isLoggedIn) {
        res.redirect('/portal');
    } else {
    res.render('login');
}
});

let isLoggedIn = false;

var aname;
app.post('/login',(req, res)=> {
    let {username} = req.body;
    aname = username;
    let {password} = req.body;
    if(isLoggedIn) {
        res.redirect('/portal');
    } else if(username === 'test' && password === 'test') {
        isLoggedIn = true;
        res.redirect('/portal');
    } else {
        res.redirect('/login');
    }
});

app.get('/logout', (req, res)=> {
    if(isLoggedIn) {
        isLoggedIn = false;
        res.redirect('/login');
    } else {
        res.redirect('back');
    }
    
})



app.get('/portal',isAuth, (req, res)=> {
    res.render('portal');
})



app.get('/portal/project', isAuth, async(req, res)=> {
    const data = await pool.query('SELECT * FROM projects ORDER BY id ASC');
    res.render('project', {data : data.rows});
});

app.get('/portal/project/new',isAuth,  (req, res)=> {
    res.render('addproject');
});

app.post('/portal/project', isAuth, async(req, res)=>{
    try{
        const {pname} = req.body;
        const {startdate} = req.body;
        const {description} = req.body;
        const newProject = await pool.query('INSERT INTO projects(pname, startdate, description) VALUES ($1, $2, $3)',
        [pname, startdate, description]);
        res.redirect('/portal/project');
    } catch(err){   
        console.error(err.message);
    }
});


app.post('/portal/project/select', isAuth, async(req, res)=>{
    const {pname} = req.body;
    console.log(pname);
    res.redirect('/portal/project/'+pname);
});

app.get('/portal/project/:pname', isAuth, async(req, res)=>{
    const {pname} = req.params;
    res.render('sproject', {pname : pname});
});

app.get('/portal/project/:pname/version', isAuth, async(req, res)=> {
    try {
        const {pname} = req.params;
        const data = await pool.query('SELECT * FROM versions WHERE pname=$1',[pname]);
        res.render('pversion',{data : data.rows, pname : pname})
    } catch (error) {
        console.log(error)
    }
});

app.get('/portal/project/:pname/bug', isAuth, async(req, res)=> {
    try {
        const {pname} = req.params;
        const data = await pool.query('SELECT bugs.* FROM bugs INNER JOIN versions ON (bugs.vid = versions.id) WHERE versions.pname=$1',[pname]);
        res.render('pbugs',{data : data.rows, pname : pname})
    } catch (error) {
        console.log(error)
    }
});

//////////////////////VERSION///////////////////////////////

app.get('/portal/version', isAuth, async (req, res)=> {
    const data = await pool.query('SELECT * FROM versions ORDER BY id ASC');
    res.render('version',{data : data.rows});
});

app.get('/portal/version/new',isAuth,  async(req, res)=> {
    const pdata = await pool.query('SELECT pname FROM projects ORDER BY id ASC')
    res.render('addversion', {pdata : pdata.rows});
});

app.post('/portal/version',isAuth, async (req, res)=> {
    try {
        const {vname} = req.body;
        const {pname} = req.body;
        const {vno} = req.body;
        const {releasedate} = req.body;
        const {comment} = req.body;
        let filername = aname;
        let activebugs = 0;
        const newVersion = await pool.query('INSERT INTO versions (vname, pname, vno, releasedate, comment, filername,  activebugs) VALUES ($1,$2,$3,$4,$5,$6,$7)',
        [vname,pname,vno,releasedate,comment,filername, activebugs]);
        res.redirect('/portal/version');
    } catch(err) {
        console.log(err.message);
        res.send(err.message);
    
    }
});

app.get('/portal/version/edit',isAuth, (req, res) => {
    res.render('editversion');
})

app.put('/portal/version', isAuth,async (req, res) => {
    try {
        const {id} = req.body;
        const {vname} = req.body;
        const {vno} = req.body;
        const {releasedate} = req.body;
        const {comment} = req.body;
        const updateVErsion = await pool.query('UPDATE versions SET vname = $1, vno = $2, releasedate = $3, comment = $4 WHERE id = $5',
        [vname, vno, releasedate, comment, id]);
        res.redirect('/portal/version');
    } catch (err) {
        console.log(err.message);
        res.send(err.message);
    }
})

app.get('/portal/bug', isAuth, async (req, res)=> {
    const data = await pool.query('SELECT * FROM bugs ORDER BY id ASC');
    res.render('bug',{data : data.rows});
});

app.get('/portal/bug/new',isAuth,  async(req, res)=> {
    const vdata = await pool.query('SELECT id FROM versions ORDER BY id ASC');
    // console.log(vdata.rows);
    res.render('addbug', {vdata : vdata.rows});
});

app.post('/portal/bug', isAuth, async(req, res)=>{
    try {
        const {bname} = req.body;
        const {vid} = req.body;
        const {bugdate} = req.body;
        const {bugpriority} = req.body;
        const {comment} = req.body;
        const {bugtype} = req.body;
        let filername = aname;
        let bugstatus = 'active';
        const newBug = await pool.query('INSERT INTO bugs (bname, vid, bugdate, filername, bugpriority, comment, bugtype, bugstatus) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
        [bname, vid, bugdate, filername, bugpriority, comment, bugtype, bugstatus]);
        update(vid);
        res.redirect('/portal/bug');
    } catch(err) {
        console.log(err.message);
        res.send(err.message);
    
    }
})

app.get('/portal/bug/modify', isAuth, (req, res)=>{
    res.render('modifybug');
})

app.put('/portal/bug', isAuth, async(req, res)=>{
    try{
        const {id} = req.body;
        const {bugstatus} = req.body;
        const updateBug = await pool.query('UPDATE bugs SET bugstatus=$1 WHERE id=$2',
        [bugstatus, id]);
        const getvid = await pool.query('SELECT vid FROM bugs WHERE id=$1',
        [id]);
        let vid = getvid.rows[0].vid;
        update(vid);
        res.redirect('/portal/bug')
    } catch(err){
        console.log(err.message);
        res.send(err.message);
    }

})

async function update(vid) {
    try{
        check = 'active'
        const getCount = await pool.query('SELECT COUNT(*) FROM bugs WHERE bugstatus=$1 AND vid=$2',
        [check, vid]);
        activebug = Number(getCount.rows[0].count)
        const update = await pool.query('UPDATE versions SET activebugs=$1 WHERE id=$2',
        [activebug, vid])
        

    }catch(err)
    {
        console.log(err.message);
        res.send(err.message);
    }
}
function isAuth(req, res, next) {
    if(isLoggedIn) {
        return next();
    } else {
        res.redirect('/login');
    }
}


app.get('*', (req, res) => {
    res.json("Wrong URL please go back!!");
});

app.listen(3000, ()=> console.log('server running'));

