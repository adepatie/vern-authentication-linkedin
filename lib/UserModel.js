var validator = require('validator');

function Model(scope) {
  var UserModel = scope.models.UserModel;
  function NewUserModel() {
    this.linkedin_access_token = null;
    this.linkedin_id = null;
    this.facebook_access_token = null;
    this.facebook_id = null;

    return this.update(arguments[0]);
  }

  new scope.model().extend(NewUserModel, {
    exclude: [
      'linkedin_access_token'
    ]
  }, UserModel);

  return NewUserModel;
}

module.exports = Model;