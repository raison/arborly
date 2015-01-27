
var express = require('express')
, routes = require('./routes')
, http = require('http')
, path = require('path');

var app = express();

app.configure(function(){
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
});

var mysql      = require('mysql');
var connection = mysql.createConnection({
	database     : 'db_name',
	host     : 'host',
	user     : 'username',
	password : 'password',
});

/*  Test Query
connection.query('SELECT * FROM `badges` WHERE 1', function(err, rows) {
	console.log(rows);// connected! (unless `err` is set)
});  
*/

app.configure('development', function(){
	app.use(express.errorHandler());
});

app.get('/', function(req,res) {
	res.sendfile('public/index.html');
});
app.get('/api/tree/:startNode', function(req,res) {
var theTree = {};
theTree =
{
 "name": "Bob Dobbs",
 "id": "1",
 "jobtitle": "big boss",
 "children": [
  {
   "name": "Suzie Morgan",
 "id": "2",
 "jobtitle": "czar",   
   "children": [
    {
     "name": "Tom Bradford",
      "id": "3",
 "jobtitle": "poobah",
     "children": [
      {"name": "Greg Simmons", "id": "4", "jobtitle": "drone"},
      {"name": "Nancy Fitz", "id": "5", "jobtitle": "drone"},
      {"name": "Shep Wooley", "id": "6", "jobtitle": "drone"},
      {"name": "Ananda Gupta", "id": "7", "jobtitle": "drone"}
     ]
    },
    {
     "name": "Hi Harrison",
      "id": "8",
 "jobtitle": "czar",  
     "children": [
      {"name": "Sweeney Todd", "id": "9", "jobtitle": "drone"},
      {"name": "Glorp Gaston", "id": "10", "jobtitle": "drone"},
      {"name": "Mike Palindrome", "id": "11", "jobtitle": "drone"},
      {"name": "Jesus Murphy", "id": "12", "jobtitle": "drone"},
      {"name": "Dave Dane", "id": "13", "jobtitle": "drone"}
     ]
    },
    {
     "name": "Paul Jones",
      "id": "14",
 "jobtitle": "czar",  
     "children": [
      {"name": "Calvin Borkum", "id": "15", "jobtitle": "drone"}
     ]
    }
   ]
  }
 ]
};
   res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(theTree));
});
app.post('/api/edit', function(req,res) {
req.body.jobtitle = "newjobtitle";
	res.send(req.body);
});
app.post('/api/add', function(req,res) {
	res.send(req.body);
});
app.post('/api/show', function(req,res) {
	res.send(req.body);
});
app.post('/api/list', function(req,res) {
	res.send(req.body);
});
http.createServer(app).listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});
