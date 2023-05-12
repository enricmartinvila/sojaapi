const express = require('express');
const router = express.Router();

const controller2 = require('../controller/controller2');
const middleware = require('../middleware/middleware');
const controllerAdmin = require('../controller/controllerModoAdmin');


//rutas de enviar correos de recuperar contraseña y de contacto
router.post('/sendContact', controller2.nodemailerthing);
router.post('/nodemailerNewPassword', controller2.nodemailerNewPassword);
router.post('/recuperarcoontramamon', controller2.tokenRecuperacionPasswd);

//rutas inicio de sesion y registro
router.post('/register', controller2.crearRegistro);
router.post('/loginWT', controller2.loginWT);

//rutas de actualizar contraseña en la bbdd y de generar token para recuperar contraseña
router.post('/updateBBDDNewPassword', controller2.updateBBDDNewPassword);
router.post('/recuperarcoontramamon',controller2.tokenRecuperacionPasswd);


router.get('/protected', middleware.protectedMidd, controller2.tokenAcceso);


//Rutas del modo admin
router.get('/modoadminselect',  controllerAdmin.selectModoAdmin);
router.post('/modoadmindelete', controllerAdmin.deleteModoAdmin);
router.post('/actualizarModoAdmin', controllerAdmin.actualizarUsuario);
router.post('/iniciarSesionAdmin', controllerAdmin.loginAdmin);

module.exports = router;