const express = require("express");
const bodyParser = require("body-parser");
const app = express();
import router from "./api/routes";
const server_port = process.env.PORT || 4500; //change as necessary

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(bodyParser.json()); // Repayment data to be uploaded is in JSON format so use json middleware
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies.

app.use("/api/v1", router);

app.listen(server_port, () => {
  console.log(
    `Seasonless Repayment System backend server is running on port ${server_port} port`
  );
});

module.exports = app; // for unit testing
