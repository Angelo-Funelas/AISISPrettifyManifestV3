document.addEventListener("DOMContentLoaded", async function () {
  const form = document.querySelector("#scheduleForm");
  const firstDayInput = document.querySelector("#firstDay");
  const lastDayInput = document.querySelector("#lastDay");

  await initializeDates(firstDayInput, lastDayInput);

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    await chooseConversionMethod();
  });
});

const ScheduleGridTimes = Object.freeze({
  2: "0700",
  4: "0800",
  6: "0900",
  8: "1000",
  10: "1100",
  12: "1200",
  14: "1300",
  16: "1400",
  18: "1500",
  20: "1600",
  22: "1700",
  24: "1800",
  26: "1900",
  28: "2000",
  30: "2100",
  3: "0730",
  5: "0830",
  7: "0930",
  9: "1030",
  11: "1130",
  13: "1230",
  15: "1330",
  17: "1430",
  19: "1530",
  21: "1630",
  23: "1730",
  25: "1830",
  27: "1930",
  29: "2030",
});

const ScheduleGridDays = Object.freeze({
  2: "M",
  3: "T",
  4: "W",
  5: "TH",
  6: "F",
  7: "SAT",
});

const TermDefaultDates = Object.freeze({
  "2nd Semester": {
    firstDay: { month: 0, day: 1 },
    lastDay: { month: 4, day: 31 },
  },
  "1st Semester": {
    firstDay: { month: 7, day: 1 },
    lastDay: { month: 11, day: 31 },
  },
  Intersession: {
    firstDay: { month: 5, day: 1 },
    lastDay: { month: 6, day: 31 },
  },
});

const Days = Object.freeze({
  S: 0,
  M: 1,
  T: 2,
  W: 3,
  TH: 4,
  F: 5,
  SAT: 6,
});

const ICSDays = Object.freeze({
  S: "SU",
  M: "MO",
  T: "TU",
  W: "WE",
  TH: "TH",
  F: "FR",
  SAT: "SA",
});

async function initializeDates(firstDayInput, lastDayInput) {
  try {
    const result = await chrome.storage.local.get([
      "data_idNumber",
      "savedTerm",
      "savedFirstDay",
      "savedLastDay",
    ]);

    const savedTerm = result.savedTerm;

    if (savedTerm) {
      if (result.savedFirstDay && result.savedLastDay) {
        firstDayInput.value = result.savedFirstDay;
        lastDayInput.value = result.savedLastDay;
        return;
      } else {
        alert(
          "Error getting the saved dates for the semester. Please refresh the current page and try again."
        );
      }
    } else {
      alert(
        "Error getting the current semester. Please refresh the current page and try again."
      );
    }
  } catch (error) {
    console.error("Error initializing dates:", error);
    alert(
      "Sorry, but there was an issue during the date processing. Please try again."
    );
  }
}

async function chooseConversionMethod() {
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
      await convertCalendarFromStorage();
    } else if (currentPage === "enlistment") {
      await convertCalendarFromEnlistment();
    } else {
      alert(
        "Sorry, but the current page is not supported for conversion. Please navigate to either the class schedule page or the enlistment summary page."
      );
    }
  } catch (error) {
    console.error("Error choosing conversion method:", error);
    alert(
      "Sorry, but there was an issue during the date processing. Please try again."
    );
  }
}

async function convertCalendarFromStorage() {
  try {
    const result = await chrome.storage.local.get(["data_idNumber"]);
    const idNumber = result.data_idNumber || 0;
    const scheduleData = await chrome.storage.local.get([
      `data_schedule_${idNumber}`,
    ]);

    const schedule = scheduleData[`data_schedule_${idNumber}`];

    if (!schedule || !schedule.gridTable) {
      alert(
        "No schedule data found. Please visit your class schedule page first."
      );
      return;
    }

    const firstDayInput = document.querySelector("#firstDay").value;
    const lastDayInput = document.querySelector("#lastDay").value;

    if (!firstDayInput || !lastDayInput) {
      alert("Please provide both first and last day of classes.");
      return;
    }

    const firstDayOfClasses = new Date(firstDayInput + "T00:00:00");
    const lastDayOfClasses = new Date(lastDayInput + "T00:00:00");

    await chrome.storage.local.set({
      savedFirstDay: firstDayInput,
      savedLastDay: lastDayInput,
    });

    let eventsByKey = new Map();
    const gridTable = schedule.gridTable;

    console.log("gridTable:", gridTable);

    for (let colIndex = 1; colIndex < gridTable.length; colIndex++) {
      const dayColumn = gridTable[colIndex];
      const dayLetter = ScheduleGridDays[colIndex + 1];

      console.log("dayLetter:", dayLetter, "dayColumn:", dayColumn);

      if (!dayLetter) continue;

      for (const cell of dayColumn) {
        if (cell.length === 3) {
          const [courseInfo, startRow, endRow] = cell;

          const parts = courseInfo.split("\n");
          if (parts.length < 2) continue;

          const subject = parts[0].trim();
          const restOfInfo = parts[1].trim();

          const modalityMatch = restOfInfo.match(/\(([^)]+)\)/);
          const modality = modalityMatch ? modalityMatch[1].trim() : "";

          const withoutModality = modalityMatch
            ? restOfInfo.substring(0, modalityMatch.index).trim()
            : restOfInfo.trim();

          const tokens = withoutModality.split(/\s+/);
          const section = tokens[0] || "";
          const venue = tokens.slice(1).join(" ");

          const startTime = ScheduleGridTimes[startRow];
          const endTime = ScheduleGridTimes[endRow];

          if (!startTime || !endTime) continue;

          const dayOfWeek = Days[dayLetter];
          const firstOccurrence = getFirstDayOccurrenceFromDate(
            firstDayOfClasses,
            dayOfWeek
          );

          const startDateTime = `${firstOccurrence.getFullYear()}${String(
            firstOccurrence.getMonth() + 1
          ).padStart(2, "0")}${String(firstOccurrence.getDate()).padStart(
            2,
            "0"
          )}T${startTime}00`;
          const endDateTime = `${firstOccurrence.getFullYear()}${String(
            firstOccurrence.getMonth() + 1
          ).padStart(2, "0")}${String(firstOccurrence.getDate()).padStart(
            2,
            "0"
          )}T${endTime}00`;

          const endString = `${lastDayOfClasses.getFullYear()}${String(
            lastDayOfClasses.getMonth() + 1
          ).padStart(2, "0")}${String(lastDayOfClasses.getDate()).padStart(
            2,
            "0"
          )}`;

          const eventKey = `${subject}|${section}|${startTime}|${endTime}|${venue}|${modality}`;

          if (!eventsByKey.has(eventKey)) {
            eventsByKey.set(eventKey, {
              summary: subject,
              startDateTime: startDateTime,
              endDateTime: endDateTime,
              location: venue,
              description: `Section: ${section}\\nModality: ${modality}`,
              bydays: [],
              endString: endString,
              firstOccurrence: firstOccurrence,
            });
          }

          eventsByKey.get(eventKey).bydays.push(ICSDays[dayLetter]);

          const currentEvent = eventsByKey.get(eventKey);
          if (firstOccurrence < currentEvent.firstOccurrence) {
            currentEvent.firstOccurrence = firstOccurrence;
            currentEvent.startDateTime = startDateTime;
            currentEvent.endDateTime = endDateTime;
          }
        }
      }
    }

    let events = [];
    for (const [key, eventData] of eventsByKey) {
      const sortedBydays = eventData.bydays.sort((a, b) => {
        const icsToDay = {
          SU: 0,
          MO: 1,
          TU: 2,
          WE: 3,
          TH: 4,
          FR: 5,
          SA: 6,
        };
        const dayA = icsToDay[a];
        const dayB = icsToDay[b];

        const firstOccurrenceA = getFirstDayOccurrenceFromDate(
          firstDayOfClasses,
          dayA
        );
        const firstOccurrenceB = getFirstDayOccurrenceFromDate(
          firstDayOfClasses,
          dayB
        );

        return firstOccurrenceA.getTime() - firstOccurrenceB.getTime();
      });

      events.push({
        summary: eventData.summary,
        start: eventData.startDateTime,
        end: eventData.endDateTime,
        location: eventData.location,
        description: eventData.description,
        byday: sortedBydays.join(","),
        endString: eventData.endString,
      });
    }

    if (events.length === 0) {
      alert("No classes found in the schedule.");
      return;
    }

    const icsData = await convertToICS(events);
    downloadICS(icsData, "schedule.ics");

    alert(`Conversion successful! Check your downloads for the ICS file.`);

    window.close();
  } catch (error) {
    console.error("Error:", error);
    alert(
      "Sorry, but there was an issue during the conversion process. Please try again."
    );
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

      let [termAndYear, term, year] = extractComputedTermAndYear(
        termAndYearResults[0].result
      );

      let yearString = year.toString();
      console.log({ term, year, yearString });

      const firstDayInput = document.querySelector("#firstDay").value;
      const lastDayInput = document.querySelector("#lastDay").value;

      if (!firstDayInput || !lastDayInput) {
        alert("Please provide both first and last day of classes.");
        return;
      }

      const firstDayOfClasses = new Date(firstDayInput + "T00:00:00");
      const lastDayOfClasses = new Date(lastDayInput + "T00:00:00");

      await chrome.storage.local.set({
        savedTerm: termAndYear,
        savedFirstDay: firstDayInput,
        savedLastDay: lastDayInput,
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

            if (
              cellText.includes("course code") ||
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

              let firstDayDate = getFirstDayOccurrenceFromDate(
                firstDayOfClasses,
                Days[firstDay]
              );
              let secondDayDate = getFirstDayOccurrenceFromDate(
                firstDayOfClasses,
                Days[secondDay]
              );

              console.log({
                firstDayDate,
                secondDayDate,
                startTime,
                endTime,
                venue,
              });

              let startDate =
                firstDayDate.getTime() < secondDayDate.getTime()
                  ? firstDayDate
                  : secondDayDate;

              let earliestDay =
                firstDayDate.getTime() < secondDayDate.getTime()
                  ? firstDay
                  : secondDay;
              let laterDay = earliestDay === firstDay ? secondDay : firstDay;

              events.push({
                summary: courseCode,
                start: `${startDate.getFullYear()}${String(
                  startDate.getMonth() + 1
                ).padStart(2, "0")}${String(startDate.getDate()).padStart(
                  2,
                  "0"
                )}T${startTime.replace(":", "")}00`,
                end: `${startDate.getFullYear()}${String(
                  startDate.getMonth() + 1
                ).padStart(2, "0")}${String(startDate.getDate()).padStart(
                  2,
                  "0"
                )}T${endTime.replace(":", "")}00`,
                location: venue.trim(),
                description: `Section: ${section}\\nInstructor: ${instructor}`,
                byday: `${ICSDays[earliestDay]},${ICSDays[laterDay]}`,
                endString: `${yearString}${String(
                  lastDayOfClasses.getMonth() + 1
                ).padStart(2, "0")}${String(
                  lastDayOfClasses.getDate()
                ).padStart(2, "0")}`,
              });
            } else {
              let dayDate = getFirstDayOccurrenceFromDate(
                firstDayOfClasses,
                Days[day]
              );

              console.log({ dayDate, startTime, endTime, venue });

              events.push({
                summary: courseCode,
                start: `${dayDate.getFullYear()}${String(
                  dayDate.getMonth() + 1
                ).padStart(2, "0")}${String(dayDate.getDate()).padStart(
                  2,
                  "0"
                )}T${startTime.replace(":", "")}00`,
                end: `${dayDate.getFullYear()}${String(
                  dayDate.getMonth() + 1
                ).padStart(2, "0")}${String(dayDate.getDate()).padStart(
                  2,
                  "0"
                )}T${endTime.replace(":", "")}00`,
                location: venue.trim(),
                description: `Section: ${section}\\nInstructor: ${instructor}`,
                byday: ICSDays[day],
                endString: `${yearString}${String(
                  lastDayOfClasses.getMonth() + 1
                ).padStart(2, "0")}${String(
                  lastDayOfClasses.getDate()
                ).padStart(2, "0")}`,
              });
            }
          }

          const icsData = await convertToICS(events);
          downloadICS(icsData, "schedule.ics");
        }

        alert(
          `Conversion successful! Check your downloads for the schedule.ics file.`
        );
      } else {
        alert(
          "Sorry, but the table containing the class schedules couldn't be found. Please ensure you are on the correct page with the class schedule table."
        );
      }
    } else {
      alert(
        "Sorry, but the table containing the class schedules couldn't be found. Please ensure you are on the correct page with the class schedule table."
      );
    }

    window.close();
  } catch (error) {
    console.error("Error:", error);
    alert(
      "Sorry, but there was an issue during the conversion process. Please try again."
    );
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
  let icsContent =
    "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//AISIS to Calendar//EN\nCALSCALE:GREGORIAN\n";

  icsContent += "BEGIN:VTIMEZONE\n";
  icsContent += "TZID:Asia/Singapore\n";
  icsContent += "BEGIN:STANDARD\n";
  icsContent += "DTSTART:19700101T000000\n";
  icsContent += "TZOFFSETFROM:+0800\n";
  icsContent += "TZOFFSETTO:+0800\n";
  icsContent += "END:STANDARD\n";
  icsContent += "END:VTIMEZONE\n";

  const timestamp =
    new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

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
    chrome.storage.local.get(["eventSequences"], (result) => {
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
  const summary = event.summary.replace(/[^a-zA-Z0-9]/g, "");
  const startTime = event.start.substring(9, 15);
  const days = event.byday.replace(/,/g, "");
  const location = event.location.replace(/[^a-zA-Z0-9]/g, "");
  const description = event.description.replace(/[^a-zA-Z0-9]/g, "");

  return `${summary}-${startTime}-${days}-${location}@aisis-to-calendar`;
}

function getFirstDayOccurrenceFromDate(startDate, dayOfWeek) {
  const date = new Date(startDate);
  const currentDay = date.getDay();
  const dayDifference = (dayOfWeek - currentDay + 7) % 7;
  date.setDate(date.getDate() + dayDifference);
  return date;
}

function extractComputedTermAndYear(termAndYear) {
  let term = termAndYear.split(", SY ")[0].trim();
  let year = termAndYear.split(", SY ")[1].trim().split("-")[1];
  year = parseInt(year, 10);
  if (term.toLowerCase() !== "2nd semester") {
    year -= 1;
  }

  return [termAndYear, term, year];
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

  return scheduleTable.outerHTML;
}

function extractPage() {
  const headerCell = document.querySelector(".header06");
  const headerContent = headerCell ? headerCell.textContent.trim() : "";

  if (headerContent.toLowerCase() === "my class schedule") {
    return "schedule";
  } else if (
    headerContent.toLowerCase() === "summary of enlistment" ||
    headerContent.toLowerCase() === "enlistment summary" ||
    headerContent.toLowerCase() === "confirm enlistment"
  ) {
    return "enlistment";
  }

  return null;
}

function extractTermAndYear() {
  const terms = ["1st semester, sy ", "2nd semester, sy ", "intersession, sy "];

  const spanElements = document.querySelectorAll("span");
  let termSpan = null;
  let foundSpan = false;
  for (const spanElement of spanElements) {
    let spanText = spanElement.textContent.trim().toLowerCase();
    if (terms.some((term) => spanText.includes(term))) {
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
      gridColumnStart: gridColumnStart,
    });
  }

  return cellsData;
}
