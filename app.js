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


//////////////////////VERSION///////////////////////////////

app.get('/portal/version', isAuth, async (req, res)=> {
    const data = await pool.query('SELECT * FROM versions ORDER BY id ASC');
    res.render('version',{data : data.rows});
});

app.get('/portal/version/new',isAuth,  (req, res)=> {
    res.render('addversion');
});

app.post('/portal/version',isAuth, async (req, res)=> {
    try {
        const {vname} = req.body;
        const {vno} = req.body;
        const {releasedate} = req.body;
        const {comment} = req.body;
        let filername = aname;
        let activebugs = 0;
        const newVersion = await pool.query('INSERT INTO versions (vname,vno, releasedate, comment, filername,  activebugs) VALUES ($1,$2,$3,$4,$5,$6)',
        [vname,vno,releasedate,comment,filername, activebugs]);
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
    const vdata = await pool.query('SELECT vno FROM versions ORDER BY id ASC')
    res.render('addbug', {vdata : vdata.rows});
});

app.post('/portal/bug', isAuth, async(req, res)=>{
    try {
        const {bname} = req.body;
        const {vno} = req.body;
        const {bugdate} = req.body;
        const {bugpriority} = req.body;
        const {comment} = req.body;
        const {bugtype} = req.body;
        let filername = aname;
        let bugstatus = 'active';
        const newBug = await pool.query('INSERT INTO bugs (bname, vno, bugdate, filername, bugpriority, comment, bugtype, bugstatus) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
        [bname, vno, bugdate, filername, bugpriority, comment, bugtype, bugstatus]);
        update(vno);
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
        const getvno = await pool.query('SELECT vno FROM bugs WHERE id=$1',
        [id]);
        let vno = getvno.rows[0].vno;
        update(vno);
        res.redirect('/portal/bug')
    } catch(err){
        console.log(err.message);
        res.send(err.message);
    }

})

async function update(vno) {
    try{
        check = 'active'
        const getCount = await pool.query('SELECT COUNT(*) FROM bugs WHERE bugstatus=$1 AND vno=$2',
        [check, vno]);
        activebug = Number(getCount.rows[0].count)
        const update = await pool.query('UPDATE versions SET activebugs=$1 WHERE vno=$2',
        [activebug, vno])
        

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

