const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");    
require("../models/Categoria");
const Categoria = mongoose.model("categorias");
require("../models/Postagem");
const Postagem = mongoose.model("postagens");


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

router.get("/categorias/edit/:id", (req,res)=>{
    Categoria.findOne({_id: req.params.id}).lean().then((categoria)=>{
        res.render("admin/editcategorias", {categoria: categoria});

    }).catch((err)=>{
        req.flash("error_msg","esta categoria nao existe")
        res.redirect("/categorias")
    })    
});

router.post("/categorias/edit/:id",(req,res)=>{
    const {id, nome, slug} = req.body // é a mesma coisa que req.body.nome 
    const erros = []
    if(!nome || !slug ){
        erros.push({texto: "Os campos nome e slug são obrigatórios"})
    }

    if(erros.length>0){
        Categoria.findOne({_id:id}).lean().then(()=>{
            res.render("admin/editcategorias", {categoria, erros})

        }).catch((erro)=>{
            req.flash("error_msg","os campos nome e slug são obrigatórios")
            res.redirect("/admin/categorias")
        })
    }

    else{
        Categoria.findOneAndUpdate({_id: id}, {nome, slug}, {new:true}).then((categoria)=>{
            req.flash("success_msg","categoria editada com sucesso")
            res.redirect("/admin/categorias")
        }).catch((err)=>{
            req.flash("error_msg","houve um erro interno ao editar a categoria")
            res.redirect("/admin/categorias")
            console.log(err);
        })
    }
});

router.post("/categorias/deletar", (req,res) =>{
    Categoria.deleteOne({_id: req.body.id}).then(()=>{
        req.flash("success_msg", "Categoria deletada com sucesso");
        res.redirect("/admin/categorias");
    }).catch((err)=>{
        req.flash("error_msg","houve um error ao deletar a categoria");
        res.redirect("/admin/categorias");
    })


});

router.get("/postagens", (req,res)=>{
    Postagem.find().lean().populate("categoria").sort({data:"desc"}).then((postagens)=>{
        res.render("admin/postagens", {postagens: postagens})
        res.render("admin/postagens");
    }).catch((err)=>{
        req.flash("error_msg","Houve um erro ao listar as postagens")
        console.log(err)
        res.redirect("/admin")
    })
});

router.get("/postagens/add", (req,res)=>{
    Categoria.find().lean().then((categorias)=>{
        res.render("admin/addpostagem", {categorias: categorias})
    }).catch((err)=>{
        req.flash("error_msg","houve um erro ao carregar o formulario")
        res.redirect("/admin")
    })
});

router.post("/postagens/nova", (req,res)=>{
        const {titulo, slug, descricao, conteudo, categoria} = req.body
        const erros = []
        
        if(!titulo || !titulo.trim() === "" || !titulo ==undefined){
            erros.push({texto: "O campo Titulo é obrigatorio"})
        }
        if(!slug || !slug.trim() === "" || !slug ==undefined){
            erros.push({texto: "O campo Slug é obrigatorio"})
        }
        if(!descricao || !descricao.trim() === "" || !descricao ==undefined){
            erros.push({texto: "O campo Descrição é obrigatorio"})
        }
        if(!conteudo || !conteudo.trim() === "" || !conteudo ==undefined){
            erros.push({texto: "O campo Conteudo é obrigatorio"})
        }
        if(!categoria || !categoria.trim() === "" || !categoria ==undefined){
            erros.push({texto: "O campo Categoria é obrigatorio"})
        }

        if(erros.length > 0){
            res.render("admin/addpostagens", {erros: erros})
        }

        else{
            const novaPostagem = {titulo, slug, descricao, conteudo, categoria}
        
        new Postagem(novaPostagem).save().then(()=>{
            req.flash("success_msg", "postagem criada com sucesso")
            res.redirect("/admin/postagens")
            console.log("postagem salva no banco")
        }).catch((err)=>{
            req.flash("error_msg","houve um erro durante ao salvar os dados da nova postagem")
            res.redirect("/admin/postagens")
            console.log(err)
        })
    }    
});

router.get("/postagens/edit/:id",(req,res)=>{
    Postagem.findById({_id: req.params.id}).lean().then((postagem)=>{
        Categoria.find().lean().then((categorias)=>{
            res.render("admin/editpostagens",{categorias: categorias, postagem: postagem})

        }).catch((err)=>{
            req.flash("error_msg","houve um erro ao listar a postagem")
            res.redirect("/admin/postagens")
        })

    }).catch((err)=>{
        req.flash("error_msg","Houve um carregar o formulario de edição")
        res.redirect("/admin/postagens")

    }) 
});

router.post("/postagens/edit/:id", (req,res)=>{
    
    const{titulo, descricao, slug, conteudo, categoria} = req.body
    const erros = []

    if(!titulo || !descricao || !slug || !conteudo || !categoria){
        erros.push({texto: "todos os campos são obrigatórios"})
    }
    if(!titulo || !titulo.trim()==="" || !titulo == undefined){
        erros.push({texto: "Para editar o campo titutlo tem que estar preenchido"})
    }
    if(!descricao || !descricao.trim()==="" || !descricao == undefined){
        erros.push({texto: "Para editar o campo titutlo tem que estar preenchido"})
    }
    if(!slug || !slug.trim()==="" || !slug == undefined){
        erros.push({texto: "Para editar o campo titutlo tem que estar preenchido"})
    }
    if(!conteudo|| !conteudo.trim()==="" || !conteudo == undefined){
        erros.push({texto: "Para editar o campo titutlo tem que estar preenchido"})
    }
    if(!categoria || !categoria.trim()==="" || !categoria == undefined){
        erros.push({texto: "Para editar o campo titutlo tem que estar preenchido"})
    }
    
    if(erros.length > 0){
        res.render("admin/postagens")
    }

    else{
        const postagemEditada = { titulo, descricao, slug, conteudo, categoria };
        Postagem.findOneAndUpdate({ _id: req.params.id }, postagemEditada, { new: true })
            .then(() => {
                req.flash("success_msg", "Postagem editada com sucesso");
                res.redirect("/admin/postagens");
                
            })
            .catch((err) => {
                req.flash("error_msg", "Houve um erro ao salvar a edição");
                res.redirect("/admin/postagens");
                console.log(err)
            });
    }
});

router.get("/postagens/deletar/:id",(req,res)=>{
    Postagem.findOneAndDelete({_id: req.params.id}).then(()=>{
        req.flash("success_msg","postagem deletada com sucesso")
        res.redirect("/admin/postagens/edit")
    }).catch((err)=>{
        req.flash("error_msg","Houve um erro ao deletar a postagem")
        res.redirect("/admin/postagens")
    })
})



    



module.exports = router;