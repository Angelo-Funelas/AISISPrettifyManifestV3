document.addEventListener("DOMContentLoaded", async function () {
  const form = document.querySelector("#scheduleForm");
  const firstDayInput = document.querySelector("#firstDay");
  const lastDayInput = document.querySelector("#lastDay");

  await initializeDates(firstDayInput, lastDayInput);

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    await convertCalendarFromStorage();
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

    window.close();
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

  return `${summary}-${startTime}-${days}-${location}@aisis-to-calendar`;
}

function getFirstDayOccurrenceFromDate(startDate, dayOfWeek) {
  const date = new Date(startDate);
  const currentDay = date.getDay();
  const dayDifference = (dayOfWeek - currentDay + 7) % 7;
  date.setDate(date.getDate() + dayDifference);
  return date;
}
