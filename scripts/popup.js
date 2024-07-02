var onAisis = false;
var activeTab = null
chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
    activeTab = tabs[0];
    if (activeTab.url.includes('aisis.ateneo.edu')) {
        onAisis = true;
        document.getElementById('settings-filter').disabled = false
        document.getElementById('settings-schedule').disabled = false
        document.getElementById('settings-dropdown').disabled = false

        chrome.storage.local.get(['disable_filter'], function(result) {
            document.getElementById('settings-filter').checked = result.disable_filter
        });
        chrome.storage.local.get(['disable_schedule'], function(result) {
            document.getElementById('settings-schedule').checked = result.disable_schedule
        });
        chrome.storage.local.get(['disable_dropdownSort'], function(result) {
            document.getElementById('settings-dropdown').checked = result.disable_dropdownSort
        });
        document.getElementById('settings-filter').addEventListener('change', function() {
            var input = document.getElementById('settings-filter');
            chrome.storage.local.set({disable_filter: input.checked});
            chrome.tabs.sendMessage(activeTab.id, {reload: true});
        });
        document.getElementById('settings-schedule').addEventListener('change', function() {
            var input = document.getElementById('settings-schedule');
            chrome.storage.local.set({disable_schedule: input.checked});
            chrome.tabs.sendMessage(activeTab.id, {reload: true});
        });
        document.getElementById('settings-dropdown').addEventListener('change', function() {
            var input = document.getElementById('settings-dropdown');
            chrome.storage.local.set({disable_dropdownSort: input.checked});
            chrome.tabs.sendMessage(activeTab.id, {reload: true});
        });
    }
    
});
