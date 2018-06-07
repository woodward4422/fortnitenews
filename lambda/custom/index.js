/* eslint-disable  func-names */
/* eslint-disable  no-console */
const Alexa = require('ask-sdk-core');
const https = require('https');
// API credential for calling the Fortnite API
const myAPI = {
  host: 'fortnitecontent-website-prod07.ol.epicgames.com',
  port: 443,
  path: `/content/api/pages/fortnite-game`,
  method: 'GET',
  headers: {"Accept-Language" : 'en'}
};
// Launch Handler that will output a speech to the user to say "get news"
const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = 'Welcome to Fortnite News, to get the latest updates say get news.';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};
//Intent Handler that will be called once the user invokes the getNewsIntent 
const GetNewsIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'getNewsIntent';
  },
  handle(handlerInput) {
    // must return a promise, async API calls
    return new Promise((resolve) => {
      getApi((news) => {
        // Form speech text
        var speechText = "Okay here is some news: ";
        // Add the title and body of each news event to the speech output
        for (var i = 0; i < news.length; i++) {
          // add spaces in between for voice speech purposes
          speechText += news[i].title + " " + news[i].body + " ";
        }
        // Spruce up the speech text for better JSON POST reading
        speechText = refine(speechText);
        speechText += "<break time=\"1s\"/> Thank you for using fortnite news, at any time say open fortnite news to get the latest news. Goodbye.";
        resolve(handlerInput.responseBuilder
          .speak(speechText)
          .withStandardCard(news[0].title, news[0].body, news[0].image)
          .getResponse());
      });
    });
  },
};
// This is the help intent that will be invoked when the user says "help"
const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'At any time say get news to get the latest fortnite news';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};
// This is an intent that will stop and exit the skill 
const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  },
};
// Helpful handler for finding out why a session ended
const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};
// Whenever a user gives an odd response, this handler will return a response to handle redirect the user
const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};
// API callback function that uses the https request module to get the fortnite news using the myAPI credentials.
function getApi(callback) {
  // creates the request object 
  const req = https.request(myAPI, (res) => {
    res.setEncoding('utf8');
    let returnData = '';
    // Takes all the chunks and compiles it into the return data variable
    res.on('data', (chunk) => {
      returnData += chunk;
    });
    // Parses the chunks of data into a JSON format and sets a variable with the news and returns it as the callback
    res.on('end', () => {
      const json = JSON.parse(returnData);
      console.log(json._locale);
      const news = json.battleroyalenews.news.messages;
      callback(news);
    });
  });
  //ends the request
  req.end();
}
// Touches up the string to make it readable for an Alexa JSON post response
function refine(str) {
  str.replace("LTM", "limited time mode");
  str.replace("#", "number ");
  return str; 
}

const skillBuilder = Alexa.SkillBuilders.custom();
//Exports all the handlers that are used
exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    GetNewsIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();