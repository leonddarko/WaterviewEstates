const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


const app = express();
const port = 1010;


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(session({
    secret: "SaveASecret",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// mongoose.connect("mongodb://localhost:27017/wvedb", { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connect("mongodb+srv://admin-leonddarko:AdminTheOptimist91@webappcluster0.4hdq0.mongodb.net/wvedb", { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    name: String,
    role: String,
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);


passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.route("/")
    .get((req, res) => {
        res.render("index");
    });

app.route("/about")
    .get((req, res) => {
        res.render("about");
    });

app.route("/city")
    .get((req, res) => {
        res.render("city");
    });

app.route("/site")
    .get((req, res) => {
        res.render("site");
    });

app.route("/homes")
    .get((req, res) => {
        res.render("homes");
    });

app.route("/cpanel-login")
    .get((req, res) => {
        res.render("cpanel-login", {
            emailError: "",
            wrongPswerror: "",
        });
    })
    .post((req, res) => {
        const username = req.body.username;
        const password = req.body.password;

        const user = new User({
            username: username,
            password: password,
        });

        req.login(user, (error) => {
            if (error) {
                console.log(error);
                //   res.render("cpanel-login", {
                //     emailError: "(!) Couldn't find this email",
                //     wrongPswerror: "Wrong password! Try again.",
                //   });
            } else {
                passport.authenticate("local")(req, res, () => {
                    res.redirect("/cpanel");
                });
            }
        });

    });

app.route("/cpanel")
    .get((req, res) => {

        if (req.isAuthenticated()) {
            User.find({}, (error, foundUsers) => {
                if (!error) {
                    res.render("cpanel", {
                        // pageTitle: "cPanel",
                        Users: foundUsers,
                    });
                } else {
                    console.log(error);
                }
            });
        } else {
            res.redirect("/cpanel-login");
        }
    })
    .post((req, res) => {
        const Button = req.body.btn;
        const Name = req.body.name;
        const Username = req.body.username;
        const Role = req.body.role;
        const Password = req.body.password;
        const userID = req.body.userID;

        if (Button === "adduser") {
            User.register({ username: Username, name: Name, role: Role }, Password, (error, user) => {
                if (error) {
                    console.log(error);
                    res.redirect("/cpanel");
                } else {
                    passport.authenticate("local")(req, res, () => {
                        res.redirect("/cpanel");
                    });
                }
            });
        } else if (Button === "deleteuser") {
            User.findByIdAndRemove({ _id: userID }, (error) => {
                if (!error) {
                    res.redirect("/cpanel");
                }
            });
        } else if (Button === "edituser") {
            console.log(userID, Name, Username, Role);
            User.findByIdAndUpdate({ _id: userID },
                { username: Username, name: Name, role: Role }, (error) => {
                    if (!error) {
                        console.log("User updates successful :) on ID" + userID);
                        res.redirect("/cpanel")
                    } else {
                        console.log(error);
                    }
            });
        }

    });

app.route("/logout")
    .get((req, res) => {
        req.logout((error) => {
            if (error) {
                console.log(error);
            }
        });
        res.redirect("/cpanel-login");
    });

app.listen(port, () => {
    console.log(`Application running at http://localhost:${port}`);
})
