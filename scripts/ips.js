async function loadIPS() {
    const title = document.querySelector("body > div > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td:nth-child(2) > table > tbody > tr:nth-child(4) > td > table > tbody > tr:nth-child(2) > td > span.header06")?.innerText;
    if (title !== "Individual Program of Study") return;
    const ips = getSemesterTables();
    chrome.storage.local.get({"settings_enlistPlanr": true}, function(result) {
        if (result.settings_enlistPlanr) loadEnlistmentPlanner();
    });
    const idNumber = await new Promise((resolve) => {
        chrome.storage.local.get({'data_idNumber': 0}, (result) => {
            resolve(result.data_idNumber);
        });
    });
    await chrome.storage.local.set({[`data_ips_${idNumber}`]: organizeSemesterData(ips)});
    if (getUrlParam("ap_close") == 1) {     
        chrome.runtime.sendMessage({
            action: "cachedIPS"
        });
        window.close();
    }
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

function getSemesterTables() {
    const tables = document.querySelectorAll("table.needspadding:has(> tbody > tr > td.text04)");
    let res = [] 
    for (let table of tables) {
        if (isSemesterTable(table)) { res.push(parseTable(table, false)); };
    }
    return res;
}

function isSemesterTable(table) {
    const table_heading = table.querySelector(".text04");
    if (!table_heading) return false;
    return table_heading.innerText.includes("Semester") || table_heading.innerText.includes("Intersession");
}

function organizeSemesterData(ips) {
    const res = Array(17).fill(null);
    let yr = 0;
    let sem;
    for (let semester of ips) {
        let name = semester[0][0][0];
        if (name.includes("First")) yr++;
        sem = (name.includes("First"))?0:(name.includes("Second"))?1:2;
        res[((yr-1)*3)+sem] = semester;
    }
    return res;
}

function getEnlistingSemester(ips) {
    let yr = 0;
    let sem;
    for (let semester of ips) {
        let name = semester[0][0][0];
        if (name.includes("First")) yr++;
        if (semester[2][0][0] == "N") {
            sem = (name.includes("Intersession"))?0:(name.includes("First"))?1:2;
            break;
        }
    }
    return [(name.includes("Intersession"))?yr+1:yr, sem];
}

function formatCoursesData(sem_data) {
     let res = [];
    for (let i = 0; i<sem_data.length; i++) {
        const course = sem_data[i];
        const catNo = course[1][0];
        const course_data = {
            id: crypto.randomUUID(),
            catNo: catNo,
            courseTitle: catNo,
            units: course[2][0],
            prerequisites: "",
            category: course[3][0]
        };
        res.push(course_data);
    }
    return res;
}

async function loadEnlistmentPlanner() {
    let sem_check_data = await fetch('https://schedule.alexi.life/api/semester')
    .then((res) => res.json())
    .catch(() => {
        return null;
    });
    if (!(sem_check_data !== null && sem_check_data.success)) return;
    sem_check_data = sem_check_data.data
    const data_update_date = new Date(sem_check_data.lastUpdated);
    const days_since_update = (Date.now()-data_update_date)/1000/60/60/24;
    if (days_since_update>21) return;
    const sem_table = findUnenlistedSem();
    const table_heading = sem_table.querySelector('tr > td').innerText
    const sem_index = semesterNameToIndex(table_heading);
    const api_sem_index = semesterNameToIndex(sem_check_data.semesterString);
    const previous_sem = (sem_index-1<0) ? 2 : (sem_index-1)
    console.log(previous_sem, sem_index, api_sem_index, sem_table)
    if (api_sem_index == previous_sem) return;
    appendButtonToTable(sem_table);
}

function appendButtonToTable(table) {
    const button = document.createElement("button");
    const newRow = document.createElement("tr");
    const td = document.createElement("td");
    const h4 = document.createElement("h4");

    h4.innerText = "Plan Enlistment";
    button.className = "enlistment-planner-button";
    td.colSpan = 7;
    button.addEventListener('click', () => {
        const parsed_table = parseTable(table);
        let cleaned_parsed_table = [];
        for (const row of parsed_table) {
            if (row.length < 4) continue;
            if (row[0][0].includes("Units Taken")) continue;
            if (row[0][0] == "Status") continue;
            cleaned_parsed_table.push(row);
        }
        planEnlistment(cleaned_parsed_table);
    });

    button.append(h4)
    td.append(button);
    newRow.append(td);
    table.querySelector("tbody").append(newRow);
}

function planEnlistment(sem_data) {
    const req_body = {
        "courses": formatCoursesData(sem_data)
    }
    fetch("https://schedule.alexi.life/api/schedule", {
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
        } else {
            console.log("No redirect URL found:", data);
        }
    })
}

function semesterNameToIndex(name) {
    if (!name) return null;
    if (name.includes("Intersession")) return 0;
    if (name.includes("First")) return 1;
    if (name.includes("Second")) return 2;
}

function findUnenlistedSem() {
    const tables = document.querySelectorAll("table.needspadding:has(> tbody > tr > td.text04)");
    for (let table of tables) {
        if (!isSemesterTable(table)) continue;
        let isUnenlisted = false;
        const rows = table.querySelectorAll("tr")
        for (let row of rows) {
            if (row.querySelectorAll('td').length < 4) continue;
            const firstCol = row.querySelector('td').innerText;
            if (firstCol == "Status" || firstCol.includes("Units")) continue;
            const status = row.querySelector('td > a')?.innerText;
            if (status == 'N') {
                isUnenlisted = true;
                break;
            };
        }
        if (isUnenlisted) return table;
    }
    return null;
}

// find table with all N

if (document.readyState !== 'loading') loadIPS()
document.addEventListener('DOMContentLoaded', loadIPS)
