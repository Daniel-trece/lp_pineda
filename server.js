
const bodyParser = require('body-parser');
const rutas = require('./routes/routes.js');
const express = require('express');
const session = require('express-session')
const app = express();
const multer = require('multer'); //modulo para carga de archivos

//? MIDLEWARES --CONFIGURACIONES
//Para traer datos de un formulario
app.use(bodyParser.urlencoded({
    extended:true
}));
app.use(session({ 		//Usuage
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
}));

app.set('view engine', 'ejs')
app.use(express.static('public'))
//Para carga de imagenes

const port = process.env.PORT
const host = process.env.HOST
//? CONEXIÓN DE BASE DE DATOS MYSQL
//Llamada de la base de datos desde su archivo db.js
const conexion = require('./db.js')

//Comprobamos la conexión de la base de datos.
conexion.connect(function(err){
    if(err){
        console.log('Error de conexión en db')
    }
    console.log('DB conectad correctamente')
})

//? USO DE RUTAS
app.use('/', rutas);

//? INICIADOR DEL SERVIDOR
app.listen(port, host, () =>{
    console.log(`Servidor corriendo en el host: ${host} y el puerto: ${port}.`)
})
