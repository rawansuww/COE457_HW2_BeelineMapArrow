
//init
const bodyParser = require("body-parser");
const express = require("express")
var cookieParser = require('cookie-parser')
var session = require('express-session')
var cookieSession = require('cookie-session')
var path = require('path');
const mongoose = require('mongoose');
const User = require('./models/user');
var MongoStore = require('connect-mongo')(session);
const app = express();


/*
/////////////////////////////////////////////////////
Adding a user
////////////////////////////////////////////////////
var user = new User({
    oName:"Kharoof",
    email:"Kharoof@yahoo.com",
    password:"OogaBooga",
    dog:
    {
        dName:"Wolf",
        age: 4,
        breed: "German Sheppard",
        currentMood: 1,
        callibration:[0,0,0]
    }
})
user.save().then(user =>{
    console.log(user.oName+" was added successfully");
})*/

//app setup
app.set('port', 3000);
app.use(cookieParser());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'))
app.use(express.static(__dirname + '/views'));
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(session({
    name: 'emailCookie',
    secret: 'pets',
    resave: true, // have to do with saving session under various conditions
    saveUninitialized: true, // just leave them as is
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie: {
        maxAge: (2592000000) //30 days lol
    }
}));

//connection to users db
mongoose.connect('mongodb://127.0.0.1:27017/users', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});


//Routes
app.get('/dashboard', (req, res) => {

    var email = req.session.email;
    User.findOne({
        email: email
    }, (err, user) => {
        if (err) {
            console.log(err);
        }
        if (user) {
            console.log(user.oName + " has been found and is now going to dashboard");
            res.render('dashboard', {
                dname: user.dog.dName,
                mood: getCurrentMood(user.dog.currentMood),
                hc: user.dog.mood[0],
                sc: user.dog.mood[1],
                anc: user.dog.mood[2],
                afc: user.dog.mood[3],
                age: user.dog.age,
                breed: user.dog.breed,
                avg: getAvg(user.dog.mood),
                pic: user.dog.image
            }, function (err, html) {
                if (err) throw err;
                res.send(html)
            })
        } else {
            res.redirect(500, '/');
        }
    });

})


app.get('/login', (req, res) => {

    res.render('login', {
        flag: 0
    }, function (err, html) {
        if (err) throw err;
        res.send(html)
    })
})

app.get('/newUser', async (req, res) => {
    console.log("!!!!!!!!!GETTING USER INFO FOR REGISTERATION!!!!!!!!!");
    User.findOne({
        email: req.query.email
    }, (err, user) => {
        if (err) {
            console.log(err);
        }
        if (user) {
            console.log("!!!!Invalid Signup!!!!");
            res.render('login', {
                flag: 2
            })
        } else {
            user = new User({
                oName: req.query.oname,
                email: req.query.email,
                password: req.query.pswd,
                dog: {
                    dName: req.query.dname,
                    age: req.query.age,
                    breed: req.query.breed,
                }
            })
            user.save().then(user => {
                console.log(user.oName + " was added successfully");
                res.redirect('login');
            });
        }
    });
})


app.get('/returningUser', async (req, res) => {
    var email = req.query.email;
    console.log("Email logged in was: " + email)
    User.findOne({
        email: email
    }, (err, user) => {
        if (err) {
            console.log(err);
        }
        if (user) {
            console.log(user.oName + " has successfully logged in to the website");
            req.session.email = user.email;
            if (req.session.viewCount) {
                console.log(req.session.viewCount);
                res.redirect('dashboard');
            } else {
                req.session.viewCount = false;
                console.log(user.oName + " has logged in for the first time. Redirecting to settings.\nView count: " + req.session.viewCount);
                res.redirect('settings');
            }

        } else {
            console.log("!!!!!User wasnt found!!!!!");
            res.render('login', {
                flag: 1
            })
        }
    });
})


app.get('/settings', (req, res) => {
    var email = req.session.email;
    User.findOne({
        email: email
    }, (err, user) => {
        if (err) {
            console.log(err);
        }
        if (user) {
            console.log(user.oName + " has been found and is now going to settings");
            res.render('settings', {
                flag: 0,
                onamevar: user.oName,
                emailvar: user.email,
                passwordvar: user.password,
                dnamevar: user.dog.dName,
                agevar: user.dog.age,
                breedvar: user.dog.breed,
                tempvar: user.dog.temperature
            }, function (err, html) {
                if (err) throw err;
                res.send(html)
            })
        } else {
            res.redirect(500, '/');
        }
    });

})


app.get('/userChanges', (req, res) => {
    var prev = req.session.email;
    User.findOne({
        email: req.query.email
    }, (err, user) => {
        if (err) {
            console.log(err);
        }
        if (user) {
            console.log("Overwriting changes...")
            user.overwrite({
                oName: req.query.oname,
                email: req.query.email,
                password: req.query.password,
                dog: {
                    dName: user.dog.dName,
                    age: user.dog.age,
                    breed: user.dog.breed,
                    temperature: user.dog.temperature
                }
            })
            user.save().then(user => {
                console.log(user.oName + "'s settings were changed successfully");
                req.session.viewCount = true;
                res.redirect('dashboard');
            });
        }
    });

})


app.get('/dogChanges', (req, res) => {
    var prev = req.session.email;
    User.findOne({
        email: prev
    }, (err, user) => {
        if (err) {
            console.log(err);
        }
        if (user) {
            user.overwrite({
                oName: user.oName,
                email: user.email,
                password: user.password,
                dog: {
                    dName: req.query.dname,
                    age: req.query.age,
                    breed: req.query.breed,
                    temperature: req.query.temp
                }
            })
            console.log(req.query.dogimg);
            user.save().then(user => {
                console.log(user.oName + "'s settings were changed successfully");
                req.session.viewCount = true;
                res.redirect('dashboard');
            });
        }
    });

})


app.get('/index', (req, res) => {
    res.render('index', function (err, html) {
        if (err) throw err;
        res.send(html)
    })
})
app.get('/', (req, res) => {
    res.render('index', function (err, html) {
        if (err) throw err;
        res.send(html)
    })
})


//Listen to the server.
app.listen(app.get('port'), () => console.log(`App started on port ${app.get('port')}`));


//functions
function getCurrentMood(i) {
    if (i == 1)
        return "happy";
    else if (i == 2)
        return "sad";
    else if (i == 3)
        return "angry";
    else if (i == 4)
        return "afraid";
}

function getAvg(moodArr) {
    console.log("Getting avg mood!");
    return getCurrentMood(moodArr.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0) + 1);
}

































/*var net = require('net');
var fs = require('fs');
var points=null;
var answer=null;
var server = net.createServer(function(socket) {
    socket.on('data', function(data) {
        r = data.toString();
        if(r.substring(0,3)=="GET" & r.length<=600) { //checking for a GET request
            console.log("You did GET");
            console.log(points);
            socket.write("HTTP/1.1 200 OK\n");
            socket.write("Access-Control-Allow-Origin: *\n");
            answer=JSON.stringify(points); 
            socket.write("Content-Length:"+answer.length);
            socket.write("\n\n");
            socket.write(answer); //sending back the coordinates as a string
        }
        else if (r.substring(0,4)=="POST" & r.length<=600){
           console.log("You have POSTED the following");
            var curlybracket = r.indexOf("{"); //as per JSON syntax, starts and ends with a curly bracekt
            var points_data = r.substring(curlybracket, r.length);
            points = JSON.parse(points_data); //parse into JSON object
            console.log(points);
        }
        else console.log(r); // show the actual message
    });  
    socket.on('close', function() {
        console.log('Connection closed');
    });
    socket.on('end', function() {
        console.log('client disconnected');
     });

    socket.on('error', function() {
        console.log('client disconnected');
     });
});
server.listen(8080, function() {  //listening on localhost and port 8080
    console.log('server is listening on port 8080');
});
*/
