// my user id = 12169450242
let SpotifyWebApi = require('../node_modules/spotify-web-api-js');
let spotify = new SpotifyWebApi();

const getHashParams = () => {
    let hashParams = {};
    let e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while ( e = r.exec(q)) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
}

const addUser = (userId) => {
    if (userId === 'me') {
        spotify.getMe()
            .then(res => {
                document.getElementById('display-name').innerHTML = res.display_name;
                document.getElementById('my-pic').src = res.images[0].url;
            })
            .then(() => {
                document.getElementById('hidden-header').style.color = '#e9e3d5';
                document.getElementById('my-pic').setAttribute(
                    "style", 
                    "height: 15vh; width: 15vh"
                );
            })
            .catch(() => {
                document.getElementById('my-pic').style.display = 'none';
            });
    }
    else {
        spotify.getUser(userId)
            .then(res => {
                document.getElementById('friend-pic').src = res.images[0].url;
                document.getElementById('friend-pic').setAttribute(
                    "style", 
                    "height: 15vh; width: 15vh"
                );
            })
            .catch(() => {
                document.getElementById('friend-pic').style.display = 'none';
            });
    }
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
                "border: 2px solid #181818; height: 15vh"
            );
        })
        .then(() => {
            document.getElementById('pics-container').style.left = '0%';
        })
        .catch(() => {
            document.getElementById('current-track').style.color = '#181818';
            document.getElementById('album-art').style.display = 'none';
        });
}

const showPlaylists = (userId) => {
    spotify.getUserPlaylists(userId)
        .then(res => {
            res.items.forEach((item) => {
                document.getElementById('playlist').innerHTML += item.name + '<br>';
            });
        });
}

spotify.setAccessToken(getHashParams().access_token);

addUser('me');
showPlayback();

document.getElementById('submit-user-id').addEventListener('click', (e) => {
    e.preventDefault();
    let userId = document.forms['add-user']['user-id'].value;
    addUser(userId);
});

document.getElementById('logout').addEventListener('click', () => {
    window.location = '/index.html'; 
});