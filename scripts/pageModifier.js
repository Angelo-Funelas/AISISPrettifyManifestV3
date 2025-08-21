const path = window.location.pathname;

const settings = {
    'home': 'Pretty Site Map',
    'login': 'Pretty Login',
    'nav': 'Pretty Navbar',
    'schedule': 'Pretty Schedule',
    'grades': 'QPI Calculator',
    'enlistPlanr': 'Enlistment Planner',
    'enlistSumm': 'Schedule in Enlistment Summary',
    'filter': 'Class Filter',
}
const setting_ids = Object.keys(settings)
const setting_keys = Object.fromEntries(setting_ids.map(str => ["settings_" + str, true]));

const isEnlistmentSummary = true;
const isHomepage = true;
const isSchedule = path.includes("J_VMCS");
const isIPS = path.includes("J_VIPS");
const isGrades = path.includes("J_VG");

chrome.storage.local.get(setting_keys, function(result) {
    if (result.settings_enlistSumm) {
        if (isEnlistmentSummary) import(chrome.runtime.getURL("/scripts/enlistSumm.js"));
    }
    if (result.settings_schedule) {
        if (isSchedule) import(chrome.runtime.getURL("/scripts/schedule.js"));
    }
    if (result.settings_grades) {
        if (isIPS) import(chrome.runtime.getURL("/scripts/ips.js"));
        if (isGrades) import(chrome.runtime.getURL("/scripts/grades.js"));
    }
})

import(chrome.runtime.getURL("/scripts/secrets.js"));