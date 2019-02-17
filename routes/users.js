var express = require('express');
var router_before_login = express.Router();
var router_after_login = express.Router();
var userController = require('../controllers/user-controller.js');

/* GET users listing. */
router_before_login.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router_before_login.post('/register', userController.register);

router_before_login.get('/session', userController.checkSession);

router_before_login.post('/login', userController.login);

router_after_login.get('/logout', userController.logout)

router_after_login.post("/createStudentsAccount",userController.createStudentsAccount)

router_after_login.post("/changePassword",userController.changePassword)


module.exports = {
  beforeLogin: router_before_login,
  afterLogin: router_after_login
};