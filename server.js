const gdax = require('./exchangeAPIs/gdax.js');
const polo = require('./exchangeAPIs/polo.js');
const YAML = require('yamljs');

const creds = YAML.load('../credentials.yaml');

let poloBTCAddress = creds.polo.address.btc;
let gdaxETHAddress = creds.gdax.address.eth;

// Minimum amounts of coin to be exchanged
const MIN_AMOUNT_BTC = 0.01;
const MIN_AMOUNT_ETH = 1;

let widestSpread = -10;
let widestSpreadInInterval = -10;
let widestNegSpread = 10;
let widestNegSpreadInInterval = 10;
let lastSpread = -10;

let totalMinutesRun = 0;

const reportIntervalSeconds = 2 * 60;
const reportIntervalMinutes = reportIntervalSeconds / 60;

setInterval(
  function () {
    totalMinutesRun += reportIntervalMinutes;

    console.log('--------( ' + totalMinutesRun + ' mins )-------');
    console.log('Last spread:', lastSpread);
    console.log(
      'Widest + in interval (' + reportIntervalMinutes + ' mins):',
      widestSpreadInInterval
    );
    console.log(
      'Widest - in interval (' + reportIntervalMinutes + ' mins):',
      widestNegSpreadInInterval
    );
    console.log('Widest + so far:', widestSpread);
    console.log('Widest - so far:', widestNegSpread);

    widestSpreadInInterval = -10;
  }, 
  reportIntervalSeconds * 1000
);

// IF ((GDAX * 104%) < POLO number)
// SELL ETH
// cancel_after (0.5 secs, which needs to be in mins)
// type: market
// funds : total ETH
// Always SEND BTC
function _handle_GDAX(btc_eth_gdax, btc_eth_polo) {
  if (!btc_eth_polo) {
    return;
  }

  gdax.getBalances(function (balances) {
    const ethAmountStr = balances.ETH;
    const btcAmountStr = balances.BTC;

    const gdaxRate = parseFloat(btc_eth_gdax);
    const poloRate = parseFloat(btc_eth_polo);

    const spread = (poloRate - gdaxRate) / gdaxRate;

    if (spread >= 0.0388 && parseFloat(ethAmountStr) > MIN_AMOUNT_ETH) {
      gdax.sellAllETH(btc_eth_gdax);

      console.log('Selling all ETH... on GDAX');
      console.log('GDAX:', gdaxRate, 'POLO:', poloRate);
    }

    if (parseFloat(btcAmountStr) > MIN_AMOUNT_BTC) {
      gdax.sendAllBTCTo(poloBTCAddress);

      console.log('Sending all BTC to POLO...');
    }

    lastSpread = spread;
    widestSpreadInInterval = Math.max(widestSpreadInInterval, spread);
    widestNegSpreadInInterval = Math.min(widestNegSpreadInInterval, spread);
    widestSpread = Math.max(widestSpread, spread);
    widestNegSpread = Math.min(widestNegSpread, spread);
  });
}

// Always BUY ETH
// Always SEND ETH
function _handle_POLO(btc_eth_gdax, btc_eth_polo) {
  if (!btc_eth_gdax) {
    return;
  }

  polo.getBalances(function (balances) {
    const ethAmountStr = balances.ETH;
    const btcAmountStr = balances.BTC;

    if (parseFloat(btcAmountStr) > MIN_AMOUNT_BTC) {
      polo.buyAllETH(btc_eth_polo);

      console.log('Buying all ETH on POLO...');
    }

    if (parseFloat(ethAmountStr) > MIN_AMOUNT_ETH) {
      polo.sendAllETHTo(gdaxETHAddress);

      console.log('Sending all ETH to GDAX...');
    }
  });
}

// Called every price update from polo
polo.initWithHandler(function (btc_eth_polo) {
  // Only execute logic on incoming gdax data
  // since it is less frequent

  // const btc_eth_gdax = gdax.getLast();

  // _handle_GDAX(btc_eth_gdax, btc_eth_polo);
  // _handle_POLO(btc_eth_gdax, btc_eth_polo);
});

// Called every price update from gdax
gdax.setupTicker(function (btc_eth_gdax) {
  const btc_eth_polo = polo.getLast();

  _handle_POLO(btc_eth_gdax, btc_eth_polo);
  _handle_GDAX(btc_eth_gdax, btc_eth_polo);
}, 401);