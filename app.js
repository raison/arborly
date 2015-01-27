var express = require('express'),
    routes = require('./routes'),
    http = require('http'),
    path = require('path');

var app = express();

app.configure(function() {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});
var traverse = require('traverse');
var mysql = require('mysql');
var connection = mysql.createConnection({
    database: 'heroku_679c9f4e343c163',
    host: 'us-cdbr-iron-east-01.cleardb.net',
    user: 'bdbc3e7d415a19',
    password: 'aacfb504',
});

connection.connect(function(err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }

    console.log('connected as id ' + connection.threadId);
});

connection.query("SELECT * FROM people", function(err, rows) {
    console.log("here are rows: ", rows);
});


app.configure('development', function() {
    app.use(express.errorHandler());
});

function convert(array) {
        var map = {};
        for (var i = 0; i < array.length; i++) {
            var obj = array[i];
            obj.children = [];

            map[obj.id] = obj;

            var parent = obj.parent || '-';
            if (!map[parent]) {
                map[parent] = {
                    children: []
                };
            }
            map[parent].children.push(obj);
        }

        return map['-'].children;

    }

function sort(obj, sortBy) {
    var list = [];

    function iterate(obj) {
        for (var property in obj) {
            if (obj.hasOwnProperty(property)) {
                if (list.indexOf([obj.name, obj.jobtitle, obj.id]) == -1) {
                    if (obj.name !== null) {
                        list.push([obj.name, obj.jobtitle, obj.id])
                    }
                }
                if (typeof obj[property] == "object") {
                    iterate(obj[property]);
                } else {
                    // console.log(property + "   " + obj[property]);
                }
            }
        }
    }
    iterate(obj);

    var seen = {};
    var out = [];
    var len = list.length;
    var j = 0;
    for (var i = 0; i < len; i++) {
        var item = list[i];
        if (seen[item] !== 1) {
            seen[item] = 1;
            if (item.indexOf(undefined) == -1) {
                out[j++] = item;
            }
        }
    }

    function ComparatorName(a, b) {
        if (a[0].toUpperCase() < b[0].toUpperCase()) return -1;
        if (a[0].toUpperCase() > b[0].toUpperCase()) return 1;
        return 0;
    }

    function ComparatorJobtitle(a, b) {
        if (a[1].toUpperCase() < b[1].toUpperCase()) return -1;
        if (a[1].toUpperCase() > b[1].toUpperCase()) return 1;
        return 0;
    }
    if (sortBy == "name") {
        out = out.sort(ComparatorName);
    } else {
        console.log("by job title");
        out = out.sort(ComparatorJobtitle);
    }
    return out;
}
app.get('/', function(req, res) {
    res.sendfile('public/index.html');
});
app.get('/api/tree/:startNode', function(req, res) {

    connection.query("SELECT * FROM people ORDER BY person_id", function(err, rows) {
        for (var i = 0; i < rows.length; i++) {
            rows[i].id = rows[i].person_id + "";
            delete rows[i].person_id;
        }




        var theTree = convert(rows);
        console.log("the start node " + req.params.startNode);
        if (req.params.startNode !== "0") {

            function scan(obj) {
                var k;
                if (obj instanceof Object) {
                    for (k in obj) {

                        if (obj.hasOwnProperty(k)) {
                            if (k == "id" && obj[k] == req.params.startNode) {
                                res.setHeader('Content-Type', 'application/json');
                                res.end(JSON.stringify(obj));
                            } else {
                                scan(obj[k]);
                            }
                        }
                    }
                } else {
                
                };

            };

            scan(theTree);
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(theTree[0]));
        }
    });

});
app.post('/api/edit', function(req, res) {
    var query = "UPDATE people SET " + req.body.name + "='" + req.body.value + "' WHERE person_id=" + req.body.pk;
    connection.query(query, function(err, rows) {
        connection.query("SELECT * FROM people WHERE person_id=" + req.body.pk, function(err, rows) {
            res.send(rows);
        });
    });
});
app.post('/api/add', function(req, res) {
    console.log("adding", req.body);
    var query = "INSERT INTO people (name, jobtitle, parent) VALUES ('" + req.body.name + "', '" + req.body.jobtitle + "', '" + req.body.parent + "')";
    connection.query(query, function(err, rows) {
        console.log(err, rows);
        res.send(rows);

    });
});

app.get('/api/list/:startNode/:sort', function(req, res) {
    connection.query("SELECT * FROM people ORDER BY person_id", function(err, rows) {
        for (var i = 0; i < rows.length; i++) {
            rows[i].id = rows[i].person_id + "";
            delete rows[i].person_id;
        }

        var theTree = convert(rows);
        console.log("the start node " + req.params.startNode);
        if (req.params.startNode !== "0") {

            function scan(obj) {
                var k;
                if (obj instanceof Object) {
                    for (k in obj) {

                        if (obj.hasOwnProperty(k)) {
                            if (k == "id" && obj[k] == req.params.startNode) {
                                var theList = sort(obj, req.params.sort);
                                res.setHeader('Content-Type', 'application/json');
                                res.end(JSON.stringify(theList));
                                var theList = obj;
                                break;
                            } else {
                                scan(obj[k]);
                            }
                        }
                    }
                } else {

                };

            };

            scan(theTree);
        } else {
            var theList = sort(theTree[0], req.params.sort);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(theList));
        }
    });
});
http.createServer(app).listen(app.get('port'), function() {
    console.log("Express server listening on port " + app.get('port'));
});