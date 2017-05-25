/*
  https://docs.gdax.com/#crypto
*/

// DAILY LIMIT CASH WITHDRAW 10000 USD -> 250000??

// GET /accounts
// [{'currency':'BTC', ... {'available':  '1.000'}}, ...]

// RATE LIMIT: NO MORE THAN 3 requests per second

// RATE LIMIT: PRIVATE ENDPOINT ARE 5 requests per second

// IF ((GDAX * 104%) < POLO number)
// SELL ETH
// cancel_after (0.5 secs, which needs to be in mins)
// type: market
// funds : total ETH

/* GET BALANCE: ?? */

/* WITHDRAW
HTTP REQUEST

POST /withdrawals/crypto

PARAMETERS

Param Description
amount  The amount to withdraw
currency  The type of currency
crypto_address  A crypto address of the recipient
*/

(function () {

  const crypto = require('cryptoUtil.js');
  const request = require('request');
  const Gdax = require('gdax');
  const YAML = require('yamljs');
  const rateLimiter = require('rateLimiter');

  const creds = YAML.load('../credentials.yaml').gdax;

  const publicClient = new Gdax.PublicClient();
  publicClient.productID = 'ETH-BTC';

  const apiURI = 'https://api.gdax.com';
   
  // Defaults to https://api.gdax.com if apiURI omitted 
  const authedClient = new Gdax.AuthenticatedClient(
    creds.key, creds.secret, creds.passphrase, apiURI);
  authedClient.productID = 'ETH-BTC';

  const PUBLIC_RATE_LIMIT_PER_SEC = 3;
  const PRIVATE_RATE_LIMIT_PER_SEC = 5;

  const pubLimit = rateLimiter.makeRateLimiter(PUBLIC_RATE_LIMIT_PER_SEC);
  const privLimit = rateLimiter.makeRateLimiter(PRIVATE_RATE_LIMIT_PER_SEC);

  let _last = null;

  /*function _DO_POST() {
    nonce++;
    params.nonce = nonce;

    // Build the post string from an object
    const postData = querystring.stringify(params);
    const sign = crypto.sign(postData, creds.secret);
    const timestamp = Math.floor(Date.now() / 1000);

    // set the parameter for the request message
    var req = {
      method: 'POST',
      path: '/v2/exchange-rates?currency=USD',
      body: ''
    };

    var options = {
      baseUrl: 'https://api.gdax.com',
      url: req.path,
      method: req.method,
      body: postData,
      headers: {
        'CB-ACCESS-KEY' : creds.key,
        'CB-ACCESS-SIGN' : sign,
        'CB-ACCESS-TIMESTAMP' : timestamp,
        'CB-ACCESS-PASSPHRASE' : creds.passphrase
      }
    };

    function callback(error, response, body) {
      if (!error && response.statusCode == 200) {
        var info = JSON.parse(body);

        console.log(info);
        onComplete(body);
      }
    }

    request.post(options, callback);




// CB-ACCESS-KEY The api key as a string.
// CB-ACCESS-SIGN The base64-encoded signature (see Signing a Message).
// CB-ACCESS-TIMESTAMP A timestamp for your request.
// CB-ACCESS-PASSPHRASE The passphrase you specified when creating the API key.

    request('http://www.google.com', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body) // Print the google web page.
         }
    })

    request.post('http://service.com/upload', {form:{key:'value'}})
  }*/

  function _getTicker(callback) {
    function ticker(err, response, data) {
      if (err) {
        return callback && callback(null);
      }

      _last = data.price;
      callback && callback(_last);
    }

    publicClient.getProductTicker(ticker);
  }

  function _getLast() {
    return _last;
  }

  function _setupTicker(callback, duration) {
    let interval = setInterval(
      function () {
        _getTicker(callback);
        callback(_getLast());
      },
      duration
    );
    return interval;
  }

  function _sellETH() {
    
  }

  function _sellAllETH() {

  }

  function _sendAllBTCto(address) {

  }

  module.exports = {
    getLast : _getLast,
    sellETH : _sellETH,
    sellAllETH : _sellAllETH,
    sendAllBTCto : _sendAllBTCto,
    setupTicker : _setupTicker,
    getTicker : _getTicker
  };

  // '/products/BTC-ETH/ticker'
  // {
  //   "trade_id": 4729088,
  //   "price": "333.99",
  //   "size": "0.193",
  //   "bid": "333.98",
  //   "ask": "333.99",
  //   "volume": "5957.11914015",
  //   "time": "2015-11-14T20:46:03.511254Z"
  // }

})();