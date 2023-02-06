const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
app.use(express.json());
module.exports = app;
const db_path = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

const initalizeDbAndServer = async () => {
  try {
    db = await open({
      filename: db_path,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("Server is Running!");
    });
  } catch (error) {
    console.log(`Datbase Error ${error.message}`);
  }
};
initalizeDbAndServer();

//API 1

app.get("/players/", async (request, response) => {
  const query1 = `SELECT player_id AS playerId,player_name AS playerName
    FROM player_details;`;
  const playersList = await db.all(query1);
  response.send(playersList);
});

//API 2

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const query2 = `SELECT player_id AS playerId, player_name AS playerName
    FROM player_details WHERE player_id=${playerId};`;
  const player = await db.get(query2);
  response.send(player);
});

//API 3
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const query3 = `UPDATE player_details SET player_name='${playerName}'
    WHERE player_id=${playerId}`;
  await db.run(query3);
  response.send("Player Details Updated");
});

//API 4
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const query4 = `SELECT match_id AS matchId, match AS match, year AS year
    FROM match_details WHERE match_id=${matchId};`;
  const matchDetails = await db.get(query4);
  response.send(matchDetails);
});

//API 5
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const query5 = `
    SELECT match_details.match_id AS matchId, match_details.match AS match, match_details.year AS year
    FROM (player_details INNER JOIN player_match_score ON player_details.player_id=player_match_score.player_id) AS T INNER JOIN match_details ON match_details.match_id=T.match_id
    WHERE T.player_id=${playerId}`;
  const matchesList = await db.all(query5);
  response.send(matchesList);
});

//API 6
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const query6 = `
    SELECT player_details.player_id AS playerId, player_details.player_name AS playerName
    FROM (match_details INNER JOIN player_match_score ON match_details.match_id=player_match_score.match_id) AS T INNER JOIN player_details ON player_details.player_id=T.player_id
    WHERE T.match_id=${matchId}`;
  const playersList = await db.all(query6);
  response.send(playersList);
});

//API 7
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const query7 = `SELECT player_details.player_id AS playerId, player_details.player_name AS playerName,sum(score) AS totalScore,sum(fours) AS totalFours,sum(sixes) AS totalSixes
    FROM player_details INNER JOIN player_match_score ON player_details.player_id=player_match_score.player_id
    WHERE player_details.player_id=${playerId};`;
  const player = await db.get(query7);
  response.send(player);
});
