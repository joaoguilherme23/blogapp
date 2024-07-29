const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Usuario');
const Usuario = mongoose.model("usuarios");
const bcrypt = require('bcryptjs')
const passport = require('passport')

router.get("/registro",(req, res)=>{
    res.render("usuarios/registro")

});

router.post("/registro", (req, res)=>{
    const{nome,email, senha, senha2} = req.body
    var erros = []

    if(!nome || nome.trim() ==="" || nome == undefined){
        erros.push({texto: "Nome inválido"})
    }

    if(!email || email.trim() === "" || email == undefined){
        erros.push({texto: "Email inválido"})
    }

    if(!senha || senha.trim() ==="" || senha == undefined ||senha.length <= 4){
        erros.push({texto: "Senha inválida ou muito pequena, digite uma senha maior que 4 digitos"})
    }
    if(senha!= senha2){
        erros.push({texto: "A senhas não são iguais, digite a mesma senha"})
    }
    if(erros.length > 0){
        res.render("usuarios/registro", {erros: erros})
    }

    else{
        Usuario.findOne({email: req.body.email}).then((usuario)=>{
            if(usuario){
                req.flash("error_msg", "Já existe uma conta vinculada a esse email")
                res.redirect("/usuarios/registro")
            }

            else{
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })
                //quero ver hackear isso
                bcrypt.genSalt(10,(erro, salt)=>{
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash)=>{
                        if(erro){
                            req.flash("error_msg", "Houve um erro interno ao salvar o usuario")
                            console.log(erro);
                            res.redirect("/")
                        }
                        novoUsuario.senha = hash
                        novoUsuario.save().then(()=>{
                            req.flash("success_msg","Usuario cadastrado com sucesso")
                            res.redirect("/")
                        }).catch((err)=>{
                            req.flash("error_msg", "Houve um um erro ao cadastrar o usuario, tente novamente")
                            res.redirect("/usuarios/registro")
                        })
                    })

                })
            }
        }).catch((err)=>{
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })   
    }   
});

router.get("/login", (req, res)=>{
    res.render("usuarios/login")
});

// rota de autenticação
router.post("/login", (req, res, next)=>{
    passport.authenticate("local", {
        successRedirect: "/", //caso de tudo certo ele irá redirecionar para a rota "/"
        failureRedirect: "/usuarios/login",
        failureFlash: true
    })(req, res, next)
})

router.get("/logout", (req, res)=>{
    req.logout((err)=>{
        req.flash("success_msg", "Saiu, volte sempre")
        res.redirect("/")
    })
    
})


module.exports = router