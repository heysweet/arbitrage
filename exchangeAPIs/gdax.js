/*
  https://docs.gdax.com/#crypto
*/

// DAILY LIMIT CASH WITHDRAW 10000 USD -> 250000??

(function () {

  const crypto = require('../utils/cryptoUtil.js');
  const Gdax = require('gdax');
  const YAML = require('yamljs');
  const rateLimiter = require('../utils/rateLimiter.js');

  const creds = YAML.load('../credentials.yaml').gdax;

  const balances = {
    'ETH' : {
      'amount' : 0,
      'hasChanged' : true
    },
    'BTC' : {
      'amount' : 0,
      'hasChanged' : true
    }
  };

  const publicClient = new Gdax.PublicClient();
  publicClient.productID = 'ETH-BTC';

  const apiURI = 'https://api.gdax.com';
   
  // Defaults to https://api.gdax.com if apiURI omitted 
  const authedClient = new Gdax.AuthenticatedClient(
    creds.key, creds.secret, creds.passphrase, apiURI);
  authedClient.productID = 'ETH-BTC';

  /*
  Added sendCrypto send amount of currency to target crypto_address
  */
  authedClient.sendCrypto = function(params, callback) {
    var self = this;
    _.forEach(['amount', 'currency', 'crypto_address'], function(param) {
      if (params[param] === undefined) {
        throw "`opts` must include param `" + param + "`";
      }
    });
    var opts = { 'body': params };
    return authedClient.post.call(self, ['withdrawals/crypto'], opts, callback);
  };


  // RATE LIMIT: NO MORE THAN 3 requests per second
  const PUBLIC_RATE_LIMIT_PER_SEC = 3;

  // RATE LIMIT: PRIVATE ENDPOINT ARE 5 requests per second
  const PRIVATE_RATE_LIMIT_PER_SEC = 5;

  const pubLimit = rateLimiter.makeRateLimiter(PUBLIC_RATE_LIMIT_PER_SEC);
  const privLimit = rateLimiter.makeRateLimiter(PRIVATE_RATE_LIMIT_PER_SEC);

  let _last = null;

  function _getTicker(callback) {

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

    function ticker(err, response, data) {
      if (err) {
        return callback && callback(null);
      }

      _last = data.price;
      callback && callback(_last);
    }

    const shouldQueue = true;

    pubLimit.rateLimit(
      function () {
        publicClient.getProductTicker(ticker);
      },
      shouldQueue
    );
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

  function _updateBalances(callback) {
    const shouldQueue = true;

    privLimit.rateLimit(function () {
      authedClient.getAccounts(function (err, resp, accounts) {
        for (var i = 0; i < accounts.length; i++) {
          let acct = accounts[i];

          if (acct.currency === 'ETH') {
            balances.ETH.amount = acct.available;
            balances.ETH.hasChanged = false;
          } else if (acct.currency === 'BTC') {
            balances.BTC.amount = acct.available;
            balances.BTC.hasChanged = false;
          }
        }

        callback();
      });
    }, shouldQueue);
  }

  function _getETHBalanceWithCache(callback) {
    if (balances.ETH.hasChanged) {
      // Get BTC balance
      _updateBalances(function () {
        callback(balances.ETH.amount);
      });
    } else {
      const ethStr = balances.ETH.amount;
      if (ethStr) {
        callback(ethStr);
      }
    }
  }

  function _sellETH(rate, amount, callback) {
    var sellParams = {
      'price': rate,
      'size': amount,
      'product_id': 'ETH-BTC',
    };

    privLimit.rateLimit(function () {
      authedClient.sell(sellParams, callback);
    });
  }

  function _sellAllETH(rateStr) {
    function _doSell(balanceStr) {
      const balance = parseFloat(balanceStr);
      const rate = parseFloat(rateStr);
      const epsilon = 0.0000001;

      if (balance > 0.001) {
        // Buy all BTC worth of ETH
        const amount = (balance / (rate + epsilon))
        _sellETH(rateStr, '' + amount, function () {
          console.log('[GDAX] Sold all ETH!');
        });
      }
    }

    _getETHBalanceWithCache(_doSell);
  }

  function _sendAllBTCto(address) {
    if (!balances.ETH.hasChanged && balances.ETH.amount < 0.01) {
      return;
    }

    const shouldQueue = true;

    _updateBalances(function () {
      const params = {
        'amount' : balances.BTC.amount,
        'currency' : 'BTC',
        'crypto_address' : address
      };

      privLimit.rateLimit(
        function() {
          authedClient.sendCrypto(
            params, 
            function () {
              console.log('[GDAX] Sent all BTC!');
              _updateBalances();
            }
          );
        },
        shouldQueue
      );
    });
  }

  function _getBalances(callback) {
    _getETHBalanceWithCache(function () {
      callback({
        BTC : balances.BTC.amount,
        ETH : balances.ETH.amount
      });
    });
  }

  module.exports = {
    getBalances : _getBalances,
    getLast : _getLast,
    sellETH : _sellETH,
    sellAllETH : _sellAllETH,
    sendAllBTCto : _sendAllBTCto,
    setupTicker : _setupTicker,
    getTicker : _getTicker
  };

})();