var jwt = require("jsonwebtoken");
// var SEED = require('../config/config').SEED;

// ==================================
// verificar token
// ==================================
exports.verificarToken = function(req, res, next) {
  var token = req.query.token;
  jwt.verify(token, "control", (err, decoded) => {
    // SEED
    if (err) {
      return res.status(401).json({
        ok: false,
        mensaje: "token incorrecto",
        errors: err
      });
    }
    req.usuario = decoded.usuario;
    next();
  });
};
