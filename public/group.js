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

document.addEventListener('DOMContentLoaded', () => {

    spotify.setAccessToken(getHashParams().access_token);
    spotify.getMe()
        .then(res => {
            document.getElementById('debug').innerHTML = res.display_name;
        })
        .catch(err => {
            document.getElementById('debug').innerHTML = err;
        })

    document.getElementById('logout').addEventListener('click', () => {
        document.getElementById('debug').innerHTML = 'Logging out...';
        window.location = '/index.html'; 
    });

})