/**
 * Server for the GuessTheWord app
 */

var express = require('express');
var app = express();
var http = require('http');

var host = "localhost";
var port = 3030;
if (process.env.hasOwnProperty("VCAP_SERVICES")) {
	// Running on BlueMix. Parse out the port and host that we've been assigned.
	var env = JSON.parse(process.env.VCAP_SERVICES);
	var host = process.env.VCAP_APP_HOST; 
	var port = process.env.VCAP_APP_PORT;	
}

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

var server = app.listen(port, function() {
    console.log('Server running on port %d on host %s', server.address().port, host);    
});

process.on('exit', function() {
    console.log('Server is shutting down!');
});

