function to12hr(hr) {
    hr = parseInt(hr)
    return `${(hr<13)?hr:hr%12}`
}
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
function parseTable(table, include_links = true) {
    if (!table) return false;

    const rows = table.tBodies[0]?.rows || []
    const parsedTable = []

    for (const row of rows) {
        const parsedRow = []
        for (const cell of row.cells) {
            const link = cell.querySelector('a')
            if (link) {
                parsedRow.push(include_links
                    ? [link.title || cell.textContent.trim(), link]
                    : [link.title || cell.textContent.trim()]
                )
            } else {
                parsedRow.push([cell.textContent.trim()])
            }
        }
        parsedTable.push(parsedRow)
    }
    return parsedTable
}
function getRandomFloat() {
    return Math.random() * 100 - 50;
}
function benchmarkPerformance(callback) {
    const frameTimes = [];
    let start = performance.now();

    function measureFrame(timestamp) {
        if (frameTimes.length >= 100) {
            const avgFrameTime = frameTimes.reduce((a, b) => a + b) / frameTimes.length;
            callback(avgFrameTime);
            return;
        }
        frameTimes.push(timestamp - start);
        start = timestamp;
        requestAnimationFrame(measureFrame);
    }

    requestAnimationFrame(measureFrame);
}