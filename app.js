// Requires
var express = require('express');
var mongoose = require('mongoose');

// Inicializar variables
var app = express();

// Conexión a la base de datos
// Las bases de datos vacias son borradas por mongoDB. Mongoose la crea si no existe.
mongoose.connection.openUri('mongodb://localhost:27017/HospitalDB', (err, res) => {
    if (err) {
        throw err
    }
    console.log('Base de datos HospitalDB: \x1b[32m%s\x1b\[0m', 'online')
});


// rutas
app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Peticion realizada correctamente'
    })
})

// Escuchar peticiones
app.listen(3000, () => {
    console.log('Express en puerto 3000: \x1b[32m%s\x1b\[0m', 'online')
});