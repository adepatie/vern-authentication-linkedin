module.exports = function($vern) {
  $vern.controllers.LinkedInController = require('./LinkedInController');
  $vern.models.UserModel = require('./UserModel')($vern);
  return $vern;
}