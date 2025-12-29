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

function loadEnlistSumm() {
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
    convertButton.innerText = '📅 Convert to Calendar'
    convertButton.style.cssText = 'margin: 10px 0; padding: 10px 20px; background-color: #4B70F5; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;'
    convertButton.onclick = () => {
        chrome.runtime.sendMessage({ action: 'openCalendar' })
    }

    div.append(convertButton)
    table.parentElement.insertBefore(div, table)
}

chrome.storage.local.get({ 'settings_enlistSumm': true }, function(result) {
    if (result.settings_enlistSumm) {
        if (document.readyState !== 'loading') return loadEnlistSumm()
        document.addEventListener('DOMContentLoaded', loadEnlistSumm)
    }
})
