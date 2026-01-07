let activeTab = null;
const settings = {
    'home': 'Pretty Site Map',
    'login': 'Pretty Login',
    'nav': 'Pretty Navbar',
    'schedule': 'Pretty Schedule',
    'grades': 'QPI Calculator',
    'enlistPlanr': 'Enlistment Planner',
    'enlistSumm': 'Schedule in Enlistment Summary',
    'filter': 'Class Filter',
    'calendar': 'Calendar Converter',
}
const setting_ids = Object.keys(settings)
const setting_keys = Object.fromEntries(setting_ids.map(str => ["settings_" + str, true]));

function loadSettings() {
    for (const setting of setting_ids) {
        const main = document.querySelector("main");
        main.append(createSettingEl(setting))
    }
}

loadSettings();
chrome.storage.local.get(setting_keys, function(result) {
    for (const setting of setting_ids) {
        document.getElementById(`setting-${setting}`).checked = result[`settings_${setting}`]
    }
});


function createSettingEl(name) {
    const el = document.createElement("div");
    const label = document.createElement("label");
    const input = document.createElement("input");
    const slider = document.createElement("span");
    const text = document.createElement("p");

    label.className = "switch";
    input.type = "checkbox";
    input.id = `setting-${name}`;
    input.disabled = true;
    slider.classList.add("slider", "round");
    text.className = "setting-checkbox-p";
    text.innerText = settings[name];

    label.append(input, slider);
    el.append(label, text);

    input.addEventListener('change', (e) => {
        chrome.storage.local.set({[`settings_${name}`]: e.target.checked});
        chrome.tabs.sendMessage(activeTab.id, {reload: true});
    });

    return el
}

chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
    activeTab = tabs[0];
    if (!activeTab.url.includes('aisis.ateneo.edu')) return;
    for (const setting of setting_ids) {
        document.getElementById(`setting-${setting}`).disabled = false;
    }
});
