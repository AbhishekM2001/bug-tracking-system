

const Pool = require('pg').Pool;

const pool = new Pool ({
    user: "postgres",
    password: "ujjwal",
    host : "localhost",
    port : 5432,
    database : "bug_tracking"
});

module.exports = pool;
