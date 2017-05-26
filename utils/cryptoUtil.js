(function() {

  const crypto = require('crypto');

  function _sign(message, secret) {
    var key = Buffer(secret, 'base64');
    var hmac = crypto.createHmac('sha256', key);
    return hmac.update(message).digest('base64');
  }

  module.exports = {
    sign : _sign
  };

})();