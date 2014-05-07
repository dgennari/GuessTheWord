/**
 * Server for the GuessTheWord app
 */

var express = require('express');
var app = express();
var http = require('http');
var mongojs = require('mongojs');

var host = "localhost";
var port = 3030;
var mongoSettings = {
	      "username" : "user1",
	      "password" : "secret",
	      "url" : "mongodb://user1:secret@localhost:27017/test"
	};

if (process.env.hasOwnProperty("VCAP_SERVICES")) {
	// Running on BlueMix. Parse out the port and host that we've been assigned.
	var env = JSON.parse(process.env.VCAP_SERVICES);
	var host = process.env.VCAP_APP_HOST; 
	var port = process.env.VCAP_APP_PORT;
	
	// Also parse out MongoDB settings.
	var mongoSettings = env['mongodb-2.2'][0].credentials;
}
var mongoURL = mongoSettings.url + '?connectTimeoutMS=5000&socketTimeoutMS=30000';

var db;

/**
 * Lookup the word in the wordnik online dictionary and return a description for it.
 * @param word {String} Word to lookup description for
 * @param cb_description {function} Callback with the description as argument. 
 * If the word was not found in the dictionary the description is empty.
 */
function wordLookup(word, cb_description) {
  http.request(
    {
	host: "api.wordnik.com",
	path: "/v4/word.json/" + word + "/definitions?limit=1&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5"
    },	function (res) {
	  var str = '';
	  res.on('data', function(d) {
	    str += d;
	  });
	  res.on('end', function() {
	    var wordList = JSON.parse(str);
	    cb_description(wordList.length > 0 ? wordList[0].text : "");
	});
  }).end();	
}

app.get('/randomword', function(request, response) {
  http.request(
  {
    host: "api.wordnik.com",
    path: "/v4/words.json/randomWord?hasDictionaryDef=false&minCorpusCount=0&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=5&maxLength=-1&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5"
  }, function (res) {
	var str = '';
	res.on('data', function(d) {
	  str += d;
	});
	res.on('end', function() {
	  var wordObj = JSON.parse(str);
	  wordLookup(wordObj.word, function(descr) {
	    var randomWordObj = { word : wordObj.word, description : descr };
	    response.send(JSON.stringify(randomWordObj));		
	});								
     });
  }).end();
});

//Set path to Jade template directory
app.set('views', __dirname + '/views');

// Set path to JavaScript files
app.set('js', __dirname + '/js');

//Set path to CSS files
app.set('css', __dirname + '/css');

//Set path to image files
app.set('images', __dirname + '/images');

//Set path to sound files
app.set('sounds', __dirname + '/sounds');

//set path to static files
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
	res.render('hiscores.jade', {title: 'Hiscores'});
});

app.get('/play', function(req, res){	
	res.render('main.jade', {title: 'Guess the Word'});
});

app.get('/hiscores', function(request, response) {	
	db.scores.find({}).sort({'score':1}).limit(10, function(err, docs) {
		if (err) throw err;
		if (docs)
			response.send(JSON.stringify(docs));
	});
});

app.get('/save_score', function(request, response) {
	var name = request.query.name;
	var score = request.query.score;
	
	var scoreRecord = { 'name': name, 'score' : parseInt(score), 'date': new Date() };
	db.scores.insert(scoreRecord, function(err) {
		if (err) { 
			console.log(err.stack); 
		}
		else {
			response.send('Successfully added one score to the DB');
		}
	});
});

var server = app.listen(port, function() {
    console.log('Server running on port %d on host %s', server.address().port, host);    
    
    db = mongojs(mongoURL, ['scores']);
});

process.on('exit', function() {
    console.log('Server is shutting down!');
});

