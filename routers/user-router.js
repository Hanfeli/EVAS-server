const express = require('express');
const { check } = require('express-validator')
const checkJwt = require('../utils/check-jwt.js')
const userControllers = require('../controllers/user-controller.js');


const router = express.Router();

router.get('/user', checkJwt,userControllers.getUser)

router.post(
    '/createUser',
    [
        check('username').not().isEmpty(),
        check('email').normalizeEmail().isEmail(),
        check('password').isLength({min: 6})
    ],
    userControllers.createUser);

router.post(
    '/login',
    [
        check('name').not().isEmpty(),
        check('password').isLength({min: 6})
    ],
    userControllers.login);

router.post(
    '/search',
    userControllers.searchUser);

router.put(
    '/update',
    checkJwt,
    userControllers.updateUser);

module.exports = router;