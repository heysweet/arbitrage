/*
  https://poloniex.com/support/api/
*/

// DAILY LIMIT CRYPTO OF $25000 USD

/* RATE LIMIT 6 calls per second */

/* GET BALANCE: ?? */

/*
withdraw
"currency", "amount", and "address"
*/

const RATE_LIMIT_PER_SEC = 6;
const limiter = require('rateLimiter').makeRateLimiter(RATE_LIMIT_PER_SEC);
let lastValue = null;

// limiter.rateLimit(apiCall);

function _initWithHandler(handler) {
  var autobahn = require('autobahn');
  var wsuri = "wss://api.poloniex.com";
  var connection = new autobahn.Connection({
    url: wsuri,
    realm: "realm1"
  });
   
  connection.onopen = function (session) {
    function tickerEvent (args, kwargs) {
      if (args[0] === 'BTC_ETH') {
        lastValue = args[1];
        handler(lastValue);
      }
    }
    session.subscribe('ticker', tickerEvent);
  }
  
  connection.onclose = function () {
    console.log("Websocket connection closed");
  }
                         
  connection.open();
}

function _getLast() {
  return lastValue;
}

/* POST buy ETH
'btc_eth', FROM_TICKER, MONEY / FROM_TICKER
"currencyPair", "rate", "amount"
'immediateOrCancel' */
function _buyETH(rate, amount) {
  const params = {
    'currencyPair' : 'btc_eth',
    'rate' : '' + rate,
    'amount' : '' + amount,
    'immediateOrCancel' : true
  };

  limiter.rateLimit(function () {
    // POST REQUEST
  });
}

function _getBTCBalance(callback) {
  limiter.rateLimit(function () {
    
  });
}

function _buyAllETH(rate) {
  // Get BTC balance
  _getBTCBalance(function (balance) {
    // Buy all BTC worth of ETH
    _buyETH(rate, balance / rate);
  });
}

module.exports = {
  initWithHandler : _initWithHandler,
  buyETH : _buyETH,
  buyAllETH : _buyAllETH,
  getLast : _getLast
}