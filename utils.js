/**
 * Utils API
 * @type {Object}
 */
Utils = {

  wrap: function(object, key) {

    var method = object[key];

    var base = Array.prototype.slice.call(arguments, 2, 3);
    var post = Array.prototype.slice.call(arguments, 3, 4);

    return function() {

      var core = Array.prototype.slice.call(arguments);

      return method.apply(object, base.concat(core, post));

    };

  },

  pluck: function(cursor, field) {

    return cursor.map(function(doc) { return doc[field]; });

  }

};
