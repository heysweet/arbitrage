var gdax = require('./gdax.js');
var polo = require('./polo.js');

gdax.setupTicker(function() {}, 201);

const poloBTCAddress;
const gdaxETHAddress;

const MIN_AMOUNT_BTC = 0.0003;
const MIN_AMOUNT_ETH = 0.003;

// IF ((GDAX * 104%) < POLO number)
// SELL ETH
// cancel_after (0.5 secs, which needs to be in mins)
// type: market
// funds : total ETH
// Always SEND BTC
function _handle_GDAX(btc_eth_gdax, btc_eth_polo) {
  gdax.getBalances(function (balances) {
    const ethAmountStr = balances.ETH;
    const btcAmountStr = balances.BTC;

    if (parseFloat(btc_eth_gdax * 1.04) < parseFloat(btc_eth_polo) &&
        parseFloat(ethAmountStr) > MIN_AMOUNT_ETH) {
      gdax.sellAllETH(btc_eth_gdax);
    }

    if (parseFloat(btcAmountStr) > MIN_AMOUNT_BTC) {
      gdax.sendAllBTCTo(poloBTCAddress);
    }
  });
}

// Always BUY ETH
// Always SEND ETH
function _handle_POLO(btc_eth_gdax, btc_eth_polo) {
  polo.getBalances(function (balances) {
    const ethAmountStr = balances.ETH;
    const btcAmountStr = balances.BTC;

    if (parseFloat(btcAmountStr) > MIN_AMOUNT_BTC) {
      polo.buyAllETH(btc_eth_polo);
    }

    if (parseFloat(ethAmountStr) > MIN_AMOUNT_ETH) {
      polo.sendAllETHTo(gdaxETHAddress);
    }
  });
}

// Called every price update from polo
polo.initWithHandler(function (btc_eth_polo) {
  const btc_eth_gdax = gdax.getLast();

  _handle_GDAX(btc_eth_gdax, btc_eth_polo);
  _handle_POLO(btc_eth_gdax, btc_eth_polo);
});

// Called every price update from gdax
gdax.setupTicker(function (btc_eth_gdax) {
  const btc_eth_polo = polo.getLast();

  _handle_POLO(btc_eth_gdax, btc_eth_polo);
  _handle_GDAX(btc_eth_gdax, btc_eth_polo);
}, 201);