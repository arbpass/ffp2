const LocalStartegy= require('passport-local').Strategy
const User= require('../models/user')
const bcrypt= require('bcrypt')

function init(passport) {
    passport.use(new LocalStartegy({ usernameField: 'email' }, async (email, password, done)=> {
        //Login
        //Check if email exist
        const user= await User.findOne({ email: email });
        if(!user) {
            return done(null, false, { message: 'No user with this Email' });
        }

        bcrypt.compare(password, user.password).then(match=> {
            if(match)
            {
                return done(null, user, { message: 'Logged In successfully' });
            }
            return done(null, false, { message: 'Wrong username or password' });
        }).catch(err=> {
            done(null, false, { message: 'Something went wrong' });
        })

    }))

    passport.serializeUser((user, done)=> {
        done(null, user._id);
    })

    passport.deserializeUser((id, done)=> {
        User.findById(id, (err, user)=> {
            done(err, user);
        })
    })

}

module.exports= init;