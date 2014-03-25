var vern = require('vern-core');


new vern().then(function($vern) {
  $vern = require('vern-authentication')($vern);
  $vern = require('../lib')($vern);
  $vern.controllers.linkedin = new $vern.controllers.LinkedInController($vern).init();
  $vern.controllers.auth = new $vern.controllers.AuthController($vern).init({
    model: $vern.models.UserModel
  });
  $vern.controllers.auth.firstRun();
}).fail(function(err) {
    console.log(err);
    console.log(err.stack);
  });