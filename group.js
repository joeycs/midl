var SpotifyWebApi = require('../node_modules/spotify-web-api-js');
var spotify = new SpotifyWebApi();

function getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while ( e = r.exec(q)) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
}

function reportError(err) {
    document.getElementById('debug').innerHTML = err;
}

document.addEventListener('DOMContentLoaded', () => {

    spotify.setAccessToken(getHashParams().access_token);

    spotify.getMe()
        .then(res => {
            document.getElementById('displayName').innerHTML = res.display_name
        });
        
    spotify.getMyCurrentPlaybackState()
        .then(res => {
            document.getElementById('songName').innerHTML = res.item.name
            document.getElementById('albumArt').src = res.item.album.images[0].url
        });

    document.getElementById('logout').addEventListener('click', () => {
        document.getElementById('debug').innerHTML = 'Logging out...';
        window.location = '/index.html'; 
    });

})