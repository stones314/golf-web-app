//server/src/index.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");

///////////////////////////////////////
// Express stuff
// used for normal fetch requests from client
///////////////////////////////////////
const PORT = process.env.PORT || 3018;

const app = express();

app.use(cors());

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// Process application/json
app.use(bodyParser.json());


// Middleware to log requests
//const reqLogMw = ({logger}) => (req, res, next) => {
//  logger("RECV <<<", req.method, req.url, req.hostname);
//  next();
//}
//app.use(reqLogMw({logger: console.log}));


/*
 * Course Edit State (non-persistent for now):
 */
var ce_state = {
  course: "",
  logged_pos: 0,
  wanted_pos: 0,
  next_pos: ""
}
var ce_order = [];
var ce_positions = [];

/*
 * Load users from file:
 */
var users = {};
const ufiles = fs.readdirSync("users/");
ufiles.forEach(fname => {
  var data = fs.readFileSync("users/" + fname, "utf-8", (err, data) => {
    if (err) {
      console.log("ERR? " + err);
      throw err;
    }
  });
  users[fname] = JSON.parse(data.toString());
});

/*
 * Load courses from file:
 */
var courses = {};
const cfiles = fs.readdirSync("courses/");
cfiles.forEach(fname => {
  var data = fs.readFileSync("courses/" + fname, "utf-8", (err, data) => {
    if (err) {
      console.log("ERR? " + err);
      throw err;
    }
  });
  courses[fname] = JSON.parse(data.toString());
});

/*
 * log-in
 * 
 * Req data:
 *  user    user name
 *  pwd     user pwd
 * 
 * Res data:
 *  ok      0 => OK, 1 => unknown user, 2 => wrong pwd
 *  user    user-data object (see json in folder users/)
 * 
 */
app.post("/test/log-in", (req, res) => {
  const data = req.body;

  var ok = -1;
  if (Object.keys(users).includes(data.user)) {
    if (users[data.user].pwd !== data.pwd) {
      console.log("log-in: unknown pwd for user " + data.user);
      ok = 2;
    }
    else {
      console.log("log-in: OK " + data.user);
      users[data.user].lastLogin = Date();
      ok = 0;
    }
  }
  else {
    console.log("log-in: unknown user " + data.user);
    ok = 1;
  }
  let user = null;
  if (ok === 0) {
    fs.writeFile("users/" + data.user, JSON.stringify(users[data.user]), (err) => {
      if (err) {
        console.log("user save to file error");
        throw err;
      }
    });
    user = users[data.user];
  }
  res.json({ ok: ok, user: user });
});

/*
 * load-course-players
 * 
 * Req data:
 *  user    user name
 * 
 * Res data:
 *  users       array of {name, state} for each other user
 *  courses     array of course data (see json in folder courses/)
 *  user_state  reload of user data for active user
 */
app.post("/test/load-course-players", (req, res) => {
  const data = req.body;
  console.log("load-course-players");

  let c_arr = []
  let u_arr = []

  Object.keys(users).forEach(key => {
    if (users[key].name !== data.user)
      u_arr.push({
        name: users[key].name,
        in_round: users[key].in_round
      });
  });

  Object.keys(courses).forEach(key => {
    c_arr.push(courses[key]);
  });

  res.json({
    users: u_arr,
    courses: c_arr,
    user_state: users[data.user]
  });
});

/*
 * create-new-round
 * 
 * Req data:
 *  users     user name of players in round
 *  course    name of course
 *  tee       index of tee to use
 *  hole      what hole to start on
 * 
 * Res data:
 *  round : ID for the new round
 * 
 */
app.post("/test/create-new-round", (req, res) => {
  const data = req.body;

  console.log("create new round");

  var new_round = 1;

  data.users.forEach(name => {
    console.log(data.users);
    users[name].in_round = new_round;
    fs.writeFile("users/" + name, JSON.stringify(users[name]), (err) => {
      if (err) {
        console.log("user save to file error");
        throw err;
      }
    });
  });

  res.json({ round: new_round });
});

/*
 * create-new-round
 * 
 * Req data:
 *  users     user name of players in round
 *  course    name of course
 *  tee       index of tee to use
 *  hole      what hole to start on
 * 
 * Res data:
 *  round : ID for the new round
 * 
 */
app.post("/test/load-round-status", (req, res) => {
  const data = req.body;

  console.log("load round status for " + data.round);

  res.json({ round: 1 });
});

/*
 * load-ce
 * 
 * Req data:
 * 
 * Res data:
 *  courses   array of course data (see json in folder courses/)
 *  cs_state  stored course edit state
 */
app.post("/test/load-ce", (req, res) => {
  const data = req.body;

  let c_arr = []

  Object.keys(courses).forEach(key => {
    c_arr.push(courses[key]);
  });

  res.json({
    courses: c_arr,
    ce_state: ce_state
  });
});

/*
 * start-ce
 * 
 * Req data:
 *  course    course name
 * 
 * Res data:
 *  cs_state  stored course edit state
 */
app.post("/test/start-ce", (req, res) => {
  const data = req.body;

  var key = "";
  Object.keys(courses).forEach(k => {
    if (courses[k].name === data.course) {
      key = k;
    }
  });

  ce_order = courses[key].tees.concat("Green");

  if (ce_positions.length > 0)
    ce_positions.splice(0, ce_positions.length);

  ce_state.course = key;
  ce_state.logged_pos = 0;
  ce_state.wanted_pos = ce_order.length * courses[key].holes.length;
  ce_state.next_pos = "Hull 1 " + ce_order[0] + " Tee";

  res.json({
    ce_state: ce_state
  });
});

/*
 * log-ce-pos
 * 
 * Req data:
 *  user    user name
 * 
 * Res data:
 *  courses   array of course data (see json in folder courses/)
 *  cs_state  stored course edit state
 */
app.post("/test/log-ce-pos", (req, res) => {
  const data = req.body;

  console.log(data.pos);

  ce_positions.push(data.pos);
  ce_state.logged_pos += 1;

  if (ce_state.logged_pos === ce_state.wanted_pos) {
    ce_state.next_pos = "Ferdig!";
    //TODO: save ce_pos to course
  }
  else {
    const hole = 1 + Math.floor((ce_state.logged_pos) / 3);
    const o = ce_state.logged_pos - (hole - 1) * 3;
    const tee = o + 1 === ce_order.length ? "" : " Tee";
    ce_state.next_pos = "Hull " + hole + " " + ce_order[o] + tee;
  }

  res.json({
    ce_state: ce_state
  });
});



var match_state = {
  hole: 0,
  course: "",
  length: 0,
  tee_id: 0,
  players: [],
  score_card: [],
}

/*
 * load match
 */
app.post("/test/load-match", (req, res) => {
  console.log("load-match: hole " + match_state.hole);
  res.json({
    match_state: match_state
  });
});

/*
 * start match
 *
 * Req data:
 *  course    course name
 *  length    number of holes to go
 *  tee_id    index of tee to use
 *  players   object with
 *    name    name of player
 *    hcp     hcp to use in match
 * 
 * Res data:
 *  match_state   initial match state object with
 *    hole        current hole
 *    course      course selected
 *    length      number of holes to go
 *    tee_id      index of tee to use
 *    players     array of player objects, with:
 *      name      name of player
 *      hcp       hcs in match
 *      shots_given how many shots gained from hcp
 *      holes_won number of holes won
 *    score_card  array with data about score and course
 *      hole    hole number
 *      par     par for hole
 *      hcp     hcp index for hole
 *      shots   array of shot data for each player
 *        used  how many shots the player used (-1 => not yet played this hole, -2 conceded hole)
 *        given how many shots player was given on hole
 *        won   0 => player did not have best score, 1 => this player had best score
 */
app.post("/test/start-match", (req, res) => {
  const data = req.body;
  console.log("start-match");

  match_state = {
    hole: 1,
    course: data.course,
    length: data.length,
    tee_id: data.tee_id,
    players: [],
    score_card: [],
  }

  let c_key = data.course.toLowerCase() + ".json";
  let course = courses[c_key];

  let cp = 0;
  course.holes.forEach(hole => {
    cp += hole.par;
  });

  data.players.forEach(player => {
    let sg = calc_shots_given(
      users[player.name].hcp,
      course.slope[data.tee_id],
      course.verdi[data.tee_id],
      cp
    );
    console.log(player.name + " is given " + sg + " shots");
    match_state.players.push({
      name: player.name,
      hcp: 20,//users[player.name].hcp,
      shots_given: sg,
      holes_won: 0
    });
  });

  for (var i = 0; i < data.length; i++) {
    let shots = []
    match_state.players.forEach(player => {
      shots.push({
        used: -1,
        given: calc_shots_given_hole(player.shots_given, course.holes[i].index),
        won: 0
      });
    });
    match_state.score_card.push({
      hole: i + 1,
      par: course.holes[i].par,
      hcp: course.holes[i].index,
      shots: shots
    });
  }

  res.json({
    match_state: match_state
  });
});

/*
 * log-match-hole
 * 
 * Req data:
 *  hole    hole number
 *  shots   array with number of shots used per player
 * 
 * Res data:
 *  match_state  stored match state
 */
app.post("/test/log-match-hole", (req, res) => {
  const data = req.body;
  console.log("log-match-hole");

  if (match_state.hole !== data.hole) {
    console.log("Error: log for wrong hole in match");

  }
  else {
    let minst = 90;
    for (const [i, ] of match_state.players.entries()) {
      match_state.score_card[data.hole-1].shots[i].used = data.shots[i];
      var s = data.shots[i] - match_state.score_card[data.hole-1].shots[i].given;
      if (s < minst) minst = s;
    }
    let n_min = 0;
    for (const [i, ] of match_state.players.entries()) {
      var s = data.shots[i] - match_state.score_card[data.hole-1].shots[i].given;
      if (s === minst) {
        n_min++;
      }
    }
    for (const [i, ] of match_state.players.entries()) {
      var s = data.shots[i] - match_state.score_card[data.hole-1].shots[i].given;
      if (s === minst && n_min === 1) {
        match_state.score_card[data.hole-1].shots[i].won = 1;
        match_state.players[i].holes_won++;
      }
    }
  }

  match_state.hole++;

  res.json({
    match_state: match_state
  });
});


/*
 * log-match-hole
 * 
 * Req data:
 *  hole    hole number
 *  shots   array with number of shots used per player
 * 
 * Res data:
 *  match_state  stored match state
 */
app.post("/test/end-match", (req, res) => {
  const data = req.body;
  console.log("end-match");

  match_state.hole = 0;

  res.json({
    ok: true
  });
});

//
// LISTEN! removed after using https server above
//
app.listen(PORT, () => {
  console.log(`Express Server listening on ${PORT}`);
});

function calc_shots_given(player_hcp, course_slope, course_val, course_par) {
  console.log("p_hcp : " + player_hcp + ", c_s : " + course_slope + ", c_v : " + course_val + ", c_p : ", course_par);
  let total_given = player_hcp * course_slope / 113.0 + course_val - course_par;
  return Math.round(total_given);
}

function calc_shots_given_hole(total_given, hole_hcp) {
  let base = Math.floor(total_given / 18);
  let rest = total_given - base * 18;
  let hole_given = base;
  if (hole_hcp <= rest) hole_given += 1;
  return hole_given;
}