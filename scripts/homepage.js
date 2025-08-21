const icon_map = {
    'GOOGLE ACCOUNT':`google`,
    'MY INDIVIDUAL PROGRAM OF STUDY':`ips`,
    'PRINT TUITION RECEIPT':`print`,
    'OFFICIAL CURRICULUM':`curriculum`,
    'UPDATE STUDENT INFORMATION':`studentinfo`,
    'MY CURRENTLY ENROLLED CLASSES':`classes`,
    'MY GRADES':`grades`,
    'MY HOLD ORDERS':`holdorder`,
    'DOWNLOAD CHANGE DEGREE PROGRAM FORM':`change`,
    'MY CLASS SCHEDULE':`schedule`,
    'CHANGE PASSWORD':`password`,
    'CLASS SCHEDULE':`list`,
    'ENLIST IN CLASS':`enlist`,
    'COURSE AND FACULTY EVALUATION': `evaluation`,
    'PRINT SAA': `print`
}
const short_headings = new Map(Object.entries({
    'GOOGLE ACCOUNT':`GOOGLE ACCOUNT`,
    'MY INDIVIDUAL PROGRAM OF STUDY':`MY IPS`,
    'PRINT TUITION RECEIPT':`TUITION RECEIPT`,
    'OFFICIAL CURRICULUM':`OFFICIAL CURRICULUM`,
    'UPDATE STUDENT INFORMATION':`STUDENT INFORMATION`,
    'MY CURRENTLY ENROLLED CLASSES':`ENROLLED CLASSES`,
    'MY GRADES':`MY GRADES`,
    'MY HOLD ORDERS':`HOLD ORDERS`,
    'DOWNLOAD CHANGE DEGREE PROGRAM FORM':`CHANGE DEG. PROGR. FORM`,
    'MY CLASS SCHEDULE':`MY SCHEDULE`,
    'CHANGE PASSWORD':`CHANGE PASSWORD`,
    'CLASS SCHEDULE':`OFFERED CLASSES`,
    'ENLIST IN CLASS':`ENLIST IN CLASS`,
    'COURSE AND FACULTY EVALUATION': `EVALUATION`,
    'FACULTY ATTENDANCE': 'FACULTY ATTENDANCE',
    'PRINT SAA': `PRINT SAA`
}))

const group_headings = ["Quick Access", "Academic Records", "Account & Settings", "Print & Documents"];
const groupings = new Map(Object.entries({
    'GOOGLE ACCOUNT': 2,
    'MY INDIVIDUAL PROGRAM OF STUDY': 0,
    'PRINT TUITION RECEIPT': 3,
    'OFFICIAL CURRICULUM': 1,
    'UPDATE STUDENT INFORMATION': 2,
    'MY CURRENTLY ENROLLED CLASSES': 1,
    'MY GRADES': 0,
    'MY HOLD ORDERS': 2,
    'DOWNLOAD CHANGE DEGREE PROGRAM FORM': 3,
    'MY CLASS SCHEDULE': 0,
    'CHANGE PASSWORD': 2,
    'CLASS SCHEDULE': 1,
    'ENLIST IN CLASS': 0,
    'COURSE AND FACULTY EVALUATION': 1,
    'FACULTY ATTENDANCE': 1,
    'PRINT SAA': 3
}))

const importantLinks = new Set(["ENLIST IN CLASS"])

function removeSideTable() {
    const leftPanel = document.querySelector("body > div:nth-child(3) > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td:nth-child(2) > table > tbody > tr:nth-child(5) > td.text04");
    if (!leftPanel) return;
    leftPanel.remove()
    const rightPanel = document.querySelector("body > div:nth-child(3) > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td:nth-child(2) > table > tbody > tr:nth-child(5) > td");
    if (!rightPanel) return;
    const rightPanelTable = rightPanel.querySelector("table");
    
    rightPanel.width = "100%";
    rightPanelTable.width = "100%";
}

function isHomePage() {
    const sitemap = document.querySelectorAll('table')[11]
    const parsedTable = parseTable(sitemap)
    return (!!parsedTable && parsedTable[0][0][0] == 'Site Map' && (parsedTable.length-1>8));
}

async function cacheDegree() {
    const degree = document.querySelectorAll("span.text04:has(+ span.text05)")[2].textContent;
    chrome.storage.local.set({[`data_degree`]: degree});
}

function prettifyHome() {
    if (!isHomePage()) return;
    const sitemap = document.querySelectorAll('table')[11]
    sitemap.style.display = "none";
    const parsedTable = parseTable(sitemap)
    removeSideTable();
    cacheDegree();
    try {
        let newSiteMap = document.querySelector('#ap-sitemap')
        if (newSiteMap==undefined) {
            newSiteMap = document.createElement('div')
            newSiteMap.id = 'ap-sitemap'
            sitemap.parentElement.append(newSiteMap)
        } else {
            newSiteMap.replaceChildren();
        }
        const reminder = document.querySelectorAll(".header08")[1]?.textContent;
        newSiteMap.append(createReminder([reminder]));
        appendSchedule(newSiteMap);
        let grouped_links = []
        for (let i=0; i<group_headings.length; i++) {
            grouped_links.push([]);
        }
        for (let i=1;i<parsedTable.length;i++) {
            const navData = parsedTable[i];
            const link = createHomeLink(navData);
            const grp_index = (groupings.has(link.og_heading))?groupings.get(link.og_heading):group_headings.length-1;
            grouped_links[grp_index].push(link);
        }
        const link_grp_container = document.createElement("div");
        const link_grp_header = document.createElement("h3");
        link_grp_header.innerText = "Site Map";
        link_grp_container.append(link_grp_header);
        link_grp_container.classList.add("link-grp-cont")
        newSiteMap.append(link_grp_container);
        for (let i=0; i<grouped_links.length; i++) {
            link_grp_container.append(createLinkGroup(group_headings[i], grouped_links[i]));
        }
        // const uselessNoteEl = document.querySelectorAll(".text04")[7];
        // uselessNoteEl && (uselessNoteEl.innerText = uselessNoteEl.innerText.replace("Access all the information you need with just a click of your mouse!\n\n\n",""));
        const header08 = document.querySelectorAll(".header08")[1];
        if (header08) header08.style.display = "none";
        return true
    } catch (err) {
        sitemap.style.display = "";
        console.error(err)
        return false;
    }
}

function highlightMessage(message, highlights) {
    if (!message) return;
    if (!Array.isArray(highlights) || highlights.length === 0) return message;

    // Escape special characters for use in a RegExp
    const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Create a single regex pattern that matches any highlight word
    const pattern = highlights.map(escapeRegExp).join('|');
    const regex = new RegExp(`(${pattern})`, 'gi');

    // Replace each match with a span
    return message.replace(regex, '<span class="highlight">$1</span>');
}


function createCredits() {
    let header = document.createElement('div');
    let headerh = document.createElement('h2');
    let headera = document.createElement('a');
    let headerp = document.createElement('p');
    let manifest = chrome.runtime.getManifest();
    headerh.innerText = `AISIS Prettify v${manifest.version}`;
    headerp.innerText = 'by Gelo Funelas';
    headera.href = 'https://gemplo.com';
    headera.target = '_blank';
    headera.appendChild(headerp);
    header.append(headerh,headera);
    header.classList.add("credits");
    return header
}

function createHomeLink(data) {
    const link = document.createElement('a');
    const navElement = document.createElement('div');
    const elIconCont = document.createElement('div');
    const elIcon = document.createElement('img');
    const elHeading = document.createElement('h3');
    if (data == []) return;
    const heading = data[0][0];
    link.og_heading = heading;
    navElement.og_heading = heading;

    navElement.className = 'nav-el'
    const icon_file = (icon_map[heading] !== undefined)?`${icon_map[heading]}.png`:'empty.png';
    elIcon.src = chrome.runtime.getURL(`/images/icons/${icon_file}`);
    elIconCont.append(elIcon);

    elHeading.innerText = (short_headings.has(heading))?short_headings.get(heading):heading;
    if (importantLinks.has(heading)) navElement.classList.add('home-highlight');
    navElement.append(elIconCont,elHeading)
    if (data[0].length>1) {
        link.href = data[0][1].href;
        link.appendChild(navElement);
        return link;
    } else {
        return navElement;
    }
}

function createLinkGroup(heading, links) {
    const grp_container = document.createElement("div");
    const heading_el = document.createElement("h4");
    grp_container.classList.add("link-group")
    heading_el.innerText = heading;
    grp_container.append(heading_el);
    for (let link of links) {
        grp_container.append(link);
    }
    return grp_container
}

const highlighted_words = ["Reminder:", "online syllabus", "printed copy", "soft copy"]
function createReminder(reminders) {
    const container = document.createElement("div");
    container.classList.add("reminder")
    for (const reminder of reminders) {
        const r = document.createElement("p");
        r.innerHTML = highlightMessage(reminder, highlighted_words) || "";
        container.append(r);
    }
    return container;
}

async function appendSchedule(container) {
    const sched_cont = document.createElement("div");
    const sched_header = document.createElement("h3");
    sched_header.innerText = "Schedule";
    sched_cont.append(sched_header);
    sched_cont.classList.add("schedule")
    sched_cont.append(await createSchedule());
    const existingSchedule = document.querySelectorAll(".schedule");
    if (!!existingSchedule) existingSchedule.forEach((item) => {item.remove()});
    const existingCredits = document.querySelectorAll(".credits");
    if (!!existingCredits) existingCredits.forEach((item) => {item.remove()});
    container.append(sched_cont);
    container.append(createCredits());
}

const subjectColors = ['3DC2EC', '4B70F5', '4C3BCF', '402E7A', '3ABEF9', '3572EF','050C9C', '153448', '3C5B6F'];
const days = ["Time", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat"];
async function createSchedule() {
    const idNumber = await new Promise((resolve) => {
        chrome.storage.local.get({'data_idNumber': 0}, (result) => {
            resolve(result.data_idNumber);
        });
    });
    const schedule = await new Promise((resolve) => {
        const key = `data_schedule_${idNumber}`
        chrome.storage.local.get({[key]: null}, (result) => {
            resolve(result[key]);
        });
    });    
    var gridSchedule = document.createElement('div')
    let gridTable, subjects, start, end;
    if (schedule == null) {
        const msg = document.createElement("p");
        msg.className = "sched-msg"
        msg.innerText = "Open \"My Schedule\" at least once to show schedule";
        gridSchedule.append(msg);
        gridTable = []
        start = 7;
        end = 24;
    } else {
        gridTable = schedule.gridTable;
        subjects = new Map(Object.entries(schedule.subjects)); 
        [start, end] = getSchedStartEnd(gridTable);
    }

    gridSchedule.id = "prettyGrid"
    gridSchedule.style.gridTemplateRows = `32px repeat(${end-start+1}, 25px)`
    
    for (let i=0;i<end-start+1;i++) {
        var gridLine = document.createElement('div')
        gridLine.className = 'gridLine'
        gridLine.style.gridRow = i+1
        gridSchedule.append(gridLine)
    }
    for (let i=0;i<days.length;i++) {
        var heading = document.createElement('p')
        heading.className = 'headCell'
        heading.style.gridColumn = i+1
        heading.innerText = days[i]
        gridSchedule.append(heading)
    }
    for (let i=0;i<gridTable.length;i++) {
        for (let j=0;j<gridTable[i].length;j++) {
            if (i==0) {
                if (j<start) continue;
                if (j>end) break;
                if (j%2==0) {
                    var cont = document.createElement('div')
                    var time = document.createElement('p')
                    cont.className = 'timeCell'
                    var timeStr = gridTable[0][j][0].split("-")[0]
                    time.innerText = to12hr(timeStr.slice(0, -2)) + ':' + timeStr.slice(-2);
                    cont.style.gridRow = gridTable[0][j][1]-start
                    cont.appendChild(time)
                    gridSchedule.append(cont)
                }
            } else {
                var classBlock = document.createElement('div')
                classBlock.className = 'classCell'
                classBlock.style.backgroundColor = `#${subjectColors[subjects.get(gridTable[i][j][0])]}`
                classBlock.innerText = gridTable[i][j][0].replace("(FULLY ONSITE)", "")
                classBlock.style.gridColumn = i+1
                classBlock.style.gridRowStart = gridTable[i][j][1]-start
                classBlock.style.gridRowEnd = gridTable[i][j][2]-start
                gridSchedule.append(classBlock)
            }
        }
    
    }
    return gridSchedule
}

function getSchedStartEnd(sched) {
    let start = 99;
    let end = -1;
    for (let i=1; i<sched.length;i++) {
        const day_classes = sched[i];
        for (let j=0; j<day_classes.length;j++) {
            const day_class = day_classes[j];
            start = Math.min(day_class[1], start);
            end = Math.max(day_class[2], end);
        }
    }
    return [start-2, end-2];
}

chrome.storage.local.get({"settings_home": true}, (result) => {
    if (!result.settings_home) return;
    const mutationObserver = new MutationObserver((mutations, obs) => {
        if (isHomePage()) {
            prettifyHome();
            obs.disconnect();
        }
    })
    mutationObserver.observe(document, {
        childList: true,
        subtree: true
    })
    document.addEventListener('DOMContentLoaded', function() {
        prettifyHome();
    })
})
