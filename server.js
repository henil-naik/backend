
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const PORT = 4000;
let User = require('./user.model');
const userRoutes = express.Router();

app.use(cors());
app.use(bodyParser.json());
mongoose.connect('mongodb://127.0.0.1:27017/users', { useNewUrlParser: true });
const connection = mongoose.connection;
connection.once('open', function () {
    console.log("MongoDB database connection established successfully");
})
// end point apis

// api to get profile information of user with email given as query param
userRoutes.route('/profile').get(function (req, res) {
    var email = req.query.emailid;
    User.findOne({ email }, function (err, user) {
        if (err) {
            console.log(err);
        } else {
            res.json(user);
        }
    })
});
// api to post profile information of user during signup call

userRoutes.route('/profile').post(function (req, res) {
    console.log(req.body)
    let User = new User(req.body);
    User.save()
        .then(user => {
            res.status(200).json({ 'User': 'User added successfully' + user });
        })
        .catch(err => {
            res.status(400).send('adding new User failed');
        });
});

// api to authenticate user based on given email id and password
userRoutes.route('/signin').post(function (req, res) {
    console.log(req.body)
    const { email, password } = req.body;
    User.findOne({ email }, function (err, user) {
        if (err) {
            console.error(err);
            res.status(500)
                .json({
                    error: 'Internal error please try again'
                });
        } else if (!user) {
            res.status(401)
                .json({
                    error: 'Incorrect email or password'
                });
        } else {
            user.isCorrectPassword(password, function (err, same) {
                if (err) {
                    res.status(500)
                        .json({
                            error: 'Internal error please try again'
                        });
                } else if (!same) {
                    res.status(401)
                        .json({
                            error: 'Incorrect email or password'
                        });
                } else {
                    res.send("you've been signed in successfully !");
                }
            });
        }
    });
});

app.use('/User', userRoutes);

app.listen(PORT, function () {
    console.log("Server is running on Port: " + PORT);
});