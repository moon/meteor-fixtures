# Meteor Fixtures

**Serverside fixtures manager for Meteor**



## Example

```js
var Authors = new Mongo.Collection('authors');
var Books = new Mongo.Collection('books');

Fixtures.insert(Authors, 'jane_austen', {
  name: 'Jane Austen'
});

console.log(Fixtures.get(Authors, 'jane_austen'));
// {
//   _id: 'EB7PbxkcrXhHEsmKh',
//   name: 'Jane Austen'
// }

Fixtures.insert(Authors, 'harper_lee', {
  name: 'Harper Lee'
});

// Convenience method that wraps the Fixtures API with a collection
Fixtures.create(Books, function(api) {

  var janeAusten = Fixtures.get(Authors, 'jane_austen');
  var harperLee = Fixtures.get(Authors, 'harper_lee');

  api.insert('pride_and_prejudice', {
    title: 'Pride & Prejudice',
    author: janeAusten.name,
    authorId: janeAusten._id
  });

  api.insert('to_kill_a_mockingbird', {
    title: 'To Kill a Mockingbird',
    author: harperLee.name,
    authorId: harperLee._id
  });

  api.update('pride_and_prejudice', {
    pages: 279
  });

  console.log(api.get('pride_and_prejudice'));
  // {
  //   _id: 'scYpPBwEmxTwkaLdH',
  //   title: 'Pride & Prejudice',
  //   author: 'Jane Austen',
  //   authorId: 'EB7PbxkcrXhHEsmKh',
  //   pages: 279
  // }

  console.log('books:', api.count()); // 'books: 2'

  api.remove('pride_and_prejudice');

  console.log('books:', api.count()); // 'books: 1'

  api.flush();

  console.log('books:', api.count()); // 'books: 0'

});

console.log('authors:', Fixtures.count(Authors)); // 'authors: 2'

Fixtures.flush(Authors);

console.log('authors:', Fixtures.count(Authors)); // 'authors: 0'
```



## API

Fixture `id`'s only have to be unique to a `collection`.

`proxy` functions should behave like the collection method they are mimicking:

- `insert` methods should return the `_id` of the new document
- `update` methods should return the `Number` of affected documents
- `remove` methods should return the `Number` of removed documents



### Fixtures.get(collection, id)

Returns a document from the `collection` for the given `id`.

If no document is found, returns `undefined`.

| Parameter  | Type              | Description
|:----------:|:-----------------:|------------
|`collection`| `Mongo.Collection`| Collection to get the document from
|`id`        | `String`          | Unique identifier for the fixture document



### Fixtures.insert(collection, id, data, proxy)

Inserts a document into the `collection` for the given `id`, passing it `data` and returns the new document `_id`.

If a document already exists in the `collection` for the given `id`, the operation bails and returns `undefined`.

| Parameter  | Type              | Description
|:----------:|:-----------------:|------------
|`collection`| `Mongo.Collection`| Collection to insert the data into
|`id`        | `String`          | Unique identifier for the fixture document
|`data`      | `Object`          | Data to insert into the collection
|`proxy`     | `Function`        | Function to call instead of `collection.insert`

The `proxy` method is called with the provided `data` object and should return the `_id` of the new document.

A useful case for providing a `proxy` function is when you are creating user fixtures using Meteor's Accounts package:

#### Example: `Accounts.createUser`

```js
Fixtures.insert(Meteor.users, 'joe', {
  email: 'joe@blogs.com',
  username: 'joe',
  password: 'dog'
}, Accounts.createUser);
```



### Fixtures.update(collection, id, data, proxy)

Updates a document in the `collection` for the given `id`, passing it `data` and returns the number of affected documents.

If no document is found, returns `undefined`.

| Parameter  | Type              | Description
|:----------:|:-----------------:|------------
|`collection`| `Mongo.Collection`| Collection to get the document from
|`id`        | `String`          | Unique identifier of the fixture document
|`data`      | `Object`          | Data to set on the document
|`proxy`     | `Function`        | Function to call instead of `collection.update`

The `proxy` method is called with the document `_id` and `data` object and should return the number of affected documents.



### Fixtures.remove(collection, id, proxy)

Removes a document from the `collection` for the given `id` and returns the number of removed documents.

If no document is found, returns `undefined`.

| Parameter  | Type              | Description
|:----------:|:-----------------:|------------
|`collection`| `Mongo.Collection`| Collection to remove the document from
|`id`        | `String`          | Unique identifier of the fixture document
|`proxy`     | `Function`        | Function to call instead of `collection.remove`

The `proxy` method is called with the document `_id` and should return the number of removed documents.



### Fixtures.flush(collection)

Removes __all__ fixture documents from the `collection` and returns the number of removed documents.

| Parameter  | Type              | Description
|:----------:|:-----------------:|------------
|`collection`| `Mongo.Collection`| Collection to remove fixture documents from



### Fixtures.count(collection)

Returns the number of fixture documents in the `collection`.

| Parameter  | Type              | Description
|:----------:|:-----------------:|------------
|`collection`| `Mongo.Collection`| Collection to get the number of fixture documents from



### Fixtures.create(collection, callback, proxies)

Creates a wrapper around the `Fixture API` for the given `collection` and passes it to the `callback` as an `api` object.

| Parameter  | Type              | Description
|:----------:|:-----------------:|------------
|`collection`| `Mongo.Collection`| Collection to wrap the `Fixture API` with
|`callback`  | `Function`        | Function to call with the wrapped `api`
|`proxies`   | `Object`          | Hash of proxy functions to call in place of `insert`, `update` and `remove`

#### Example

```js
Fixtures.create(Meteor.users, function(api) {

  api.insert('joe', {
    email: 'joe@blogs.com',
    username: 'joe',
    password: 'dog'
  });

}, {

  insert: Accounts.createUser // use for all calls to api.insert

});
```



## Author

Matthew Wagerfield: [@wagerfield][twitter]



## License

Licensed under [MIT][mit]. Enjoy.

[twitter]: http://twitter.com/wagerfield
[mit]: http://www.opensource.org/licenses/mit-license.php
