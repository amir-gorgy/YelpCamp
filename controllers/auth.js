const User = require("../models/user");

module.exports.registerForm = (req, res) => {
    res.render("auth/register");
};

module.exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ username, email });
        const validatedUser = await User.register(newUser, password);
        console.log(validatedUser);
        req.login(validatedUser, function (err) {
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp!');
            return res.redirect('/campgrounds');
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
};

module.exports.loginForm = (req, res) => {
    res.render("auth/login");
};

module.exports.login = (req, res) => {
    req.flash('success', 'Welcome back!');
    const redirectUrl = res.locals.returnTo || '/campgrounds'; // update this line to use res.locals.returnTo now
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
};