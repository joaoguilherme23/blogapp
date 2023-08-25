const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const app = express();
const mongoose = require('mongoose');
const admin = require("./routes/admin"); // variavel que importa a pasta routes que contem os arquivos de rotas 
const path = require("path");
const session = require('express-session')
const flash = require("connect-flash")



//configurações
    //configuração cookie sessão
    app.use(session({
        secret: "cursodenode",
        resave: true,
        saveUninitialized: true
    }))
    app.use(flash())
    
    //middleware
    app.use((req,res,next)=>{
        res.locals.success_msg = req.flash("success_msg");
        res.locals.error_msg = req.flash("error_msg");
        next()
    })

    // public
    // configuração para o app usar arquivos estaticos atraves da url, pela pasta public
    app.use(express.static(path.join(__dirname,"public"))) 

    //configuração body-parser
    app.use(express.urlencoded({extended: true}));
    app.use(express.json());

    // configuração Handlebars
    app.engine('handlebars', handlebars.engine({defaultLayout:'main'}));
    app.set('view engine', 'handlebars');

    //configuração moongose
    mongoose.Promise = global.Promise; //configuração para evitar erros
    mongoose.connect("mongodb://localhost/blogapp",{}).then((req, res) =>{
        console.log("conectado ao mongoo");
    }).catch((erro)=>{
        console.log("erro ao conectar com o banco:" + erro);
    });


// rotas 
    app.use("/admin",admin);

// outros 

const PORT = 8081
 app.listen(PORT,()=>{
    console.log("servidor rodando na porta: "+ PORT);
 });