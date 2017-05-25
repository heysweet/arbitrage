/*
  https://poloniex.com/support/api/
*/

// DAILY LIMIT CRYPTO OF $25000 USD

/* RATE LIMIT 6 calls per second */

// POST buy ETH
// 'btc_eth', FROM_TICKER, MONEY / FROM_TICKER
// "currencyPair", "rate", "amount"
// 'immediateOrCancel'

/* GET BALANCE: ?? */

/*
withdraw
"currency", "amount", and "address"
*/

const RATE_LIMIT_PER_SEC = 6;
let callTimesInLastSecond = [];

function _performRequest(requestMethod) {
  const now = + new Date()
  callTimesInLastSecond.push(now);


}

function _addToQueue(requestMethod) {
  
}

function _runQueued() {
  // for() {
  //   _performRequest(requestMethod);
  // }
}

/*
Rate limits all requests.
If rate exceeded, item fails to go through.

shouldQueue: true means go through when you can.
*/
function _rateLimit(requestMethod, shouldQueue) {
  const now = + new Date();
  let numCalls = callTimesInLastSecond.length;

  const numToDelete = 0;
  while (numToDelete < numCalls &&
          callTimesInLastSecond[numToDelete] < (now - 1000)) {
    numToDelete++;
  }

  callTimesInLastSecond.splice(0, numToDelete);

  numCalls = callTimesInLastSecond.length;
  if (numCalls < RATE_LIMIT_PER_SEC) {
    // Make the request
    _performRequest(requestMethod);
  } else if (shouldQueue) {
    _addToQueue(requestMethod);
  }

  _runQueued();
}

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
        handler(args[1]);
      }
    }
    session.subscribe('ticker', tickerEvent);
  }
  
  connection.onclose = function () {
    console.log("Websocket connection closed");
  }
                         
  connection.open();
}

module.exports = {
  initWithHandler : _initWithHandler,
  buyETH : _buyETH,
}