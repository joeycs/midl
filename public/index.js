document.getElementById('login').addEventListener('click', () => {
    document.getElementById('debug').innerHTML = 'Logging in...';
    setTimeout(() => {
        fetch('/user')
            .then(res => res.json())
            .then(data => {
                document.getElementById('debug').innerHTML = data.name + ", " + data.age;
            })
            .catch(error => {
                alert(error);
            });
    }, 500);
});