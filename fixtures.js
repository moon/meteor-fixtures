/**
 * Collection to store fixture data.
 * @type {Mongo.Collection}
 */
var store = new Mongo.Collection('fixtures');

/**
 * Fixtures API
 * @type {Object}
 */
Fixtures = {

  /**
   * Returns an array of fixture `id` strings for a given `collection`.
   * @param {Mongo.Collection} collection Collection to get the `id` values of.
   * @return {Array.<String>} Array of fixture `id` strings.
   */
  ids: function(collection) {

    var cursor = store.find({
      collection: collection._name
    }, { fields: { id: 1 } });

    return Utils.pluck(cursor, 'id');

  },

  /**
   * Returns a document from the `collection` for the given `id`.
   * If no `id` is provided, returns a cursor to all fixture documents in the `collection`.
   * @param {Mongo.Collection} collection Collection to get the document from.
   * @param {String} id Unique identifier for the fixture document. Optional.
   * @return {Object} Document.
   */
  get: function(collection, id) {

    if (_.isString(id)) {

      var fixture = store.findOne({
        collection: collection._name, id: id
      }, { fields: { _id: 1 } });

      if (fixture) { return collection.findOne(fixture._id); }

    } else {

      var cursor = store.find({
        collection: collection._name
      }, { fields: { _id: 1 } });

      return collection.find({ _id: { $in: Utils.pluck(cursor, '_id') }});

    }

  },

  /**
   * Inserts a document into the `collection` for the given `id`,
   * passing it `data` and returns the new document `_id`.
   * @param {Mongo.Collection} collection Collection to insert the data into.
   * @param {String} id Unique identifier for the fixture document
   * @param {Object} data Data to insert into the collection.
   * @param {Function} proxy Function to call in place of `collection.insert`.
   * @return {String} Document `_id`.
   */
  insert: function(collection, id, data, proxy) {

    var doc = Fixtures.get(collection, id);

    if (!doc) {

      var _id = _.isFunction(proxy) ? proxy(data) :
                  collection.insert(data);

      if (_id) {

        store.insert({
          _id: _id, id: id, collection: collection._name
        });

        Counter.added(collection, 1);

        return id;

      }

    }

  },

  /**
   * Updates a document in the `collection` for the given `id`,
   * passing it `data` and returns the number of affected documents.
   * @param {Mongo.Collection} collection Collection to get the document from.
   * @param {String} id Unique identifier of the fixture document.
   * @param {Object} data Data to set on the document.
   * @param {Function} proxy Function to call in place of `collection.update`.
   * @return {Number} Number of affected documents.
   */
  update: function(collection, id, data, proxy) {

    var doc = Fixtures.get(collection, id);

    if (doc) {

      var count = _.isFunction(proxy) ? proxy(doc._id, data) :
                    collection.update(doc._id, { $set: data });

      Counter.changed(collection, count);

      return count;

    }

  },

  /**
   * Removes a document from the `collection` for the given `id`
   * and returns the number of removed documents.
   * @param {Mongo.Collection} collection Collection to remove the document from.
   * @param {String} id Unique identifier of the fixture document.
   * @param {Function} proxy Function to call instead of `collection.remove`.
   * @return {Number} Number of removed documents.
   */
  remove: function(collection, id, proxy) {

    var doc = Fixtures.get(collection, id);

    if (doc) {

      var count = _.isFunction(proxy) ? proxy(doc._id) :
                    collection.remove(doc._id);

      Counter.removed(collection, count);

      return count;

    }

  },

  /**
   * Removes all fixture documents from the `collection`
   * and returns the number of removed documents.
   * @param {Mongo.Collection} collection Collection to remove fixture documents from.
   * @return {Number} Number of removed documents.
   */
  flush: function(collection) {

    var cursor = store.find({
      collection: collection._name
    }, { fields: { _id: 1 } });

    var ids = Utils.pluck(cursor, '_id');

    if (ids.length) {

      store.remove({ collection: collection._name });

      var count = collection.remove({ _id: { $in: ids }});

      Counter.removed(collection, count);

      return count;

    } else { return 0; }

  },

  /**
   * Returns the number of fixture documents in the `collection`.
   * @param {Mongo.Collection} collection Collection to get the number of fixture documents from.
   * @return {Number} Number of fixture documents.
   */
  count: function(collection) {

    var cursor = store.find({
      collection: collection._name
    }, { fields: { _id: 1 } });

    var ids = Utils.pluck(cursor, '_id');
    var selector = { _id: { $in: ids }};

    return ids.length ? collection.find(selector).count() : 0;

  },

  /**
   * Creates a wrapper around the `Fixture API` for the given `collection`
   * and passes it to the `callback` as an `api` object.
   * @param {Mongo.Collection} collection Collection to wrap the `Fixture API` with.
   * @param {Function} callback Function to call with the wrapped `api`.
   * @param {Object} proxies Hash of proxy functions to call in place of `insert`, `update` and `remove`.
   */
  create: function(collection, callback, proxies) {

    var key, proxy, api = {};

    for (key in Fixtures) {
      switch (key) {
        case 'insert':
        case 'update':
        case 'remove':
          proxy = _.isObject(proxies) &&
                  _.isFunction(proxies[key]) ?
                    proxies[key] : undefined;
          break;
        default:
          proxy = undefined;
          break;
      }

      api[key] = Utils.wrap(Fixtures, key, collection, proxy);

    }

    callback.apply(api, [api]);

  }

};
