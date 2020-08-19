const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const bodyParser = require("body-parser");
const unirest = require("unirest");
const { Wit, log } = require("node-wit");
const interactive = require("node-wit").interactive;
const fetch = require("node-fetch");

const cors = require("cors");

admin.initializeApp();

const db = admin.firestore();

const app = express();
const main = express();

main.use("/api/v1", app);
main.use(cors({ origin: false }));
main.use(bodyParser.json());
main.use(bodyParser.urlencoded({ extended: true }));

const client = new Wit({
  accessToken: "WJNHREJLFURRUENIER2I5W5OVBWUGTWP",
  logger: new log.Logger(log.DEBUG), // optional
});

exports.webApi = functions.https.onRequest(main);

//Testing
app.get("/test", (req, res) => {
  res.status(200).send("TESTING API");
});
