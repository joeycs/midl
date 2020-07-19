const MEMBER_LIMIT = 5;

let SpotifyWebApi = require('spotify-web-api-js');
let spotify = new SpotifyWebApi();
let members = [];
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

            spotify.getMySavedTracks({'limit': 1, 'offset': 0})
                .then(tracks => {
                    user.tracksTotal = tracks.total;
                    members.push(user);
                    sessionStorage.setItem('members', JSON.stringify(members));
                    showUsersFrom(members.length - 1);
                })
                .catch(err => {
                    alert(err.response);
                });
        })
        .catch(err => {
            alert('ERROR: ' + err.response.status + ': ' + err.response.message);
        });
}

const addUser = (id) => {
    let memberInGroup = false;
    let userId = id.toLowerCase();
    
    members.forEach(user => {
        if (user.id === userId) {
            memberInGroup = true;
        }
    });

    if (memberInGroup) {
        showNotification('Looks like that user is already in your group!');
    }
    else if (members.length >= MEMBER_LIMIT) {
        showNotification('Your group is full!');
    }
    else {
        spotify.getUser(userId)
            .then(res => {
                let user = {
                    id: userId,
                    name: res.display_name,
                    pic: res.images[0].url,
                    tracks: []
                };

                spotify.getUserPlaylists(userId)
                    .then(playlists => {

                        playlists.items.forEach(playlist => {
                            spotify.getPlaylistTracks(playlist.id)
                                .then(res => {

                                    res.items.forEach(item => {
                                        if (!user.tracks.includes(item.track.uri)) {
                                            user.tracks.push(item.track.uri);
                                        }
                                    });

                                })
                                .catch(err => {
                                    alert(err.response);
                                });

                        });

                        members.push(user);
                        sessionStorage.setItem('members', JSON.stringify(members));
                        showUsersFrom(members.length - 1);
                    })
                    .catch(err => {
                        alert(err.response);
                    });
            })
            .catch(() => {
                showNotification('You\'ve entered an invalid profile link or user ID!');
            });
    }
}

const fillPlaylist = (playlistId) => {
    let i = 0, tracksAdded = 0;
    let matchedTracks = [];
    var currTrack, currMember, currOffset;

    while (i < 100 && tracksAdded < 50) {
        currOffset = getRandomInt(0, members[0].tracksTotal - 50)

        spotify.getMySavedTracks({'limit': 50, 'offset': currOffset})
            .then(myTracks => {

                for (let j = 0; j < 50 && tracksAdded < 50; j++) {
                    currTrack = myTracks.items[j].track.uri;
                    currMember = members[(j % (members.length - 1)) + 1];

                    for (let k = 0; k < currMember.tracks.length; k++) {
                        if (currMember.tracks[k] === currTrack && (!matchedTracks.includes(currTrack))) {
                            matchedTracks.push(currMember.tracks[k]);
                            tracksAdded++;
                            break;
                        }
                    }
                }

            })
            .catch(err => {
                alert(err.response);
            });

        i++;
    }

    setTimeout(() => {
        showPlaylist(matchedTracks);

        spotify.addTracksToPlaylist(playlistId, matchedTracks)
            .then(() => {})
            .catch(err => {
                alert(err.response);
            });
    }, 500);
};

const findPlaylist = (name) => {
    spotify.getUserPlaylists()
        .then(res => {
            for (let i = 0; i < res.items.length; i++) {
                if (res.items[i].name === name) {
                    sessionStorage.setItem('takenName', res.items[i].name);
                    break;
                }
            }
        });
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

const makePlaylist = (name, isPublic, isCollaborative, description) => {
    let localName = name;
    let nameTaken = false;
    let nameTakenMsg = 'You already have a playlist with that name!';

    if (localName === '') {
        localName = members[0].name + '\'s midl Playlist';
        nameTakenMsg = 'You already have a playlist with the default name!'
    }

    findPlaylist(localName);

    setTimeout(() => {
        nameTaken = sessionStorage.getItem('takenName') !== null;

        if (nameTaken) {
            showNotification(nameTakenMsg);
        }
        else {
            let playlistData = {
                'name': localName,
                'public': isPublic,
                'collaborative': isCollaborative,
                'description': description
            };

            spotify.createPlaylist(members[0].id, playlistData)
                .then((res) => {
                    fillPlaylist(res.id);
                    showNotification('"' + localName + '" has been saved to your library!')
                })
                .catch(err => {
                    alert(err.response);
                });
        }

    }, 150);

    sessionStorage.removeItem('takenName');
}

const removeUser = (userId) => {
    let namesContainer = document.getElementById('names-container');
    let picsContainer = document.getElementById('pics-container');

    for (let i = 0; i < members.length; i++) {
        let currUser = members[i];

        if (currUser.id === userId) {
            members.splice(i, 1);
            namesContainer.removeChild(document.getElementById(currUser.id + '-text'));
            picsContainer.removeChild(document.getElementById(currUser.id + '-img'));
            picsContainer.removeChild(document.getElementById(currUser.id + '-remove'));
            break;
        }
    }

    sessionStorage.setItem('members', JSON.stringify(members));
}

const showNotification = (msg) => {
    clearTimeout(notifTimeout);
    document.getElementById('notification').innerHTML = msg;

    document.getElementById('notification').setAttribute(
        'style',
        'z-index: 1; right: -0.225em; transition: 0.5s'
    );

    notifTimeout = setTimeout(() => {
        document.getElementById('notification').setAttribute(
            'style',
            'z-index: 0; right: -15em; transition: 0.3s'
        );
    }, 3000);
}

const showPlaylist = (tracks) => {

};

const showUsersFrom = (i) => {
    let currNameId = members[0].id + '-text';
    document.getElementById('display-name').innerHTML = members[0].name;

    for (i; i < members.length; i++) {
        let namesContainer = document.getElementById('names-container');
        let picsContainer = document.getElementById('pics-container');
        let displayName = document.createElement('span');
        let profilePic = document.createElement('img');

        let currUser = members[i];
        let currImgId = currUser.id + '-img';
        currNameId = currUser.id + '-text';

        displayName.id = currNameId;
        displayName.innerHTML = currUser.name;
        displayName.classList.add('member-name');
        namesContainer.appendChild(displayName);

        setTimeout(() => {
            profilePic.setAttribute(
                'style', 
                'height: 9.375em; width: 9.375em'
            );
        }, 20);

        profilePic.id = currImgId;
        profilePic.src = currUser.pic;
        profilePic.href = members
        profilePic.classList.add('profile-pic');
        picsContainer.appendChild(profilePic);

        if (i > 0) {
            let removeIcon = document.createElement('img');

            removeIcon.id = currUser.id + '-remove';
            removeIcon.src = 'https://i.imgur.com/SuiuFIj.png';
            removeIcon.classList.add('remove-icon');

            removeIcon.addEventListener('mouseover', () => {
                removeIcon.style.opacity = '0.75';
            });
            removeIcon.addEventListener('mouseleave', () => {
                removeIcon.style.opacity = '1';
            });

            removeIcon.addEventListener('click', (e) => {
                e.preventDefault();
                removeUser(currUser.id);
            });

            picsContainer.appendChild(removeIcon);

            setTimeout(() => {
                removeIcon.style.opacity = '1';
            }, 20);
        }
    }

    document.getElementById('hidden-header').style.color = '#e9e3d5';
    document.getElementById(currNameId).style.color = '#181818';

    setTimeout(() => {
        document.getElementById('pics-container').style.left = '0%';
        document.getElementById('names-container').style.color = '#e9e3d5';
        document.getElementById(currNameId).style.color = '#e9e3d5';
    }, 20);
}

spotify.setAccessToken(getHashParams().access_token);

if (JSON.parse(sessionStorage.getItem('members')) === null) {
    addMe();
}
else {
    members = JSON.parse(sessionStorage.getItem('members'));
    showUsersFrom(0);
}

let helpOpen = false;

document.getElementById('dropdown-button').addEventListener('click', () => {
    if (helpOpen) {
        document.getElementById('dropdown-content').style.opacity = '0';
        document.getElementById('dropdown-content').style.zIndex = '-1';
        helpOpen = false;
    }
    else {
        document.getElementById('dropdown-content').style.opacity = '1';
        document.getElementById('dropdown-content').style.zIndex = '1';
        helpOpen = true;
    }
});

document.getElementById('submit-profile-link').addEventListener('click', (e) => {
    e.preventDefault();
    let userLink = (document.forms['add-friend']['profile-link'].value).split('/');
    let userParams = userLink[userLink.length - 1].split('?');
    let userId = userParams[0];
    addUser(userId);
});

document.getElementById('logout').addEventListener('click', () => {
    window.location = '/index.html'; 
});

document.getElementById('midl-button').addEventListener('click', () => {
    document.getElementById('midl-button').disabled = true;
    setTimeout(() => {
        document.getElementById('midl-button').disabled = false;
    }, 1500);

    if (members.length > 1) {
        makePlaylist(document.getElementById('playlist-name').value,
                    document.getElementById('playlist-public').checked,
                    document.getElementById('playlist-collab').checked,
                    document.getElementById('playlist-desc').value);
    }
    else {
        showNotification('Add some friends to your group first!')
    }
});