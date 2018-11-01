var express = require("express");
var bcrypt = require("bcryptjs");
var Usuario = require("../models/usuario");

var auth = require("../middlewares/autenticacion");
var app = express();

// ==================================
// Obtener lista de usuarios
// ==================================
app.get("/", (req, res, next) => {
  var desde = req.query.desde || 0;
  desde = Number(desde);

  Usuario.find({}, "nombre email img role")
    .skip(desde)
    .limit(5)
    .exec(
      (err, usuarios) => {
        if (err) {
          res.status(500).json({
            ok: false,
            mensaje: "Se ha producido un error al leer usuarios",
            errors: err
          });
        }

        Usuario.count({},
          (err, count) => {
            res.status(200).json({
              ok: true,
              usuarios: usuarios,
              total: count
            })
          })
      });
});

// ==================================
// Editar usuario
// ==================================
app.put("/:id", auth.verificarToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;

  Usuario.findById(id, (err, usuario) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar usuarios",
        errors: err
      });
    }

    if (!usuario) {
      return res.status(400).json({
        ok: false,
        mensaje: "El usuarios no existe",
        errors: {
          message: "No existe el usuario con id " + id
        }
      });
    }

    if (usuario.nombre) {
      usuario.nombre = body.nombre;
    }
    if (body.email) {
      usuario.email = body.email;
    }
    if (body.role) {
      usuario.role = body.role;
    }

    usuario.save((err, usuarioGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al actualizar el usuario",
          errors: err
        });
      }
      usuarioGuardado.password = "SECRET";
      res.status(200).json({
        ok: true,
        usuario: usuarioGuardado
      });
    });
  });
});

// ==================================
// Borrar usuario
// ==================================
app.delete("/:id", auth.verificarToken, (req, res) => {
  var id = req.params.id;
  Usuario.findByIdAndDelete(id, (err, usuario) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: "Se ha producido un error al borrar el usuario",
        errors: err
      });
    }
    if (!usuario) {
      return res.status(400).json({
        ok: false,
        mensaje: "El usuario " + id + " no se ha encontrado",
        errors: err
      });
    }
    res.status(200).json({
      ok: true,
      body: usuario
    });
  });
});

// ==================================
// Crear un nuevo usuario
// ==================================
app.post("/", auth.verificarToken, (req, res) => {
  var body = req.body;

  var usuario = new Usuario({
    nombre: body.nombre,
    email: body.email,
    img: body.img,
    password: bcrypt.hashSync(body.password, 10),
    role: body.role
  });

  usuario.save((err, usuario) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: "Se ha producido un error al crear el usuarios",
        errors: err
      });
    }
    res.status(201).json({
      ok: true,
      body: usuario,
      usuariotoken: req.usuario
    });
  });
});

module.exports = app;
