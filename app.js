//Module dependencies.
var express = require('express');
var http = require('http');
var path = require('path');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var socketio = require('socket.io');
var ejs = require('ejs');

var config = require("./crypto.json");

//Load Necessary Config Files
var node_algorithm = config["algorithm"];
var node_password = config["password"];
var node_secret = config["secret"];

//AES256 Crypto Functions
var crypto = require('crypto'),
    algorithm = node_algorithm,
    password = node_password;

function encrypt(text) {
    var cipher = crypto.createCipher(algorithm, password)
    var crypted = cipher.update(text, 'utf8', 'hex')
    crypted += cipher.final('hex');
    return crypted;
}

function decrypt(text) {
    var decipher = crypto.createDecipher(algorithm, password)
    var dec = decipher.update(text, 'hex', 'utf8')
    dec += decipher.final('utf8');
    return dec;
}

//Connect to Database
mongoose.connection.on('open', function(ref) {
    console.log('Connected to mongo server.');
});
mongoose.connection.on('error', function(err) {
    console.log('Could not connect to mongo server!');
    console.log(err);
});
mongoose.connect('mongodb://localhost/Vamos');
var Schema = mongoose.Schema;

var UserDetails = require("./items").UserDetails;

// all environments
var app = express();
app.use(require('express-session')({
    key: 'session',
    secret: node_secret,
    city: '',
    region: '',
    store: require('mongoose-session')(mongoose)
}));
app.set('port', process.env.PORT || 3002);
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(__dirname + '/public'));
var sess;

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

//Handle User Sessions
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

//Verify Login with User Schema
passport.use(new LocalStrategy(
    function(username, password, done) {

        process.nextTick(function() {
            UserDetails.findOne({
                    'username': username
                },
                function(err, user) {
                    if (err) {
                        return done(err);
                    }
                    if (!user) {
                        return done(null, false);
                    }
                    if (user.password != encrypt(password)) {
                        return done(null, false);
                    }
                    return done(null, user);
                });
        });
    }
));

/////////////////////////
// Handle Page Routing //
/////////////////////////

app.get('/admin', function(req, res, next) {
    if (req.user) {
      res.render('pages/admin', {page_name:"admin"});
    } else {
        res.redirect('/login');
    }
});

app.get('/login', function(req, res, next) {
    if (req.user) {
        res.redirect('/admin');
    } else {
      res.render('pages/login', {page_name:"login", fail: false});
    }
});

app.get('/loginfailed', function(req, res, next) {
    if (req.user) {
        res.redirect('/admin');
    } else {
      res.render('pages/login', {page_name:"login", fail: true});
    }
});

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/'); //Can fire before session is destroyed?
});

app.get('/', function(req, res, next) {
    sess = req.session;
    res.render('pages/index', {page_name:"home"});
});

app.get('/about', function(req, res, next) {
    sess = req.session;
    res.render('pages/about', {page_name:"about"});
});


app.get('/results', function(req, res, next) {
    sess = req.session;
    if (req.session) {
      res.render('pages/results',  {page_name:"results", city: req.session.city, region: req.session.region});
    }
    else{
    res.redirect('/locate'); //Can fire before session is destroyed?
    }
});

app.get('/locate', function(req, res, next) {
    sess = req.session;
    res.render('pages/locate', {page_name:"locate"});
});


app.get('/app/:city/:type', function(req, res, next) {
  sess = req.session;
  if (req.session) {
    console.log( req.params.city);
    console.log( req.params.type);
    if(req.params.type=="resturants"){
    res.render('pages/app/resturants',  {page_name:"resturants", city: req.session.city, region: req.session.region});
    }
    else if(req.params.type=="attractions"){
    res.render('pages/app/attractions',  {page_name:"attractions", city: req.session.city, region: req.session.region});
    }
    else if(req.params.type=="hotels"){
    res.render('pages/app/hotels',  {page_name:"hotels", city: req.session.city, region: req.session.region});
    }
    else if(req.params.type=="coffee"){
    res.render('pages/app/coffee',  {page_name:"coffee", city: req.session.city, region: req.session.region});
    }
    else if(req.params.type=="beauty"){
    res.render('pages/app/beauty',  {page_name:"beauty", city: req.session.city, region: req.session.region});
    }
    else{
      res.redirect('/locate'); //Can fire before session is destroyed?
    }
  }
  else{
  res.redirect('/locate'); //Can fire before session is destroyed?
  }
});

app.post('/auth',
    passport.authenticate('local', {
        successRedirect: '/admin',
        failureRedirect: '/loginfailed'
    }));

app.post('/locator', function(req, res) {
    if (req.session) {
        req.session.city = req.body["city"];
        req.session.region = req.body["region"];
        req.session.save();
        res.send({err: 0, redirectUrl: "/results"});
    }
    else{
    res.redirect('/'); //Can fire before session is destroyed?
    }
});

//Create Server Instance on Defined Port
var server = http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});

//Create Socket Server Instance
socketio.listen(server).on('connection', function(socket) {
    console.log("User Connected!");
    //Function to handle setCity requests
    socket.on('setCity', function(msg) {
        var data = msg.split(",");
        console.log('Location Received: ', msg);
    });
});
