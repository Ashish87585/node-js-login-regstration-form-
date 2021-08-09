require('dotenv').config();
const express = require("express");
const path = require("path");
const hbs = require("hbs");
const bcrypt = require("bcryptjs");
const app = express();
require("../src/db/conn");
const Register = require("./models/registers");
const jwt = require("jsonwebtoken");
const cookieParser = require('cookie-parser');
const auth = require('./middleware/auth');

const port = process.env.PORT || 3000;

const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partial_path = path.join(__dirname, "../templates/partials");
// console.log(path.join(__dirname , "../public"))

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partial_path);

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/secret", auth, (req, res) => {
  console.log(`This is cookie ${req.cookies.jwt}`); 
  res.render("secret");
});

app.get("/logout", auth, async (req, res) => {
  try{
    res.clearCookie("jwt")
    console.log("logout successfully");
    //logout for single device
    req.user.tokens = req.user.tokens.filter((currentToken) => {
      return currentToken.token !== req.token
    })

    //logout from all devices
    req.user.tokens = [];

    await req.user.save();
    res.render("login")
    }catch(e){
    res.status(500).send(e)
  }
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/register", async (req, res) => {
  try {
    const password = req.body.password;
    const cpassword = req.body.cpassword;

    if (password === cpassword) {
      const registerEmployee = new Register({
        fname: req.body.fname,
        lname: req.body.lname,
        age: req.body.age,
        phone: req.body.phone,
        email: req.body.email,
        gender: req.body.gender,
        password: req.body.password,
        cpassword: req.body.cpassword,
      });

      const token = await registerEmployee.generateAuthToken();

      res.cookie("jwt" , token , {
        expires : new Date(Date.now() + 600000),
        httpOnly:true
      });

      const register = await registerEmployee.save();
      console.log(register);
      res.status(201).render("index");
    } else {
      res.send("Password and confirm password not same");
    }
  } catch (e) {
    res.status(400).send(e);
  }
});

app.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userEmail = await Register.findOne({ email: email });
    const isMatch = await bcrypt.compare(password , userEmail.password);

    const token = await userEmail .generateAuthToken();

    res.cookie("jwt" , token , {
      expires : new Date(Date.now() + 600000),
      httpOnly:true
    });
    // res.send(userEmail)
    if (isMatch) {
      res.status(201).render("index");
    } else {
      res.send("Invalid login details");
    }
  } catch (e) {
    res.status(400).send("Invalid login details");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
