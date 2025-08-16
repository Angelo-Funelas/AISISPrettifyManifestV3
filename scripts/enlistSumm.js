const headers = ['Time', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat']
const dayIndex = {
    "M": 2,
    "T": 3,
    "W": 4,
    "TH": 5,
    "F": 6,
    "SAT": 7,
}
function loadEnlistSumm() {
    // console.log("Loading Enlistment Summary")
    const table = document.querySelector('body > div:nth-child(1) > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td:nth-child(2) > table > tbody > tr:nth-child(4) > td > table > tbody > tr:nth-child(6) > td > table');
    const parsedTable = parseTable(table)
    const pageHeading = document.querySelector("body > div:nth-child(1) > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td:nth-child(2) > table > tbody > tr:nth-child(4) > td > table > tbody > tr:nth-child(2) > td > span.header06")?.innerText
    if (parsedTable[0]?.length !== 7 || pageHeading !== "Enlistment Summary") return;
    var prettyGridOld = document.getElementById("prettyGrid")
    if (prettyGridOld) prettyGridOld.remove()

    var gridSchedule = document.createElement('div')
    gridSchedule.id = "prettyGrid"
    gridSchedule.style.marginTop = `6em`
    gridSchedule.style.width = `80%`
    gridSchedule.style.gridTemplateRows = `64px repeat(28, 32px)`
    for (let i=0;i<29;i++) {
        var gridLine = document.createElement('div')
        gridLine.className = 'gridLine'
        gridLine.style.gridRow = i+1
        gridSchedule.append(gridLine)
    }
    for (let i=0;i<headers.length;i++) {
        var heading = document.createElement('p')
        heading.className = 'headCell'
        heading.style.gridColumn = i+1
        heading.innerText = headers[i]
        gridSchedule.append(heading)
    }
    for (let i=7; i<22; i++) {
        var cont = document.createElement('div')
        var time = document.createElement('p')
        cont.className = 'timeCell'
        time.innerText = to12hr(i) + ':00';
        cont.style.gridRow = (i-6)*2
        cont.appendChild(time)
        gridSchedule.append(cont)
    }
    for (let i=1;i<parsedTable.length-1;i++) {
        const row = parsedTable[i]
        const week_day = row[4][0].split(' ')[0].split('-')
        const time = row[4][0].split(' ')[1].split('-')
        // console.log(time)
        for (let j = 0; j<week_day.length;j++) {
            const day = week_day[j]
            var classBlock = document.createElement('div')
            classBlock.className = 'classCell'
            classBlock.style.backgroundColor = `#63c1ff`
            classBlock.innerText = `${row[0]}\n${row[1]} ${row[2]}\n${row[4]}`
            classBlock.style.gridColumn = dayIndex[day]
            // console.log(parseInt(time[0])+((time[0][2]=='3')?20:0))
            classBlock.style.gridRowStart = Math.floor((parseInt(time[0])+((time[0][2]=='3')?20:0))/50)-12
            classBlock.style.gridRowEnd = Math.floor((parseInt(time[1])+((time[1][2]=='3')?20:0))/50)-12
            gridSchedule.append(classBlock)
        }

    }
    // for (let i=0;i<gridTable.length;i++) {
    //     for (let j=0;j<gridTable[i].length;j++) {
    //         if (i==0) {
    //             if (j%2==0) {
    //                 var cont = document.createElement('div')
    //                 var time = document.createElement('p')
    //                 cont.className = 'timeCell'
    //                 var timeStr = gridTable[0][j][0].split("-")[0]
    //                 time.innerText = to12hr(timeStr.slice(0, -2)) + ':' + timeStr.slice(-2);
    //                 cont.style.gridRow = gridTable[0][j][1]
    //                 cont.appendChild(time)
    //                 gridSchedule.append(cont)
    //             }
    //         } else {
    //             var classBlock = document.createElement('div')
    //             classBlock.className = 'classCell'
    //             classBlock.style.backgroundColor = `#${subjectColors[subjects.get(gridTable[i][j][0])]}`
    //             classBlock.innerText = gridTable[i][j][0]
    //             classBlock.style.gridColumn = i+1
    //             classBlock.style.gridRowStart = gridTable[i][j][1]
    //             classBlock.style.gridRowEnd = gridTable[i][j][2]
    //             gridSchedule.append(classBlock)
    //         }
    //     }
    // }
    table.parentElement.append(gridSchedule)
    // console.log(parsedTable)
}

chrome.storage.local.get({'settings_enlistSumm': true}, function(result) {
    if (result.settings_enlistSumm) {
        if (document.readyState !== 'loading') return loadEnlistSumm()
        document.addEventListener('DOMContentLoaded', loadEnlistSumm)
    }
})