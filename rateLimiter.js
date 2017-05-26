(function () {
  const Queue = require('./queue.js');

  function _makeRateLimiter(RATE_LIMIT_PER_SEC) {
    const queue = new Queue();

    let numCallTimesInLastSeconds = 0;

    function _performRequest(requestMethod) {
      numCallTimesInLastSeconds++;

      setTimeout(function () {
        numCallTimesInLastSeconds--;
        _runQueued();
      }, 1010);

      requestMethod();
    }

    function _addToQueue(requestMethod) {
      queue.enqueue(requestMethod);
    }

    function _runQueued() {
      if (numCallTimesInLastSeconds < RATE_LIMIT_PER_SEC) {
        _performRequest(queue.dequeue());
      }
    }

    /*
    Rate limits all requests.
    If rate exceeded, item fails to go through.

    shouldQueue: true means go through when you can.
    */
    function _rateLimit(requestMethod, shouldQueue) {
      if (numCallTimesInLastSeconds < RATE_LIMIT_PER_SEC) {
        _performRequest(requestMethod);
      } else if (shouldQueue) {
        _addToQueue(requestMethod);
      }
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