const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const bodyParser = require("body-parser");
const unirest = require("unirest");
const { Wit, log } = require("node-wit");
const interactive = require("node-wit").interactive;
const fetch = require("node-fetch");

const Tbase64 = require("base-64");

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
  console.info("DATA_RECIVED", req.body);

  const url = "https://api.wit.ai/speech";
  const fileCreated = arrayBufferToBase64(req.body.audioContent.data);
  //console.log("FILE CREATED AFTER RESPONSE", fileCreated);
  const buffered_response = Buffer.from(fileCreated, "base64");
  let rdata = {
    id: req.body.idChat,
    audioContent: buffered_response,
  };

  console.log("OBJETO", rdata);
  // res.status(200).send(rdata);
  return fetch(url, {
    method: "POST",
    body: buffered_response,
    headers: {
      "Content-Type": "audio/wav",
      Authorization: "Bearer WJNHREJLFURRUENIER2I5W5OVBWUGTWP",
    },
  })
    .then((res) => res.json())
    .then(async (data) => {
      res.status(200).send(data);
    })
    .catch((error) => res.status(500).send(error));
});

arrayBufferToBase64 = (buffer) => {
  var binary = "";
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return Tbase64.encode(binary);
};

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
      ans = await handleNone(data);
      //await docRef.add(ans);
      return res.status(200).send(ans);
    })
    .catch((error) => res.status(500).send("Error" + error));
});

async function handleInsult(data) {
  const user_txt = data.text;

  const entity_name =
    data.entities["insult:insult"] && data.entities["insult:insult"][0];

  let insult = entity_name.value ? entity_name.value : " ";

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
async function handleNone(data) {
  const user_txt = data.text;

  // const sentiment =
  //   data.traits["wit$sentiment:sentiment"] &&
  //   data.traits["wit$sentiment:sentiment"][0];

  // let detected_sentiment = sentiment.value;
  // console.log("SENTIMENT", sentiment.value);

  // if (detected_sentiment == null) {
  //   detected_sentiment = " ";
  // }

  let = p_ans = [
    "Sorry I didn't understand you, try again!",
    "Fuck m8, No fucking clue, try again!",
    "I'm sorry, I am not able to understand, please ask me in another way or something else 😓",
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
async function handleGreeting(data) {
  const user_txt = data.text;

  const entity_name =
    data.entities["wit$contact:contact"] &&
    data.entities["wit$contact:contact"][0];

  // const sentiment =
  //   data.traits["wit$sentiment:sentiment"] &&
  //   data.traits["wit$sentiment:sentiment"][0];

  let user_name = entity_name ? entity_name.value : "Handsome";

  console.log("USER_NAME", user_name);

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
    voice: {
      languageCode: "en-GB",
      name: "en-GB-Wavenet-C",
      ssmlGender: "FEMALE",
    },
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

  let data = {
    idChat: id,
    user_txt: user_txt,
    uid: "X4TkYxTgloQlFjgPKO6ciKSUeL63",
    sentiment: sentiment,
    message: message,
    img_avatar: 1,
    img_landscape: 1,
    speech: speech,
  };

  return data;
}

//Setup TEST Wit.AI

//Ending Test API

//THIS IS THE REAL DEAL----
app.post("/gameNPL", (req, res) => {
  console.info("DATA_RECIVED", req.body);

  const url = "https://api.wit.ai/speech";
  const fileCreated = arrayBufferToBase64(req.body.audioContent.data);
  //console.log("FILE CREATED AFTER RESPONSE", fileCreated);
  const buffered_response = Buffer.from(fileCreated, "base64");
  let rdata = {
    id: req.body.idChat,
    audioContent: buffered_response,
  };

  console.log("OBJETO", rdata);
  // res.status(200).send(rdata);
  return fetch(url, {
    method: "POST",
    body: buffered_response,
    headers: {
      "Content-Type": "audio/wav",
      Authorization: "Bearer WJNHREJLFURRUENIER2I5W5OVBWUGTWP",
    },
  })
    .then((res) => res.json())
    .then(async (data) => {
      //Here is where the magic happens
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
      ans = await handleNone(data);
      //await docRef.add(ans);
      return res.status(200).send(ans);
    })
    .catch((error) => res.status(500).send(error));
});
