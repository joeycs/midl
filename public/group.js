const MEMBER_LIMIT = 4;

let SpotifyWebApi = require("spotify-web-api-js");
let spotify = new SpotifyWebApi();
let members = [], matchedTracks = [];
let matchesAttempted = 0;
let helpOpen = false;
var notifTimeout;

const addMe = () => {
    spotify.getMe()
        .then(res => {
            let user = {
                id: res.id,
                name: res.display_name,
                pic: res.images[0].url,
                tracksTotal: 0
            };

            spotify.getMySavedTracks({
                "limit": 1, 
                "offset": 0
            })
                .then(tracks => {
                    user.tracksTotal = tracks.total;
                    members.push(user);
                    sessionStorage.setItem("members", JSON.stringify(members));
                    showMembersFrom(members.length - 1);
                })
                .catch (() => {
                    showNotification("We couldn't get your user data as Spotify's servers are too busy. Please try again later.");
                });
        });
}

const addUser = (id) => {
    let memberInGroup = false;
    let userId = id.toLowerCase();
    var includes;
    
    members.forEach(user => {
        if (user.id === userId) {
            memberInGroup = true;
        }
    });

    if (memberInGroup) {
        showNotification("Looks like that user is already in your group!");
    }
    else if (members.length >= MEMBER_LIMIT) {
        showNotification("Your group is full!");
    }
    else {
        spotify.getUser(userId)
            .then(res => {
                let user = {
                    id: userId,
                    name: res.display_name,
                    pic: res.images[0].url,
                    trackIds: [],
                    audioProfile: {
                        "mode": 0.00,
                        "danceability": 0.00,
                        "energy": 0.00,
                        "speechiness": 0.00,
                        "acousticness": 0.00,
                        "valence": 0.00
                    }
                };

                spotify.getUserPlaylists(userId)
                    .then(playlists => {

                        playlists.items.forEach(playlist => {

                            spotify.getPlaylistTracks(playlist.id)
                                .then(res => {

                                    res.items.forEach(item => {
                                        includes = false;

                                        for (let i = 0; i < user.trackIds.length; i++) {
                                            if (user.trackIds[i] === item.track.id) {
                                                includes = true;
                                                break;
                                            }
                                        }

                                        if (!includes) {
                                            user.trackIds.push(item.track.id)
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
                        document.getElementById("lds-ellipsis").style.display = "none";
                        showNotification("We couldn't get that user's data as Spotify's servers are too busy. Please try again later.");
                    });
            })
            .catch(() => {
                showNotification("You\'ve entered an invalid profile link or user ID!");
            });
    }
}

const removeUser = (userId) => {
    let namesContainer = document.getElementById("names-container");
    let picsContainer = document.getElementById("pics-container");

    for (let i = 1; i < members.length; i++) {
        let currUser = members[i];

        if (currUser.id === userId) {
            members.splice(i, 1);
            namesContainer.removeChild(document.getElementById(currUser.id + "-text"));
            picsContainer.removeChild(document.getElementById(currUser.id + "-img"));
            picsContainer.removeChild(document.getElementById(currUser.id + "-remove"));
            break;
        }
    }

    sessionStorage.setItem("members", JSON.stringify(members));
}

const showMembersFrom = (i) => {
    let currNameId = members[0].id + "-text";
    document.getElementsByClassName("display-name")[0].innerHTML = members[0].name;
    document.getElementsByClassName("display-name")[1].innerHTML = members[0].name;

    for (i; i < members.length; i++) {
        let namesContainer = document.getElementById("names-container");
        let picsContainer = document.getElementById("pics-container");
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

    document.getElementById("hidden-header").style.color = "#e9e3d5";
    document.getElementById(currNameId).style.color = "#181818";

    setTimeout(() => {
        document.getElementById("pics-container").style.left = "0%";
        document.getElementById("names-container").style.color = "#e9e3d5";
        document.getElementById(currNameId).style.color = "#e9e3d5";
    }, 20);
}

const setAudioProfile = (user) => {
    var currTrackFeatures;

    spotify.getAudioFeaturesForTracks(user.trackIds)
        .then(res => {
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
}

const makePlaylist = (name, isPublic, isCollaborative, description, _callback) => {
    let localName = name;
    let nameTaken = false;
    let nameTakenMsg = "You already have a playlist with that name!";

    if (localName === "") {
        localName = members[0].name + "\'s midl Playlist";
        nameTakenMsg = "You already have a playlist with the default name!"
    }

    findPlaylist(localName);

    setTimeout(() => {
        nameTaken = sessionStorage.getItem("foundPlaylist") !== null;

        if (nameTaken) {
            showNotification(nameTakenMsg);
        }
        else {
            document.getElementById("lds-ellipsis").style.display = "inline-block";

            let playlistData = {
                "name": localName,
                "public": isPublic,
                "collaborative": isCollaborative,
                "description": description
            };

            spotify.createPlaylist(members[0].id, playlistData)
                .then(res => {
                    document.getElementById("playlist-link").href = res.external_urls["spotify"];

                    fillPlaylist(res.id);
                    showNotification("\"" + localName + "\" has been saved to your library!");
                })
                .catch(err => {
                    document.getElementById("lds-ellipsis").style.display = "none";
                });
        }

        _callback();
    }, 150);

    sessionStorage.removeItem("foundPlaylist");
}

const findPlaylist = (name) => {
    spotify.getUserPlaylists()
        .then(res => {
            for (let i = 0; i < res.items.length; i++) {
                if (res.items[i].name === name) {
                    sessionStorage.setItem("foundPlaylist", res.items[i].name);
                    break;
                }
            }
        });
}

const fillPlaylist = (playlistId) => {
    matchedTracks = [];
    matchesAttempted = 0;

    document.getElementById("playlist-table").innerHTML = `
        <tr>
            <th style = "border-radius: 3px 0 0 0;"></th>
            <th>Track</th>
            <th>Album</th>
            <th style = "border-radius: 0 3px 0 0;">Artists</th>
        </tr>
    `;

    for (let i = 0; i < 20; i++) {
        spotify.getMySavedTracks({
            "limit": 50, 
            "offset": getRandomInt(0, members[0].tracksTotal - 50)
        })
            .then(myTracks => {
                for (let j = 0; j < 50; j++) {
                    findMatch(myTracks.items[j].track);
                }
            })
            .catch(() => {
                document.getElementById("lds-ellipsis").style.display = "none";
                showNotification("We couldn't retrieve your tracks as Spotify's servers are too busy. Please try again later.")
            });
    }

    setTimeout(() => {
        if (matchedTracks.length < 20) {
            showNotification("We couldn't find many matches. Try adding more tracks to your group\'s public playlists.");
        }

        spotify.addTracksToPlaylist(playlistId, matchedTracks.slice(0, 50))
            .then(() => {
                document.getElementById("playlist").style.display = "block";
                document.getElementById("lds-ellipsis").style.display = "none";
            })
            .catch(err => {
                document.getElementById("lds-ellipsis").style.display = "none";
                //showNotification(JSON.stringify(err.getResponseHeader("retry-after")));
                showNotification("We couldn't fill your playlist as Spotify's servers are too busy. Please try again later.");
            });
    }, 10000);
};

const findMatch = (track) => {
    let matchRate = 1.00;
    var currMember, normalizedFeature, diffSum;

    if (matchesAttempted > 0) {
        matchRate = matchedTracks.length / matchesAttempted;
    }

    if (matchRate > 0.50) {
        matchesAttempted++;

        for (let i = 1; i < members.length; i++) {
            currMember = members[i];
            if (!currMember.trackIds.includes(track.id)) {
                return;
            }
        }

        matchedTracks.push(track.uri);
        showTrack(track);
    }
    else {
        spotify.getAudioFeaturesForTrack(track.id)
            .then(trackFeatures => {
                matchesAttempted++;

                for (let i = 1; i < members.length; i++) {
                    currMember = members[i];
                    diffSum = 0.00;

                    if (currMember.trackIds.includes(track.id)) {
                        continue;
                    }

                    for (feature in currMember.audioProfile) {
                        normalizedFeature = currMember.audioProfile[feature] / currMember.trackIds.length;
                        diffSum += Math.abs(trackFeatures[feature] - normalizedFeature);
                    }

                    if (diffSum > 1.50) {
                        return;
                    }
                }

                matchedTracks.push(track.uri);
                showTrack(track);
            });
    }
}

const showTrack = (track) => {
    let table = document.getElementById("playlist-table");
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
            artistNameCell.innerHTML += ', ';
        }
    }

    trackRow.appendChild(albumArtCell);
    trackRow.appendChild(trackNameCell);
    trackRow.appendChild(albumNameCell);
    trackRow.appendChild(artistNameCell);
    table.appendChild(trackRow);
}

const getHashParams = () => {
    let hashParams = {};
    let e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while (e = r.exec(q)) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
}

const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const showNotification = (msg) => {
    clearTimeout(notifTimeout);
    document.getElementById("notification").innerHTML = msg;

    document.getElementById("notification").setAttribute(
        "style",
        "z-index: 1; right: -0.225em; transition: 0.5s"
    );

    notifTimeout = setTimeout(() => {
        document.getElementById("notification").setAttribute(
            "style",
            "z-index: 0; right: -15em; transition: 0.3s"
        );
    }, 3000);
}

spotify.setAccessToken(getHashParams().access_token);

if (JSON.parse(sessionStorage.getItem("members")) === null) {
    addMe();
}
else {
    members = JSON.parse(sessionStorage.getItem("members"));
    showMembersFrom(0);
}

document.getElementById("dropdown-button").addEventListener("click", () => {
    if (helpOpen) {
        document.getElementById("dropdown-content").style.opacity = "0";
        document.getElementById("dropdown-content").style.zIndex = "-1";
        helpOpen = false;
    }
    else {
        document.getElementById("dropdown-content").style.opacity = "1";
        document.getElementById("dropdown-content").style.zIndex = "1";
        helpOpen = true;
    }
});

document.getElementById("submit-profile-link").addEventListener("click", (e) => {
    e.preventDefault();
    let userLink = (document.forms["add-friend"]["profile-link"].value).split("/");
    let userParams = userLink[userLink.length - 1].split("?");
    let userId = userParams[0];
    addUser(userId);
});

document.getElementById("logout").addEventListener("click", () => {
    sessionStorage.removeItem("members");
    window.location = "/index.html"; 
});

document.getElementById("midl-button").addEventListener("click", () => {
    document.getElementById("midl-button").disabled = true;
    document.getElementById("playlist").style.display = "none";

    if (document.getElementById("playlist-name").value !== "") {
        document.getElementById("playlist-link").innerHTML = 
            document.getElementById("playlist-name").value;
    }

    if (members.length > 1) {
        makePlaylist(document.getElementById("playlist-name").value,
                    document.getElementById("playlist-public").checked,
                    document.getElementById("playlist-collab").checked,
                    document.getElementById("playlist-desc").value,
                    () => {
                        document.getElementById("midl-button").disabled = false;
                    });
    }
    else {
        showNotification("Add some friends to your group first!");
        document.getElementById("midl-button").disabled = false;
    }
});