/*
  https://poloniex.com/support/api/
*/

// DAILY LIMIT CRYPTO OF $25000 USD

(function () {

  const crypto = require('../utils/cryptoUtil.js');
  const http = require('http');
  const request = require('request');
  const querystring = require('query-string');

  /* RATE LIMIT 6 calls per second */
  const RATE_LIMIT_PER_SEC = 6;
  const limiter = require('../utils/rateLimiter.js').makeRateLimiter(RATE_LIMIT_PER_SEC);

  let lastValue = null;
  let nonce = 0;

  let balances = {
    ETH : {
      amount : 0,
      hasChanged : true
    },
    BTC : {
      amount : 0,
      hasChanged : true
    }
  };

  const YAML = require('yamljs');
  const creds = YAML.load('../credentials.yaml').gdax;

  function _DO_POST(params, onComplete, isPublic) {
    nonce++;
    params.nonce = nonce;

    // Build the post string from an object
    const postData = querystring.stringify(params);
    const sign = crypto.sign(postData, creds.secret);
    const url = isPublic ?
      'https://poloniex.com/public' :
      'https://poloniex.com/tradingApi';

    var options = {
      url: url,
      qs: postData,
      headers: {
        'Key' : creds.key,
        'Sign' : sign
      }
    };

    function callback(error, response, body) {
      if (!error && response.statusCode == 200) {
        var info = body ? JSON.parse(body) : {};
        console.log(response.body);

        if (!info.error) {
          onComplete(info);
        }
      }
    }

    console.log('[POLO]', options.qs);
    request.post(options, callback);
  }

  function _POST_PUBLIC(params, onComplete, shouldQueue) {
    onComplete = onComplete ? onComplete : function(){};

    limiter.rateLimit(function () {
      _DO_POST(params, onComplete, true);
    }, shouldQueue);
  }

  function _POST(params, onComplete, shouldQueue) {
    onComplete = onComplete ? onComplete : function(){};

    limiter.rateLimit(function () {
      _DO_POST(params, onComplete);
    }, shouldQueue);
  }

  function _initWithHandler(handler) {
    var autobahn = require('autobahn');
    var wsuri = 'wss://api.poloniex.com';
    var connection = new autobahn.Connection({
      url: wsuri,
      realm: 'realm1'
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
      console.log('Websocket connection closed');
    }
                           
    connection.open();
  }

  function _getLast() {
    return lastValue;
  }

  /* POST buy ETH
  'btc_eth', FROM_TICKER, MONEY / FROM_TICKER
  'currencyPair', 'rate', 'amount'
  'immediateOrCancel' */
  function _buyETH(rateStr, amountStr, callback) {
    const params = {
      'command' : 'buy',
      'currencyPair' : 'btc_eth',
      'rate' : rateStr,
      'amount' : amountStr,
      /* immediateOrCancel: can be partially or completely filled, but any
      portion of the order that cannot be filled immediately will be
      canceled rather than left on the order book
      */
      'immediateOrCancel' : 1
    };

    _POST(
      params,
      function () {
        // Guaranteed to have changed on success
        balances.ETH.hasChanged = true;
        balances.BTC.hasChanged = true;
      }
    );
  }

  function _updateBalances(callback) {
    const shouldQueue = true;

    _POST_PUBLIC({
        command : 'returnCompleteBalances'
      },
      function (data) {
        const btcBalanceStr = data && data.BTC ? data.BTC.available : '0';
        const ethBalanceStr = data && data.ETG ? data.ETH.available : '0';

        // BTC
        balances.BTC.amount = btcBalanceStr;
        balances.BTC.hasChanged = false;

        // ETH
        balances.ETH.amount = ethBalanceStr;
        balances.ETH.hasChanged = false;

        callback && callback();
      },
      shouldQueue
    );
  }

  function _getBTCBalanceWithCache(callback) {
    if (balances.BTC.hasChanged) {
      // Get BTC balance
      _updateBalances(function () {
        callback(balances.BTC.amount);
      });
    } else {
      const btcStr = balances.BTC.amount;
      if (btcStr) {
        callback(btcStr);
      }
    }
  }

  function _buyAllETH(rateStr) {
    function _doBuy(balanceStr) {
      const balance = parseFloat(balanceStr);
      const rate = parseFloat(rateStr);
      const epsilon = 0.0000001;

      if (balance > 0.001) {
        // Buy all BTC worth of ETH
        const amount = (balance / (rate + epsilon))
        _buyETH(rateStr, '' + amount, function () {
          console.log('[POLO] Bought all ETH!');
        });
      }
    }

    _getBTCBalanceWithCache(_doBuy);
  }

  function _sendAllETHTo(address) {
    if (!balances.ETH.hasChanged && balances.ETH.amount < 0.01) {
      return;
    }

    const shouldQueue = true;

    _updateBalances(function () {
      const ethStr = balances.ETH.amount;

      _POST({
          'command' : 'withdraw',
          'currency' : 'ETH',
          'amount' : ethStr,
          'address' : address
        }, 
        function() {
          console.log('[POLO] Sent all ETH!');
          _updateBalances();
        },
        shouldQueue
      );
    });
  }
  
  function _getBalances(callback) {
    _getBTCBalanceWithCache(function () {
      callback({
        BTC : balances.BTC.amount,
        ETH : balances.ETH.amount
      });
    });
  }

  module.exports = {
    getBalances : _getBalances,
    initWithHandler : _initWithHandler,
    buyETH : _buyETH,
    buyAllETH : _buyAllETH,
    sendAllETHTo : _sendAllETHTo,
    getLast : _getLast
  }

})();