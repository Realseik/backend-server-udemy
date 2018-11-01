var express = require('express');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');
var app = express();


// ==================================
// Busqueda por coleccion
// ==================================
app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    var regex = new RegExp(busqueda, 'i');
    var promise;

    switch (tabla) {
        case 'hospitales':
            promise = buscarHospitales(busqueda, regex);
            break;
        case 'medicos':
            promise = buscarMedicos(busqueda, regex);
            break;
        case 'usuarios':
            promise = buscarUsuarios(busqueda, regex);
            break;
        default:
            return res.status(400).json({
                ok: false,
                mensaje: "La tabla " + tabla + ' no existe'
            });
    }

    promise.then(data => {
        res.status(200).json({
            ok: true,
            [tabla]: data
        });
    })

})




// ==================================
// Busqueda general
// ==================================
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    Promise.all([
        buscarHospitales(busqueda, regex),
        buscarMedicos(busqueda, regex),
        buscarUsuarios(busqueda, regex)
    ])
        .then(
            respuestas => {
                res.status(200).json({
                    ok: true,
                    hospitales: respuestas[0],
                    medicos: respuestas[1],
                    usuarios: respuestas[2]
                })
            }
        )

})





function buscarHospitales(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({ 'nombre': regex }, 'nombre')
            .populate('usuario', 'nombre email')
            .exec((err, usuarios) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(usuarios);
                }
            })
    })
}

function buscarMedicos(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {

                if (err) {
                    reject(err);
                } else {
                    resolve(medicos);
                }
            })
    })
}

function buscarUsuarios(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(usuarios);
                }
            })
    });
}


module.exports = app;
