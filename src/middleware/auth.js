const jwt = require("jsonwebtoken");
const Register = require("../models/registers");

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    const verifyEmp = jwt.verify(token, process.env.SECRET_KEY);
    const user = await Register.findOne({ _id: verifyEmp._id });
    req.user = user;
    req.token = token;
    next();
  } catch (e) {
    res.status(401).send(e);
  }
};

module.exports = auth;
