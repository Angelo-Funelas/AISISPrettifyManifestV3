const mapToObject = map => Object.fromEntries(map.entries());
function loadSchedule(settings_calendar) {
    const pageHeading = document.getElementsByTagName('table')[11]?.querySelector("tbody > tr:nth-child(2) > td > span.header06")?.innerText
    if (pageHeading !== "My Class Schedule") return;
    var table = document.getElementsByTagName('table')[15]
    var rows = table.querySelector('tbody').querySelectorAll('tr')
    var parsedTable = []
    for (let i = 0; i< rows.length;i++) {
        let cells = rows[i].querySelectorAll('td')
        var parsedRow = []
        for (let cell of cells) {
            parsedRow.push(cell.innerText)
        }
        parsedTable.push(parsedRow)
    }
    const subjectColors = ['3DC2EC', '4B70F5', '4C3BCF', '402E7A', '3ABEF9', '3572EF','050C9C', '153448', '3C5B6F']
    var subjects = new Map()
    var gridTable = []
    let subjStart = 0;
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
    if (parsedTable[0].length == 7) {
        chrome.storage.local.get({"data_idNumber": 0}, (result) => {
            chrome.storage.local.set({[`data_schedule_${result.data_idNumber}`]: {
                gridTable: gridTable,
                subjects: mapToObject(subjects)
            }});
        })

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

        if (settings_calendar) {
            var convertButton = document.createElement('button')
            convertButton.id = 'convertToCalendar'
            convertButton.style.cssText = 'font-family: Arial, Helvetica, sans-serif; padding: 0.5rem 2.2rem; box-shadow: rgba(145, 145, 145, 0.4) 0px 0px 5px 3px; font-size: 14px; transition: all 0.2s cubic-bezier(.36,1.59,.59,.99); cursor: pointer; border-radius: 10px; text-align: center; display: inline-block; margin: 1rem 0; border: none; background-image: linear-gradient(40deg, rgb(255, 255, 255) -30%, rgb(255, 255, 255) 69%);'

            var buttonText = document.createElement('p')
            buttonText.innerText = 'Convert to Calendar'
            buttonText.style.cssText = 'margin: 0; background-image: linear-gradient(40deg, rgb(129, 213, 255) -30%, rgb(89, 122, 255) 69%); font-weight: bold; color: transparent; background-clip: text; -webkit-background-clip: text;'
            convertButton.appendChild(buttonText)

            convertButton.onmouseover = () => {
                convertButton.style.backgroundImage = 'linear-gradient(40deg, rgb(129, 213, 255) -30%, rgb(89, 122, 255) 69%)'
                convertButton.style.boxShadow = 'rgba(145, 145, 145, 0.3) 0px 0px 5px 3px'
                convertButton.style.scale = '1.02'
                buttonText.style.color = 'white'
            }
            convertButton.onmouseout = () => {
                convertButton.style.backgroundImage = 'linear-gradient(40deg, rgb(255, 255, 255) -30%, rgb(255, 255, 255) 69%)'
                convertButton.style.boxShadow = 'rgba(145, 145, 145, 0.4) 0px 0px 5px 3px'
                convertButton.style.scale = '1'
                buttonText.style.color = 'transparent'
            }
            convertButton.onclick = () => {
                chrome.runtime.sendMessage({ action: 'openCalendar' })
            }

            table.parentElement.append(convertButton)
        }

        table.parentElement.append(gridSchedule)
        table.style.display = 'none'
    }
}

chrome.storage.local.get({'settings_schedule': true, 'settings_calendar': true}, function(result) {
    if (result.settings_schedule) {
        if (document.readyState !== 'loading') return loadSchedule(result.settings_calendar)
        document.addEventListener('DOMContentLoaded', loadSchedule)
    }
})
