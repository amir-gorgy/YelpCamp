const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const passport = require("passport");
const { storeReturnTo } = require("../middleware");
const auth = require("../controllers/auth");

router.route('/register')
    .get(auth.registerForm)
    .post(catchAsync(auth.register));


router.route('/login')
    .get(auth.loginForm)
    .post(// use the storeReturnTo middleware to save the returnTo value from session to res.locals
        storeReturnTo,
        // passport.authenticate logs the user in and clears req.session
        passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }),
        // Now we can use res.locals.returnTo to redirect the user after login
        auth.login);

router.get('/logout', auth.logout);

module.exports = router;