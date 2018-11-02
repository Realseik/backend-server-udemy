var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var app = express();
var SEED = require('../config/config').SEED;
var Usuario = require('../models/usuario');

// Google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

// ===================================
// Autenticacion de Google
// ===================================
app.post('/google', (req, res) => {

    var token = req.body.token;

    verify(token)
        .then(googleUser => {
            Usuario.findOne({ email: googleUser.email }, (err, usuarioBD) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al buscar usuarios',
                        errors: err
                    })
                }

                if (usuarioBD) {
                    if (usuarioBD.google === false) {
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'El email no se ha registrado con Google. Use la autenticacion normal',
                            errors: err
                        })
                    } else {
                        var token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: '7d' })
                        return res.status(200).json({
                            ok: true,
                            usuario: usuarioBD,
                            token: token,
                            id: usuarioBD._id
                        })
                    }
                } else {
                    // El usuario no existe; lo creamos
                    var user = new Usuario();
                    user.nombre = googleUser.nombre;
                    user.img = googleUser.picture;
                    user.email = googleUser.email;
                    user.role = 'USER_ROLE';
                    user.password = ":)";
                    user.google = true;

                    user.save((err, usuarioBD) => {

                        if (err) {
                            return res.status(400).json({
                                ok: false,
                                mensaje: "Error al crear el usuario",
                                errors: err
                            });
                        }
                        var token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: '7d' })
                        return res.status(200).json({
                            ok: true,
                            usuario: usuarioBD,
                            token: token,
                            id: usuarioBD._id
                        })
                    });

                }
            })
        })
        .catch(err => {
            return res.status(403).json({
                ok: false,
                mensaje: 'token no valido',
            })
        })



});



// ===================================
// Autenticacion normal
// ===================================
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