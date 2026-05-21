const express = require('express')
const router = express.Router()
const catchAsync = require('../utils/catchAsync.js')
const User = require('../models/user.js')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const { isLoggedIn, storeReturnTo } = require('../middleware.js')
const users = require('../controllers/users.js')


router.route('/register')
    .get(users.renderReg)
    .post(catchAsync(users.Reg))

router.route('/login')
    .get(users.renderLogin)
    .post(storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)

router.get('/logout', users.logout)

module.exports = router