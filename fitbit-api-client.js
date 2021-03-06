var OAuth2 = require('simple-oauth2'),
    Q = require('q'),
    Request = require('request');

function FitbitApiClient(clientID, clientSecret) {
    this.oauth2 = OAuth2({
        clientID: clientID,
        clientSecret: clientSecret,
        site: 'https://api.fitbit.com/', 
        authorizationPath: 'oauth2/authorize',
        tokenPath: 'oauth2/token',
        useBasicAuthorizationHeader: true
    });
}

FitbitApiClient.prototype = {
    getAuthorizeUrl: function (options) {
        var missingAuthParamsErrorMsg = "One of (scope, redirect_uri) missing in options";
        if (options.redirect_uri === undefined || options.scope === undefined){
            throw new Error(missingAuthParamsErrorMsg);
        }else{
            return this.oauth2.authCode.authorizeURL(options).replace('api', 'www');
        }
    },

    getAccessToken: function (options) {
        var deferred = Q.defer();
        var missingAuthParamsErrorMsg = "One of (code, redirect_uri) missing in options";
        if (options.code === undefined || options.redirect_uri === undefined){
            deferred.reject(missingAuthParamsErrorMsg);
        }else{
            this.oauth2.authCode.getToken(options, function (error, result) {
                if (error) {
                    deferred.reject(error);
                } else {
                    deferred.resolve(result);
                }
            });
        }
        return deferred.promise;
    },

    revokeTokens: function(tokens){
        var deferred = Q.defer();
        var token = this.oauth2.accessToken.create(tokens);
        token.revoke('access_token')
        .then(function revokeRefresh() {
            // Revoke the refresh token
            return token.revoke('refresh_token').then(function(res){
                deferred.resolve(res);
            });
        }).catch(function(err){
            deferred.reject(err);
        });
        return deferred.promise;
    },

    revokeAccessToken: function(tokens){
        var deferred = Q.defer();
        var token = this.oauth2.accessToken.create(tokens);
        token.revoke('access_token').then(function(res){
            deferred.resolve(res);
        }).catch(function(err){
            deferred.reject(err);
        });
        return deferred.promise;
    },

    revokeRefreshToken: function(tokens){
        var deferred = Q.defer();
        var token = this.oauth2.accessToken.create(tokens);
        token.revoke('refresh_token').then(function(res){
            deferred.resolve(res);
        }).catch(function(err){
            deferred.reject(err);
        });
        return deferred.promise;
    },
    
    refreshAccessToken: function (accessToken, refreshToken) {
        var deferred = Q.defer();
          
        var token = this.oauth2.accessToken.create({
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_in: -1
        });
          
        token.refresh(function (error, result) {
            if (error) {
                deferred.reject(error);
            } else {
                deferred.resolve(result.token);
            }
        });
        
        return deferred.promise;
    },
    
    get: function (path, accessToken, userId) {
        var deferred = Q.defer();
        
        Request({
            url: getUrl(path, userId), 
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + accessToken
            },
            json: true
        }, function(error, response, body) {
            if (error) {
                deferred.reject(error);
            } else {
                deferred.resolve([
                    body,
                    response
                ]);
            }
        });
        
        return deferred.promise;
    },

    post: function (path, accessToken, data, userId) {
        var deferred = Q.defer();
        
        Request({
            url: getUrl(path, userId), 
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + accessToken
            },
            json: true,
            body: data
        }, function(error, response, body) {
            if (error) {
                deferred.reject(error);
            } else {
                deferred.resolve([
                    body,
                    response
                ]);
            }
        });
        
        return deferred.promise;
    },

    put: function (path, accessToken, data, userId) {
        var deferred = Q.defer();
        
        Request({
            url: getUrl(path, userId), 
            method: 'PUT',
            headers: {
                Authorization: 'Bearer ' + accessToken
            },
            json: true,
            body: data
        }, function(error, response, body) {
            if (error) {
                deferred.reject(error);
            } else {
                deferred.resolve([
                    body,
                    response
                ]);
            }
        });
        
         return deferred.promise;
    },

    delete: function (path, accessToken, userId) {
        var deferred = Q.defer();
        
        Request({
            url: getUrl(path, userId), 
            method: 'DELETE',
            headers: {
                Authorization: 'Bearer ' + accessToken
            },
            json: true
        }, function(error, response, body) {
            if (error) {
                deferred.reject(error);
            } else {
                deferred.resolve([
                    body,
                    response
                ]);
            }
        });
        
        return deferred.promise;
    }
};

function getUrl(path, userId) {
    return url = 'https://api.fitbit.com/1/user/' + (userId || '-') + path;
}

module.exports = FitbitApiClient;
