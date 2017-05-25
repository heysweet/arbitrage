var gdax = require('./gdax.js');
var polo = require('./polo.js');

gdax.setupTicker(function() {}, 200);

polo.initWithHandler(function (btc_eth_polo) {
  const btc_eth_gdax = gdax.getLast();

  console.log(btc_eth_gdax, btc_eth_polo);
});


// var child_process = require('child_process');

// var opts = {
//     stdio: [process.stdin, process.stdout, process.stderr, 'pipe', 'pipe']
// };
// var child = child_process.spawn('node', ['./b.js'], opts);

// child.stdio[3].write('First message.\n', 'utf8', function() {
//     child.stdio[3].write('Second message.\n', 'utf8', function() {

//     });
// }); 

// child.stdio[4].pipe(process.stdout);