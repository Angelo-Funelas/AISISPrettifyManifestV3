let grades_loaded = false;
function load() {
    const title = document.querySelector("body > div > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td:nth-child(2) > table > tbody > tr:nth-child(4) > td > table > tbody > tr:nth-child(2) > td > span.header06").innerText;
    if (title !== "View Grades") return;
    appendGradeExporter();
    if (getUrlParam("export") == 1) {
        grades_loaded = true;

        const grade_exporter_button = document.getElementById('grade-exporter-button');
        const grade_exporter_button_text = grade_exporter_button.querySelector('h4');
        const text_anim = ["Exporting      ", "Exporting .    ", "Exporting . .  ", "Exporting . . ."];
        animate_text(grade_exporter_button_text, text_anim, 500);
        grade_exporter_button.disabled = true;

        chrome.storage.local.get(['data_ips'], function(result) {
            console.log(result)
            if (result.data_ips) {
                openGradeCalculator(result.data_ips)
            } else {
                cacheIPS();
            }
        })
        removeURLParam("export");
    };
}

function cacheIPS() {
    chrome.runtime.sendMessage({
        action: "cacheIPS",
        url: "https://aisis.ateneo.edu/j_aisis/J_VIPS.do?ap_close=1"
    });
    const grade_exporter_button = document.getElementById('grade-exporter-button');
    const grade_exporter_button_text = grade_exporter_button.querySelector('h4');
    const text_anim = ["Caching IPS      ", "Caching IPS .    ", "Caching IPS . .  ", "Caching IPS . . ."];
    animate_text(grade_exporter_button_text, text_anim, 500);
    grade_exporter_button.disabled = true;
}

function updateGradeExporterText(text, disabled) {
    const grade_exporter_button = document.getElementById('grade-exporter-button');
    const grade_exporter_button_text = grade_exporter_button.querySelector('h4');
    grade_exporter_button_text.cancelAnimation();
    grade_exporter_button.disabled = disabled;
    grade_exporter_button_text.innerHTML = text;
}

function animate_text(el, states, interval) {
    el.cancelAnimation = () => {
        if (el.animationInterval) clearInterval(el.animationInterval);
    }
    el.cancelAnimation();
    el.animation_index = 0;
    el.animationInterval = setInterval(() => {
        el.innerHTML = states[el.animation_index].replace(/ /g, "&nbsp;");
        el.animation_index = el.animation_index>=states.length-1?0:el.animation_index+1;
    }, interval);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "IPSCached") {
    openAllGrades();
  }
});

async function getDegree() {
    const { data_degree } = await chrome.storage.local.get('data_degree');
    return data_degree;
}

function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    const res = urlParams.get(param);
    return res
}

function removeURLParam(param) {
    const url = new URL(window.location.href);
    url.searchParams.delete(param);
    window.history.replaceState({}, document.title, url.toString());
}

function addGradeExporterRow() {
    // console.log("Adding Row");
    const referenceRow = document.querySelector("body > div > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td:nth-child(2) > table > tbody > tr:nth-child(5)");
    const newRow = document.createElement("tr");
    const td = document.createElement("td");
    const container = document.createElement("div");
    td.colSpan = 3;
    newRow.id = "grade-calculator-row"
    newRow.append(td);
    td.append(container);
    referenceRow.parentNode.insertBefore(newRow, referenceRow.nextSibling);
    return container;
}

function createGradeExporter() {
    // console.log("Creating Grades Exporter");
    const el = document.createElement("button");
    el.id = "grade-exporter-button"
    const heading = document.createElement("h4");

    el.addEventListener("click", () => {
        exportGrades();
    })

    heading.innerText = "Open QPI Calculator";
    el.appendChild(heading)
    return el;
}

function appendGradeExporter() {
    const checkIfExists = document.getElementById("grade-calculator-row");
    if (!!checkIfExists) return;
    // console.log("Appending Grades Exporter");
    const newRow = addGradeExporterRow();
    const gradeExporter = createGradeExporter();
    const desc = document.createElement("p");
    desc.innerText = "Open your grades in the Ateneo QPI Calculator";
    newRow.append(gradeExporter);
    newRow.append(desc);
}

function exportGrades() {
    const grade_exporter_button = document.getElementById('grade-exporter-button');
    const grade_exporter_button_text = grade_exporter_button.querySelector('h4');
    const text_anim = ["Waiting      ", "Waiting .    ", "Waiting . .  ", "Waiting . . ."];
    animate_text(grade_exporter_button_text, text_anim, 500);
    grade_exporter_button.disabled = true;

    chrome.storage.local.get(['data_ips'], function(result) {
        const ips_loaded = !!result.data_ips;
        if (!ips_loaded) {
            cacheIPS();
        } else {
            openAllGrades();
        }
    })
}
function openAllGrades() {
    const display_button = document.querySelector("body > div > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td:nth-child(2) > table > tbody > tr:nth-child(4) > td > table > tbody > tr:nth-child(3) > td > table > tbody > tr > td > form > table > tbody > tr > td > table > tbody > tr:nth-child(2) > td:nth-child(4) > input");
    const form  = document.querySelector("body > div > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td:nth-child(2) > table > tbody > tr:nth-child(4) > td > table > tbody > tr:nth-child(3) > td > table > tbody > tr > td > form");
    const options = document.querySelectorAll("#firstChoice > option");
    updateGradeExporterText("Loading All Grades.", true)
    for (let option of options) {
        // console.log(option.selected)
        if (option.innerText == "All Grades") {
            if (option.selected) {
                // console.log("Already selected.")
                break;
            };
            form.action += "?export=1"
            option.selected = true;
            display_button.click();
            break;
        }
    }
}

async function openGradeCalculator(ips) {
    const req_body = {
        "program": {
            "program_info": await getDegree(),
            "years": getFormattedYears(ips)
        },
        "grades_data": formatGrades(getGrades())
    }
    // console.log(req_body);
    fetch("https://qpi.alexi.life/api/calculator", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(req_body)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success && data.redirect && data.redirectUrl) {
            window.open(data.redirectUrl, '_blank');
            updateGradeExporterText("Open QPI Calculator", false);
        } else {
            console.error("No redirect URL found:", data);
            updateGradeExporterText("Error: No redirect URL found.", true);
        }
    })
    .catch(err => {
        console.error("POST failed:", err);
        updateGradeExporterText("Error: POST failed.", true);
    });
}

function getFormattedYears(ips) {
    const years = ["First", "Second", "Third", "Fourth", "Fifth", "Sixth"];
    const grade_map = getGrades();
    let res = []
    for (let i = 0; i<years.length; i++) {
        let year_data = {
            year: years[i],
            semesters: []
        }
        for (let sem_i of getSemesterIndexes(i)) {
            const semester = ips[sem_i];
            if (!semester) continue;
            year_data.semesters.push(formatSemester(semester, grade_map));
        }
        if (year_data.semesters.length > 0) {
            res.push(year_data)
        }
    }
    return res;
}

function getSemesterIndexes(yr) {
    if (yr == 0) {
        return [0,1]
    } else {
        return [(yr*3)-1, (yr*3), (yr*3)+1]
    }
}

function formatSemester(sem_data, grade_map) {
    let res = {
        name: sem_data[0][0],
        courses: []
    };
    for (let i = 2; i<sem_data.length-1; i++) {
        const course = sem_data[i];
        const catNo = course[1][0];
        const course_data = {
            id: grade_map.has(catNo)?grade_map.get(catNo).id:crypto.randomUUID(),
            catNo: catNo,
            courseTitle: grade_map.has(catNo)?grade_map.get(catNo).title:catNo,
            units: course[2][0],
            prerequisites: "",
            category: course[3][0]
        };
        res.courses.push(course_data);
    }
    return res;
}

let cached_grades = null;
function getGrades() {
    if (cached_grades) return cached_grades;
    const res = new Map();
    const grade_table = document.querySelector("body > div > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td:nth-child(2) > table > tbody > tr:nth-child(9) > td > table");
    const parsed_grade_table = parseTable(grade_table);
    for (let i = 1; i<parsed_grade_table.length; i++) {
        const course = parsed_grade_table[i]
        const course_data = {
            id: crypto.randomUUID(),
            sy: course[0][0],
            sem: course[1][0],
            course: course[2][0],
            code: course[3][0],
            title: course[4][0],
            units: course[5][0],
            grade: course[6][0],
        };
        res.set(course_data.code, course_data);
    }
    cached_grades = res;
    // console.log(res)
    return res;
}

function formatGrades(grades) {
    let res = {};
    for (const [key, subj] of grades) {
        res[subj.id] = subj.grade
    }
    return res;
}

chrome.storage.local.get({'settings_grades': true}, function(result) {
    if (result.settings_grades) {
        if (document.readyState !== 'loading') return load()
        document.addEventListener('DOMContentLoaded', load)
    }
})