const ACCESS_TOKEN = 'midl-access-token';

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('logout').addEventListener('click', () => {
        localStorage.removeItem(ACCESS_TOKEN); 
        document.getElementById('debug').innerHTML = 'Logging out...';
        window.location = '/index.html';
    });
})