/* eslint-disable  func-names */
/* eslint-disable  no-console */
const Alexa = require('ask-sdk-core');
const https = require('https');
// API credential for calling the Fortnite API
const newsAPI = {
  host: 'fortnitecontent-website-prod07.ol.epicgames.com',
  port: 443,
  path: `/content/api/pages/fortnite-game`,
  method: 'GET',
  headers: { 'Accept-Language': 'en' }
};

const statusAPI = {
  host: 'lightswitch-public-service-prod06.ol.epicgames.com',
  port: 443,
  path: '/lightswitch/api/service/bulk/status?serviceId=Fortnite',
  method: 'GET'
};

const dropLocations = [
  'Junk Junction',
  'Anarchy Acres',
  'Motel',
  'Soccer arena near Junk Junction',
  'Soccer field near Greasy Grove',
  'Haunted Hills',
  'Anarchy Acres',
  'Risky Reels',
  'Wailing Woods',
  'Tomato Town',
  'Crates near tomato town',
  'Lonely Lodge',
  'Retail Row',
  'Dusty Divot',
  'Loot lake',
  'Pleasant Park',
  'Snobby shores',
  'Titled Towers',
  'Greasy Grove',
  'Shifty Shafts',
  'Salty Springs',
  'Fatal Fields',
  'Factories near Flush Factory',
  'Flush Factory',
  'Lucky Landing',
  'Moisty Mire',
  'prison',
  'gus'
];
// Launch Handler that will output a speech to the user to say "get news"
const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText =
      'Welcome to your fortnite news companion. Tell me to do something or say help for example commands.';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  }
};
//Intent Handler that will be called once the user invokes the getNewsIntent
const GetNewsIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'getNewsIntent'
    );
  },
  handle(handlerInput) {
    // must return a promise, async API calls
    return new Promise(resolve => {
      getNews(news => {
        // Form speech text
        var speechText = 'Okay here is some news: ';
        // Add the title and body of each news event to the speech output
        for (var i = 0; i < news.length; i++) {
          // add spaces in between for voice speech purposes
          speechText += news[i].title + ' ' + news[i].body + ' ';
        }
        // Spruce up the speech text for better JSON POST reading
        speechText = refine(speechText);
        speechText +=
          '<break time="1s"/> Thank you for using fortnite news, at any time say open fortnite news to get the latest news. Goodbye.';
        resolve(
          handlerInput.responseBuilder
            .speak(speechText)
            .withStandardCard(news[0].title, news[0].body, news[0].image)
            .getResponse()
        );
      });
    });
  }
};
// Intent hanlder that will be called once the user invokes the getStatusIntent
const GetStatusIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'getStatusIntent'
    );
  },
  handle(handlerInput) {
    // must return a promise, async API calls
    return new Promise(resolve => {
      getStatus(status => {
        // Form speech text
        var speechText = 'The fortnite servers are ' + status;
        resolve(handlerInput.responseBuilder.speak(speechText).getResponse());
      });
    });
  }
};

// Intent hanlder that will be called once the user invokes the getDropIntent
const GetDropIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'getDropIntent'
    );
  },
  handle(handlerInput) {
    var speechText =
      'Okay, you will drop at ' +
      dropLocations[getRandomInt(0, dropLocations.length - 1)];
    return handlerInput.responseBuilder.speak(speechText).getResponse();
  }
};

// This is the help intent that will be invoked when the user says "help"
const HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent'
    );
  },
  handle(handlerInput) {
    const speechText =
      'You can ask whats in the update, or ask if the servers are up.';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  }
};
// This is an intent that will stop and exit the skill
const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      (handlerInput.requestEnvelope.request.intent.name ===
        'AMAZON.CancelIntent' ||
        handlerInput.requestEnvelope.request.intent.name ===
          'AMAZON.StopIntent')
    );
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder.speak(speechText).getResponse();
  }
};
// Helpful handler for finding out why a session ended
const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(
      `Session ended with reason: ${
        handlerInput.requestEnvelope.request.reason
      }`
    );

    return handlerInput.responseBuilder.getResponse();
  }
};
// Whenever a user gives an odd response, this handler will return a response to handle redirect the user
const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak("Sorry, I can't understand the command. Please say again.")
      .reprompt("Sorry, I can't understand the command. Please say again.")
      .getResponse();
  }
};
// API callback function that uses the https request module to get the fortnite news using the myAPI credentials.
function getNews(callback) {
  // creates the request object
  const req = https.request(newsAPI, res => {
    res.setEncoding('utf8');
    let returnData = '';
    // Takes all the chunks and compiles it into the return data variable
    res.on('data', chunk => {
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

// API callback function that uses the https request module to get the fortnite news using the myAPI credentials.
function getStatus(callback) {
  // creates the request object
  const req = https.request(statusAPI, res => {
    res.setEncoding('utf8');
    let returnData = '';
    // Takes all the chunks and compiles it into the return data variable
    res.on('data', chunk => {
      returnData += chunk;
    });
    // Parses the chunks of data into a JSON format and sets a variable with the news and returns it as the callback
    res.on('end', () => {
      const json = JSON.parse(returnData);
      const status = json[0].status;
      callback(status);
    });
  });
  //ends the request
  req.end();
}
// Touches up the string to make it readable for an Alexa JSON post response
function refine(str) {
  str.replace('LTM', 'limited time mode');
  str.replace('#', 'number ');
  return str;
}

// gets a random integer
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const skillBuilder = Alexa.SkillBuilders.custom();
//Exports all the handlers that are used
exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    GetNewsIntentHandler,
    GetStatusIntentHandler,
    GetDropIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
