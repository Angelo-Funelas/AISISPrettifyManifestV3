const headers = ['Time', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat']
const dayIndex = {
    "M": 2,
    "T": 3,
    "W": 4,
    "TH": 5,
    "F": 6,
    "SAT": 7,
}

function extractPage() {
    const headerCell = document.querySelector(".header06");
    const headerContent = headerCell ? headerCell.textContent.trim() : "";

    if (
        headerContent.toLowerCase() === "summary of enlistment" ||
        headerContent.toLowerCase() === "enlistment summary"
    ) {
        return "enlistment";
    }

    return null;
}

function extractClassesTableFromEnlistment() {
    const tableCells = document.querySelectorAll("td");
    let scheduleTable = null;
    let foundTable = false;
    for (const tableCell of tableCells) {
        const background = tableCell.getAttribute("background");
        const isScheduleInCell = tableCell.textContent
            .trim()
            .toLowerCase()
            .includes("schedule");

        if (!isScheduleInCell || background !== "images/spacer_lightblue.jpg")
            continue;

        foundTable = true;
        scheduleTable = tableCell;
        break;
    }

    if (!foundTable) return null;

    scheduleTable = scheduleTable.closest("table");

    return scheduleTable;
}

function addCalendarConverter() {
    let page = extractPage()
    if (!page) return;

    let table = extractClassesTableFromEnlistment();
    let tbody = table.querySelector("tbody");
    let rows = Array.from(tbody.rows);

    let enlistedClasses = [];

    if (rows.length === 0) {
        alert("No rows found in the schedule table.");
        return;
    }
    const expectedColumnCount = rows[0].cells.length;

    const firstRow = rows[0];
    let courseCodeIndex = -1;
    let sectionIndex = -1;
    let instructorIndex = -1;
    let scheduleIndex = -1;

    for (let i = 0; i < firstRow.cells.length; i++) {
        const cellText = firstRow.cells[i].innerText.trim().toLowerCase();

        if (
            cellText.includes("subject")
        ) {
            courseCodeIndex = i;
        } else if (cellText.includes("section")) {
            sectionIndex = i;
        } else if (cellText.includes("instructor")) {
            instructorIndex = i;
        } else if (cellText.includes("schedule")) {
            scheduleIndex = i;
        }
    }

    for (const row of rows) {
        let shouldSkipRow = false;
        for (const cell of row.cells) {
            if (
                cell.getAttribute("background") ===
                "images/spacer_lightblue.jpg"
            ) {
                shouldSkipRow = true;
                break;
            }
        }
        if (shouldSkipRow) continue;

        if (row.cells.length !== expectedColumnCount) continue;

        const courseCode =
            courseCodeIndex >= 0 && row.cells[courseCodeIndex]
                ? row.cells[courseCodeIndex].innerText.trim()
                : "";
        const section =
            sectionIndex >= 0 && row.cells[sectionIndex]
                ? row.cells[sectionIndex].innerText.trim()
                : "";
        const instructor =
            instructorIndex >= 0 && row.cells[instructorIndex]
                ? row.cells[instructorIndex].innerText.trim()
                : "";
        const schedule =
            scheduleIndex >= 0 && row.cells[scheduleIndex]
                ? row.cells[scheduleIndex].innerText.trim()
                : "";

        if (schedule.includes("TBA")) continue;

        let dateAndVenue = schedule.split("(")[0].trim();
        let dayAndTime = dateAndVenue.split("/");
        let timeSplit = dayAndTime[0].trim().split(" ")[1].trim().split("-");
        let day = dayAndTime[0].trim().split(" ")[0].trim();
        let startTime = timeSplit[0].trim();
        let endTime = timeSplit[1].trim();
        let venue = dayAndTime[1].trim();

        enlistedClasses.push({
            courseCode: courseCode,
            startTime: startTime,
            endTime: endTime,
            day: day,
            location: venue,
            section: section,
            instructor: instructor
        });
    }

    chrome.storage.local.set({ enlistedClasses: enlistedClasses });

    var div = document.createElement('div')
    div.style.cssText = 'width: 100%; display: flex; justify-content: center; align-items: center;'
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

    div.append(convertButton)
    table.parentElement.insertBefore(div, table)
}

function addCalendarPreview() {
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

function loadEnlistSumm(settings_calendar) {
    if (settings_calendar)
        addCalendarConverter();
    // addCalendarPreview();
}

chrome.storage.local.get({ 'settings_enlistSumm': true, 'settings_calendar': true }, function(result) {
    if (result.settings_enlistSumm) {
        if (document.readyState !== 'loading') return loadEnlistSumm(result.settings_calendar)
        document.addEventListener('DOMContentLoaded', loadEnlistSumm)
    }
})
