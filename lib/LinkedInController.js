/**
 * Authorization and registration functions for LinkedIn
 *
 * @class LinkedInController
 * @constructor
 */
function LinkedInController($parent) {
  var validator         = require('validator'),
    extend            = require('node.extend'),
    request           = require('request'),
    liObj             = require('linkedin-node-new');

  var $scope = new $parent.controller();
  $scope.loginLinkedIn = function(req, res, next) {
    var resp = res.resp;
    var linkedin = new liObj({
      id: $parent.localConfig.LinkedIn_clientId,
      secret: $parent.localConfig.LinkedIn_clientSecret,
      redirect_uri: $parent.localConfig.LinkedIn_redirectUri
    });
    if(!req.params.code) {
      res.resp.data({
        url: linkedin.createURL()
      });
      res.resp.send();
      return;
    }

    linkedin.getAccessToken(req.params.code, function(err, access_token) {
      if(err) {
        console.log(err);
        return res.resp.handleError(500, new Error('Error connecting LinkedIn'));
      }
      linkedin.setAccessToken(access_token);
      linkedin.get('/v1/people/~:(id,first-name,last-name,headline,positions,picture-url::(original),picture-urls::(original),email-address)', function(err, linkedinres) {
        if(err) {
          console.log(err);
          return res.resp.handleError(500, new Error('Error connecting LinkedIn'));
        }

        console.log(linkedinres);
        console.log(linkedinres.positions.values[0]);
        var bio = linkedinres.positions && linkedinres.positions.values.length ? linkedinres.positions.values[0] : null;
        var avatar_url = linkedinres.pictureUrls && linkedinres.pictureUrls.values.length ? linkedinres.pictureUrls.values[0] : linkedinres.pictureUrl;
        new $parent.models.UserModel().query({email: linkedinres.emailAddress.toLowerCase()}, function(err, rows) {
          if(err) {
            console.log(err);
            return res.resp.handleError(500, new Error('Error connecting LinkedIn'));
          }

          if(rows.length <= 0) {
            // If there are no users with the linkedin id,
            // Create a new user
            new $parent.controllers.AuthController().createUser({
              email: linkedinres.emailAddress,
              username: linkedinres.emailAddress,
              linkedin_access_token: access_token,
              linkedin_id: linkedinres.id,
              active: true,
              display_name: linkedinres.firstName + ' ' + linkedinres.lastName,
              avatar_url: avatar_url,
              biography: bio ? bio.summary : null,
              occupation: bio ? bio.title : null,
              occupation_company: bio ? bio.company.name : null,
              registrationCode: $parent.controllers.auth.createRegistrationCode(),
              role: 'user'
            }, function(err, newUser) {
              if(err) {
                return res.resp.handleError(res, 400, err);
              }
              res.resp.data(newUser.account());
              res.resp.send();
            });
            return;
          }

          // User exists in the database.
          var user = rows[0];
          new $parent.controllers.AuthController().loginUser(user, function(err, user) {
            if(err) {
              return res.resp.handleError(res, 400, err);
            }
            res.resp.data(user.account());
            res.resp.send();
          });
        });
      });
    });
  };
  $scope.addRoute({
    method: 'get',
    path: '/auth/linkedin',
    controller: $scope.loginLinkedIn
  });

  $scope.addRoute({
    method: 'post',
    path: '/auth/linkedin',
    controller: $scope.loginLinkedIn
  });
  return $scope;
}
module.exports = LinkedInController;