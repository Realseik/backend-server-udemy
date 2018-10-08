var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var app = express();
// var SEED = require('../config/config').SEED;
var Usuario = require('../models/usuario');

app.post('/', (req, res) => {

    let body = req.body;

    Usuario.findOne({
            email: body.email
        },
        (err, usuarioBD) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar usuarios',
                    errors: err
                })
            }
            if (!usuarioBD) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Usuario no encontrado',
                    errors: err
                })
            }

            if (!bcrypt.compareSync(body.password, usuarioBD.password)) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Contraseña incorrecta',
                    errors: err
                })
            }

            // Todo OK, creamos un token
            usuarioBD.password = '';
            var token = jwt.sign({
                usuario: usuarioBD
            }, 'control', { // SEED
                expiresIn: '7d'
            })

            return res.status(200).json({
                ok: true,
                usuario: usuarioBD,
                token: token,
                id: usuarioBD._id
            })
        })

})




module.exports = app;