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

//TEXT2SPEECH
const textToSpeech = require("@google-cloud/text-to-speech");

// Import other required libraries
// const fs = require("fs");
// const util = require("util");
const projectId = "castlefortress-game";
const keyFilename = "CastleFortress-Game-6db995a78ddf.json";
// Creates a client
const clientGCP = new textToSpeech.TextToSpeechClient({
  projectId,
  keyFilename,
});

// END TEXT2SPEECH

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
app.get("/test", async (req, res) => {
  // Imports the Google Cloud client library
  // const textToSpeech = require("@google-cloud/text-to-speech");

  // // Import other required libraries
  // // const fs = require("fs");
  // // const util = require("util");
  // const projectId = "castlefortress-game";
  // const keyFilename = "CastleFortress-Game-6db995a78ddf.json";
  // // Creates a client
  // const client = new textToSpeech.TextToSpeechClient({
  //   projectId,
  //   keyFilename,
  // });

  // The text to synthesize
  const text = "hello, world!";

  // Construct the request
  const request = {
    input: { text: text },
    // Select the language and SSML voice gender (optional)
    voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
    // select the type of audio encoding
    audioConfig: { audioEncoding: "MP3" },
  };

  // Performs the text-to-speech request
  const [response] = await clientGCP.synthesizeSpeech(request);

  // Write the binary audio content to a local file
  // const writeFile = util.promisify(fs.writeFile);
  // await writeFile("output.mp3", response.audioContent, "binary");
  // console.log("Audio content written to file: output.mp3");
  return res.status(200).send(response);
});

//Testing Speech

app.post("/speech_test", (req, res) => {
  console.info("AUDIO_RECIVED", req.body);

  const url = "https://api.wit.ai/speech";

  return fetch(url, {
    method: "POST",
    body: req.body,
    headers: {
      "Content-Type": "audio/wav",
      Authorization: "Bearer WJNHREJLFURRUENIER2I5W5OVBWUGTWP",
    },
  })
    .then((res) => res.json())
    .then(async (data) => {
      return res.status(200).send(data);
    })
    .catch((error) => res.status(500).send(error));
});

app.post("/speech_conv_test", (req, res) => {
  console.info("AUDIO_RECIVED", req.body);

  const url = "https://api.wit.ai/speech";

  return fetch(url, {
    method: "POST",
    body: req.body,
    headers: {
      "Content-Type": "audio/wav",
      Authorization: "Bearer WJNHREJLFURRUENIER2I5W5OVBWUGTWP",
    },
  })
    .then((res) => res.json())
    .then(async (data) => {
      //Here is where the magic happends
      const intent = (data.intents.length > 0 && data.intents[0]) || "__foo__";
      const user_txt = data.text;

      const entities =
        (data.entities.length > 0 && data.entities[0]) || "__foo__";

      let ans = "";
      switch (intent.name) {
        case "greetingIntent":
          ans = await handleGreeting(data);
          //await docRef.add(ans);
          return res.status(200).send(ans);
        case "insultIntent":
          ans = await handleInsult(data);
          //await docRef.add(ans);
          return res.status(200).send(ans);
      }
      ans = formateResponse(
        001,
        user_txt,
        "Neultra",
        "I'm sorry, I am not able to understand, please ask me in another way or something else 😓",
        -1
      );
      //await docRef.add(ans);
      return res.status(200).send(ans);
    })
    .catch((error) => res.status(500).send("Error" + error));
});

async function handleInsult(data) {
  const user_txt = data.text;

  const entity_name =
    data.entities["wit$contact:contact"] &&
    data.entities["wit$contact:contact"][0];

  // const sentiment =
  //   data.traits["wit$sentiment:sentiment"] &&
  //   data.traits["wit$sentiment:sentiment"][0];

  let insult = entity_name.value;

  if (insult == null) {
    insult = " ";
  }

  // const sentiment =
  //   data.traits["wit$sentiment:sentiment"] &&
  //   data.traits["wit$sentiment:sentiment"][0];

  // let detected_sentiment = sentiment.value;

  // if (detected_sentiment == null) {
  //   detected_sentiment = " ";
  // }

  let = p_ans = [
    "Fuck you!",
    "Hey motherfucker, you are the" + insult + "!",
    "Fuck you, you are the" + insult + "!",
  ];
  const respo = formateResponse(
    001,
    user_txt,
    "Negative",
    p_ans[Math.floor(Math.random() * p_ans.length)],
    7
  );
  return respo;
}

async function handleGreeting(data) {
  const user_txt = data.text;

  const entity_name =
    data.entities["wit$contact:contact"] &&
    data.entities["wit$contact:contact"][0];

  // const sentiment =
  //   data.traits["wit$sentiment:sentiment"] &&
  //   data.traits["wit$sentiment:sentiment"][0];

  let user_name = entity_name.value;

  console.log("USER_NAME", user_name);

  if (user_name == null) {
    user_name = " ";
  }

  // let detected_sentiment = sentiment.value;
  // console.log("SENTIMENT", sentiment.value);

  // if (detected_sentiment == null) {
  //   detected_sentiment = " ";
  // }

  let = p_ans = [
    "Hello There!",
    "Hi " + user_name + "!, I'm John Snow, how may I help you?",
  ];
  const respo = formateResponse(
    001,
    user_txt,
    "Neutral",
    p_ans[Math.floor(Math.random() * p_ans.length)],
    0
  );
  return respo;
}

async function text2speech(text) {
  // The text to synthesize

  // Construct the request
  const request = {
    input: { text: text },
    // Select the language and SSML voice gender (optional)
    voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
    // select the type of audio encoding
    audioConfig: { audioEncoding: "MP3" },
  };

  // Performs the text-to-speech request
  const [response] = await clientGCP.synthesizeSpeech(request);

  // Write the binary audio content to a local file
  // const writeFile = util.promisify(fs.writeFile);
  // await writeFile("output.mp3", response.audioContent, "binary");
  // console.log("Audio content written to file: output.mp3");
  return response;
}
//FORMATTING RESPONSE TO SEND
async function formateResponse(id, user_txt, sentiment, message, ansimg) {
  let img = "";

  const speech = await text2speech(message);

  /*
    Code of images
    0-> Dude 
    1-> Woman
  */

  switch (ansimg) {
    case 0:
      img =
        "https://firebasestorage.googleapis.com/v0/b/castlefortress-game.appspot.com/o/characters%2Fdude0.jpeg?alt=media&token=d637efa8-866d-4acc-b141-73b07d7bf119";
      break;
    case 1:
      img =
        "https://firebasestorage.googleapis.com/v0/b/castlefortress-game.appspot.com/o/characters%2Fdude1.jpeg?alt=media&token=1c22ec2e-23bd-4e56-9229-e19fd08d28f8";
      break;
    case 7:
      img =
        "https://firebasestorage.googleapis.com/v0/b/castlefortress-game.appspot.com/o/istockphoto-984735510-640x640.jpg?alt=media&token=b6d21833-4b76-4b99-912f-373b392aea28";
      break;

    default:
      img = "";
      break;
  }

  let data = {
    idChat: id,
    user_txt: user_txt,
    uid: "X4TkYxTgloQlFjgPKO6ciKSUeL63",
    sentiment: sentiment,
    message: message,
    img_url: img,
    speech: speech,
  };

  return data;
}

//Setup TEST Wit.AI
app.post("/witai_test", (req, res) => {
  const message = req.body.message;
  console.log(message);
  client
    .message(message)
    .then(async (data) => {
      const intent = (data.intents.length > 0 && data.intents[0]) || "__foo__";

      let ans = "";
      switch (intent.name) {
        case "distanceBetween":
          ans = await handleDistanceBetween(data);
          console.log(ans);
          res.status(200).send(ans);
          break;
        case "timeAtPlace":
          ans = await handleTimeAtPlace(data);
          console.log(ans);
          res.status(200).send(ans);
          break;
      }

      res.status(202).send("Sorry Bruh, I don't know what to answer you :'v");
    })
    .catch((error) => res.status(400).send(error));
});

function handleGibberish() {
  return res
    .status(202)
    .send("Sorry Bruh, I don't know what to answer you :'v");
}

// ----------------------------------------------------------------------------
// handleDistanceBetween

function handleDistanceBetween(data) {
  const location = data.entities["wit$location:location"];
  if (location == null || location.length != 2) {
    return handleGibberish();
  }

  var loc0 = location[0].resolved.values[0];
  var loc1 = location[1].resolved.values[0];
  var distance = getDistanceFromLatLonInKm(
    loc0.coords.lat,
    loc0.coords.long,
    loc1.coords.lat,
    loc1.coords.long
  );
  distance = roundTo(distance, 0.01);
  return Promise.resolve(
    `It's ${distance}km from ${loc0.name} to ${loc1.name}`
  );
}

//https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1); // deg2rad below
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

function roundTo(val, round) {
  return Math.floor(val / round) * round;
}

// ----------------------------------------------------------------------------
// handleTimeAtPlace

function handleTimeAtPlace(data) {
  const loc =
    data.entities["wit$location:location"] &&
    data.entities["wit$location:location"][0];
  if (loc == null) {
    return handleGibberish();
  }

  const tz = loc.resolved.values[0].timezone;
  const placeName = loc.resolved.values[0].name;

  return currentTimeFromTimezone(tz).then((res) => {
    return `It's currently ${res} in ${placeName}`;
  });
}

function currentTimeFromTimezone(loc) {
  const url = "http://worldtimeapi.org/api/timezone/" + loc;

  return fetch(url, {})
    .then((res) => res.json())
    .then((data) => {
      //trim off the timezone to avoid date auto-adjusting
      const time = data.datetime.substring(0, 19);
      return new Date(time).toUTCString("en-US").substring(0, 22);
    });
}
//Ending Test API
