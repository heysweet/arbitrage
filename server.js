var gdax = require('./gdax.js');
var polo = require('./polo.js');

gdax.setupTicker(function() {}, 201);

function _handle_GDAX(btc_eth_gdax, btc_eth_polo) {
  if (parseFloat(btc_eth_gdax * 1.04) < parseFloat(btc_eth_polo)) {
    gdax.sellAllETH(btc_eth_gdax);
  }
}

function _handle_POLO(btc_eth_gdax, btc_eth_polo) {
  polo.buyAllETH(btc_eth_polo);
}

polo.initWithHandler(function (btc_eth_polo) {
  const btc_eth_gdax = gdax.getLast();

  _handle_GDAX(btc_eth_gdax, btc_eth_polo);
  _handle_POLO(btc_eth_gdax, btc_eth_polo);
});

gdax.setupTicker(function (btc_eth_gdax) {
  const btc_eth_polo = polo.getLast();

  _handle_POLO(btc_eth_gdax, btc_eth_polo);
  _handle_GDAX(btc_eth_gdax, btc_eth_polo);
}, 201);