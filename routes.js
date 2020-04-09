module.exports = function (router) {

    router.get('/users', function(req, res) {
         res.render('index'});
    });

    router.get('/inventions', function(req, res) {
         res.render('index2');
    });

};
