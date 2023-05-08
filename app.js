const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "covid19IndiaPortal.db");

const app = express();
app.use(express.json());

let db = null;

const initializationDbAndSever = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("sever is running at http://localhost:3000");
    });
  } catch (error) {
    console.log(`db error ${error.massage}`);
    process.exit(1);
  }
};

initializationDbAndSever();

app.get("/states/", async (request, response) => {
  const getStatesQuery = `select * from state;`;
  const stateArray = await db.all(getStatesQuery);
  response.send(stateArray);
});

app.get("/states/:stateId/", async (request, response) => {
  const getStatesQuery = `select * from state where state_id = 8;`;
  const stateArray = await db.all(getStatesQuery);
  response.send(stateArray);
});

app.get("/districts/:districtId/", async (request, response) => {
  const getStatesQuery = `select * from district where district_id = 764;`;
  const stateArray = await db.all(getStatesQuery);
  response.send(stateArray);
});

app.post("/districts/", async (request, response) => {
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;

  const addDistrictQuery = `
   insert into 
   district (
    district_name,
    state_id,
    cases,
    cured,
    active,
    deaths
    )

    values
     (
        '${districtName}',
        ${stateId},
        ${cases},
        ${cured},
        ${active},
        ${deaths}
    );
   `;

  const dbResponse = await db.run(addDistrictQuery);
  const districtId = dbResponse.lastID;
  response.send("District add Successfully");
});

app.put("/districts/:districtId/", async (req, res) => {
  const { districtId } = req.params;
  const districtDetails = req.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;

  const updateDistrictQuery = `
        update 
        district
        set

    district_name = '${districtName}',
    state_id = ${stateId},
    cases = ${cases},
    cured = ${cured},
    active = ${active},
    deaths = ${deaths}
   where district_id = ${districtId};`;

  await db.run(updateDistrictQuery);
  res.send("update is successfully");
});

app.delete("/districts/:districtId/", async (req, res) => {
  const { districtId } = req.params;
  const deleteQuery = `
      delete from district where district_id = ${districtId};`;
  await db.run(deleteQuery);
  res.send("District Removed");
});

app.get("/states/:stateId/stats/", (req, res) => {
  const { stateId } = req.params;
  const getStatesQuery = `
    select * from state where state_id = ${stateId};`;
  const statesArray = db.all(getStatesQuery);
  res.send(statesArray);
});

app.post("/login/", async (req, res) => {
  const { username, password } = req.body;
  const postLoginQuery = `
    select * from user where username ='${username}';`;
  const userDb = await db.get(postLoginQuery);

  if (userDb === undefined) {
    res.status(400);
    res.send("Invalid user");
  } else {
    res.send("login success");
  }
});
