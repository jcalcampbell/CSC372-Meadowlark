/**
 * Created by jcampbell on 2/2/17.
 */

var express = require('express');
var credentials = require('./credentials');

var fortune = require('./lib/fortune.js');
var weather = require('./lib/weather.js');

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
app.use(require('cookie-parser')(credentials.cookieSecret));

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

app.use('/tour*', function (req, res, next) {
    res.locals.pageTitle = "Meadowlark Tours";
    next();
});

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
    if(req.xhr || req.accepts('json,html') === 'json') {
        res.send({success: true});
    } else {
        res.redirect(303, '/thank-you');
    }
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

// Chat Code
app.get('/chat', function (req, res) {
    if(req.signedCookies.chatName) {
        res.locals.chatName = req.cookies.chatName;
        res.render('chat');
    } else {
        res.redirect(303, '/chat-login')
    }
});
app.get('/chat-login', function (req, res) {
    res.render('chat-login');
});
app.post('/chat-login', function (req, res) {
    res.cookie('chatName', req.body.chatName, {signed:true});
    res.redirect(303, '/chat');
});
const Message = function(message, sender) {
    this.message = message;
    this.sender = sender || '{unknown}';
    this.time = new Date().toLocaleTimeString();
}
var chatMessages = new Array();
for(var i = 0; i < 8; i++) {
    chatMessages.push(new Message(''));
}
app.post('/chat/server', function (req, res) {
    var newMessage = new Message(
        req.body.message,
        req.signedCookies.chatName
        //req.connection.remoteAddress
    );
    chatMessages.pop(); // throws away oldest message at bottom
    chatMessages.unshift(newMessage); // new message at top
    res.send(newMessage); //have to either send response or next()
});

const message2html = require('handlebars').compile(
    '{{#each messages}}<p><strong>{{sender}}</strong>: {{message}} | {{time}}</p>{{/each}}'
)

app.get('/chat/server', function (req, res) {
    res.setHeader('Cache-Control', 'no-cache');
    res.send(message2html({messages: chatMessages}));
})

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