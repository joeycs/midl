var SpotifyWebApi = require('../node_modules/spotify-web-api-js');
var spotify = new SpotifyWebApi();

const getHashParams = () => {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while ( e = r.exec(q)) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
}

const reportError = (err) => {
    document.getElementById('debug').innerHTML = err;
}

const showUser = (/* possible params for adaptability */) => {
    spotify.getMe()
    .then(res => {
        document.getElementById('display-name').innerHTML = res.display_name
    })
    .then(() => {
        document.getElementById('hidden-header').style.color = "#e9e3d5";
    });
}

const showPlayback = (/* possible params for adaptability */) => {
    spotify.getMyCurrentPlaybackState()
    .then(res => {
        document.getElementById('track-name').innerHTML = res.item.name;
        document.getElementById('on').innerHTML = "on";
        document.getElementById('album-name').innerHTML = res.item.album.name;
        document.getElementById('by').innerHTML = "by";
        document.getElementById('artist-name').innerHTML = res.item.artists[0].name;
        document.getElementById('album-art').src = res.item.album.images[0].url
    })
    .then(() => {
        document.getElementById('current-track').style.color = "#181818";
        document.getElementById('album-art').style.border = "2px solid #181818";
        document.getElementById('album-art').style.height = "30vh";
    })
    .catch(() => {
        document.getElementById('current-track').style.color = "#181818";
    })
}

spotify.setAccessToken(getHashParams().access_token);

showUser();
showPlayback();   

document.getElementById('logout').addEventListener('click', () => {
    window.location = '/index.html'; 
});