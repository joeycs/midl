document.addEventListener('DOMContentLoaded', () => {

    document.getElementById('login').addEventListener('click', () => {
        document.getElementById('debug').innerHTML = 'Logging in...';
        window.location = '/login';
    });

})