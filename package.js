//------------------------------
// Description
//------------------------------

Package.describe({
  name: 'moonco:fixtures',
  summary: 'Moon fixtures manager',
  version: '0.1.1',
  git: 'https://github.com/moon/meteor-fixtures'
});

//------------------------------
// Definition
//------------------------------

Package.onUse(function(api) {

  api.versionsFrom('1.0.4.2');

  //------------------------------
  // Exports
  //------------------------------

  api.export('Fixtures', 'server');

  //------------------------------
  // Dependancies
  //------------------------------

  api.use([

    'underscore',
    'mongo'

  ], 'server');

  //------------------------------
  // Files
  //------------------------------

  api.addFiles([

    'utils.js',
    'counter.js',
    'fixtures.js'

  ], 'server');

});
