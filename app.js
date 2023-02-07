var express = require("express");
var app = express();
app.set("view engine", "ejs");
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
const validator=require("validator");
 app.use(express.json());
const userRouter = require("./routes/user");
const itemRouter = require("./routes/item");
const cartRouter = require("./routes/cart");
require("./db/mongoose");
app.use("/", userRouter);
app.use("/", itemRouter);
app.use("/", cartRouter);
const port = process.env.PORT;
app.get("/", (req, res) => {
  res.send("hello");
});
app.listen(port);
