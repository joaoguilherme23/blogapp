const localStrategy = require('passport-local').Strategy
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

require('../models/Usuario')
const Usuario = mongoose.model("usuarios")

module.exports = function(passport){
    passport.use(new localStrategy({usernameField: 'email', passwordField: "senha"}, (email, senha, done)=>{
        // passwordField foi usado pois estamos lidando com a lingua portugues e os campos no html estão como "senha" e n "password"
        Usuario.findOne({email: email}).then((usuario)=>{
            if(!usuario){
                return done(null, false, {message: "Essa usuario não existe"})
            }
           bcrypt.compare(senha, usuario.senha, (erro, batem)=>{
            if(batem){
                return done(null, usuario)
            }
            else{
                return done(null, false, {message: "Senha inválida"})
            }
           })

        }).catch((err)=>{
            req.flash("error_msg", "Houve um erro interno")
        })
    }))

    passport.serializeUser((usuario, done)=>{
        done(null, usuario.id)
    })

    passport.deserializeUser((id, done)=>{
        Usuario.findById(id).then(usuario =>{
            done(null, usuario)
        }).catch(err =>{
            done(err, null)
        })
        
    })



}