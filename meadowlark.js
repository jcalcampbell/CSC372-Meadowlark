/**
 * Created by jcampbell on 2/2/17.
 */

var express = require('express');

/// App Setup
var app = express();

var handlebars = require('express-handlebars')
    .create({defaultLayout: 'main', extname: 'hbs'});
app.engine('hbs', handlebars.engine);
app.set('view engine', 'hbs');

app.set('port', process.env.PORT || 3000);

app.use(express.static(__dirname + '/public'));

app.use(function(req, res, next){
    if(app.get('env') !== 'production' && req.query.test=='1'){
        res.locals.showTests = true;
    }
    next();
});

var fortune = require('./lib/fortune.js');

/// Routes
app.get('/', function(req, res){
    res.render('home');
});

app.get('/about', function(req, res){
    res.render('about', {
        fortune: fortune.getFortune(),
        pageTestScript: '/qa/tests-about.js'
    });
});

/// Error Handling
//custom 404 page
app.use(function(req, res, next){
    res.status(404);
    res.render('404');
});

//custom 500 page
app.use(function(err, req, res, next){
    console.error(err.stack);
    res.status(500);
    res.render('500');
});

app.listen(app.get('port'), function(){
    console.log( 'Express started on http://localhost:' +
        app.get('port') + '; press Ctrl-C to terminate.' );
});