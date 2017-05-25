(function () {
  function _makeRateLimiter(RATE_LIMIT_PER_SEC) {
    let callTimesInLastSecond = [];

    function _performRequest(requestMethod) {
      const now = + new Date()
      callTimesInLastSecond.push(now);

      requestMethod();
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

    return {
      rateLimit : _rateLimit,
      runQueued : _runQueued
    }
  }

  module.exports = {
    makeRateLimiter : _makeRateLimiter
  }
})();