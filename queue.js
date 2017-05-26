(function () {
  // Linked List
  function Node(data) {
    this.data = data;
    this.next = null;
  }

  // Queue implemented using LinkedList
  function Queue() {
    this.head = null;
    this.tail = null;
  }

  Queue.prototype.enqueue = function(data) {
    var newNode = new Node(data);

    if (this.head === null) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      this.tail.next = newNode;
      this.tail = newNode;
    }
  }

  Queue.prototype.dequeue = function() {
    var newNode;
    if (this.head !== null) {
      newNode = this.head.data;
      this.head = this.head.next;
    }
    return newNode;
  }

  Queue.prototype.print = function() {
    var curr = this.head;
    while (curr) {
      console.log(curr.data);
      curr = curr.next;
    }
  }

  module.exports = Queue;
})();
