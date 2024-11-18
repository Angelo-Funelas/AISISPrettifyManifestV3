function to12hr(hr) {
    hr = parseInt(hr)
    return `${(hr<13)?hr:hr%12}`
}
function loadSchedule() {
    const pageHeading = document.getElementsByTagName('table')[11]?.querySelector("tbody > tr:nth-child(2) > td > span.header06")?.innerText
    console.log(pageHeading)
    if (pageHeading !== "My Class Schedule") return;
    var table = document.getElementsByTagName('table')[15]
    var rows = table.querySelector('tbody').querySelectorAll('tr')
    var parsedTable = []
    for (let i = 0; i< rows.length;i++) {
        cells = rows[i].querySelectorAll('td')
        var parsedRow = []
        for (let cell of cells) {
            parsedRow.push(cell.innerText)
        }
        parsedTable.push(parsedRow)
    }
    console.log(parsedTable)

    const subjectColors = ['3DC2EC', '4B70F5', '4C3BCF', '402E7A', '3ABEF9', '3572EF','050C9C', '153448', '3C5B6F']
    var subjects = new Map()
    var gridTable = []
    for (let i=0;i<parsedTable[0].length;i++) {
        var col = []
        var prevSubj = ' '
        for (let j=1;j<parsedTable.length;j++) {
            if (i==0) {
                col.push([parsedTable[j][i],j+1])
            } else {
                var curSubj = parsedTable[j][i]
                if (prevSubj!==curSubj) {
                    if (prevSubj!==" ") {
                        col.push([prevSubj,subjStart+1,j+1])
                        if (!subjects.has(prevSubj)) {
                            subjects.set(prevSubj, subjects.size)
                        }
                    }
                    if (curSubj!==" ") {
                        subjStart = j
                    }
                    prevSubj = curSubj
                }
            }
        }
        gridTable.push(col)
    }
    console.log(gridTable)
    console.log(subjects)
    if (parsedTable[0].length == 7) {
        var gridSchedule = document.createElement('div')
        gridSchedule.id = "prettyGrid"
        gridSchedule.style.gridTemplateRows = `64px repeat(${gridTable[0].length-1}, 32px)`
        for (let i=0;i<gridTable[0].length;i++) {
            var gridLine = document.createElement('div')
            gridLine.className = 'gridLine'
            gridLine.style.gridRow = i+1
            gridSchedule.append(gridLine)
        }
        for (let i=0;i<parsedTable[0].length;i++) {
            var heading = document.createElement('p')
            heading.className = 'headCell'
            heading.style.gridColumn = i+1
            heading.innerText = parsedTable[0][i]
            gridSchedule.append(heading)
        }
        for (let i=0;i<gridTable.length;i++) {
            for (let j=0;j<gridTable[i].length;j++) {
                if (i==0) {
                    if (j%2==0) {
                        var cont = document.createElement('div')
                        var time = document.createElement('p')
                        cont.className = 'timeCell'
                        var timeStr = gridTable[0][j][0].split("-")[0]
                        time.innerText = to12hr(timeStr.slice(0, -2)) + ':' + timeStr.slice(-2);
                        cont.style.gridRow = gridTable[0][j][1]
                        cont.appendChild(time)
                        gridSchedule.append(cont)
                    }
                } else {
                    var classBlock = document.createElement('div')
                    classBlock.className = 'classCell'
                    classBlock.style.backgroundColor = `#${subjectColors[subjects.get(gridTable[i][j][0])]}`
                    classBlock.innerText = gridTable[i][j][0]
                    classBlock.style.gridColumn = i+1
                    classBlock.style.gridRowStart = gridTable[i][j][1]
                    classBlock.style.gridRowEnd = gridTable[i][j][2]
                    gridSchedule.append(classBlock)
                }
            }
        
        }
        table.parentElement.append(gridSchedule)
        table.style.display = 'none'
    }
}
chrome.storage.local.get(['disable_schedule'], function(result) {
    if (!result.disable_schedule) {
        if (document.readyState !== 'loading') return loadSchedule()
        document.addEventListener('DOMContentLoaded', loadSchedule)
    }
})