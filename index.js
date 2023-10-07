const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
let bodyParser = require("body-parser");
require("dotenv").config();

mongoose.connect(process.env["MONGO_URI"], {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

console.log("DB connected!!!");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

const UserSchema = new mongoose.Schema({
  username: String,
});

let User = mongoose.model("User", UserSchema);

app.post("/api/users", async (req, res) => {
  let addUser = new User({ username: req.body.username });
  addUser.save();
  res.json(addUser);
});

app.get("/api/users", async (req, res) => {
  let allUsers = await User.find({});
  res.json(allUsers);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
