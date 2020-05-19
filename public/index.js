const ACCESS_TOKEN = 'midl-access-token';

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem(ACCESS_TOKEN) !== null
        /* && actual authorization */) {
        window.location = '/group.html';
    }
    else {
        localStorage.setItem(ACCESS_TOKEN, window.location.hash);    
        document.getElementById('login').addEventListener('click', () => {
            document.getElementById('debug').innerHTML = 'Logging in...';
            window.location = '/login';
        });
    }
})