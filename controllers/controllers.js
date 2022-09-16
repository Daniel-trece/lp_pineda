const conexion = require('../db.js'); //Llamamos db.js para poder usar la base de datos aquí
const multer = require('multer'); //modulo para carga de archivos
const { uuid } = require("uuidv4"); //modulo para crear los id al azar de 36 caracteres
const express = require ('express');
const session = require('express-session');
const fs = require('fs').promises

// ###############################################################

//                      APARTADO CLIENTES

// ###############################################################

//?ANCHOR INDEX DEL SITIO --VER CLIENTES
function clientes(req,res){
    if(req.session.loggedin){
        conexion.query('SELECT * FROM clientes;', (err,results)=>{
            var cantRegistros = results.length;
            if(err){
                res.send('error al cargar select');
            }
            //res.send(results);
            res.render('users', {
                results
            })
        })
    }else{
        res.redirect('/login')
    }
}
//?ANCHOR ELIMINAR UN CLIENTE DE LA BASE DE DATOS
function deleteCliene(req,res){
    var id = req.params.id;
    conexion.query(`DELETE FROM clientes WHERE ID_usuario = '${id}';`, (err,rows)=>{
        if(err){
            throw err
        }
        res.redirect('/usuarios')
    })
}

// AGREGAR CLIENTE
function insertCliente(req,res){
    const id_cliente = uuid();
    const datos = req.body;
    console.log(datos)
    const query = `INSERT INTO clientes(ID_usuario,nombre_completo,correo,telefono,clave_acceso,fechaExp,membresiaEstatus) VALUES("${id_cliente}","${datos.name}","${datos.correo}","${datos.tel}","${datos.pass}","${datos.fecha}","1")`;
    conexion.query(query, (err,rows)=>{
        try {
            console.log('registrado correctamente')
        } catch (err) {
            console.log(err)
        }
        res.redirect('/usuarios');
    })
}

// ###############################################################

//                      APARTADO PEDIDOS

// ###############################################################

//?ANCHOR VER PEDIDOS

function pedidos (req,res){
    /* WHERE USABLES
        all - todos --'/pedidos/all'
        mbr - con membresia --'/pedidos/mbr'
        sinMbr - sin membresia --'/pedidos/sinMbr'
    */
    var where = req.params.where;
    function titulo(){
        if(where === 'all'){
            return 'Todos los Pedidos'
        }else if(where === 'mbr'){
            return 'Pedidos con Membresía'
        }else if(where === 'sinMbr'){
            return 'Pedidos sin Membresía'
        }
    }
    function whereif(){
        if(where === 'mbr'){ //Si el enlace es /pedidos/mbr ejecutara esta condicion, pedidos con membresia
            return 'WHERE membresia = 1'
        }
        else if(where === 'sinMbr'){ //Si el enlace es /pedidos/sinMbr ejecutara esta condicion, pedidos sin membresia
            return 'WHERE membresia = 0'
        }
    } // WHERE IF es para seleccionar una consulta
    function query(){ // Condición para escoger entre una consulta all y una con condicion
        if(where === 'all'){
            return 'SELECT * FROM pedidos;' // se seleccionara esta consulta si el enlace es /pedidos/all
        }else{
            return `SELECT * FROM pedidos ${condicionwhere};` // se seleccionara esta consulta si el enlace es diferente a /pedidos/all
        }
    }
    var condicionwhere = whereif();
    var consulta = query()
    if(where === 'all' || where === 'mbr' || where === 'sinMbr'){ // Esta condición indica que solo acepta los enlaces de arriba
        conexion.query(consulta,(err,pedidos)=>{
            if (err){
                throw err
            }
            res.render('pedidos',{
                pedidos,
                title:titulo(),
                cantPedidos:pedidos.length
            })
        })
    }else{ // En caso de no ingresar un enlace de arriba
        res.send('esta opcion no está disponible')
    }
}

//?ANCHOR PEDIDO ENVIADO --ELIMINAR PEDIDO
function deletePedido(req,res){
    var id = req.params.id;
    conexion.query(`DELETE FROM pedidos WHERE ID_pedido = '${id}';`, (err,rows)=>{
        if(err){
            res.send('error al eliminar');
        }else{
            res.redirect('/pedidos/all')
        }
    })
}

//?ANCHOR VER PEDIDO
function viewPedido(req,res){
    var id = req.params.id;
    var query = `SELECT * FROM pedidos WHERE ID_pedido = '${id}';`
    conexion.query(query, (err, results)=>{
        res.render('pedido', {
            results
        })
    })
}


// ###############################################################

//                      APARTADO PRODUCTOS

// ###############################################################
//?ANCHOR VER PRODUCTOS
function productos(req,res){
    if(req.session.loggedin){
        conexion.query('SELECT * FROM productos;',(err,productos)=>{
            if(err){
                res.send('error al realizar consulta');
            }
            res.render('index',{
                productos,
                cant:productos.length
            })
        })
    }else{
        res.redirect('/login')
    }
}

//?ANCHOR VER PRODUCTO
function verProducto(req,res){
    if(req.session.loggedin){
        var id = req.params.id;
        conexion.query(`SELECT * FROM productos WHERE ID_producto = '${id}';`,(err,producto)=>{
            if(err){
                res.send('error al buscar producto')
            }else if(producto.length == 0){
                res.send('el producto que buscas no existe')
            }
            res.send(producto[0])
        })
    }else{
        res.redirect('/login')
    }
}

//?ANCHOR DELETE PRODUCTO
function deleteProducto(req,res){
    var id = req.params.id;
    conexion.query(`SELECT url_imagen FROM productos WHERE ID_producto = '${id}';`, (err,img)=>{
        var imgurl = img[0].url_imagen
        conexion.query(`DELETE FROM productos WHERE ID_producto = '${id}';`,(err,rows)=>{
            if(err){
                res.send('error al eliminar producto')
            }else{
                // fs.unlink(`/img/products/${img}`)
                fs.unlink(`./public/img/products/${imgurl}`)
                .then(() => {
                  console.log('File removed')
                }).catch(err => {
                  console.error('Something wrong happened removing the file', err)
                })
                res.redirect('/')
            }
        })
    })
}

//?ANCHOR UPLOAD PRODUCTO
function newProduct (req,res){
    var id = uuid();
    console.log(req.file)
    var img = req.file.filename;
    var datos = req.body;
    var query = `INSERT INTO productos VALUES('${id}','${datos.nombre_producto}','${datos.descripcion}','${img}','${datos.precio_normal}','${datos.precio_mayoreo}','${datos.precio_membresia}','');`
    conexion.query(query,(err,rows)=>{
         if(err){
             res.send('error al registrar')
         }
         res.redirect('/')
     })
}

//?ANCHOR ACTUALIZAR PRODUCTO
function updateProduct (req,res){
    var id = req.params.id;
    var datos = req.body;
    var query = `UPDATE productos SET ? WHERE ID_producto = '${id}';`
    conexion.query(query,[datos],(err,rows)=>{
         if(err){
             throw err
         }
         res.redirect('/productos')
     })
}

// ###############################################################

//                   CONFIGURACIÓN EXTRAS

// ###############################################################

//? VER PRECIOS DE MEMBRESIA Y MENSUALIDAD
function extras(req,res){
    if(req.session.loggedin){
        conexion.query('SELECT * FROM membrecias;',(err,precios)=>{
            if (err){
                throw err
            }
            var precioSuscripcion = precios[0].precio, id_precioSuc = precios[0].ID_pago;
            var precioMensualidad = precios[1].precio, id_precioMbr = precios[1].ID_pago;
            res.render('extras',{
                priceSus:precioSuscripcion,
                id1:id_precioSuc,
                priceMbr:precioMensualidad,
                id2:id_precioMbr,
            })
        })
    }else{
        res.redirect('/login')
    }
}

//? ACTUALIZAR PRECIOS DE MEMBRESIA Y MENSUALIDAD
function extrasUpdate(req,res){
    var dateUpdate = req.body;
    var id = req.params.id;
    conexion.query('UPDATE membrecias SET ? WHERE ID_pago = ?;', [dateUpdate,id], (err,rows)=>{
        if(err){
            throw err;
        }
        res.redirect('/configuracion-extra')
    })
}

// ###############################################################

//                   AUTENTICACIÓN DE USUARIO

// ###############################################################

function login(req,res){
    res.render('login')
}

function auth(req,res){
    var pass = req.body.pass;
    conexion.query(`SELECT * FROM user_auth WHERE pass = '${pass}';`, (err,results)=>{
        if(results.length == 0 || results[0].pass !== pass){
            console.log('correo o contraseña incorrectos');
            res.redirect('/login')
        }else{
            req.session.loggedin = true;
            req.session.name = results[0].ID_usuario;
            console.log('acceso correcto')
            res.redirect('/')
        }
    })
}
function destroySession(req,res){
    req.session.destroy(()=>{
        res.redirect('/login')
    })
}



function redirect404(req,res){
    res.redirect('/error-404')
}

function error404(req,res){
    res.render('error404')
}

module.exports = {
    clientes,
    deleteCliene,
    insertCliente,
    
    pedidos,
    deletePedido,
    viewPedido,

    productos,
    verProducto,
    deleteProducto,
    newProduct,
    updateProduct,

    extras,
    extrasUpdate,

    login,
    auth,
    destroySession,

    redirect404,
    error404
}
