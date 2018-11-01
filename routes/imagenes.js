var express = require('express');
var path = require('path');
var fs = require('fs');

var app = express();

app.get('/:tipo/:img', (req, res, next) => {

    var tipo = req.params.tipo;
    var img = req.params.img;

    var pathImagen = path.resolve(__dirname, `../uploads/${tipo}/${img}`)


    if (fs.existsSync(pathImagen)) {
        res.sendfile(pathImagen);
    } else {
        var pathNoImagen = path.resolve(__dirname, `../assets/no-img.jpg`)
        res.sendfile(pathNoImagen);
    }
})

module.exports = app;