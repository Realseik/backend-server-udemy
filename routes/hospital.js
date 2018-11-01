var express = require("express");
var Hospital = require("../models/hospital");

var auth = require("../middlewares/autenticacion");
var app = express();

// ==================================
// Obtener lista de hospitales
// ==================================
app.get("/", (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({}, "nombre img usuario hospital")
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec(
            (err, hospitales) => {
                if (err) {
                    res.status(500).json({
                        ok: false,
                        mensaje: "Se ha producido un error al leer hospitales",
                        errors: err
                    });
                }
                Hospital.count({},
                    (err, count) => {
                        res.status(200).json({
                            ok: true,
                            hospitales: hospitales,
                            total: count
                        })
                    });
            });
});

// ==================================
// Editar hospital
// ==================================
app.put("/:id", auth.verificarToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar hospitales",
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: "El hospitales no existe",
                errors: {
                    message: "No existe el hospital con id " + id
                }
            });
        }

        if (body.nombre) {
            hospital.nombre = body.nombre;
        }

        hospital.usuario = req.usuario._id;


        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Error al actualizar el hospital",
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });
    });
});

// ==================================
// Borrar hospital
// ==================================
app.delete("/:id", auth.verificarToken, (req, res) => {
    var id = req.params.id;
    Hospital.findByIdAndDelete(id, (err, hospital) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: "Se ha producido un error al borrar el hospital",
                errors: err
            });
        }
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: "El hospital " + id + " no se ha encontrado",
                errors: err
            });
        }
        res.status(200).json({
            ok: true,
            body: hospital
        });
    });
});

// ==================================
// Crear un nuevo hospital
// ==================================
app.post("/", auth.verificarToken, (req, res) => {
    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: "Se ha producido un error al crear el hospitales",
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });
    });
});

module.exports = app;
