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

function extractComputedTermAndYear(termAndYear) {
  let term = termAndYear.split(", SY ")[0].trim();
  let year = termAndYear.split(", SY ")[1].trim().split("-")[1];
  year = parseInt(year, 10);
  if (term.toLowerCase() !== "2nd semester") {
    year -= 1;
  }
  return [termAndYear, term, year];
}

function extractTermAndYear() {
  const terms = ["1st semester, sy ", "2nd semester, sy ", "intersession, sy "];
  const spanElements = document.querySelectorAll("span");
  
  for (const spanElement of spanElements) {
    let spanText = spanElement.textContent.trim().toLowerCase();
    if (terms.some((term) => spanText.includes(term))) {
      return spanElement.innerHTML;
    }
  }
  return null;
}

function cacheTermInfo() {
  const termAndYearHTML = extractTermAndYear();
  if (!termAndYearHTML) return;
  
  const [termAndYear, term, year] = extractComputedTermAndYear(termAndYearHTML);
  const defaults = TermDefaultDates[term];
  
  if (defaults) {
    const firstDay = new Date(year, defaults.firstDay.month, defaults.firstDay.day);
    const lastDay = new Date(year, defaults.lastDay.month, defaults.lastDay.day);
    
    const formatLocalDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };
    
    chrome.storage.local.set({
      savedTerm: termAndYear,
      savedFirstDay: formatLocalDate(firstDay),
      savedLastDay: formatLocalDate(lastDay)
    });
  }
}

if (document.readyState !== 'loading') {
  cacheTermInfo();
} else {
  document.addEventListener('DOMContentLoaded', cacheTermInfo);
}