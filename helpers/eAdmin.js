module.exports = {
    eAdmin: function(req, res, next){
        if(req.isAuthenticated() && req.user.eAdmin == 1){
             return next();
        }
        req.flash("error_msg", "voce deve estar autenticado para acesar o painel ")
        res.redirect("/")
    }

}