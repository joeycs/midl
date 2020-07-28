const detectMobile = () => {
    const toMatch = [
        /Android/i,
        /webOS/i,
        /iPhone/i,
        /iPad/i,
        /iPod/i,
        /BlackBerry/i,
        /Windows Phone/i
    ];

    return toMatch.some((toMatchItem) => {
        return navigator.userAgent.match(toMatchItem);
    });
}

if (detectMobile()) {
    window.location = "/mobile.html";
}

document.getElementById('hidden-header').style.color = "#e9e3d5";

document.getElementById('login').addEventListener('click', () => {
    window.location = '/login';
});