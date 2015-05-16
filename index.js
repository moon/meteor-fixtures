//------------------------------
// Helpers
//------------------------------

/**
 * Serialises an object into a MD5 hash.
 * @param {Object} data Object to serialise.
 * @return {String} Hash MD5 representation of the provided data.
 */
function serialise(data) {
  return CryptoJS.MD5(JSON.stringify(data)).toString();
}

/**
 * Returns an array of document values for a given field key.
 * @param {Mongo.Cursor} cursor Cursor to iterate over.
 * @param {String} field Field key to return the value of.
 * @return {Array} Array of document values.
 */
function map(cursor, field) {
  return cursor.map(function(doc) { return doc[field]; });
}

//------------------------------
// Store
//------------------------------

var Store = {

  collection: new Mongo.Collection('fixtures'),

  /**
   * Return a cursor for all fixtures in a collection.
   * @param {String} name Name of the collection to find fixtures within.
   * @param {String} hash Hash representation of the fixture data. Optional.
   * @return {Mongo.Cursor} Cursor pointing at the matching fixtures.
   */
  find: function(name, hash) {
    var selector = { name: name };
    if (hash) { selector.hash = hash; }
    return Store.collection.find(selector);
  },

  /**
   * Inserts a document into the fixture collection.
   * @param {String} name Name of the collection.
   * @param {String} id Reference id of the document in the actual collection.
   * @param {String} hash Hash representation of the fixture data.
   * @return {String} ID of the inserted fixture document.
   */
  insert: function(name, id, hash) {
    return Store.collection.insert({
      name: name, _id: id, hash: hash,
    });
  },

  /**
   * Removes a fixture document from the fixtures collection.
   * @param {String} name Name of the fixture collection.
   * @param {String} id ID  of the fixture document.
   * @return {Number} Number of documents that have been removed.
   */
  remove: function(name, id) {
    return Store.collection.remove({
      name: name, _id: id
    });
  },

  /**
   * Returns the number of fixtures in a collection.
   * @param {String} name Name of the fixture collection.
   * @return {Number} Number of fixture documents in the collection.
   */
  count: function(name) {
    return Store.findAll(name).count();
  }

};

//------------------------------
// Fixtures
//------------------------------

Fixtures = {

  /**
   * Provides an callback and interface to insert, remove and flush fixtures.
   * @param {Mongo.Collection} collection Collection to add fixture data to.
   * @param {Function} callback Callback to run, passing an API object to.
   * @param {Object} options Options object allowing insert and remove methods
   *                         to be overridden. For example:
   *                         {
   *                           insert: Accounts.createUser
   *                         }
   */
  create: function(collection, callback, options) {

    Meteor.startup(function() {

      /**
       * Returns the collection mutation method for a given key.
       * @param {String} key Method name. 'insert', 'remove', 'update', 'upsert'
       * @return {Function} Mutation method.
       */
      function getMethod(key) {
        var valid = _.isObject(options) && _.isFunction(options[key]);
        var method = valid ? options[key] : collection[key];
        return method.bind(collection);
      }

      var name = collection._name,
          insert = getMethod('insert'),
          remove = getMethod('remove'),
          inserted = 0,
          removed = 0;

      // Monitor the insertion of documents into the collection.
      var insertHook = collection.after.insert(function(userId, doc) {
        inserted++;
      });

      // Monitor the removal of documents from the collection.
      var removeHook = collection.after.remove(function(userId, doc) {
        Store.remove(name, doc._id);
        removed++;
      });

      // Build the api object to ba passed to the callback.
      var api = {

        /**
         * Inserts a fixture document into the collection.
         * @param {Object} data Data to be inserted into the collection.
         * @param {Object} options Options object.
         *                         {
         *                           allowDuplicate: Boolean
         *                         }
         * @return {String} ID of the inserted document.
         */
        insert: function(data, options) {
          options = _.isObject(options) ? options : {};
          var hash = serialise(data);
          var cursor = Store.find(name, hash);
          if (options.allowDuplicate || !cursor.count()) {
            var id = insert(data);
            if (id) {
              Store.insert(name, id, hash);
              return id;
            }
          }
        },

        /**
         * Removes fixture documents from the collection that match the given data signature.
         * @param {Object} data Data signature to lookup documents with.
         * @return {Number} Number of fixture documents that have been removed.
         */
        remove: function(data) {
          var hash = serialise(data);
          var cursor = Store.find(name, hash);
          if (cursor.count()) {
            return remove({ _id: { $in: map(cursor, '_id') } });
          }
        },

        /**
         * Removes all fixture documents form the collection.
         * @return {Number} The number of documents that have been removed.
         */
        flush: function() {
          var cursor = Store.find(name);
          if (cursor.count()) {
            return remove({ _id: { $in: map(cursor, '_id') } });
          }
        },

        /**
         * Returns the number of fixture documents in the collection.
         * @return {Number} Number of fixture documents in the collection.
         */
        count: function() {
          return Store.count(name);
        }

      };

      // Call the callback, passing the api.
      callback(api);

      // Remove hooks.
      insertHook.remove();
      removeHook.remove();

      // Log any fixture mutations.
      if (inserted || removed) {
        console.log('\nFixtures:', name);
        console.log(' – inserted:', inserted);
        console.log(' – removed:', removed);
        console.log(' – count:', Store.count(name));
      }

    });

  }

};
