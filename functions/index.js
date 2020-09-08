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

//Setup TEST Wit.AI

//Ending Test API

//THIS IS THE REAL DEAL----
app.post("/gameNPL", async (req, res) => {
  console.info("DATA_RECIVED", req.body);

  const idChat = req.body.idChat;

  if (idChat === 0) {
    let ans2 = await handleInitial(idChat);
    return res.status(200).send(ans2);
  }

  const url = "https://api.wit.ai/speech";
  const fileCreated = arrayBufferToBase64(req.body.audioContent.data);
  //console.log("FILE CREATED AFTER RESPONSE", fileCreated);
  const buffered_response = Buffer.from(fileCreated, "base64");

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
        case "handleGreeting":
          ans = await handleGreeting(idChat, data);
          return res.status(200).send(ans);
        case "handleCreators":
          ans = await handleCreators(idChat, data);
          return res.status(200).send(ans);

        default:
          ans = await handleNone(idChat, data);
          return res.status(200).send(ans);
      }
    })
    .catch((error) => res.status(500).send(error));
});

//Getting info TEXT, LANDSCAPE, AVATAR

async function getContext(id) {
  console.log("CONTEXT_FUNCTION", id);
  let query = db.collection("story").doc(parseInt(id).toString());
  let item = await query.get();
  console.log("ITEM", item);
  let response = {
    text: item.data().text,
    landscape: item.data().landscape,
    character: item.data().character,
  };
  console.log("RESPONSE_STORY", response);
  return response;
}

async function getVoiceConf(id) {
  let query = db.collection("voices").doc(parseInt(id).toString());
  let item = await query.get();
  let response = {
    character: item.data().character,
    languageCode: item.data().languageCode,
    name: item.data().name,
    pitch: item.data().pitch,
    speakingRate: item.data().speakingRate,
  };
  console.log("RESPONSE_VOICE_CONFIGURATION", response);
  return response;
}

//When the API don't know what to answer
async function handleNone(idChat, data) {
  const user_txt = data.text;

  let = p_ans = [
    "Sorry, I didn't get that!",
    "What? can you repeat please",
    "I can't help you with that yet, lets keep going were we left",
  ];

  let context = {
    text: p_ans[Math.floor(Math.random() * p_ans.length)],
    landscape: -1,
    character: -1,
  };

  let voice = await getVoiceConf(7);

  const respo = formateResponse(idChat, user_txt, voice, context);

  return respo;
}

//handleAnime

async function handleGreeting(idChat, data) {
  const user_txt = data.text;

  let = p_ans = [
    "Hello There! I hope you are having a great experience",
    "Hi, glad you came!",
  ];

  let context = {
    text: p_ans[Math.floor(Math.random() * p_ans.length)],
    landscape: -1,
    character: -1,
  };

  let voice = await getVoiceConf(7);

  const respo = formateResponse(idChat, user_txt, voice, context);

  return respo;
}

//handleAnime

async function handleGreeting(idChat, data) {
  const user_txt = data.text;

  let = p_ans = [
    "Hello There! I hope you are having a great experience",
    "Hi, glad you came!",
  ];

  let context = {
    text: p_ans[Math.floor(Math.random() * p_ans.length)],
    landscape: -1,
    character: -1,
  };

  let voice = await getVoiceConf(7);

  const respo = formateResponse(idChat, user_txt, voice, context);

  return respo;
}

//handleAnime

async function handleCreators(idChat, data) {
  const user_txt = data.text;

  let = p_ans = [
    "-A group of crazy devs developed me",
    "I was made by a group of developers from El Salvador!",
  ];

  let context = {
    text: p_ans[Math.floor(Math.random() * p_ans.length)],
    landscape: -1,
    character: -1,
  };

  let voice = await getVoiceConf(7);

  const respo = formateResponse(idChat, user_txt, voice, context);

  return respo;
}

//formateResponse(id, user_txt, voiceConf, context)

//Start of the game
async function handleInitial(id) {
  console.log("INITIAL_FUN");
  let context = await getContext(id);

  console.log("CONTEXT", context);

  let voice = await getVoiceConf(context.character);

  const respo = formateResponse(++id, "Let's begin the story!", voice, context);

  return respo;
}

async function text2speech(voiceConf, text) {
  // The text to synthesize

  // Construct the request
  const request = {
    input: { text: text },
    // Select the language and SSML voice gender (optional)
    voice: {
      languageCode: voiceConf.languageCode,
      name: voiceConf.name,
    },
    // select the type of audio encoding
    audioConfig: {
      audioEncoding: "MP3",
      pitch: voiceConf.pitch,
      speakingRate: voiceConf.speakingRate,
    },
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
async function formateResponse(id, user_txt, voiceConf, context) {
  const speech = await text2speech(voiceConf, context.text);

  let data = {
    idChat: id,
    user_txt: user_txt,
    message: context.text,
    img_avatar: context.character,
    img_landscape: context.landscape,
    speech: speech,
  };

  return data;
}
