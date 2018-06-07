const Fortnite = require("fortnite-api");

let fortniteAPI = new Fortnite(
  [
    "nils.backe@gmail.com",
    "Lantern11",
    "MzRhMDJjZjhmNDQxNGUyOWIxNTkyMTg3NmRhMzZmOWE6ZGFhZmJjY2M3Mzc3NDUwMzlkZmZlNTNkOTRmYzc2Y2Y=",
    "ZWM2ODRiOGM2ODdmNDc5ZmFkZWEzY2IyYWQ4M2Y1YzY6ZTFmMzFjMjExZjI4NDEzMTg2MjYyZDM3YTEzZmM4NGQ="
  ],
  {
    debug: true
  }
);

// fortniteAPI.login().then(() => {
//   fortniteAPI
//     .getFortniteNews("en")
//     .then(news => {
//       console.log(news.br);
//     })
//     .catch(err => {
//       console.log(err);
//     });
// });

// fortniteAPI.getFortniteNews("en").then(news => {
//     console.log(news.br);
// }).catch(err => {
//     console.log(err);
// });

// fortniteAPI.login().then(() => {
//     fortniteAPI.killSession()
//         .then(() => {
//           console.log("killed");
//         }).catch(err => {
//           console.log(err);
//         });
//     });

const https = require('https');

const myAPI = {
    host: 'fortnitecontent-website-prod07.ol.epicgames.com',
    port: 443,
    path: `/content/api/pages/fortnite-game`,
    method: 'GET',
    headers: {"Accept-Language" : 'en'}
};

function getApi(callback) {
    const req = https.request(myAPI, (res) => {
        res.setEncoding('utf8');
        let returnData = '';

        res.on('data', (chunk) => {
            returnData += chunk;
        });
        res.on('end', () => {
            const json = JSON.parse(returnData);
            console.log(json._locale);
            const title = json.battleroyalenews.news.messages;
            // const title = json.uri;
            callback(title);
        });
    });
    req.end();
}

return new Promise((resolve) => {
    getApi((title) => {
        const speechText = title.toString();
        console.log(speechText);
    });
});



