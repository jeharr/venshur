var db = require('../db/config');
var express = require('express');
var bodyParser = require('body-parser');
var http = require('http');
require('../db/models/user');
require("../db/models/trip");
require("../db/models/photo");

require('../db/collections/users');
require("../db/collections/trips");
require("../db/collections/photos");

var passport = require("passport");

var app = express();
var server = http.Server(app);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

require("./passport.js")(passport)

//Required for Passport
var session = require("express-session");
app.use(session({ secret: 'Frowning Dolphins' }));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(__dirname + "/client"));

app.get("/", function (req, res, next) {
  res.sendFile('/index.html');
});

app.get('/api/trips', function(req, res){
  db.collection('Trips').fetchAll()
  .then(function(trips){
    res.json({trips: trips.toJSON()});
  })
});

// this needs checking
// app.get('/api/photos', function(req, res){
//   db.collection('Photos').fetchByTrip(???)
//   .then(function(photos){
//     res.json({photos: photos.toJSON()});
//   })
// });

//Direct to Instagram Login
app.get('/auth/instagram',
  passport.authenticate('instagram'));

//Redirect Back to Home Page upon Authentication
app.get('/auth/instagram/callback',
  passport.authenticate('instagram', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.post('/api/trip', function (req, res) {
  console.log('req:', req.body);

  var tripName = req.body.name;
  db.model('Trip').newTrip({name: tripName}).save();

  var instaResults = []
  var feed = new Instafeed({
    get: 'user',
    userId: 273734145,
    accessToken: '22125417.d904cd4.44abd06ef59d43e5b0fc7e9b4f347ebb',
    filter: function(image) {
      if(image.tags.indexOf(tripName) >= 0){
        instaResults.push(image);
        console.log(instaResults);
        return true;
      }
    },
    links: true,
    limit: 34,
    target: 'instafeed',
    sortBy: 'most-recent',
    resolution: 'standard_resolution',
    useHttp: true,
  });

  feed.run();


  // create a new trip & send Instafeed post request for user
  // filter for newTrip tag we just created
  // add photos to the db with associated trip Id

});

app.listen(process.env.PORT || 8000);
console.log("listening...")
