const User = require('../../models/user');
const bcrypt = require('bcrypt');
const passport = require('passport');

function authController() {
    _getRedirectUrl= (req)=> {
        return req.user.role === 'admin' ? '/admin/orders' : '/';
    }

    return {
        login(req, res) {
            res.render('auth/login');
        },

        postLogin(req, res, next) {
            const { email, password } = req.body;

            //Vaidate request
            if (!email || !password) {
                req.flash('error', 'All fields are required!');
                return res.redirect('/login');
            }

            passport.authenticate('local', (error, user, info) => {
                if (error) {
                    req.flash('error', info.message);
                    return next(error);
                }
                if (!user) {
                    req.flash('error', info.message);
                    return res.redirect('/login');
                }
                req.logIn(user, (error) => {
                    if (error) {
                        req.flash('error', info.messages);
                        return next(error);
                    }
                    return res.redirect(_getRedirectUrl(req));
                })
            })(req, res, next)
        },

        register(req, res) {
            res.render('auth/register');
        },

        async postRegister(req, res) {
            const { name, email, password } = req.body;

            //Validate request
            if (!name || !email || !password) {
                req.flash('error', 'All fields are required!');
                req.flash('name', name);
                req.flash('email', email);
                return res.redirect('/register');
            }

            //Check if email exists
            User.exists({ email: email }, (err, result) => {
                if (result) {
                    req.flash('error', 'Email already taken!');
                    req.flash('name', name);
                    req.flash('email', email);
                    return res.redirect('/register');
                }
            })

            //Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            //Create a user
            const user = new User({
                name: name,
                email: email,
                password: hashedPassword,
            })

            user.save().then(() => {
                //Login
                return res.redirect('/');
            }).catch(err => {
                req.flash('error', 'Something went wrong!');
                return res.redirect('/register');
            })
        },


        logout(req, res) {
            req.logout(function (err) {
                if(err)
                {
                    return next(err); 
                }

                res.redirect('/login');
            });
        }
    }
}


module.exports = authController;