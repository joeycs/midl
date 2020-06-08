// my user id -> 12169450242

const MEMBER_LIMIT = 6;

let SpotifyWebApi = require('../node_modules/spotify-web-api-js');
let spotify = new SpotifyWebApi();
let members = [];

const addMe = () => {
    spotify.getMe()
        .then(res => {
            let user = {
                id: res.id,
                imgId: res.id + '-pic',
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
                    imgId: userId + '-pic',
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

const getHashParams = () => {
    let hashParams = {};
    let e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while (e = r.exec(q)) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
}

const showPlayback = () => {
    spotify.getMyCurrentPlaybackState()
        .then(res => {
            document.getElementById('current-track').innerHTML =
                res.item.name.bold() 
                + " on " + res.item.album.name.bold() 
                + " by " + res.item.artists[0].name.bold();
            document.getElementById('album-art').src = res.item.album.images[0].url
        })
        .then(() => {
            document.getElementById('current-track').style.color = '#181818';
            document.getElementById('album-art').setAttribute(
                "style", 
                "border: 2px solid #181818; height: 150px"
            );
        })
        .catch((err) => {
            document.getElementById('error-stack').innerHTML += 'ERROR: ' + err + '<br>';
            document.getElementById('current-track').style.color = '#181818';
        });
}

const showPlaylists = (userId) => {
    spotify.getUserPlaylists(userId)
        .then(res => {
            res.items.forEach(item => {
                document.getElementById('playlist').innerHTML += item.name + '<br>';
            });
        });
}

const showUsersFrom = (i) => {
    document.getElementById('display-name').innerHTML = members[0].name;
    document.getElementById('pics-bg').style.color = "#181818";

    for (i; i < members.length; i++) {
        let picsContainer = document.getElementById('pics-container');
        let profilePic = document.createElement('img');

        profilePic.setAttribute(
            'style', 
            'height: 150px; width: 150px'
        );

        profilePic.id = members[i].imgId;
        profilePic.src = members[i].pic;
        profilePic.title = members[i].name;
        profilePic.classList.add('profile-pic');
        picsContainer.appendChild(profilePic);

        document.getElementById('debug').innerHTML += members[i].name + "<br>";
    }

    document.getElementById('hidden-header').style.color = '#e9e3d5';
    document.getElementById('pics-container').style.left = '0%';
}

/* Use group creator's access token from URL params to authorize API calls. */

spotify.setAccessToken(getHashParams().access_token);

if (JSON.parse(sessionStorage.getItem('members')) === null) {
    addMe();
}
else {
    members = JSON.parse(sessionStorage.getItem('members'));
    showUsersFrom(0);
}

showPlayback();

/* Use Add User form's input to add member to group. */

document.getElementById('submit-user-id').addEventListener('click', (e) => {
    e.preventDefault();
    let userId = document.forms['add-user']['user-id'].value;
    addUser(userId);
});

/* Add listener to log out button */

document.getElementById('logout').addEventListener('click', () => {
    window.location = '/index.html'; 
});