var express  = require('express'),
    http     = require('http'),
    app      = module.exports.app = express(),
    server   = http.createServer(app)
    io       = require('socket.io').listen(server),

    mongoose       = require('mongoose'),
    morgan         = require('morgan'),
    bodyParser     = require('body-parser'),
    methodOverride = require('method-override'),
    
    ping             = require('ping'),
    cron             = require('cron'),
    connectionTester = require('connection-tester');

// configuration =================

mongoose.connect('mongodb://localhost:27017');     // connect to mongoDB database on modulus.io

app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
app.use(morgan('dev'));                                         // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());

// define model =================
var Game = mongoose.model('Game', {
    name   : String,
    ip     : String,
    port   : Number,
    status : Boolean, //true is active, false is down,
    ping   : Number,
    user   : Boolean
});

// routes ======================================================================

    // api ---------------------------------------------------------------------
    // get all games
    app.get('/api/games', function(req, res) {

        // use mongoose to get all games in the database
        Game.find(function(err, games) {

            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)

            res.json(games); // return all games in JSON format
        });
    });

    // create todo and send back all games after creation
    app.post('/api/games', function(req, res) {

        // create a game, information comes from AJAX request from Angular
        Game.create({
            name : req.body.name,
            ip   : req.body.ip,
            port : req.body.port,
            user : req.body.user,
            done : false
        }, function(err, game) {
            if (err)
                res.send(err);

            // get and return all the games after you create another
            Game.find(function(err, games) {
                if (err)
                    res.send(err)
                res.json(games);
            });
        });

        io.emit('listChange');
    });

    // delete a game
    app.delete('/api/games/:game_id', function(req, res) {
        Game.remove({
            _id : req.params.game_id
        }, function(err, game) {
            if (err)
                res.send(err);

            // get and return all the games after you create another
            Game.find(function(err, games) {
                if (err)
                    res.send(err)
                res.json(games);
            });
        });
        io.emit('listChange');
    });


app.get('*', function(req, res) {
    res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});

var cronJob = cron.job("*/5 * * * * *", function() {
    Game.find(function(err, games) {
        var gameList = games;
        var i = 0;
        var step = function(i) {
            if(i < gameList.length) {
                Game.findById(gameList[i]._id, function(err, game) {
                    var checkIP = gameList[i].ip;
                    var checkPort = gameList[i].port;
                    if(checkPort != null) {
                        serverStatus = connectionTester.test(checkIP, checkPort);
//                        console.log(serverStatus);
                        game.status = serverStatus.success;
                    }
                    else {
                        ping.sys.probe(checkIP, function(isAlive) {
                            game.status = isAlive;
//                            console.log(checkIP + isAlive);
                            game.save(function(err) {
//                                if(err) { console.log(err); };
                            });
                        });
                    }
                    game.save(function(err) {
//                        if(err) { console.log(err); };
                    });
                });
                step(i+1);
            }
        };
        step(0);
    });
    io.emit('listChange');
});
cronJob.start();

io.on('connection', function (socket) {
    console.log('Socket succesfully connected with id: '+socket.id);
});

// listen (start app with node server.js) ======================================
server.listen(80);