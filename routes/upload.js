var express = require('express');
var fs = require('fs');
const fileUpload = require('express-fileupload');
var app = express();
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');
app.use(fileUpload());

app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Peticion realizada correctamente'
    })
})

app.put('/:tipo/:id', function (req, res) {
    var tipo = req.params.tipo;
    var id = req.params.id;

    var tiposValidos = ['usuarios', 'hospitales', 'medicos'];
    if (tiposValidos.indexOf(tipo.toLowerCase()) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo no valido',
            erros: {
                message: 'Los tipos validos son: usuarios, hospitales, medicos'
            }

        })
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No se han enviado ficheros',
            erros: {
                message: 'No ha seleccionado ningun fichero'
            }

        })
    }

    var archivo = req.files.imagen;
    var splitNombre = archivo.name.split('.');
    var extension = splitNombre[splitNombre.length - 1];
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
    if (extensionesValidas.indexOf(extension.toLowerCase()) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no valida',
            erros: {
                message: 'Las extensiones validas son: png, jpg, gif, jpeg'
            }

        })
    }

    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;
    var path = `./uploads/${tipo}/${nombreArchivo}`;
    archivo.mv(path, function (err) {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al subir el archivo',
                erros: err
            })
        }

        subirPorTipo(tipo, id, nombreArchivo, res);

    })
})




function subirPorTipo(tipo, id, nombreArchivo, res) {
    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {
            if (err) {
                borrarFichero('./uploads/usuarios/' + nombreArchivo);
                return res.status(500).json({
                    ok: false,
                    mensaje: "Error al buscar usuarios",
                    errors: err
                });
            }

            if (!usuario) {
                borrarFichero('./uploads/usuarios/' + nombreArchivo);
                return res.status(400).json({
                    ok: false,
                    mensaje: "El usuarios no existe",
                    errors: {
                        message: "No existe el usuario con id " + id
                    }
                });
            }

            var pathViejo = './uploads/usuarios/' + usuario.img;
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: "Error al actualizar la imagen del usuario",
                        errors: err
                    });
                }
                usuarioActualizado.password = "SECRET";
                return res.status(200).json({
                    ok: true,
                    mensaje: "Imagen del usuario actualizada correctamente",
                    usuario: usuarioActualizado
                });
            });

        })
    }
    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {
            if (err) {
                borrarFichero('./uploads/medicos/' + nombreArchivo);
                return res.status(500).json({
                    ok: false,
                    mensaje: "Error al buscar medicos",
                    errors: err
                });
            }

            if (!medico) {
                borrarFichero('./uploads/medicos/' + nombreArchivo);
                return res.status(400).json({
                    ok: false,
                    mensaje: "El medico no existe",
                    errors: {
                        message: "No existe el medico con id " + id
                    }
                });
            }

            var pathViejo = './uploads/medicos/' + medico.img;
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: "Error al actualizar la imagen del medico",
                        errors: err
                    });
                }
                medicoActualizado.password = "SECRET";
                return res.status(200).json({
                    ok: true,
                    mensaje: "Imagen del medico actualizada correctamente",
                    medico: medicoActualizado
                });
            });

        })
    }
    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {
            if (err) {
                borrarFichero('./uploads/hospitales/' + nombreArchivo);
                return res.status(500).json({
                    ok: false,
                    mensaje: "Error al buscar hospitales",
                    errors: err
                });
            }

            if (!hospital) {
                borrarFichero('./uploads/hospitales/' + nombreArchivo);
                return res.status(400).json({
                    ok: false,
                    mensaje: "El hospital no existe",
                    errors: {
                        message: "No existe el hospital con id " + id
                    }
                });
            }

            var pathViejo = './uploads/hospitales/' + hospital.img;
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: "Error al actualizar la imagen del hospital",
                        errors: err
                    });
                }
                hospitalActualizado.password = "SECRET";
                return res.status(200).json({
                    ok: true,
                    mensaje: "Imagen del hospital actualizada correctamente",
                    hospital: hospitalActualizado
                });
            });

        })
    }
}

function borrarFichero(ruta) {
    if (fs.existsSync(ruta)) {
        fs.unlink(ruta);
    }
}
module.exports = app;