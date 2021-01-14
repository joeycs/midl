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
        showNotification("You've entered an invalid profile link or user ID!");
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
      profilePic.setAttribute("style", "height: 9.375em; width: 9.375em");
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
            currMember.audioProfile[feature] / currMember.trackIds.length;
          diffSum += Math.abs(trackFeatures[feature] - normalizedFeature);
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
  let userLink = document.forms["add-friend"]["profile-link"].value.split("/");
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
