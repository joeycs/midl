const toMatch = [
    /Android/i,
    /webOS/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i
];

if (toMatch.some((toMatchItem) => {
        return navigator.userAgent.match(toMatchItem);
    })) 
{
    window.location = "/mobile.html";
}