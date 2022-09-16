const express = require('express')
const router = express.Router()
const controllers = require('../controllers/controllers.js')

const multer = require('multer'); //modulo para carga de archivos
const { application } = require('express');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/img/products/') //Seleccionamos la ruta de destino
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname) //agregamos el nombre del archivo
    }
  })
const upload = multer({ storage: storage }) //guardamos la configuración anterior en uploads

router.get('/', (req,res)=>{res.redirect('/productos')})
router.get('/usuarios', controllers.clientes);
router.post('/delete-cliente/:id', controllers.deleteCliene);
router.post('/insert-cliente', controllers.insertCliente);

router.get('/pedidos/:where', controllers.pedidos);
router.get('/pedido/:id', controllers.viewPedido);
router.post('/delete-pedido/:id', controllers.deletePedido);

router.get('/productos', controllers.productos);
router.post('/update-producto/:id', controllers.updateProduct);
router.post('/delete-producto/:id', controllers.deleteProducto);
router.post('/uppload-producto', upload.single('imagen-product'), controllers.newProduct);

router.get('/configuracion-extra', controllers.extras);
router.post('/update-precio/:id', controllers.extrasUpdate);

router.get('/login', controllers.login);
router.post('/auth',controllers.auth);
router.post('/salir-admin',controllers.destroySession);

router.get('/error-404',controllers.error404);
router.get('*',controllers.redirect404);

module.exports = router;
