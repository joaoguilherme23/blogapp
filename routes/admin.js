const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");    
require("../models/Categoria");
const Categoria = mongoose.model("categorias");

router.get('/',(req,res)=>{
    res.render("admin/index")
});

router.get('/posts', (req,res)=>{
    res.send("pagina de postagens");
});

router.get('/categorias', (req,res)=>{
    Categoria.find().lean().sort({date:'desc'}).then((categorias)=>{
        res.render("admin/categorias",{categorias: categorias})
    }).catch((err)=>{
        req.flash("error_msg","houve um erro ao listar as categorias salva no banco de dados ")
        res.redirect('/admin')
    })
    
});

router.get('/categorias/add',(req,res)=>{
    res.render('./admin/addcategorias');
});

router.post('/categorias/nova',(req, res)=>{
    
    var  erros = []

    // verificação para nao receber valores vazios
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "nome inválido"})
    }
        
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "slug inválido"})
    }

    if(req.body.nome.length < 2){
        erros.push({texto: "nome da categoria é muito pequeno"})
    }   

    if(erros.length > 0){
        res.render("admin/addcategorias",{erros: erros});
    }

    else{
        const novaCategoria = {
            nome: req.body.nome,  //requisção pelo tag nome do arquivo handlebars
            slug: req.body.slug
        }
        const categoria = new Categoria(novaCategoria).save().then(()=>{
            req.flash('success_msg','categoria salva com sucesso')
            res.redirect("/admin/categorias")
            console.log("categoria salva com sucesso")
    }).catch((err)=>{
        req.flash('error_msg', 'erro ao salvar a categoria, tente novamente')
        res.redirect('/admin/categorias')
    })
    }
});

router.get("/categorias/edit:id", (req,res)=>{
    Categoria.findOne({_id:req.params.id}).lean().then((categoria)=>{
        res.render("admin/editcategorias", {
            id: categoria.id,
            nome: categoria.nome,
            slug: categoria.slug
        });
    }).catch((err)=>{
        req.flash("error_msg","esta categoria nao existe")
        res.redirect("/admin/categorias")
    })    
});

router.post("/categorias/edit",(req,res)=>{
    Categoria.where({_id:req.body.id}).updateOne({nome:req.body.nome, slug:req.body.slug})

})
    



module.exports = router;