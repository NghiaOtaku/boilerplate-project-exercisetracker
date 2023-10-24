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

const ExerciseSchema = new mongoose.Schema({
  idUser: {
    type: mongoose.Schema.Types.String,
    ref: "User",
  },
  timestamp: Number,
  log: {
    description: String,
    duration: Number,
    date: {
      type: String,
      default: Date.now,
    },
  },
});

let Exercise = mongoose.model("Exercise", ExerciseSchema);

app.post("/api/users", async (req, res) => {
  let addUser = new User({ username: req.body.username });
  addUser.save();
  res.json(addUser);
});

app.get("/api/users", async (req, res) => {
  let allUsers = await User.find({});
  res.json(allUsers);
});

app.post("/api/users/:_id/exercises", async (req, res) => {
  try {
    let findUser = await User.findOne({ _id: req.params._id });
    let d = req.body.date
      ? new Date(req.body.date).toDateString()
      : new Date().toDateString();
    let day = Date.parse(d) + 86400000;
    let addExercise = new Exercise({
      idUser: req.params._id,
      timestamp: day,
      log: {
        description: req.body.description,
        duration: req.body.duration,
        date: d,
      },
    });
    addExercise.save();
    res.json({
      username: findUser.username,
      description: req.body.description,
      duration: Number(req.body.duration),
      date: d,
      _id: req.params._id,
    });
  } catch {
    (err) => res.json(err);
  }
});

//GET /api/users/:_id/logs?[from][&to][&limit]

app.get("/api/users/:_id/logs", async (req, res) => {
  let { from, to, limit } = req.query;
  let dayEnd = Date.parse(to) || Date.now() + 86400000;
  let dayStart = Date.parse(from) || 0;
  let findUser = await User.findOne({ _id: req.params._id });
  let findExerciseLog = await Exercise.find({ idUser: req.params._id });
  let sortExerciseLog = findExerciseLog.sort((a, b) => {
    return b.timestamp - a.timestamp;
  });
  let number =
    limit && limit < findExerciseLog.length ? limit : findExerciseLog.length;
  console.log(number);
  let filterExerciseLog = sortExerciseLog
    .filter((x) => x.timestamp >= dayStart && x.timestamp <= dayEnd + 86400000)
    .slice(0, Number(number))
    .map((x) => x.log);
  res.json({
    _id: req.params._id,
    username: findUser.username,
    count: filterExerciseLog.length,
    log: filterExerciseLog,
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
