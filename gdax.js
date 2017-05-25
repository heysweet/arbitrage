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

const Gdax = require('gdax');
const YAML = require('yamljs');
const rateLimiter = require('rateLimiter');

var creds = YAML.load('../credentials.yaml').gdax;

var publicClient = new Gdax.PublicClient();
publicClient.productID = 'ETH-BTC';

const PUBLIC_RATE_LIMIT_PER_SEC = 3;
const PRIVATE_RATE_LIMIT_PER_SEC = 5;

const pubLimit = rateLimiter.makeRateLimiter(PUBLIC_RATE_LIMIT_PER_SEC);
const privLimit = rateLimiter.makeRateLimiter(PRIVATE_RATE_LIMIT_PER_SEC);

let _last = null;

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
      _getTicker();
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

module.exports = {
  getLast : _getLast,
  sellETH : _sellETH,
  sellAllETH : _sellAllETH,
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


// var autobahn = require('autobahn');
// var wsuri = "wss://ws-feed.gdax.com/";
// var connection = new autobahn.Connection({
//   url: wsuri,
//   realm: "realm1"
// });
 
// connection.onopen = function (session) {
//   function marketEvent (args,kwargs) {
//     console.log(args);
//   }
//   function tickerEvent (args,kwargs) {
//     console.log(args[0]);
//   }
//   function trollboxEvent (args,kwargs) {
//     console.log(args);
//   }
//   // session.subscribe('BTC_ETH', marketEvent);
//   session.subscribe('ticker', tickerEvent);
//   // session.subscribe('trollbox', trollboxEvent);
// }
 
// connection.onclose = function () {
//   console.log("Websocket connection closed");
// }
                       
// connection.open();