// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Inicializar variables
var app = express();

// Body Parser
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());


// Conexión a la base de datos
// Las bases de datos vacias son borradas por mongoDB. Mongoose la crea si no existe.
mongoose.connection.openUri('mongodb://localhost:27017/HospitalDB', (err, res) => {
    if (err) {
        throw err
    }
    console.log('Base de datos HospitalDB: \x1b[32m%s\x1b\[0m', 'online')
});


// Importar Rutas
var appRoutes = require('./routes/app');
var appRoutesUsuario = require('./routes/usuario');
var appLogin = require('./routes/login');
var appHospital = require('./routes/hospital');
var appMedico = require('./routes/medico');
var appBusqueda = require('./routes/busqueda');
var appUpload = require('./routes/upload');
var appImagenes = require('./routes/imagenes');

// Escuchar peticiones
app.listen(3000, () => {
    console.log('Express en puerto 3000: \x1b[32m%s\x1b\[0m', 'online')
});

// Rutas
app.use('/usuario', appRoutesUsuario);
app.use('/login', appLogin);
app.use('/hospital', appHospital);
app.use('/medico', appMedico);
app.use('/busqueda', appBusqueda);
app.use('/upload', appUpload);
app.use('/img', appImagenes);
app.use('/', appRoutes);