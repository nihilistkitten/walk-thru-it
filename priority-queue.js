/// A max priority queue. Generic over an ordering function.
///
/// Implemented using an array-based heap.
///

const TOP = 0;

class PriorityQueue {
  constructor(ordering = (a, b) => a < b) {
    this._heap = [];
    this._ordering = ordering;
  }

  /// Get the size of the queue.
  size() {
    return this._heap.length;
  }

  /// Return true if queue is empty.
  isEmpty() {
    return this.size() == 0;
  }

  /// Return the top value of the queue.
  peek() {
    return this._heap[TOP];
  }

  /// Add values to queue, maintain heap structure.
  push(value) {
    this._heap.push(value);
    this._siftUp();
  }

  pop() {
    const ret = this.peek();
    const bottom = this.size() - 1;
    this._swap(TOP, bottom);
    this._heap.pop();
    this._siftDown();
    return ret;
  }

  replace(value) {
    const replacedValue = this.peek();
    this._heap[top] = value;
    this._siftDown();
    return replacedValue;
  }

  /// Helper method to compare the values at two indices.
  _less(i, j) {
    return this._ordering(this._heap[i], this._heap[j]);
  }

  /// Helper method to swap the values in two indices.
  _swap(i, j) {
    var tmp = this._heap[i];
    this._heap[i] = this._heap[j];
    this._heap[j] = tmp;
  }

  /// Given an index into the heap, get the child to the left of that index. Performs no bounds checking.
  _parent(i) {
    return ~~((i + 1) / 2) - 1;
  }

  /// Given an index into the heap, get the child to the left of that index. Performs no bounds checking.
  _left(i) {
    return 2 * i + 1;
  }

  /// Given an index into the heap, get the child to the right of that index. Performs no bounds checking.
  _right(i) {
    return 2 * i + 2;
  }

  /// Given an index into the heap, check whether the index is inside the array bounds.
  _exists(i) {
    return i < this.size();
  }

  _siftUp() {
    var node = this.size() - 1;
    var parent = this._parent(node);
    while (node > TOP && this._less(node, parent)) {
      this._swap(node, parent);
      node = parent;
      parent = this._parent(node);
    }
  }

  /// Reorder heap to maintain priority queue structure.
  _siftDown(node = TOP) {
    var left = this._left(node);
    var right = this._right(node);

    if (this._exists(left) && this._exists(right)) {
      if (this._less(left, right)) {
        var bigChild = left;
        var smallChild = right;
      } else {
        var bigChild = right;
        var smallChild = left;
      }
    } else if (this._exists(left)) {
      var bigChild = left;
      var smallChild = null;
    } else if (this._exists(right)) {
      var bigChild = right;
      var smallChild = null;
    } else {
      // at a leaf node
      return;
    }

    console.log("bigChild", bigChild);
    console.log("smallChild", smallChild);

    if (this._less(bigChild, node)) {
      this._swap(bigChild, node);
      this._siftDown(bigChild);
    }

    if (smallChild && this._less(smallChild, node)) {
      this._swap(smallChild, node);
      this._siftDown(smallChild);
    }
  }
}
