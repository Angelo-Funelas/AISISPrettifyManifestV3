function RandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
};
function RandomRGB() {
    var r,b,g = 0;
    r = RandomInt(0, 255);
    g = RandomInt(0, 255);
    b = RandomInt(0, 255);
    return `${r}, ${g}, ${b}`;
}
function timeNow(data) {
    var d = new Date();
    var h = (d.getHours() % 12 || 12);
    var m = (d.getMinutes()<10?'0':'') + d.getMinutes();
    var ampm = d.getHours() < 12 ? "am" : "pm";
    if (data == 'time') {
        return (h + ':' + m);
    } else if (data == 'ampm') {
        return ampm;
    }
}
function gotoBottom(id){
    var element = document.getElementById(id);
    element.scrollTop = element.scrollHeight - element.clientHeight;
}