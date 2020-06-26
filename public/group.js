// my user id -> 12169450242

const MEMBER_LIMIT = 4;

let SpotifyWebApi = require('spotify-web-api-js');
let spotify = new SpotifyWebApi();
let members = [];

const addMe = () => {
    spotify.getMe()
        .then(res => {
            let user = {
                id: res.id,
                name: res.display_name,
                pic: res.images[0].url
            };

            members.push(user);
            sessionStorage.setItem('members', JSON.stringify(members));
            showUsersFrom(members.length - 1);
        })
        .catch((err) => {
            document.getElementById('error-stack').innerHTML += 'ERROR: ' + err + '<br>';
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

    if (members.length >= MEMBER_LIMIT) {
        document.getElementById('error-stack').innerHTML += 'ERROR: group full' + '<br>';
    }
    else if (memberInGroup) {
        document.getElementById('error-stack').innerHTML += 'ERROR: member already in group' + '<br>';
    }
    else {
        spotify.getUser(userId)
            .then(res => {
                let user = {
                    id: userId,
                    name: res.display_name,
                    pic: res.images[0].url
                };

                members.push(user);
                sessionStorage.setItem('members', JSON.stringify(members));
                showUsersFrom(members.length - 1);
            })
            .catch((err) => {
                document.getElementById('error-stack').innerHTML += 'ERROR: user does not exist' + '<br>';
            });
    }
}

const createPlaylist = (name = (members[0].name + '\'s midl playlist #' + generateTag()), isPublic, isCollaborative, description) => {
    let playlistData = {
        'name' : name,
        'public' : isPublic,
        'collaborative' : isCollaborative,
        'description' : description
    };

    spotify.createPlaylist(members[0].id, playlistData)
        .then(res => {
            localStorage.setItem('playlist_id', playlistId);
        })
        .catch(err => {
            document.getElementById('error-stack').innerHTML += 'ERROR: ' + err + '<br>';
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

const generateTag = () => {
    let ownerId = members[0].id;
    let tag = 1;
    
    for (let i = 0; i < ownerId.length; i++) {
        let num = ownerId.charCodeAt(i);

        if (num > 0)
            tag *= num;
    }

    let d = new Date();
    let s = Math.round(d.getTime());
    tag = Math.round((tag * (s / 100000)) % 10000)

    document.getElementById('debug').innerHTML = tag;
    
    return tag;
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
                'height: 150px; width: 150px'
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
            removeIcon.src = 'https://i.imgur.com/2Xs7AD1.png';
            removeIcon.classList.add('remove-icon');

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
        document.getElementById(currNameId).style.color = '#e9e3d5';
        document.getElementById('names-container').setAttribute(
            'style',
            'color: #e9e3d5; font-size: larger'
        );
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

let playlistId = localStorage.getItem('playlist_id');

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

document.getElementById('make-playlist').addEventListener('click', () => {
    createPlaylist();
    // personalizePlaylist();
    // showPlaylist();
});