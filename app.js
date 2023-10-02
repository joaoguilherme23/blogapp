const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const app = express();
const mongoose = require('mongoose');
const admin = require("./routes/admin"); // variavel que importa a pasta routes que contem os arquivos de rotas 
const path = require("path");
const session = require('express-session')
const flash = require("connect-flash")
require("./models/Postagem")
const Postagem = mongoose.model("postagens")
const usuarios = require("./routes/usuario");
const passport = require('passport');
require("./config/auth")(passport)



//configurações


    //configuração cookie sessão
    app.use(session({
        secret: "cursodenode",
        resave: true,
        saveUninitialized: true
    }))

    //configuração passport
    app.use(passport.initialize())
    app.use(passport.session())
    app.use(flash())
    
    //middleware
    app.use((req,res,next)=>{
        res.locals.success_msg = req.flash("success_msg");
        res.locals.error_msg = req.flash("error_msg");
        res.locals.error = req.flash("error");
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
    app.get("/",(req, res)=>{
        Postagem.find().lean().populate("categoria").sort({data: "desc"}).then((postagens)=>{
            res.render("index",{postagens: postagens})    
        }).catch((err)=>{
            req.flash("error_msg","Houve um erro interno")
            res.redirect("/404")
        })
        
    });

    app.get("/postagens/:slug",(req, res)=>{
        Postagem.findOne({slug: req.params.slug}).lean().then((postagem)=>{
            if(postagem){
                res.render("postagem/index",{postagem: postagem})
            }
            else{
                req.flash("error_msg","Essa postagem não existe")
                res.redirect("/")
            }
        }).catch((erro)=>{
            req.flash("error_msg","Houve um erro interno")
            res.redirect("/")
        })
    });

    app.get("/404", (req, res)=>{
        res.send("Erro 404!")
    })

    app.use("/admin",admin);
    app.use("/usuarios", usuarios)

// outros 

const PORT = 8081
 app.listen(PORT,()=>{
    console.log("servidor rodando na porta: "+ PORT);
 });