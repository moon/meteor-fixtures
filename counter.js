/**
 * Counter API
 * @type {Object}
 */
Counter = {

  /**
   * Timeout delay before log is called.
   * @type {Number}
   */
  delay: 1000,

  /**
   * Hash of counter objects, keyed with collection._name's.'
   * @type {Object}
   */
  counters: {},

  /**
   * Resets a counter's added, changed and removed counter values to 0.
   * @param {Object} counter Counter object.
   */
  reset: function(counter) {

    counter.added = counter.changed = counter.removed = 0;

  },

  /**
   * Returns the counter object for the given `collection`.
   * Creates a new counter object if no counter is found.
   * @param {Mongo.Collection} collection Collection to create the counter for.
   * @return {Object} Counter object.
   */
  get: function(collection) {

    var name = collection._name;
    var counter = Counter.counters[name];

    if (!counter) {

      counter = Counter.counters[name] = { name: name };

      Counter.reset(counter);

    }

    return counter;

  },

  /**
   * Updates a counter's added counter.
   * @param {Mongo.Collection} collection Collection counter to update.
   * @param {Number} count Number to add to the added counter.
   */
  added: function(collection, count) {

    if (count) {

      var counter = Counter.get(collection);

      counter.added += count;

      Counter.queue(counter);

    }

  },

  /**
   * Updates a counter's changed counter.
   * @param {Mongo.Collection} collection Collection counter to update.
   * @param {Number} count Number to add to the changed counter.
   */
  changed: function(collection, count) {

    if (count) {

      var counter = Counter.get(collection);

      counter.changed += count;

      Counter.queue(counter);

    }

  },

  /**
   * Updates a counter's removed counter.
   * @param {Mongo.Collection} collection Collection counter to update.
   * @param {Number} count Number to add to the removed counter.
   */
  removed: function(collection, count) {

    if (count) {

      var counter = Counter.get(collection);

      counter.removed += count;

      Counter.queue(counter);

    }

  },

  /**
   * Clears and queues a timeout function for a counter.
   * @param {Object} counter Counter object to queue.
   */
  queue: function(counter) {

    Meteor.clearTimeout(counter.timeout);

    counter.timeout = Meteor.setTimeout(function() {

      Counter.log(counter);

    }, Counter.delay);

  },

  /**
   * Logs the number of added, changed and removed calls.
   * @param {Object} counter Counter object to log the values of.
   */
  log: function(counter) {

    console.log('\nFixtures [', counter.name, ']');
    console.log('├─ removed', counter.removed);
    console.log('├─ changed', counter.changed);
    console.log('└─── added', counter.added);

    Counter.reset(counter);

  }

};
