var onAisis = false;
var activeTab = null
chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
    activeTab = tabs[0];
    if (activeTab.url.includes('aisis.ateneo.edu')) {
        onAisis = true;
        document.getElementById('settings-filter').disabled = false

        chrome.storage.local.get(['disable_filter'], function(result) {
            document.getElementById('settings-filter').checked = result.disable_filter
        });
        chrome.storage.local.get(['show_schedule'], function(result) {
            document.getElementById('settings-schedule').checked = result.show_schedule
        });
        document.getElementById('settings-filter').addEventListener('change', function() {
            var input = document.getElementById('settings-filter');
            chrome.storage.local.set({disable_filter: input.checked});
            chrome.tabs.sendMessage(activeTab.id, {reload: true});
        });
        document.getElementById('settings-schedule').addEventListener('change', function() {
            var input = document.getElementById('settings-schedule');
            chrome.storage.local.set({show_schedule: input.checked});
        });
    }
    
});
