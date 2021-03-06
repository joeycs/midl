(function () {
  function r(e, n, t) {
    function o(i, f) {
      if (!n[i]) {
        if (!e[i]) {
          var c = "function" == typeof require && require;
          if (!f && c) return c(i, !0);
          if (u) return u(i, !0);
          var a = new Error("Cannot find module '" + i + "'");
          throw ((a.code = "MODULE_NOT_FOUND"), a);
        }
        var p = (n[i] = { exports: {} });
        e[i][0].call(
          p.exports,
          function (r) {
            var n = e[i][1][r];
            return o(n || r);
          },
          p,
          p.exports,
          r,
          e,
          n,
          t
        );
      }
      return n[i].exports;
    }
    for (
      var u = "function" == typeof require && require, i = 0;
      i < t.length;
      i++
    )
      o(t[i]);
    return o;
  }
  return r;
})()(
  {
    1: [
      function (require, module, exports) {
        /* global module */
        "use strict";

        /**
         * Class representing the API
         */
        var SpotifyWebApi = (function () {
          var _baseUri = "https://api.spotify.com/v1";
          var _accessToken = null;
          var _promiseImplementation = null;

          var WrapPromiseWithAbort = function (promise, onAbort) {
            promise.abort = onAbort;
            return promise;
          };

          var _promiseProvider = function (promiseFunction, onAbort) {
            var returnedPromise;
            if (_promiseImplementation !== null) {
              var deferred = _promiseImplementation.defer();
              promiseFunction(
                function (resolvedResult) {
                  deferred.resolve(resolvedResult);
                },
                function (rejectedResult) {
                  deferred.reject(rejectedResult);
                }
              );
              returnedPromise = deferred.promise;
            } else {
              if (window.Promise) {
                returnedPromise = new window.Promise(promiseFunction);
              }
            }

            if (returnedPromise) {
              return new WrapPromiseWithAbort(returnedPromise, onAbort);
            } else {
              return null;
            }
          };

          var _extend = function () {
            var args = Array.prototype.slice.call(arguments);
            var target = args[0];
            var objects = args.slice(1);
            target = target || {};
            objects.forEach(function (object) {
              for (var j in object) {
                if (object.hasOwnProperty(j)) {
                  target[j] = object[j];
                }
              }
            });
            return target;
          };

          var _buildUrl = function (url, parameters) {
            var qs = "";
            for (var key in parameters) {
              if (parameters.hasOwnProperty(key)) {
                var value = parameters[key];
                qs +=
                  encodeURIComponent(key) +
                  "=" +
                  encodeURIComponent(value) +
                  "&";
              }
            }
            if (qs.length > 0) {
              // chop off last '&'
              qs = qs.substring(0, qs.length - 1);
              url = url + "?" + qs;
            }
            return url;
          };

          var _performRequest = function (requestData, callback) {
            var req = new XMLHttpRequest();

            var promiseFunction = function (resolve, reject) {
              function success(data) {
                if (resolve) {
                  resolve(data);
                }
                if (callback) {
                  callback(null, data);
                }
              }

              function failure() {
                if (reject) {
                  reject(req);
                }
                if (callback) {
                  callback(req, null);
                }
              }

              var type = requestData.type || "GET";
              req.open(type, _buildUrl(requestData.url, requestData.params));
              if (_accessToken) {
                req.setRequestHeader("Authorization", "Bearer " + _accessToken);
              }
              if (requestData.contentType) {
                req.setRequestHeader("Content-Type", requestData.contentType);
              }

              req.onreadystatechange = function () {
                if (req.readyState === 4) {
                  var data = null;
                  try {
                    data = req.responseText ? JSON.parse(req.responseText) : "";
                  } catch (e) {
                    console.error(e);
                  }

                  if (req.status >= 200 && req.status < 300) {
                    success(data);
                  } else {
                    failure();
                  }
                }
              };

              if (type === "GET") {
                req.send(null);
              } else {
                var postData = null;
                if (requestData.postData) {
                  postData =
                    requestData.contentType === "image/jpeg"
                      ? requestData.postData
                      : JSON.stringify(requestData.postData);
                }
                req.send(postData);
              }
            };

            if (callback) {
              promiseFunction();
              return null;
            } else {
              return _promiseProvider(promiseFunction, function () {
                req.abort();
              });
            }
          };

          var _checkParamsAndPerformRequest = function (
            requestData,
            options,
            callback,
            optionsAlwaysExtendParams
          ) {
            var opt = {};
            var cb = null;

            if (typeof options === "object") {
              opt = options;
              cb = callback;
            } else if (typeof options === "function") {
              cb = options;
            }

            // options extend postData, if any. Otherwise they extend parameters sent in the url
            var type = requestData.type || "GET";
            if (
              type !== "GET" &&
              requestData.postData &&
              !optionsAlwaysExtendParams
            ) {
              requestData.postData = _extend(requestData.postData, opt);
            } else {
              requestData.params = _extend(requestData.params, opt);
            }
            return _performRequest(requestData, cb);
          };

          /**
           * Creates an instance of the wrapper
           * @constructor
           */
          var Constr = function () {};

          Constr.prototype = {
            constructor: SpotifyWebApi,
          };

          /**
           * Fetches a resource through a generic GET request.
           *
           * @param {string} url The URL to be fetched
           * @param {function(Object,Object)} callback An optional callback
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.getGeneric = function (url, callback) {
            var requestData = {
              url: url,
            };
            return _checkParamsAndPerformRequest(requestData, callback);
          };

          /**
           * Fetches information about the current user.
           * See [Get Current User's Profile](https://developer.spotify.com/web-api/get-current-users-profile/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {Object} options A JSON object with options that can be passed
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.getMe = function (options, callback) {
            var requestData = {
              url: _baseUri + "/me",
            };
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Fetches current user's saved tracks.
           * See [Get Current User's Saved Tracks](https://developer.spotify.com/web-api/get-users-saved-tracks/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {Object} options A JSON object with options that can be passed
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.getMySavedTracks = function (options, callback) {
            var requestData = {
              url: _baseUri + "/me/tracks",
            };
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Adds a list of tracks to the current user's saved tracks.
           * See [Save Tracks for Current User](https://developer.spotify.com/web-api/save-tracks-user/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {Array<string>} trackIds The ids of the tracks. If you know their Spotify URI it is easy
           * to find their track id (e.g. spotify:track:<here_is_the_track_id>)
           * @param {Object} options A JSON object with options that can be passed
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.addToMySavedTracks = function (
            trackIds,
            options,
            callback
          ) {
            var requestData = {
              url: _baseUri + "/me/tracks",
              type: "PUT",
              postData: trackIds,
            };
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Remove a list of tracks from the current user's saved tracks.
           * See [Remove Tracks for Current User](https://developer.spotify.com/web-api/remove-tracks-user/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {Array<string>} trackIds The ids of the tracks. If you know their Spotify URI it is easy
           * to find their track id (e.g. spotify:track:<here_is_the_track_id>)
           * @param {Object} options A JSON object with options that can be passed
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.removeFromMySavedTracks = function (
            trackIds,
            options,
            callback
          ) {
            var requestData = {
              url: _baseUri + "/me/tracks",
              type: "DELETE",
              postData: trackIds,
            };
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Checks if the current user's saved tracks contains a certain list of tracks.
           * See [Check Current User's Saved Tracks](https://developer.spotify.com/web-api/check-users-saved-tracks/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {Array<string>} trackIds The ids of the tracks. If you know their Spotify URI it is easy
           * to find their track id (e.g. spotify:track:<here_is_the_track_id>)
           * @param {Object} options A JSON object with options that can be passed
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.containsMySavedTracks = function (
            trackIds,
            options,
            callback
          ) {
            var requestData = {
              url: _baseUri + "/me/tracks/contains",
              params: { ids: trackIds.join(",") },
            };
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Get a list of the albums saved in the current Spotify user's "Your Music" library.
           * See [Get Current User's Saved Albums](https://developer.spotify.com/web-api/get-users-saved-albums/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {Object} options A JSON object with options that can be passed
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.getMySavedAlbums = function (options, callback) {
            var requestData = {
              url: _baseUri + "/me/albums",
            };
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Save one or more albums to the current user's "Your Music" library.
           * See [Save Albums for Current User](https://developer.spotify.com/web-api/save-albums-user/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {Array<string>} albumIds The ids of the albums. If you know their Spotify URI, it is easy
           * to find their album id (e.g. spotify:album:<here_is_the_album_id>)
           * @param {Object} options A JSON object with options that can be passed
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.addToMySavedAlbums = function (
            albumIds,
            options,
            callback
          ) {
            var requestData = {
              url: _baseUri + "/me/albums",
              type: "PUT",
              postData: albumIds,
            };
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Remove one or more albums from the current user's "Your Music" library.
           * See [Remove Albums for Current User](https://developer.spotify.com/web-api/remove-albums-user/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {Array<string>} albumIds The ids of the albums. If you know their Spotify URI, it is easy
           * to find their album id (e.g. spotify:album:<here_is_the_album_id>)
           * @param {Object} options A JSON object with options that can be passed
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.removeFromMySavedAlbums = function (
            albumIds,
            options,
            callback
          ) {
            var requestData = {
              url: _baseUri + "/me/albums",
              type: "DELETE",
              postData: albumIds,
            };
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Check if one or more albums is already saved in the current Spotify user's "Your Music" library.
           * See [Check User's Saved Albums](https://developer.spotify.com/web-api/check-users-saved-albums/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {Array<string>} albumIds The ids of the albums. If you know their Spotify URI, it is easy
           * to find their album id (e.g. spotify:album:<here_is_the_album_id>)
           * @param {Object} options A JSON object with options that can be passed
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.containsMySavedAlbums = function (
            albumIds,
            options,
            callback
          ) {
            var requestData = {
              url: _baseUri + "/me/albums/contains",
              params: { ids: albumIds.join(",") },
            };
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Get the current userÔÇÖs top artists based on calculated affinity.
           * See [Get a UserÔÇÖs Top Artists](https://developer.spotify.com/web-api/get-users-top-artists-and-tracks/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {Object} options A JSON object with options that can be passed
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.getMyTopArtists = function (options, callback) {
            var requestData = {
              url: _baseUri + "/me/top/artists",
            };
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Get the current userÔÇÖs top tracks based on calculated affinity.
           * See [Get a UserÔÇÖs Top Tracks](https://developer.spotify.com/web-api/get-users-top-artists-and-tracks/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {Object} options A JSON object with options that can be passed
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.getMyTopTracks = function (options, callback) {
            var requestData = {
              url: _baseUri + "/me/top/tracks",
            };
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Get tracks from the current userÔÇÖs recently played tracks.
           * See [Get Current UserÔÇÖs Recently Played Tracks](https://developer.spotify.com/web-api/web-api-personalization-endpoints/get-recently-played/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {Object} options A JSON object with options that can be passed
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.getMyRecentlyPlayedTracks = function (
            options,
            callback
          ) {
            var requestData = {
              url: _baseUri + "/me/player/recently-played",
            };
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Adds the current user as a follower of one or more other Spotify users.
           * See [Follow Artists or Users](https://developer.spotify.com/web-api/follow-artists-users/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {Array<string>} userIds The ids of the users. If you know their Spotify URI it is easy
           * to find their user id (e.g. spotify:user:<here_is_the_user_id>)
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is an empty value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.followUsers = function (userIds, callback) {
            var requestData = {
              url: _baseUri + "/me/following/",
              type: "PUT",
              params: {
                ids: userIds.join(","),
                type: "user",
              },
            };
            return _checkParamsAndPerformRequest(requestData, callback);
          };

          /**
           * Adds the current user as a follower of one or more artists.
           * See [Follow Artists or Users](https://developer.spotify.com/web-api/follow-artists-users/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {Array<string>} artistIds The ids of the artists. If you know their Spotify URI it is easy
           * to find their artist id (e.g. spotify:artist:<here_is_the_artist_id>)
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is an empty value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.followArtists = function (artistIds, callback) {
            var requestData = {
              url: _baseUri + "/me/following/",
              type: "PUT",
              params: {
                ids: artistIds.join(","),
                type: "artist",
              },
            };
            return _checkParamsAndPerformRequest(requestData, callback);
          };

          /**
           * Add the current user as a follower of one playlist.
           * See [Follow a Playlist](https://developer.spotify.com/web-api/follow-playlist/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {string} playlistId The id of the playlist. If you know the Spotify URI it is easy
           * to find the playlist id (e.g. spotify:user:xxxx:playlist:<here_is_the_playlist_id>)
           * @param {Object} options A JSON object with options that can be passed. For instance,
           * whether you want the playlist to be followed privately ({public: false})
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is an empty value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.followPlaylist = function (
            playlistId,
            options,
            callback
          ) {
            var requestData = {
              url: _baseUri + "/playlists/" + playlistId + "/followers",
              type: "PUT",
              postData: {},
            };

            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Removes the current user as a follower of one or more other Spotify users.
           * See [Unfollow Artists or Users](https://developer.spotify.com/web-api/unfollow-artists-users/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {Array<string>} userIds The ids of the users. If you know their Spotify URI it is easy
           * to find their user id (e.g. spotify:user:<here_is_the_user_id>)
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is an empty value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.unfollowUsers = function (userIds, callback) {
            var requestData = {
              url: _baseUri + "/me/following/",
              type: "DELETE",
              params: {
                ids: userIds.join(","),
                type: "user",
              },
            };
            return _checkParamsAndPerformRequest(requestData, callback);
          };

          /**
           * Removes the current user as a follower of one or more artists.
           * See [Unfollow Artists or Users](https://developer.spotify.com/web-api/unfollow-artists-users/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {Array<string>} artistIds The ids of the artists. If you know their Spotify URI it is easy
           * to find their artist id (e.g. spotify:artist:<here_is_the_artist_id>)
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is an empty value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.unfollowArtists = function (artistIds, callback) {
            var requestData = {
              url: _baseUri + "/me/following/",
              type: "DELETE",
              params: {
                ids: artistIds.join(","),
                type: "artist",
              },
            };
            return _checkParamsAndPerformRequest(requestData, callback);
          };

          /**
           * Remove the current user as a follower of one playlist.
           * See [Unfollow a Playlist](https://developer.spotify.com/web-api/unfollow-playlist/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {string} playlistId The id of the playlist. If you know the Spotify URI it is easy
           * to find the playlist id (e.g. spotify:user:xxxx:playlist:<here_is_the_playlist_id>)
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is an empty value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.unfollowPlaylist = function (playlistId, callback) {
            var requestData = {
              url: _baseUri + "/playlists/" + playlistId + "/followers",
              type: "DELETE",
            };
            return _checkParamsAndPerformRequest(requestData, callback);
          };

          /**
           * Checks to see if the current user is following one or more other Spotify users.
           * See [Check if Current User Follows Users or Artists](https://developer.spotify.com/web-api/check-current-user-follows/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {Array<string>} userIds The ids of the users. If you know their Spotify URI it is easy
           * to find their user id (e.g. spotify:user:<here_is_the_user_id>)
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is an array of boolean values that indicate
           * whether the user is following the users sent in the request.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.isFollowingUsers = function (userIds, callback) {
            var requestData = {
              url: _baseUri + "/me/following/contains",
              type: "GET",
              params: {
                ids: userIds.join(","),
                type: "user",
              },
            };
            return _checkParamsAndPerformRequest(requestData, callback);
          };

          /**
           * Checks to see if the current user is following one or more artists.
           * See [Check if Current User Follows](https://developer.spotify.com/web-api/check-current-user-follows/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {Array<string>} artistIds The ids of the artists. If you know their Spotify URI it is easy
           * to find their artist id (e.g. spotify:artist:<here_is_the_artist_id>)
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is an array of boolean values that indicate
           * whether the user is following the artists sent in the request.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.isFollowingArtists = function (artistIds, callback) {
            var requestData = {
              url: _baseUri + "/me/following/contains",
              type: "GET",
              params: {
                ids: artistIds.join(","),
                type: "artist",
              },
            };
            return _checkParamsAndPerformRequest(requestData, callback);
          };

          /**
           * Check to see if one or more Spotify users are following a specified playlist.
           * See [Check if Users Follow a Playlist](https://developer.spotify.com/web-api/check-user-following-playlist/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {string} playlistId The id of the playlist. If you know the Spotify URI it is easy
           * to find the playlist id (e.g. spotify:user:xxxx:playlist:<here_is_the_playlist_id>)
           * @param {Array<string>} userIds The ids of the users. If you know their Spotify URI it is easy
           * to find their user id (e.g. spotify:user:<here_is_the_user_id>)
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is an array of boolean values that indicate
           * whether the users are following the playlist sent in the request.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.areFollowingPlaylist = function (
            playlistId,
            userIds,
            callback
          ) {
            var requestData = {
              url:
                _baseUri + "/playlists/" + playlistId + "/followers/contains",
              type: "GET",
              params: {
                ids: userIds.join(","),
              },
            };
            return _checkParamsAndPerformRequest(requestData, callback);
          };

          /**
           * Get the current user's followed artists.
           * See [Get User's Followed Artists](https://developer.spotify.com/web-api/get-followed-artists/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {Object} [options] Options, being after and limit.
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is an object with a paged object containing
           * artists.
           * @returns {Promise|undefined} A promise that if successful, resolves to an object containing a paging object which contains
           * artists objects. Not returned if a callback is given.
           */
          Constr.prototype.getFollowedArtists = function (options, callback) {
            var requestData = {
              url: _baseUri + "/me/following",
              type: "GET",
              params: {
                type: "artist",
              },
            };
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Fetches information about a specific user.
           * See [Get a User's Profile](https://developer.spotify.com/web-api/get-users-profile/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {string} userId The id of the user. If you know the Spotify URI it is easy
           * to find the id (e.g. spotify:user:<here_is_the_id>)
           * @param {Object} options A JSON object with options that can be passed
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.getUser = function (userId, options, callback) {
            var requestData = {
              url: _baseUri + "/users/" + encodeURIComponent(userId),
            };
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Fetches a list of the current user's playlists.
           * See [Get a List of a User's Playlists](https://developer.spotify.com/web-api/get-list-users-playlists/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {string} userId An optional id of the user. If you know the Spotify URI it is easy
           * to find the id (e.g. spotify:user:<here_is_the_id>). If not provided, the id of the user that granted
           * the permissions will be used.
           * @param {Object} options A JSON object with options that can be passed
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.getUserPlaylists = function (
            userId,
            options,
            callback
          ) {
            var requestData;
            if (typeof userId === "string") {
              requestData = {
                url:
                  _baseUri +
                  "/users/" +
                  encodeURIComponent(userId) +
                  "/playlists",
              };
            } else {
              requestData = {
                url: _baseUri + "/me/playlists",
              };
              callback = options;
              options = userId;
            }
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Fetches a specific playlist.
           * See [Get a Playlist](https://developer.spotify.com/web-api/get-playlist/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {string} playlistId The id of the playlist. If you know the Spotify URI it is easy
           * to find the playlist id (e.g. spotify:user:xxxx:playlist:<here_is_the_playlist_id>)
           * @param {Object} options A JSON object with options that can be passed
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.getPlaylist = function (
            playlistId,
            options,
            callback
          ) {
            var requestData = {
              url: _baseUri + "/playlists/" + playlistId,
            };
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Fetches the tracks from a specific playlist.
           * See [Get a Playlist's Tracks](https://developer.spotify.com/web-api/get-playlists-tracks/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {string} playlistId The id of the playlist. If you know the Spotify URI it is easy
           * to find the playlist id (e.g. spotify:user:xxxx:playlist:<here_is_the_playlist_id>)
           * @param {Object} options A JSON object with options that can be passed
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.getPlaylistTracks = function (
            playlistId,
            options,
            callback
          ) {
            var requestData = {
              url: _baseUri + "/playlists/" + playlistId + "/tracks",
            };
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Gets the current image associated with a specific playlist.
           * See [Get a Playlist Cover Image](https://developer.spotify.com/documentation/web-api/reference/playlists/get-playlist-cover/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {string} playlistId The id of the playlist. If you know the Spotify URI it is easy
           * to find the playlist id (e.g. spotify:playlist:<here_is_the_playlist_id>)
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.getPlaylistCoverImage = function (
            playlistId,
            callback
          ) {
            var requestData = {
              url: _baseUri + "/playlists/" + playlistId + "/images",
            };
            return _checkParamsAndPerformRequest(requestData, callback);
          };

          /**
           * Creates a playlist and stores it in the current user's library.
           * See [Create a Playlist](https://developer.spotify.com/web-api/create-playlist/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {string} userId The id of the user. If you know the Spotify URI it is easy
           * to find the id (e.g. spotify:user:<here_is_the_id>)
           * @param {Object} options A JSON object with options that can be passed
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.createPlaylist = function (
            userId,
            options,
            callback
          ) {
            var requestData = {
              url:
                _baseUri +
                "/users/" +
                encodeURIComponent(userId) +
                "/playlists",
              type: "POST",
              postData: options,
            };
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Change a playlist's name and public/private state
           * See [Change a Playlist's Details](https://developer.spotify.com/web-api/change-playlist-details/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {string} playlistId The id of the playlist. If you know the Spotify URI it is easy
           * to find the playlist id (e.g. spotify:user:xxxx:playlist:<here_is_the_playlist_id>)
           * @param {Object} data A JSON object with the data to update. E.g. {name: 'A new name', public: true}
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.changePlaylistDetails = function (
            playlistId,
            data,
            callback
          ) {
            var requestData = {
              url: _baseUri + "/playlists/" + playlistId,
              type: "PUT",
              postData: data,
            };
            return _checkParamsAndPerformRequest(requestData, data, callback);
          };

          /**
           * Add tracks to a playlist.
           * See [Add Tracks to a Playlist](https://developer.spotify.com/web-api/add-tracks-to-playlist/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {string} playlistId The id of the playlist. If you know the Spotify URI it is easy
           * to find the playlist id (e.g. spotify:user:xxxx:playlist:<here_is_the_playlist_id>)
           * @param {Array<string>} uris An array of Spotify URIs for the tracks
           * @param {Object} options A JSON object with options that can be passed
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.addTracksToPlaylist = function (
            playlistId,
            uris,
            options,
            callback
          ) {
            var requestData = {
              url: _baseUri + "/playlists/" + playlistId + "/tracks",
              type: "POST",
              postData: {
                uris: uris,
              },
            };
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback,
              true
            );
          };

          /**
           * Replace the tracks of a playlist
           * See [Replace a Playlist's Tracks](https://developer.spotify.com/web-api/replace-playlists-tracks/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {string} playlistId The id of the playlist. If you know the Spotify URI it is easy
           * to find the playlist id (e.g. spotify:user:xxxx:playlist:<here_is_the_playlist_id>)
           * @param {Array<string>} uris An array of Spotify URIs for the tracks
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.replaceTracksInPlaylist = function (
            playlistId,
            uris,
            callback
          ) {
            var requestData = {
              url: _baseUri + "/playlists/" + playlistId + "/tracks",
              type: "PUT",
              postData: { uris: uris },
            };
            return _checkParamsAndPerformRequest(requestData, {}, callback);
          };

          /**
           * Reorder tracks in a playlist
           * See [Reorder a PlaylistÔÇÖs Tracks](https://developer.spotify.com/web-api/reorder-playlists-tracks/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {string} playlistId The id of the playlist. If you know the Spotify URI it is easy
           * to find the playlist id (e.g. spotify:user:xxxx:playlist:<here_is_the_playlist_id>)
           * @param {number} rangeStart The position of the first track to be reordered.
           * @param {number} insertBefore The position where the tracks should be inserted. To reorder the tracks to
           * the end of the playlist, simply set insert_before to the position after the last track.
           * @param {Object} options An object with optional parameters (range_length, snapshot_id)
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.reorderTracksInPlaylist = function (
            playlistId,
            rangeStart,
            insertBefore,
            options,
            callback
          ) {
            /* eslint-disable camelcase */
            var requestData = {
              url: _baseUri + "/playlists/" + playlistId + "/tracks",
              type: "PUT",
              postData: {
                range_start: rangeStart,
                insert_before: insertBefore,
              },
            };
            /* eslint-enable camelcase */
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Remove tracks from a playlist
           * See [Remove Tracks from a Playlist](https://developer.spotify.com/web-api/remove-tracks-playlist/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {string} playlistId The id of the playlist. If you know the Spotify URI it is easy
           * to find the playlist id (e.g. spotify:user:xxxx:playlist:<here_is_the_playlist_id>)
           * @param {Array<Object>} uris An array of tracks to be removed. Each element of the array can be either a
           * string, in which case it is treated as a URI, or an object containing the properties `uri` (which is a
           * string) and `positions` (which is an array of integers).
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.removeTracksFromPlaylist = function (
            playlistId,
            uris,
            callback
          ) {
            var dataToBeSent = uris.map(function (uri) {
              if (typeof uri === "string") {
                return { uri: uri };
              } else {
                return uri;
              }
            });

            var requestData = {
              url: _baseUri + "/playlists/" + playlistId + "/tracks",
              type: "DELETE",
              postData: { tracks: dataToBeSent },
            };
            return _checkParamsAndPerformRequest(requestData, {}, callback);
          };

          /**
           * Remove tracks from a playlist, specifying a snapshot id.
           * See [Remove Tracks from a Playlist](https://developer.spotify.com/web-api/remove-tracks-playlist/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {string} playlistId The id of the playlist. If you know the Spotify URI it is easy
           * to find the playlist id (e.g. spotify:user:xxxx:playlist:<here_is_the_playlist_id>)
           * @param {Array<Object>} uris An array of tracks to be removed. Each element of the array can be either a
           * string, in which case it is treated as a URI, or an object containing the properties `uri` (which is a
           * string) and `positions` (which is an array of integers).
           * @param {string} snapshotId The playlist's snapshot ID against which you want to make the changes
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.removeTracksFromPlaylistWithSnapshotId = function (
            playlistId,
            uris,
            snapshotId,
            callback
          ) {
            var dataToBeSent = uris.map(function (uri) {
              if (typeof uri === "string") {
                return { uri: uri };
              } else {
                return uri;
              }
            });
            /* eslint-disable camelcase */
            var requestData = {
              url: _baseUri + "/playlists/" + playlistId + "/tracks",
              type: "DELETE",
              postData: {
                tracks: dataToBeSent,
                snapshot_id: snapshotId,
              },
            };
            /* eslint-enable camelcase */
            return _checkParamsAndPerformRequest(requestData, {}, callback);
          };

          /**
           * Remove tracks from a playlist, specifying the positions of the tracks to be removed.
           * See [Remove Tracks from a Playlist](https://developer.spotify.com/web-api/remove-tracks-playlist/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {string} playlistId The id of the playlist. If you know the Spotify URI it is easy
           * to find the playlist id (e.g. spotify:user:xxxx:playlist:<here_is_the_playlist_id>)
           * @param {Array<number>} positions array of integers containing the positions of the tracks to remove
           * from the playlist.
           * @param {string} snapshotId The playlist's snapshot ID against which you want to make the changes
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.removeTracksFromPlaylistInPositions = function (
            playlistId,
            positions,
            snapshotId,
            callback
          ) {
            /* eslint-disable camelcase */
            var requestData = {
              url: _baseUri + "/playlists/" + playlistId + "/tracks",
              type: "DELETE",
              postData: {
                positions: positions,
                snapshot_id: snapshotId,
              },
            };
            /* eslint-enable camelcase */
            return _checkParamsAndPerformRequest(requestData, {}, callback);
          };

          /**
           * Upload a custom playlist cover image.
           * See [Upload A Custom Playlist Cover Image](https://developer.spotify.com/web-api/upload-a-custom-playlist-cover-image/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {string} playlistId The id of the playlist. If you know the Spotify URI it is easy
           * to find the playlist id (e.g. spotify:user:xxxx:playlist:<here_is_the_playlist_id>)
           * @param {string} imageData Base64 encoded JPEG image data, maximum payload size is 256 KB.
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.uploadCustomPlaylistCoverImage = function (
            playlistId,
            imageData,
            callback
          ) {
            var requestData = {
              url: _baseUri + "/playlists/" + playlistId + "/images",
              type: "PUT",
              postData: imageData.replace(/^data:image\/jpeg;base64,/, ""),
              contentType: "image/jpeg",
            };
            return _checkParamsAndPerformRequest(requestData, {}, callback);
          };

          /**
           * Fetches an album from the Spotify catalog.
           * See [Get an Album](https://developer.spotify.com/web-api/get-album/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {string} albumId The id of the album. If you know the Spotify URI it is easy
           * to find the album id (e.g. spotify:album:<here_is_the_album_id>)
           * @param {Object} options A JSON object with options that can be passed
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.getAlbum = function (albumId, options, callback) {
            var requestData = {
              url: _baseUri + "/albums/" + albumId,
            };
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Fetches the tracks of an album from the Spotify catalog.
           * See [Get an Album's Tracks](https://developer.spotify.com/web-api/get-albums-tracks/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {string} albumId The id of the album. If you know the Spotify URI it is easy
           * to find the album id (e.g. spotify:album:<here_is_the_album_id>)
           * @param {Object} options A JSON object with options that can be passed
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.getAlbumTracks = function (
            albumId,
            options,
            callback
          ) {
            var requestData = {
              url: _baseUri + "/albums/" + albumId + "/tracks",
            };
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Fetches multiple albums from the Spotify catalog.
           * See [Get Several Albums](https://developer.spotify.com/web-api/get-several-albums/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {Array<string>} albumIds The ids of the albums. If you know their Spotify URI it is easy
           * to find their album id (e.g. spotify:album:<here_is_the_album_id>)
           * @param {Object} options A JSON object with options that can be passed
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.getAlbums = function (albumIds, options, callback) {
            var requestData = {
              url: _baseUri + "/albums/",
              params: { ids: albumIds.join(",") },
            };
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Fetches a track from the Spotify catalog.
           * See [Get a Track](https://developer.spotify.com/web-api/get-track/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {string} trackId The id of the track. If you know the Spotify URI it is easy
           * to find the track id (e.g. spotify:track:<here_is_the_track_id>)
           * @param {Object} options A JSON object with options that can be passed
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.getTrack = function (trackId, options, callback) {
            var requestData = {};
            requestData.url = _baseUri + "/tracks/" + trackId;
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Fetches multiple tracks from the Spotify catalog.
           * See [Get Several Tracks](https://developer.spotify.com/web-api/get-several-tracks/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {Array<string>} trackIds The ids of the tracks. If you know their Spotify URI it is easy
           * to find their track id (e.g. spotify:track:<here_is_the_track_id>)
           * @param {Object} options A JSON object with options that can be passed
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.getTracks = function (trackIds, options, callback) {
            var requestData = {
              url: _baseUri + "/tracks/",
              params: { ids: trackIds.join(",") },
            };
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Fetches an artist from the Spotify catalog.
           * See [Get an Artist](https://developer.spotify.com/web-api/get-artist/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {string} artistId The id of the artist. If you know the Spotify URI it is easy
           * to find the artist id (e.g. spotify:artist:<here_is_the_artist_id>)
           * @param {Object} options A JSON object with options that can be passed
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.getArtist = function (artistId, options, callback) {
            var requestData = {
              url: _baseUri + "/artists/" + artistId,
            };
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Fetches multiple artists from the Spotify catalog.
           * See [Get Several Artists](https://developer.spotify.com/web-api/get-several-artists/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {Array<string>} artistIds The ids of the artists. If you know their Spotify URI it is easy
           * to find their artist id (e.g. spotify:artist:<here_is_the_artist_id>)
           * @param {Object} options A JSON object with options that can be passed
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.getArtists = function (
            artistIds,
            options,
            callback
          ) {
            var requestData = {
              url: _baseUri + "/artists/",
              params: { ids: artistIds.join(",") },
            };
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Fetches the albums of an artist from the Spotify catalog.
           * See [Get an Artist's Albums](https://developer.spotify.com/web-api/get-artists-albums/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {string} artistId The id of the artist. If you know the Spotify URI it is easy
           * to find the artist id (e.g. spotify:artist:<here_is_the_artist_id>)
           * @param {Object} options A JSON object with options that can be passed
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.getArtistAlbums = function (
            artistId,
            options,
            callback
          ) {
            var requestData = {
              url: _baseUri + "/artists/" + artistId + "/albums",
            };
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Fetches a list of top tracks of an artist from the Spotify catalog, for a specific country.
           * See [Get an Artist's Top Tracks](https://developer.spotify.com/web-api/get-artists-top-tracks/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {string} artistId The id of the artist. If you know the Spotify URI it is easy
           * to find the artist id (e.g. spotify:artist:<here_is_the_artist_id>)
           * @param {string} countryId The id of the country (e.g. ES for Spain or US for United States)
           * @param {Object} options A JSON object with options that can be passed
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.getArtistTopTracks = function (
            artistId,
            countryId,
            options,
            callback
          ) {
            var requestData = {
              url: _baseUri + "/artists/" + artistId + "/top-tracks",
              params: { country: countryId },
            };
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Fetches a list of artists related with a given one from the Spotify catalog.
           * See [Get an Artist's Related Artists](https://developer.spotify.com/web-api/get-related-artists/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {string} artistId The id of the artist. If you know the Spotify URI it is easy
           * to find the artist id (e.g. spotify:artist:<here_is_the_artist_id>)
           * @param {Object} options A JSON object with options that can be passed
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.getArtistRelatedArtists = function (
            artistId,
            options,
            callback
          ) {
            var requestData = {
              url: _baseUri + "/artists/" + artistId + "/related-artists",
            };
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Fetches a list of Spotify featured playlists (shown, for example, on a Spotify player's "Browse" tab).
           * See [Get a List of Featured Playlists](https://developer.spotify.com/web-api/get-list-featured-playlists/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {Object} options A JSON object with options that can be passed
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.getFeaturedPlaylists = function (options, callback) {
            var requestData = {
              url: _baseUri + "/browse/featured-playlists",
            };
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Fetches a list of new album releases featured in Spotify (shown, for example, on a Spotify player's "Browse" tab).
           * See [Get a List of New Releases](https://developer.spotify.com/web-api/get-list-new-releases/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {Object} options A JSON object with options that can be passed
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.getNewReleases = function (options, callback) {
            var requestData = {
              url: _baseUri + "/browse/new-releases",
            };
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Get a list of categories used to tag items in Spotify (on, for example, the Spotify player's "Browse" tab).
           * See [Get a List of Categories](https://developer.spotify.com/web-api/get-list-categories/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {Object} options A JSON object with options that can be passed
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.getCategories = function (options, callback) {
            var requestData = {
              url: _baseUri + "/browse/categories",
            };
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Get a single category used to tag items in Spotify (on, for example, the Spotify player's "Browse" tab).
           * See [Get a Category](https://developer.spotify.com/web-api/get-category/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {string} categoryId The id of the category. These can be found with the getCategories function
           * @param {Object} options A JSON object with options that can be passed
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.getCategory = function (
            categoryId,
            options,
            callback
          ) {
            var requestData = {
              url: _baseUri + "/browse/categories/" + categoryId,
            };
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Get a list of Spotify playlists tagged with a particular category.
           * See [Get a Category's Playlists](https://developer.spotify.com/web-api/get-categorys-playlists/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {string} categoryId The id of the category. These can be found with the getCategories function
           * @param {Object} options A JSON object with options that can be passed
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.getCategoryPlaylists = function (
            categoryId,
            options,
            callback
          ) {
            var requestData = {
              url: _baseUri + "/browse/categories/" + categoryId + "/playlists",
            };
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Get Spotify catalog information about artists, albums, tracks or playlists that match a keyword string.
           * See [Search for an Item](https://developer.spotify.com/web-api/search-item/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {string} query The search query
           * @param {Array<string>} types An array of item types to search across.
           * Valid types are: 'album', 'artist', 'playlist', and 'track'.
           * @param {Object} options A JSON object with options that can be passed
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.search = function (query, types, options, callback) {
            var requestData = {
              url: _baseUri + "/search/",
              params: {
                q: query,
                type: types.join(","),
              },
            };
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Fetches albums from the Spotify catalog according to a query.
           * See [Search for an Item](https://developer.spotify.com/web-api/search-item/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {string} query The search query
           * @param {Object} options A JSON object with options that can be passed
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.searchAlbums = function (query, options, callback) {
            return this.search(query, ["album"], options, callback);
          };

          /**
           * Fetches artists from the Spotify catalog according to a query.
           * See [Search for an Item](https://developer.spotify.com/web-api/search-item/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {string} query The search query
           * @param {Object} options A JSON object with options that can be passed
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.searchArtists = function (query, options, callback) {
            return this.search(query, ["artist"], options, callback);
          };

          /**
           * Fetches tracks from the Spotify catalog according to a query.
           * See [Search for an Item](https://developer.spotify.com/web-api/search-item/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {string} query The search query
           * @param {Object} options A JSON object with options that can be passed
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.searchTracks = function (query, options, callback) {
            return this.search(query, ["track"], options, callback);
          };

          /**
           * Fetches playlists from the Spotify catalog according to a query.
           * See [Search for an Item](https://developer.spotify.com/web-api/search-item/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {string} query The search query
           * @param {Object} options A JSON object with options that can be passed
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.searchPlaylists = function (
            query,
            options,
            callback
          ) {
            return this.search(query, ["playlist"], options, callback);
          };

          /**
           * Fetches shows from the Spotify catalog according to a query.
           * See [Search for an Item](https://developer.spotify.com/web-api/search-item/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {string} query The search query
           * @param {Object} options A JSON object with options that can be passed
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.searchShows = function (query, options, callback) {
            return this.search(query, ["show"], options, callback);
          };

          /**
           * Fetches episodes from the Spotify catalog according to a query.
           * See [Search for an Item](https://developer.spotify.com/web-api/search-item/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {string} query The search query
           * @param {Object} options A JSON object with options that can be passed
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.searchEpisodes = function (
            query,
            options,
            callback
          ) {
            return this.search(query, ["episode"], options, callback);
          };

          /**
           * Get audio features for a single track identified by its unique Spotify ID.
           * See [Get Audio Features for a Track](https://developer.spotify.com/web-api/get-audio-features/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {string} trackId The id of the track. If you know the Spotify URI it is easy
           * to find the track id (e.g. spotify:track:<here_is_the_track_id>)
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.getAudioFeaturesForTrack = function (
            trackId,
            callback
          ) {
            var requestData = {};
            requestData.url = _baseUri + "/audio-features/" + trackId;
            return _checkParamsAndPerformRequest(requestData, {}, callback);
          };

          /**
           * Get audio features for multiple tracks based on their Spotify IDs.
           * See [Get Audio Features for Several Tracks](https://developer.spotify.com/web-api/get-several-audio-features/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {Array<string>} trackIds The ids of the tracks. If you know their Spotify URI it is easy
           * to find their track id (e.g. spotify:track:<here_is_the_track_id>)
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.getAudioFeaturesForTracks = function (
            trackIds,
            callback
          ) {
            var requestData = {
              url: _baseUri + "/audio-features",
              params: { ids: trackIds },
            };
            return _checkParamsAndPerformRequest(requestData, {}, callback);
          };

          /**
           * Get audio analysis for a single track identified by its unique Spotify ID.
           * See [Get Audio Analysis for a Track](https://developer.spotify.com/web-api/get-audio-analysis/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {string} trackId The id of the track. If you know the Spotify URI it is easy
           * to find the track id (e.g. spotify:track:<here_is_the_track_id>)
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.getAudioAnalysisForTrack = function (
            trackId,
            callback
          ) {
            var requestData = {};
            requestData.url = _baseUri + "/audio-analysis/" + trackId;
            return _checkParamsAndPerformRequest(requestData, {}, callback);
          };

          /**
           * Create a playlist-style listening experience based on seed artists, tracks and genres.
           * See [Get Recommendations Based on Seeds](https://developer.spotify.com/web-api/get-recommendations/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {Object} options A JSON object with options that can be passed
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.getRecommendations = function (options, callback) {
            var requestData = {
              url: _baseUri + "/recommendations",
            };
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Retrieve a list of available genres seed parameter values for recommendations.
           * See [Available Genre Seeds](https://developer.spotify.com/web-api/get-recommendations/#available-genre-seeds) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.getAvailableGenreSeeds = function (callback) {
            var requestData = {
              url: _baseUri + "/recommendations/available-genre-seeds",
            };
            return _checkParamsAndPerformRequest(requestData, {}, callback);
          };

          /**
           * Get information about a userÔÇÖs available devices.
           * See [Get a UserÔÇÖs Available Devices](https://developer.spotify.com/web-api/get-a-users-available-devices/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.getMyDevices = function (callback) {
            var requestData = {
              url: _baseUri + "/me/player/devices",
            };
            return _checkParamsAndPerformRequest(requestData, {}, callback);
          };

          /**
           * Get information about the userÔÇÖs current playback state, including track, track progress, and active device.
           * See [Get Information About The UserÔÇÖs Current Playback](https://developer.spotify.com/web-api/get-information-about-the-users-current-playback/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {Object} options A JSON object with options that can be passed.
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.getMyCurrentPlaybackState = function (
            options,
            callback
          ) {
            var requestData = {
              url: _baseUri + "/me/player",
            };
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Get the object currently being played on the userÔÇÖs Spotify account.
           * See [Get the UserÔÇÖs Currently Playing Track](https://developer.spotify.com/web-api/get-the-users-currently-playing-track/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {Object} options A JSON object with options that can be passed.
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.getMyCurrentPlayingTrack = function (
            options,
            callback
          ) {
            var requestData = {
              url: _baseUri + "/me/player/currently-playing",
            };
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Transfer playback to a new device and determine if it should start playing.
           * See [Transfer a UserÔÇÖs Playback](https://developer.spotify.com/web-api/transfer-a-users-playback/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {Array<string>} deviceIds A JSON array containing the ID of the device on which playback should be started/transferred.
           * @param {Object} options A JSON object with options that can be passed.
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.transferMyPlayback = function (
            deviceIds,
            options,
            callback
          ) {
            var postData = options || {};
            postData.device_ids = deviceIds;
            var requestData = {
              type: "PUT",
              url: _baseUri + "/me/player",
              postData: postData,
            };
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Start a new context or resume current playback on the userÔÇÖs active device.
           * See [Start/Resume a UserÔÇÖs Playback](https://developer.spotify.com/web-api/start-a-users-playback/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {Object} options A JSON object with options that can be passed.
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.play = function (options, callback) {
            options = options || {};
            var params =
              "device_id" in options ? { device_id: options.device_id } : null;
            var postData = {};
            ["context_uri", "uris", "offset", "position_ms"].forEach(function (
              field
            ) {
              if (field in options) {
                postData[field] = options[field];
              }
            });
            var requestData = {
              type: "PUT",
              url: _baseUri + "/me/player/play",
              params: params,
              postData: postData,
            };

            // need to clear options so it doesn't add all of them to the query params
            var newOptions = typeof options === "function" ? options : {};
            return _checkParamsAndPerformRequest(
              requestData,
              newOptions,
              callback
            );
          };

          /**
           * Pause playback on the userÔÇÖs account.
           * See [Pause a UserÔÇÖs Playback](https://developer.spotify.com/web-api/pause-a-users-playback/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {Object} options A JSON object with options that can be passed.
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.pause = function (options, callback) {
            options = options || {};
            var params =
              "device_id" in options ? { device_id: options.device_id } : null;
            var requestData = {
              type: "PUT",
              url: _baseUri + "/me/player/pause",
              params: params,
            };
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Skips to next track in the userÔÇÖs queue.
           * See [Skip UserÔÇÖs Playback To Next Track](https://developer.spotify.com/web-api/skip-users-playback-to-next-track/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {Object} options A JSON object with options that can be passed.
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.skipToNext = function (options, callback) {
            options = options || {};
            var params =
              "device_id" in options ? { device_id: options.device_id } : null;
            var requestData = {
              type: "POST",
              url: _baseUri + "/me/player/next",
              params: params,
            };
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Skips to previous track in the userÔÇÖs queue.
           * Note that this will ALWAYS skip to the previous track, regardless of the current trackÔÇÖs progress.
           * Returning to the start of the current track should be performed using `.seek()`
           * See [Skip UserÔÇÖs Playback To Previous Track](https://developer.spotify.com/web-api/skip-users-playback-to-next-track/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {Object} options A JSON object with options that can be passed.
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.skipToPrevious = function (options, callback) {
            options = options || {};
            var params =
              "device_id" in options ? { device_id: options.device_id } : null;
            var requestData = {
              type: "POST",
              url: _baseUri + "/me/player/previous",
              params: params,
            };
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Seeks to the given position in the userÔÇÖs currently playing track.
           * See [Seek To Position In Currently Playing Track](https://developer.spotify.com/web-api/seek-to-position-in-currently-playing-track/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {number} position_ms The position in milliseconds to seek to. Must be a positive number.
           * @param {Object} options A JSON object with options that can be passed.
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.seek = function (position_ms, options, callback) {
            options = options || {};
            var params = {
              position_ms: position_ms,
            };
            if ("device_id" in options) {
              params.device_id = options.device_id;
            }
            var requestData = {
              type: "PUT",
              url: _baseUri + "/me/player/seek",
              params: params,
            };
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Set the repeat mode for the userÔÇÖs playback. Options are repeat-track, repeat-context, and off.
           * See [Set Repeat Mode On UserÔÇÖs Playback](https://developer.spotify.com/web-api/set-repeat-mode-on-users-playback/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {String} state A string set to 'track', 'context' or 'off'.
           * @param {Object} options A JSON object with options that can be passed.
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.setRepeat = function (state, options, callback) {
            options = options || {};
            var params = {
              state: state,
            };
            if ("device_id" in options) {
              params.device_id = options.device_id;
            }
            var requestData = {
              type: "PUT",
              url: _baseUri + "/me/player/repeat",
              params: params,
            };
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Set the volume for the userÔÇÖs current playback device.
           * See [Set Volume For UserÔÇÖs Playback](https://developer.spotify.com/web-api/set-volume-for-users-playback/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {number} volume_percent The volume to set. Must be a value from 0 to 100 inclusive.
           * @param {Object} options A JSON object with options that can be passed.
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.setVolume = function (
            volume_percent,
            options,
            callback
          ) {
            options = options || {};
            var params = {
              volume_percent: volume_percent,
            };
            if ("device_id" in options) {
              params.device_id = options.device_id;
            }
            var requestData = {
              type: "PUT",
              url: _baseUri + "/me/player/volume",
              params: params,
            };
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Toggle shuffle on or off for userÔÇÖs playback.
           * See [Toggle Shuffle For UserÔÇÖs Playback](https://developer.spotify.com/web-api/toggle-shuffle-for-users-playback/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {bool} state Whether or not to shuffle user's playback.
           * @param {Object} options A JSON object with options that can be passed.
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.setShuffle = function (state, options, callback) {
            options = options || {};
            var params = {
              state: state,
            };
            if ("device_id" in options) {
              params.device_id = options.device_id;
            }
            var requestData = {
              type: "PUT",
              url: _baseUri + "/me/player/shuffle",
              params: params,
            };
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Fetches a show from the Spotify catalog.
           * See [Get a Show](https://developer.spotify.com/documentation/web-api/reference/shows/get-a-show/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {string} showId The id of the show. If you know the Spotify URI it is easy
           * to find the show id (e.g. spotify:show:<here_is_the_show_id>)
           * @param {Object} options A JSON object with options that can be passed
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.getShow = function (showId, options, callback) {
            var requestData = {};
            requestData.url = _baseUri + "/shows/" + showId;
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Fetches multiple shows from the Spotify catalog.
           * See [Get Several Shows](https://developer.spotify.com/documentation/web-api/reference/shows/get-several-shows/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {Array<string>} showIds The ids of the shows. If you know their Spotify URI it is easy
           * to find their show id (e.g. spotify:show:<here_is_the_show_id>)
           * @param {Object} options A JSON object with options that can be passed
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.getShows = function (showIds, options, callback) {
            var requestData = {
              url: _baseUri + "/shows/",
              params: { ids: showIds.join(",") },
            };
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Fetches current user's saved shows.
           * See [Get Current User's Saved Shows](https://developer.spotify.com/documentation/web-api/reference/library/get-users-saved-shows/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {Object} options A JSON object with options that can be passed
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.getMySavedShows = function (options, callback) {
            var requestData = {
              url: _baseUri + "/me/shows",
            };
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Adds a list of shows to the current user's saved shows.
           * See [Save Shows for Current User](https://developer.spotify.com/documentation/web-api/reference/library/save-shows-user/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {Array<string>} showIds The ids of the shows. If you know their Spotify URI it is easy
           * to find their show id (e.g. spotify:show:<here_is_the_show_id>)
           * @param {Object} options A JSON object with options that can be passed
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.addToMySavedShows = function (
            showIds,
            options,
            callback
          ) {
            var requestData = {
              url: _baseUri + "/me/shows",
              type: "PUT",
              postData: showIds,
            };
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Remove a list of shows from the current user's saved shows.
           * See [Remove Shows for Current User](https://developer.spotify.com/documentation/web-api/reference/library/remove-shows-user/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {Array<string>} showIds The ids of the shows. If you know their Spotify URI it is easy
           * to find their show id (e.g. spotify:show:<here_is_the_show_id>)
           * @param {Object} options A JSON object with options that can be passed
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.removeFromMySavedShows = function (
            showIds,
            options,
            callback
          ) {
            var requestData = {
              url: _baseUri + "/me/shows",
              type: "DELETE",
              postData: showIds,
            };
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Checks if the current user's saved shows contains a certain list of shows.
           * See [Check Current User's Saved Shows](https://developer.spotify.com/documentation/web-api/reference/library/check-users-saved-shows/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {Array<string>} showIds The ids of the shows. If you know their Spotify URI it is easy
           * to find their show id (e.g. spotify:show:<here_is_the_show_id>)
           * @param {Object} options A JSON object with options that can be passed
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.containsMySavedShows = function (
            showIds,
            options,
            callback
          ) {
            var requestData = {
              url: _baseUri + "/me/shows/contains",
              params: { ids: showIds.join(",") },
            };
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Fetches the episodes of a show from the Spotify catalog.
           * See [Get a Show's Episodes](https://developer.spotify.com/documentation/web-api/reference/shows/get-shows-episodes/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {string} showId The id of the show. If you know the Spotify URI it is easy
           * to find the show id (e.g. spotify:show:<here_is_the_show_id>)
           * @param {Object} options A JSON object with options that can be passed
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.getShowEpisodes = function (
            showId,
            options,
            callback
          ) {
            var requestData = {
              url: _baseUri + "/shows/" + showId + "/episodes",
            };
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Fetches an episode from the Spotify catalog.
           * See [Get an Episode](https://developer.spotify.com/documentation/web-api/reference/episodes/get-an-episode/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {string} episodeId The id of the episode. If you know the Spotify URI it is easy
           * to find the episode id (e.g. spotify:episode:<here_is_the_episode_id>)
           * @param {Object} options A JSON object with options that can be passed
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.getEpisode = function (
            episodeId,
            options,
            callback
          ) {
            var requestData = {};
            requestData.url = _baseUri + "/episodes/" + episodeId;
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Fetches multiple episodes from the Spotify catalog.
           * See [Get Several Episodes](https://developer.spotify.com/documentation/web-api/reference/episodes/get-several-episodes/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {Array<string>} episodeIds The ids of the episodes. If you know their Spotify URI it is easy
           * to find their episode id (e.g. spotify:episode:<here_is_the_episode_id>)
           * @param {Object} options A JSON object with options that can be passed
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.getEpisodes = function (
            episodeIds,
            options,
            callback
          ) {
            var requestData = {
              url: _baseUri + "/episodes/",
              params: { ids: episodeIds.join(",") },
            };
            return _checkParamsAndPerformRequest(
              requestData,
              options,
              callback
            );
          };

          /**
           * Gets the access token in use.
           *
           * @return {string} accessToken The access token
           */
          Constr.prototype.getAccessToken = function () {
            return _accessToken;
          };

          /**
           * Sets the access token to be used.
           * See [the Authorization Guide](https://developer.spotify.com/web-api/authorization-guide/) on
           * the Spotify Developer site for more information about obtaining an access token.
           *
           * @param {string} accessToken The access token
           * @return {void}
           */
          Constr.prototype.setAccessToken = function (accessToken) {
            _accessToken = accessToken;
          };

          /**
           * Sets an implementation of Promises/A+ to be used. E.g. Q, when.
           * See [Conformant Implementations](https://github.com/promises-aplus/promises-spec/blob/master/implementations.md)
           * for a list of some available options
           *
           * @param {Object} PromiseImplementation A Promises/A+ valid implementation
           * @throws {Error} If the implementation being set doesn't conform with Promises/A+
           * @return {void}
           */
          Constr.prototype.setPromiseImplementation = function (
            PromiseImplementation
          ) {
            var valid = false;
            try {
              var p = new PromiseImplementation(function (resolve) {
                resolve();
              });
              if (
                typeof p.then === "function" &&
                typeof p.catch === "function"
              ) {
                valid = true;
              }
            } catch (e) {
              console.error(e);
            }
            if (valid) {
              _promiseImplementation = PromiseImplementation;
            } else {
              throw new Error("Unsupported implementation of Promises/A+");
            }
          };

          return Constr;
        })();

        if (typeof module === "object" && typeof module.exports === "object") {
          module.exports = SpotifyWebApi;
        }
      },
      {},
    ],
    2: [
      function (require, module, exports) {
        const MEMBER_LIMIT = 4;

        let SpotifyWebApi = require("spotify-web-api-js");
        let spotify = new SpotifyWebApi();
        let members = [],
          matchedTracks = [];
        let matchesAttempted = 0;
        let helpOpen = false;
        var notifTimeout;

        /**
         * Selects element from DOM by its ID using the shorthand '$'.
         * @param {string} id - ID of the element to be selected.
         * @return {object} Selected element.
         */

        let $ = (id) => {
          return document.getElementById(id);
        };

        /**
         * Add current user of the app to the group.
         */

        const addMe = () => {
          spotify.getMe().then((res) => {
            // Create object which stores current user's data
            let user = {
              id: res.id,
              name: res.display_name,
              pic: res.images[0].url,
              tracksTotal: 0,
            };

            spotify
              .getMySavedTracks({
                limit: 1,
                offset: 0,
              })
              .then((tracks) => {
                /**
                 * Store the current user's total number of saved tracks
                 * to determine random offset when searching saved tracks
                 * within track matching algorithm.
                 */
                user.tracksTotal = tracks.total;
                members.push(user);
                sessionStorage.setItem("members", JSON.stringify(members));
                showMembersFrom(members.length - 1);
              })
              .catch(() => {
                showNotification(
                  "We couldn't get your user data as Spotify's servers are too busy. Please try again later."
                );
              });
          });
        };

        /**
         * Add desired user to the group.
         * @param {string} id - ID belonging to the user to be added.
         */

        const addUser = (id) => {
          var trackInList;

          // Convert user ID to lowercase to prevent adding duplicate users to group
          let userId = id.toLowerCase();

          // Check if user to be added already exists in the group
          let userInGroup = false;

          userInGroup = members.some((user) => {
            return user.id === userId;
          });

          if (userInGroup) {
            showNotification("Looks like that user is already in your group!");
          } else if (members.length >= MEMBER_LIMIT) {
            showNotification("Your group is full!");
          } else {
            spotify
              .getUser(userId)
              .then((res) => {
                // Create object which stores user's data
                let user = {
                  id: userId,
                  name: res.display_name,
                  pic: res.images[0].url,
                  trackIds: [],
                  audioProfile: {
                    mode: 0.0,
                    danceability: 0.0,
                    energy: 0.0,
                    speechiness: 0.0,
                    acousticness: 0.0,
                    valence: 0.0,
                  },
                };

                /**
                 * Retrieve the IDs of all tracks existing in all
                 * of the user's public playlists.
                 */
                spotify
                  .getUserPlaylists(userId)
                  .then((playlists) => {
                    playlists.items.forEach((playlist) => {
                      spotify.getPlaylistTracks(playlist.id).then((res) => {
                        res.items.forEach((item) => {
                          /**
                           * In the case of duplicate track across user's playlists,
                           * prevent adding duplicate to list of tracks;
                           * otherwise, add it to the list of tracks
                           * */
                          trackInList = false;

                          trackInList = user.trackIds.some((trackId) => {
                            return trackId === item.track.id;
                          });

                          if (!trackInList) {
                            user.trackIds.push(item.track.id);
                          }
                        });

                        setAudioProfile(user);
                      });
                    });
                    members.push(user);
                    sessionStorage.setItem("members", JSON.stringify(members));
                    showMembersFrom(members.length - 1);
                  })
                  .catch(() => {
                    $("lds-ellipsis").style.display = "none";
                    showNotification(
                      "We couldn't get that user's data as Spotify's servers are too busy. Please try again later."
                    );
                  });
              })
              .catch(() => {
                showNotification(
                  "You've entered an invalid profile link or user ID!"
                );
              });
          }
        };

        /**
         * Remove desired user from the group.
         * @param {string} id - ID belonging to the user to be removed.
         */

        const removeUser = (id) => {
          let namesContainer = $("names-container");
          let picsContainer = $("pics-container");

          // Search list of members for user to be removed, excluding group owner
          for (let i = 1; i < members.length; i++) {
            let currUser = members[i];

            if (currUser.id === id) {
              members.splice(i, 1);
              namesContainer.removeChild($(currUser.id + "-text"));
              picsContainer.removeChild($(currUser.id + "-img"));
              picsContainer.removeChild($(currUser.id + "-remove"));
              break;
            }
          }

          sessionStorage.setItem("members", JSON.stringify(members));
        };

        /**
         * Display the profile pictures and display names of
         * current group members from the given index to the newest member.
         * @param {integer} i - Index of the first group member to be displayed.
         */

        const showMembersFrom = (i) => {
          let currNameId = members[0].id + "-text";
          document.getElementsByClassName("display-name")[0].innerHTML =
            members[0].name;
          document.getElementsByClassName("display-name")[1].innerHTML =
            members[0].name;

          for (i; i < members.length; i++) {
            let namesContainer = $("names-container");
            let picsContainer = $("pics-container");
            let displayName = document.createElement("span");
            let profilePic = document.createElement("img");

            let currUser = members[i];
            let currImgId = currUser.id + "-img";
            currNameId = currUser.id + "-text";

            displayName.id = currNameId;
            displayName.innerHTML = currUser.name;
            displayName.classList.add("member-name");
            namesContainer.appendChild(displayName);

            setTimeout(() => {
              profilePic.setAttribute(
                "style",
                "height: 9.375em; width: 9.375em"
              );
            }, 20);

            profilePic.id = currImgId;
            profilePic.src = currUser.pic;
            profilePic.classList.add("profile-pic");
            picsContainer.appendChild(profilePic);

            /**
             * If not displaying the first member, i.e. the group owner,
             * include button for removing member from the group
             */
            if (i > 0) {
              let removeIcon = document.createElement("img");

              removeIcon.id = currUser.id + "-remove";
              removeIcon.src = "https://i.imgur.com/SuiuFIj.png";
              removeIcon.classList.add("remove-icon");

              removeIcon.addEventListener("mouseover", () => {
                removeIcon.style.opacity = "0.75";
              });
              removeIcon.addEventListener("mouseleave", () => {
                removeIcon.style.opacity = "1";
              });

              removeIcon.addEventListener("click", (e) => {
                e.preventDefault();
                removeUser(currUser.id);
              });

              picsContainer.appendChild(removeIcon);

              setTimeout(() => {
                removeIcon.style.opacity = "1";
              }, 20);
            }
          }

          $("hidden-header").style.color = "#e9e3d5";
          $(currNameId).style.color = "#181818";

          setTimeout(() => {
            // Wait for member information to load, then unhide all members
            $("pics-container").style.left = "0%";
            $("names-container").style.color = "#e9e3d5";
            $(currNameId).style.color = "#e9e3d5";
          }, 20);
        };

        /**
         * Set the attributes of the given user's audio profile object which describe their
         * music preferences according to the tracks existing in their public playlists.
         * @param {Object} user - User for which the audio profile is to be set.
         */

        const setAudioProfile = (user) => {
          var currTrackFeatures;

          spotify.getAudioFeaturesForTracks(user.trackIds).then((res) => {
            /**
             * Get the sum of each audio feature from each track
             * obtained from all of the user's public playlists.
             */
            features = res.audio_features;

            for (let i = 0; i < features.length; i++) {
              currTrackFeatures = features[i];

              for (feature in currTrackFeatures) {
                if (user.audioProfile.hasOwnProperty(feature)) {
                  user.audioProfile[feature] += currTrackFeatures[feature];
                }
              }
            }
          });
        };

        /**
         * Creates a Spotify playlist with the given attributes.
         * @param {string} name - name of the playlist to be created.
         * @param {boolean} isPublic - determines if the playlist to be created will be public.
         * @param {boolean} isCollaborative - determines if the playlist to be created will be collaborative.
         * @param {string} description - description of the playlist to be created.
         * @param {function()} _callback - function to be called after the playlist has been created.
         */

        const makePlaylist = (
          name,
          isPublic,
          isCollaborative,
          description,
          _callback
        ) => {
          let localName = name;
          let nameTaken = false;
          let nameTakenMsg = "You already have a playlist with that name!";

          if (localName === "") {
            // If no playlist name provided, use default name
            localName = members[0].name + "'s midl Playlist";
            nameTakenMsg = "You already have a playlist with the default name!";
          }

          // Determine if a playlist of the given name already exists in the group owner's library
          findPlaylist(localName);

          setTimeout(() => {
            nameTaken = sessionStorage.getItem("foundPlaylist") !== null;

            if (nameTaken) {
              showNotification(nameTakenMsg);
            } else {
              $("lds-ellipsis").style.display = "inline-block";

              let playlistData = {
                name: localName,
                public: isPublic,
                collaborative: isCollaborative,
                description: description,
              };

              // Create playlist with the given attributes
              spotify
                .createPlaylist(members[0].id, playlistData)
                .then((res) => {
                  $("playlist-link").href = res.external_urls["spotify"];
                  // After the playlist is created, fill the playlist
                  fillPlaylist(res.id);
                  showNotification(
                    '"' + localName + '" has been saved to your library!'
                  );
                })
                .catch(() => {
                  $("lds-ellipsis").style.display = "none";
                });
            }

            _callback();
          }, 150);

          sessionStorage.removeItem("foundPlaylist");
        };

        /**
         * Iterate over the group owner's playlists to determine
         * if a playlist of the given name exists.
         * @param {string} name - name of the playlist to be searched for.
         */

        const findPlaylist = (name) => {
          spotify.getUserPlaylists().then((res) => {
            for (let i = 0; i < res.items.length; i++) {
              if (res.items[i].name === name) {
                sessionStorage.setItem("foundPlaylist", res.items[i].name);
                break;
              }
            }
          });
        };

        /**
         * Use match tracking algorithm to fill playlist with tracks from the group owner's library
         * which all group members prefer based on the tracks existing in their public playlists.
         * @param {string} playlistId - ID of the playlist to be filled.
         */

        const fillPlaylist = (playlistId) => {
          matchedTracks = [];
          matchesAttempted = 0;

          // Initialize table which displays tracks in the filled playlist
          $("playlist-table").innerHTML = `
        <tr>
            <th style = "border-radius: 3px 0 0 0;"></th>
            <th>Track</th>
            <th>Album</th>
            <th style = "border-radius: 0 3px 0 0;">Artists</th>
        </tr>
    `;

          // Run match tracking algorithm a maximum of 20 times to prevent exceeding API call limit
          for (let i = 0; i < 20; i++) {
            spotify
              .getMySavedTracks({
                limit: 50,
                offset: getRandomInt(0, members[0].tracksTotal - 50),
              })
              .then((myTracks) => {
                // Obtain 50 tracks from group owner's library starting at a randomly selected offset
                for (let j = 0; j < 50; j++) {
                  // Attempt to match current track with other group member's preferences
                  matchTrack(myTracks.items[j].track);
                }
              })
              .catch(() => {
                $("lds-ellipsis").style.display = "none";
                showNotification(
                  "We couldn't retrieve your tracks as Spotify's servers are too busy. Please try again later."
                );
              });
          }

          setTimeout(() => {
            /**
             * Wait 10 seconds to allow asynchronous API calls within track matching algorithm to complete
             * and prevent exceeding API call limit, then add tracks which were matched to the playlist
             */

            if (matchedTracks.length < 20) {
              showNotification(
                "We couldn't find many matches. Try adding more tracks to your group's public playlists."
              );
            }

            spotify
              .addTracksToPlaylist(playlistId, matchedTracks.slice(0, 50))
              .then(() => {
                // Unhide table which displays the playlist's tracks
                $("playlist").style.display = "block";
                $("lds-ellipsis").style.display = "none";
              })
              .catch((err) => {
                $("lds-ellipsis").style.display = "none";
                showNotification(
                  "We couldn't fill your playlist as Spotify's servers are too busy. Please try again later."
                );
                // showNotification(JSON.stringify(err.getResponseHeader("retry-after")));
              });
          }, 10000);
        };

        /**
         * Attempt to match track from group owner's library to the preferences of all other group members.
         * @param {Object} track - track which will be attempted to be matched.
         */

        const matchTrack = (track) => {
          let matchRate = 1.0;
          var currMember, normalizedFeature, diffSum;

          if (matchesAttempted > 0) {
            // Determine the current rate at which the track matching algorithm has been successful
            matchRate = matchedTracks.length / matchesAttempted;
          }

          if (matchRate > 0.5) {
            /**
             * If the current match rate is high, attempt to match identical tracks
             * to improve the probability that matched tracks are preferred by all members.
             */
            matchesAttempted++;

            // For each member, check if the given track exists in their public playlists
            for (let i = 1; i < members.length; i++) {
              currMember = members[i];
              if (!currMember.trackIds.includes(track.id)) {
                return;
              }
            }

            /**
             * If the track is a match for all members, add it to the list of
             * matched tracks and add the track to the playlist table.
             */

            matchedTracks.push(track.uri);
            showTrack(track);
          } else {
            /**
             * If the current match rate is low, attempt to match tracks based on
             * members' audio profiles if they are not an exact match to ensure
             * the playlist is adequately filled.
             */
            spotify.getAudioFeaturesForTrack(track.id).then((trackFeatures) => {
              matchesAttempted++;

              /**
               * For each member, check if the track exists in their public playlists
               * or matches closely to their audio profile determined form the tracks
               * existing in their public playlists.
               */
              for (let i = 1; i < members.length; i++) {
                currMember = members[i];
                diffSum = 0.0;

                if (currMember.trackIds.includes(track.id)) {
                  continue;
                }

                for (feature in currMember.audioProfile) {
                  normalizedFeature =
                    currMember.audioProfile[feature] /
                    currMember.trackIds.length;
                  diffSum += Math.abs(
                    trackFeatures[feature] - normalizedFeature
                  );
                }

                if (diffSum > 1.5) {
                  return;
                }
              }

              /**
               * If the track is a match for all members, add it to the list of
               * matched tracks and add the track to the playlist table.
               */

              matchedTracks.push(track.uri);
              showTrack(track);
            });
          }
        };

        /**
         * Add matched track to the table containing the playlist's tracks.
         * @param {Object} track - track to be added to the playlist table.
         */

        const showTrack = (track) => {
          let table = $("playlist-table");
          let trackRow = document.createElement("tr");
          let albumArtCell = document.createElement("td");
          let trackNameCell = document.createElement("td");
          let albumNameCell = document.createElement("td");
          let artistNameCell = document.createElement("td");
          let albumArt = document.createElement("img");
          let trackLink = document.createElement("a");

          albumArt.src = track.album.images[0].url;
          albumArt.classList.add("album-art");

          trackLink.href = track.external_urls["spotify"];
          trackLink.append(albumArt);
          albumArtCell.append(trackLink);

          trackNameCell.innerHTML = track.name;
          albumNameCell.innerHTML = track.album.name;

          for (let i = 0; i < track.album.artists.length; i++) {
            artistNameCell.innerHTML += track.album.artists[i].name;

            if (i < track.album.artists.length - 1) {
              artistNameCell.innerHTML += ", ";
            }
          }

          trackRow.appendChild(albumArtCell);
          trackRow.appendChild(trackNameCell);
          trackRow.appendChild(albumNameCell);
          trackRow.appendChild(artistNameCell);
          table.appendChild(trackRow);
        };

        /**
         * Get paramaters from app's current location.
         * @return {integer} object containing URI parameters.
         */

        const getHashParams = () => {
          let hashParams = {};
          let e,
            r = /([^&;=]+)=?([^&;]*)/g,
            q = window.location.hash.substring(1);
          while ((e = r.exec(q))) {
            hashParams[e[1]] = decodeURIComponent(e[2]);
          }
          return hashParams;
        };

        /**
         * Get random integer in given range.
         * @param {integer} min - inclusive beginning of range.
         * @param {integer} max - inclusive end of range.
         * @return {integer} random integer in given range.
         */

        const getRandomInt = (min, max) => {
          min = Math.ceil(min);
          max = Math.floor(max);
          return Math.floor(Math.random() * (max - min + 1)) + min;
        };

        /**
         * Display notification to app user to indicate an error or other feedback.
         * @param {string} msg - contents of the notification to be displayed.
         */

        const showNotification = (msg) => {
          clearTimeout(notifTimeout);
          $("notification").innerHTML = msg;

          $("notification").setAttribute(
            "style",
            "z-index: 1; right: -0.225em; transition: 0.5s"
          );

          notifTimeout = setTimeout(() => {
            $("notification").setAttribute(
              "style",
              "z-index: 0; right: -15em; transition: 0.3s"
            );
          }, 3000);
        };

        // Use access token for URL paramaters to authentice API calls
        spotify.setAccessToken(getHashParams().access_token);

        if (JSON.parse(sessionStorage.getItem("members")) === null) {
          // If a group is being created for the first time this session, initialize group with app user
          addMe();
        } else {
          // If a group has already been created this session, retrieve members and display them
          members = JSON.parse(sessionStorage.getItem("members"));
          showMembersFrom(0);
        }

        $("dropdown-button").addEventListener("click", () => {
          /**
           * If not already shown, unhide information which provides instructions
           * for adding members to the group and creating a playlist.
           */
          if (helpOpen) {
            $("dropdown-content").style.opacity = "0";
            $("dropdown-content").style.zIndex = "-1";
            helpOpen = false;
          } else {
            $("dropdown-content").style.opacity = "1";
            $("dropdown-content").style.zIndex = "1";
            helpOpen = true;
          }
        });

        $("submit-profile-link").addEventListener("click", (e) => {
          /**
           * Parse ID of user to be added to group from their profile link,
           * or simply retrieve their ID if it is specifically provided
           */
          e.preventDefault();
          let userLink = document.forms["add-friend"][
            "profile-link"
          ].value.split("/");
          let userParams = userLink[userLink.length - 1].split("?");
          let userId = userParams[0];
          addUser(userId);
        });

        $("logout").addEventListener("click", () => {
          // When the user logs out, remove group from session storage and return to log in page
          sessionStorage.removeItem("members");
          window.location = "/index.html";
        });

        $("midl-button").addEventListener("click", () => {
          /**
           * If the user has added at least one member to their group,
           * make a playlist with the attributes they provided
           */
          $("midl-button").disabled = true;
          $("playlist").style.display = "none";

          if ($("playlist-name").value !== "") {
            $("playlist-link").innerHTML = $("playlist-name").value;
          }

          if (members.length > 1) {
            makePlaylist(
              $("playlist-name").value,
              $("playlist-public").checked,
              $("playlist-collab").checked,
              $("playlist-desc").value,
              () => {
                // When the playlist has been created and filled, allow the user to make another playlist
                $("midl-button").disabled = false;
              }
            );
          } else {
            showNotification("Add some friends to your group first!");
            $("midl-button").disabled = false;
          }
        });
      },
      { "spotify-web-api-js": 1 },
    ],
  },
  {},
  [2]
);
