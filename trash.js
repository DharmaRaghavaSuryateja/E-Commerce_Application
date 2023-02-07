var express = require("express");
var app = express();
var path = require("path");
app.set("views", path.join(__dirname, "views"));
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
var cors = require("cors");
app.use(cors());
const validator = require("validator");
app.use(express.json());
app.get("/", (req, res) => {
  res.render("emo", { result: "hello" });
});
app.listen(2000);
