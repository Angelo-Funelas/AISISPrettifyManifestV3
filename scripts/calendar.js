document.addEventListener("DOMContentLoaded", async function () {
  const form = document.querySelector("#scheduleForm");
  const firstDayInput = document.querySelector("#firstDay");
  const lastDayInput = document.querySelector("#lastDay");

  await initializeDates(firstDayInput, lastDayInput);

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const format = document.querySelector("#format").value;

    await chooseConversionMethod(format);
  });
});

const ScheduleGridTimes = Object.freeze({
  "2": "0700",
  "4": "0800",
  "6": "0900",
  "8": "1000",
  "10": "1100",
  "12": "1200",
  "14": "1300",
  "16": "1400",
  "18": "1500",
  "20": "1600",
  "22": "1700",
  "24": "1800",
  "26": "1900",
  "28": "2000",
  "30": "2100",
  "3": "0730",
  "5": "0830",
  "7": "0930",
  "9": "1030",
  "11": "1130",
  "13": "1230",
  "15": "1330",
  "17": "1430",
  "19": "1530",
  "21": "1630",
  "23": "1730",
  "25": "1830",
  "27": "1930",
  "29": "2030"
})

const ScheduleGridDays = Object.freeze({
  "2": "M",
  "3": "T",
  "4": "W",
  "5": "TH",
  "6": "F",
  "7": "SAT",
})

const TermStartMonth = Object.freeze({
  "2nd Semester": 0,
  "1st Semester": 7,
  "Intersession": 5
})

const TermEndMonth = Object.freeze({
  "2nd Semester": 4,
  "1st Semester": 11,
  "Intersession": 6
})

const TermEndMonthDay = Object.freeze({
  "2nd Semester": "0531",
  "1st Semester": "1231",
  "Intersession": "0731"
})

const TermDefaultDates = Object.freeze({
  "2nd Semester": {
    firstDay: { month: 0, day: 1 },
    lastDay: { month: 4, day: 31 }
  },
  "1st Semester": {
    firstDay: { month: 7, day: 1 },
    lastDay: { month: 11, day: 31 }
  },
  "Intersession": {
    firstDay: { month: 5, day: 1 },
    lastDay: { month: 6, day: 31 }
  }
})

const Days = Object.freeze({
  "S": 0,
  "M": 1,
  "T": 2,
  "W": 3,
  "TH": 4,
  "F": 5,
  "SAT": 6
}) 

const ICSDays = Object.freeze({
  "S": "SU",
  "M": "MO",
  "T": "TU",
  "W": "WE",
  "TH": "TH",
  "F": "FR",
  "SAT": "SA"
})

async function initializeDates(firstDayInput, lastDayInput) {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    const termAndYearResults = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: extractTermAndYear,
    });

    if (termAndYearResults && termAndYearResults[0] && termAndYearResults[0].result) {
      let termAndYear = termAndYearResults[0].result;
      let term = termAndYear.split(", SY ")[0].trim();
      let year = termAndYear.split(", SY ")[1].trim().split("-")[1];
      year = parseInt(year, 10);
      if (term !== "2nd Semester") {
        year -= 1;
      }

      const savedData = await chrome.storage.local.get(['savedTerm', 'savedFirstDay', 'savedLastDay']);
      
      if (savedData.savedTerm === termAndYear) {
        firstDayInput.value = savedData.savedFirstDay;
        lastDayInput.value = savedData.savedLastDay;
      } else {
        await chrome.storage.local.remove(['savedTerm', 'savedFirstDay', 'savedLastDay']);
        
        const defaults = TermDefaultDates[term];
        if (defaults) {
          const firstDay = new Date(year, defaults.firstDay.month, defaults.firstDay.day);
          const lastDay = new Date(year, defaults.lastDay.month, defaults.lastDay.day);
          
          const formatLocalDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          };
          
          firstDayInput.value = formatLocalDate(firstDay);
          lastDayInput.value = formatLocalDate(lastDay);
        }
      }
    } else {
      console.warn("Term and year information not found on the page.");
      alert("Sorry, but the term and year information couldn't be found. Please ensure you are on the correct page with the term and year details.");
    }
  } catch (error) {
    console.error("Error initializing dates:", error);
    alert("Sorry, but there was an issue during the date processing. Please try again.");
  }
}

async function chooseConversionMethod(format) {
  try {
    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

    const pageResults = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: extractPage,
      });
    let currentPage = pageResults[0].result;

    if (currentPage === "schedule") {
      await convertCalendarFromSchedule(format);
    } else {
      await convertCalendarFromEnlistment(format);
    }
  } catch (error) {
    console.error("Error choosing conversion method:", error);
    alert("Sorry, but there was an issue during the date processing. Please try again.");
  }
}

async function convertCalendarFromSchedule() {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    const termAndYearResults = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: extractTermAndYear,
    });

    const classCellsResults = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: extractClassCellsFromSchedule,
    });

    console.log("Executing...");
    console.log({ classCellsResults, termAndYearResults });

    if (classCellsResults && classCellsResults[0] && classCellsResults[0].result) {
      const classCellsData = classCellsResults[0].result;

      let termAndYear = termAndYearResults[0].result;
      let term = termAndYear.split(", SY ")[0].trim();
      let year = termAndYear.split(", SY ")[1].trim().split("-")[1];
      year = parseInt(year, 10);
      if (term !== "2nd Semester") {
        year -= 1;
      }
      let yearString = year.toString();
      console.log({ term, year, yearString });

      const firstDayInput = document.querySelector("#firstDay").value;
      const lastDayInput = document.querySelector("#lastDay").value;
      
      if (!firstDayInput || !lastDayInput) {
        alert("Please provide both first and last day of classes.");
        return;
      }

      const firstDayOfClasses = new Date(firstDayInput + 'T00:00:00');
      const lastDayOfClasses = new Date(lastDayInput + 'T00:00:00');

      await chrome.storage.local.set({
        savedTerm: termAndYear,
        savedFirstDay: firstDayInput,
        savedLastDay: lastDayInput
      });

      if (classCellsData && classCellsData.length > 0) {
        console.log("Found class cells:", classCellsData);

        const groupedCells = {};
        for (const cell of classCellsData) {
          const key = cell.innerHTML;
          if (!groupedCells[key]) {
            groupedCells[key] = [];
          }
          groupedCells[key].push(cell);
        }

        let events = [];

        for (const [courseCode, cells] of Object.entries(groupedCells)) {
          let courseInfo = courseCode.split("<br>");
          subject = courseInfo[0].trim();
          let sectionLocationModalityInfo = courseInfo[1].split(" (");
          sectionLocationModalityInfo[1] = "(" + sectionLocationModalityInfo[1];
          let sectionLocationInfo = sectionLocationModalityInfo[0].split(/ (.+)/);
          let section = sectionLocationInfo[0].trim();
          let venue = sectionLocationInfo[1].trim();
          let modality = sectionLocationModalityInfo[1].replace("(", "").replace(")", "").trim();

          const daysSet = new Set();
          let startTime = null;
          let endTime = null;

          for (const cell of cells) {
            const day = ScheduleGridDays[cell.gridColumnStart];
            if (day) {
              daysSet.add(day);
            }

            if (!startTime) {
              startTime = ScheduleGridTimes[cell.gridRowStart];
            }
            if (!endTime) {
              endTime = ScheduleGridTimes[cell.gridRowEnd];
            }
          }

          const days = Array.from(daysSet);
          
          if (days.length === 0 || !startTime || !endTime) {
            console.warn("Skipping event due to missing data:", courseCode);
            continue;
          }

          let earliestDayDate = null;
          for (const day of days) {
            const dayDate = getFirstDayOccurrenceFromDate(firstDayOfClasses, Days[day]);
            if (!earliestDayDate || dayDate < earliestDayDate) {
              earliestDayDate = dayDate;
            }
          }

          const icsDays = days.map(day => ICSDays[day]).join(",");

          events.push({
            summary: subject,
            start: `${earliestDayDate.getFullYear()}${String(earliestDayDate.getMonth()+1).padStart(2, '0')}${String(earliestDayDate.getDate()).padStart(2, '0')}T${startTime}00`,
            end: `${earliestDayDate.getFullYear()}${String(earliestDayDate.getMonth()+1).padStart(2, '0')}${String(earliestDayDate.getDate()).padStart(2, '0')}T${endTime}00`,
            location: venue,
            description: `Section: ${section}\\nModality: ${modality}`,
            byday: icsDays,
            endString: `${yearString}${String(lastDayOfClasses.getMonth()+1).padStart(2, '0')}${String(lastDayOfClasses.getDate()).padStart(2, '0')}`
          });
        }

        const icsData = await convertToICS(events);
        downloadICS(icsData, "schedule.ics");

        alert(`Conversion successful! Check your downloads for the ICS file.`);
      } else {
        alert("Sorry, but no class cells were found. Please ensure you are on the correct schedule page.");
      }
    } else {
      alert("Sorry, but no class cells were found. Please ensure you are on the correct schedule page.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Sorry, but there was an issue during the conversion process. Please try again.");
  }
}

async function convertCalendarFromEnlistment() {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    const termAndYearResults = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: extractTermAndYear,
    });

    const classResults = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: extractClassesTableFromEnlistment,
    });

    console.log("Executing...");
    console.log({ classResults, termAndYearResults });

    if (classResults && classResults[0] && classResults[0].result) {
      const tableHTML = classResults[0].result;

      let termAndYear = termAndYearResults[0].result;
      let term = termAndYear.split(", SY ")[0].trim();
      let year = termAndYear.split(", SY ")[1].trim().split("-")[1];
      year = parseInt(year, 10);
      if (term !== "2nd Semester") {
        year -= 1;
      }
      let yearString = year.toString();
      console.log({ term, year, yearString });

      const firstDayInput = document.querySelector("#firstDay").value;
      const lastDayInput = document.querySelector("#lastDay").value;
      
      if (!firstDayInput || !lastDayInput) {
        alert("Please provide both first and last day of classes.");
        return;
      }

      const firstDayOfClasses = new Date(firstDayInput + 'T00:00:00');
      const lastDayOfClasses = new Date(lastDayInput + 'T00:00:00');

      await chrome.storage.local.set({
        savedTerm: termAndYear,
        savedFirstDay: firstDayInput,
        savedLastDay: lastDayInput
      });

      if (tableHTML) {
        console.log("Found table:", tableHTML);

        const parser = new DOMParser();
        const doc = parser.parseFromString(tableHTML, "text/html");
        const tableElement = doc.querySelector("table");

        console.log("Table element:", tableElement);

        const tbody = tableElement.querySelector("tbody");
        if (tbody) {
          const rows = Array.from(tbody.rows);

          let events = [];

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
            
            if (cellText.includes("course code") || cellText.includes("subject")) {
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
              if (cell.getAttribute("background") === "images/spacer_lightblue.jpg") {
                shouldSkipRow = true;
                break;
              }
            }
            if (shouldSkipRow) continue;

            if (row.cells.length !== expectedColumnCount) continue;

            const courseCode = courseCodeIndex >= 0 && row.cells[courseCodeIndex] ? row.cells[courseCodeIndex].innerText.trim() : "";
            const section = sectionIndex >= 0 && row.cells[sectionIndex] ? row.cells[sectionIndex].innerText.trim() : "";
            const instructor = instructorIndex >= 0 && row.cells[instructorIndex] ? row.cells[instructorIndex].innerText.trim() : "";
            const schedule = scheduleIndex >= 0 && row.cells[scheduleIndex] ? row.cells[scheduleIndex].innerText.trim() : "";

            if (schedule.includes("TBA")) continue;

            let dateAndVenue = schedule.split("(")[0];
            let dayAndTime = dateAndVenue.split("/");
            let timeSplit = dayAndTime[0].split(" ")[1].split("-");
            let day = dayAndTime[0].split(" ")[0];
            let startTime = timeSplit[0];
            let endTime = timeSplit[1];
            let venue = dayAndTime[1];

            if (day.includes("-")) {
              let dayValues = day.split("-");
              let firstDay = dayValues[0];
              let secondDay = dayValues[1];

              let firstDayDate = getFirstDayOccurrenceFromDate(firstDayOfClasses, Days[firstDay]);
              let secondDayDate = getFirstDayOccurrenceFromDate(firstDayOfClasses, Days[secondDay]);

              console.log({ firstDayDate, secondDayDate, startTime, endTime, venue });
              
              let startDate = firstDayDate.getTime() < secondDayDate.getTime() ? firstDayDate : secondDayDate;

              events.push({
                summary: courseCode,
                start: `${startDate.getFullYear()}${String(startDate.getMonth()+1).padStart(2, '0')}${String(startDate.getDate()).padStart(2, '0')}T${startTime.replace(":", "")}00`,
                end: `${startDate.getFullYear()}${String(startDate.getMonth()+1).padStart(2, '0')}${String(startDate.getDate()).padStart(2, '0')}T${endTime.replace(":", "")}00`,
                location: venue.trim(),
                description: `Section: ${section}\\nInstructor: ${instructor}`,
                byday: `${ICSDays[firstDay]},${ICSDays[secondDay]}`,
                endString: `${yearString}${String(lastDayOfClasses.getMonth()+1).padStart(2, '0')}${String(lastDayOfClasses.getDate()).padStart(2, '0')}`
              })
              
            } else {
              let dayDate = getFirstDayOccurrenceFromDate(firstDayOfClasses, Days[day]);

              console.log({ dayDate, startTime, endTime, venue });
              
              events.push({
                summary: courseCode,
                start: `${dayDate.getFullYear()}${String(dayDate.getMonth()+1).padStart(2, '0')}${String(dayDate.getDate()).padStart(2, '0')}T${startTime.replace(":", "")}00`,
                end: `${dayDate.getFullYear()}${String(dayDate.getMonth()+1).padStart(2, '0')}${String(dayDate.getDate()).padStart(2, '0')}T${endTime.replace(":", "")}00`,
                location: venue.trim(),
                description: `Section: ${section}\\nInstructor: ${instructor}`,
                byday: ICSDays[day],
                endString: `${yearString}${String(lastDayOfClasses.getMonth()+1).padStart(2, '0')}${String(lastDayOfClasses.getDate()).padStart(2, '0')}`
              })
            }
          }

          const icsData = await convertToICS(events);
          downloadICS(icsData, "schedule.ics");
        }

        alert(`Conversion successful! Check your downloads for the schedule.ics file.`);
      } else {
        alert("Sorry, but the table containing the class schedules couldn't be found. Please ensure you are on the correct page with the class schedule table.");
      }
    } else {
      alert("Sorry, but the table containing the class schedules couldn't be found. Please ensure you are on the correct page with the class schedule table.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Sorry, but there was an issue during the conversion process. Please try again.");
  }
}

function downloadICS(icsData, filename) {
  const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.visibility = "hidden";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function convertToICS(events) {
  let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//AISIS to Calendar//EN\nCALSCALE:GREGORIAN\n";
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  const sequences = await getSequences();
  const updatedSequences = { ...sequences };
  
  for (const event of events) {
    icsContent += "BEGIN:VEVENT\n";
    
    const uid = generateUID(event);
    icsContent += `UID:${uid}\n`;
    icsContent += `DTSTAMP:${timestamp}\n`;
    
    const currentSequence = sequences[uid] || 0;
    const newSequence = currentSequence + 1;
    updatedSequences[uid] = newSequence;
    icsContent += `SEQUENCE:${newSequence}\n`;

    icsContent += `SUMMARY:${event.summary}\n`;
    icsContent += `DTSTART;TZID=Asia/Singapore:${event.start}\n`;
    icsContent += `DTEND;TZID=Asia/Singapore:${event.end}\n`;
    icsContent += `LOCATION:${event.location}\n`;
    icsContent += `DESCRIPTION:${event.description}\n`;
    icsContent += `RRULE:FREQ=WEEKLY;BYDAY=${event.byday};UNTIL=${event.endString}T235959Z\n`;
    icsContent += "END:VEVENT\n";
  }
  icsContent += "END:VCALENDAR";
  
  await saveSequences(updatedSequences);
  
  return icsContent;
}

async function getSequences() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['eventSequences'], (result) => {
      resolve(result.eventSequences || {});
    });
  });
}

async function saveSequences(sequences) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ eventSequences: sequences }, resolve);
  });
}

function generateUID(event) {
  const summary = event.summary.replace(/[^a-zA-Z0-9]/g, '');
  const startTime = event.start.substring(9, 15);
  const days = event.byday.replace(/,/g, '');
  const location = event.location.replace(/[^a-zA-Z0-9]/g, '');
  
  return `${summary}-${startTime}-${days}-${location}@aisis-to-calendar`;
}

function getFirstDayOccurrence(year, month, dayOfWeek) {
  const date = new Date(year, month, 1);
  const firstDayOfMonth = date.getDay();
  const dayDifference = (dayOfWeek - firstDayOfMonth + 7) % 7;
  date.setDate(1 + dayDifference);
  return date;
}

function getFirstDayOccurrenceFromDate(startDate, dayOfWeek) {
  const date = new Date(startDate);
  const currentDay = date.getDay();
  const dayDifference = (dayOfWeek - currentDay + 7) % 7;
  date.setDate(date.getDate() + dayDifference);
  return date;
}

function extractClassesTableFromEnlistment() {
  const tableCells = document.querySelectorAll("td");
  let scheduleTable = null;
  let foundTable = false;
  for (const tableCell of tableCells) {
    const background = tableCell.getAttribute("background");
    const isScheduleInCell = tableCell.textContent.trim().toLowerCase().includes("schedule");

    if (!isScheduleInCell || background !== "images/spacer_lightblue.jpg") continue;

    foundTable = true;
    scheduleTable = tableCell;
    break;
  }

  if (!foundTable) return null;

  scheduleTable = scheduleTable.closest("table");

  return scheduleTable.outerHTML;
}

function extractPage() {
  const classCell = document.querySelector(".classCell");
  if (classCell) {
    return "schedule";
  } else {
    return "enlistment";
  }
}

function extractTermAndYear() {
  const terms = ["1st semester, sy ", "2nd semester, sy ", "intersession, sy "];

  const spanElements = document.querySelectorAll("span");
  let termSpan = null;
  let foundSpan = false;
  for (const spanElement of spanElements) {
    let spanText = spanElement.textContent.trim().toLowerCase();
    if (terms.some(term => spanText.includes(term))) {
      foundSpan = true;
      termSpan = spanElement;
      break;
    }
  }

  if (!foundSpan) return null;

  return termSpan.innerHTML;
}

function extractClassCellsFromSchedule() {
  const classCells = document.querySelectorAll(".classCell");
  const cellsData = [];

  for (const cell of classCells) {
    const style = cell.style;
    const gridRowStart = style.gridRowStart;
    const gridRowEnd = style.gridRowEnd;
    const gridColumnStart = style.gridColumnStart;
    const innerHTML = cell.innerHTML.trim();

    cellsData.push({
      innerHTML: innerHTML,
      gridRowStart: gridRowStart,
      gridRowEnd: gridRowEnd,
      gridColumnStart: gridColumnStart
    });
  }

  return cellsData;
}
