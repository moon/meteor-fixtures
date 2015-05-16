//------------------------------
// Description
//------------------------------

Package.describe({
  name: 'moonco:fixtures',
  summary: 'Moon fixtures',
  version: '0.0.1',
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

    // Meteor Packages
    'underscore',
    'mongo',

    // Thirdparty Packages
    'matb33:collection-hooks@0.7.13',
    'jparker:crypto-md5@0.1.1'

  ], 'server');

  //------------------------------
  // Files
  //------------------------------

  api.addFiles([

    'index.js'

  ], 'server');

});
