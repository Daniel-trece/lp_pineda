const mysql = require('mysql');
var conexion = mysql.createConnection({
    host: process.env.HOST_DB || 'mysql-lpporte.alwaysdata.net',
    database: process.env.NAME_DB || 'lpporte_db',
    user: process.env.USER_DB || 'lpporte',
    password: process.env.PASS_DB || 'lp_31#/98>porte!32'
});

module.exports = conexion