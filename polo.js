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
  initWithHandler : _initWithHandler
}