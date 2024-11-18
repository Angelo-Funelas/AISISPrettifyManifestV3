var activeTab = null
chrome.storage.local.get([
    'disable_filter', 'disable_schedule', 'disable_dropdownSort', 'disable_home', 'disable_login', 'disable_enlistSumm'
], function(result) {
    document.getElementById('settings-filter').checked = !result.disable_filter
    document.getElementById('settings-schedule').checked = !result.disable_schedule
    document.getElementById('settings-dropdown').checked = !result.disable_dropdownSort
    document.getElementById('settings-home').checked = !result.disable_home
    document.getElementById('settings-login').checked = !result.disable_login
    document.getElementById('settings-enlistSumm').checked = !result.disable_enlistSumm
});
chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
    activeTab = tabs[0];
    if (!activeTab.url.includes('aisis.ateneo.edu')) return;
    document.getElementById('settings-filter').disabled = false
    document.getElementById('settings-schedule').disabled = false
    document.getElementById('settings-dropdown').disabled = false
    document.getElementById('settings-home').disabled = false
    document.getElementById('settings-login').disabled = false
    document.getElementById('settings-enlistSumm').disabled = false

    const settings = ['filter','schedule','dropdown','home','login','enlistSumm']
    for (let i=0;i<settings.length;i++) {
        const elId = `settings-${settings[i]}`;
        document.getElementById(elId).addEventListener('change', function() {
            var input = document.getElementById(elId);
            chrome.storage.local.set({[`disable_${settings[i]}`]: !input.checked});
            chrome.tabs.sendMessage(activeTab.id, {reload: true});
        });
    }
});
