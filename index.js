const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

app.use(cors());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

let users = [];
let exercises = [];

app.post('/api/users', (req, res) => {
  const username = req.body.username;
  const _id = Math.random().toString(36).substring(2, 10);
  const newUser = { username, _id };
  users.push(newUser);
  res.json(newUser);
});

app.get("/api/users", (req, res) => {
  res.json(users);
});

app.post("/api/users/:_id/exercises", (req, res) => {
  const user = users.find(u => u._id === req.params._id);
  if (!user) return res.status(400).json({ error: "User not found" });

  const description = req.body.description;
  const duration = parseInt(req.body.duration);
  let date = req.body.date ? new Date(req.body.date) : new Date();

  if (isNaN(date.getTime())) {
    date = new Date();
  }

  const exercise = {
    userId: user._id,
    username: user.username,
    description,
    duration,
    date: date.toDateString()
  };

  exercises.push({
    userId: user._id,
    description,
    duration,
    date: date
  });

  res.json({
    _id: user._id,
    username: user.username,
    description,
    duration,
    date: date.toDateString()
  });
});

app.get("/api/users/:_id/logs", (req, res) => {
  const user = users.find(u => u._id === req.params._id);
  if (!user) return res.status(400).json({ error: "User not found" });

  let { from, to, limit } = req.query;
  let log = exercises.filter(ex => ex.userId === user._id);

  if (from) {
    let fromDate = new Date(from);
    if (!isNaN(fromDate.getTime())) {
      log = log.filter(ex => ex.date >= fromDate);
    }
  }

  if (to) {
    let toDate = new Date(to);
    if (!isNaN(toDate.getTime())) {
      log = log.filter(ex => ex.date <= toDate);
    }
  }

  if (limit) {
    log = log.slice(0, parseInt(limit));
  }

  const formattedLog = log.map(ex => ({
    description: ex.description,
    duration: ex.duration,
    date: ex.date.toDateString()
  }));

  res.json({
    _id: user._id,
    username: user.username,
    count: formattedLog.length,
    log: formattedLog
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
