var express = require("express");
var Medico = require("../models/medico");

var auth = require("../middlewares/autenticacion");
var app = express();

// ==================================
// Obtener lista de medicos
// ==================================
app.get("/", (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({}, "nombre img usuario hospital")
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital', 'nombre')
        .exec(
            (err, medicos) => {
                if (err) {
                    res.status(500).json({
                        ok: false,
                        mensaje: "Se ha producido un error al leer medicos",
                        errors: err
                    });
                }
                Medico.count({},
                    (err, count) => {
                        res.status(200).json({
                            ok: true,
                            medicos: medicos,
                            total: count
                        })
                    });
            });
});

// ==================================
// Editar medico
// ==================================
app.put("/:id", auth.verificarToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar medicos",
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: "El medicos no existe",
                errors: {
                    message: "No existe el medico con id " + id
                }
            });
        }

        medico.nombre = body.nombre;
        medico.hospital = body.hospital;
        medico.usuario = req.usuario._id;

        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Error al actualizar el medico",
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });
    });
});

// ==================================
// Borrar medico
// ==================================
app.delete("/:id", auth.verificarToken, (req, res) => {
    var id = req.params.id;
    Medico.findByIdAndDelete(id, (err, medico) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: "Se ha producido un error al borrar el medico",
                errors: err
            });
        }
        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: "El medico " + id + " no se ha encontrado",
                errors: err
            });
        }
        res.status(200).json({
            ok: true,
            body: medico
        });
    });
});

// ==================================
// Crear un nuevo medico
// ==================================
app.post("/", auth.verificarToken, (req, res) => {
    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        hospital: body.hospital,
        usuario: req.usuario._id
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: "Se ha producido un error al crear el medicos",
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            medico: medicoGuardado,
        });
    });
});

module.exports = app;
