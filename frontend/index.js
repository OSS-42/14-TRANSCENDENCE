// Import the axios library, to make HTTP requests
const axios = require("axios");

// This is the client ID and client secret that you obtained
// while registering the application
const clientID = "u-s4t2ud-c14a5526d27b133c2732f5848ea8a11d76ae8e503f6e495cd3016623aa0c382e";
const clientSecret = "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";

const app = express();

// Declare the redirect route
app.get("/oauth/redirect", (req, res) => {
  // The req.query object has the query params that
  // were sent to this route. We want the `code` param
  const requestToken = req.query.code;
  axios({
    // make a POST request
    method: "post",
    // to the Github authentication API, with the client ID, client secret
    // and request token
    url: `https://api.intra.42.fr/oauth/token?client_id=${clientID}&client_secret=${clientSecret}&code=${requestToken}`,
    // Set the content type header, so that we get the response in JSOn
    headers: {
      accept: "application/json",
    },
  }).then((response) => {
    // Once we get the response, extract the access token from
    // the response body
    const accessToken = response.data.access_token;
    // redirect the user to the welcome page, along with the access token
    res.redirect(`http://localhost:3000/welcome.html?access_token=${accessToken}`);
  });
});