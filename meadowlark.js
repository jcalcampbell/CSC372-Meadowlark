/**
 * Created by jcampbell on 2/2/17.
 */

var express = require('express');

/// App Setup
var app = express();

var handlebars = require('express-handlebars')
    .create({
        defaultLayout: 'main', extname: 'hbs',
        helpers: {
            section: function (name, option) {
                if (!this._sections) this._sections = {};
                this._sections[name] = option.fn(this);
                return null;
            }
        }
    });
app.engine('hbs', handlebars.engine);
app.set('view engine', 'hbs');

app.set('port', process.env.PORT || 3000);

/// Middleware
app.use(express.static(__dirname + '/public'));
app.use(require('body-parser').urlencoded({extended: true}));

app.use(function (req, res, next) {
    if (app.get('env') !== 'production' && req.query.test == '1') {
        res.locals.showTests = true;
    }
    next();
});

app.use(function (req, res, next) {
    if (!res.locals.partials) res.locals.partials = {};
    res.locals.partials.weatherContext = weather.getWeatherData();
    next();
});

var fortune = require('./lib/fortune.js');
var weather = require('./lib/weather.js');

/// Routes
app.get('/', function (req, res) {
    res.render('home');
});

app.get('/about', function (req, res) {
    res.render('about', {
        pageTitle: "About Meadowlark Travel",
        fortune: fortune.getFortune(),
        pageTestScript: '/qa/tests-about.js'
    });
});

app.get('/newsletter', function (req, res) {
    res.render('newsletter', {
        csrf: 'CSRF token goes here'
    });
});

app.post('/process', function (req, res) {
    console.log('Form (from querystring): ' + req.query.form);
    console.log('CSRF token (form hidden form field): ' + req.body._csrf);
    console.log('Name (from visible form field): ' + req.body.name);
    console.log('Email (from visible form field): ' + req.body.email);
    res.redirect(303, '/thank-you');
});

app.get('/thank-you', function (req, res) {
    res.render('thank-you');
});

app.get('/tours/hood-river', function (req, res) {
    res.render('tours/hood-river');
});

app.get('/tours/oregon-coast', function (req, res) {
    res.render('tours/oregon-coast');
});

app.get('/tours/request-group-rate', function (req, res) {
    res.render('tours/request-group-rate');
});

/// Error Handling
//custom 404 page
app.use(function (req, res, next) {
    res.status(404);
    res.render('404');
});

//custom 500 page
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500);
    res.render('500');
});

app.listen(app.get('port'), function () {
    console.log('Express started on http://localhost:' +
        app.get('port') + '; press Ctrl-C to terminate.');
});