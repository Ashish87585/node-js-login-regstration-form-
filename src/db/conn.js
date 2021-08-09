const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost:27017/employees", {
    useCreateIndex: true,
    useFindAndModify: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connection success");
  })
  .catch((e) => {
    console.log("connection failed", e);
  });
