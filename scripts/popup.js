var onAisis = false;
var activeTab = null
chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
    activeTab = tabs[0];
    if (activeTab.url.includes('aisis.ateneo.edu')) {
        onAisis = true;
        document.getElementById('settings-filter').disabled = false
        document.getElementById('settings-schedule').disabled = false
        document.getElementById('settings-dropdown').disabled = false
        document.getElementById('settings-home').disabled = false
        document.getElementById('settings-login').disabled = false

        chrome.storage.local.get(['disable_filter'], function(result) {
            document.getElementById('settings-filter').checked = result.disable_filter
        });
        chrome.storage.local.get(['disable_schedule'], function(result) {
            document.getElementById('settings-schedule').checked = result.disable_schedule
        });
        chrome.storage.local.get(['disable_dropdownSort'], function(result) {
            document.getElementById('settings-dropdown').checked = result.disable_dropdownSort
        });
        chrome.storage.local.get(['disable_homepage'], function(result) {
            document.getElementById('settings-home').checked = result.disable_homepage
        });
        chrome.storage.local.get(['disable_login'], function(result) {
            document.getElementById('settings-login').checked = result.disable_login
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
        document.getElementById('settings-home').addEventListener('change', function() {
            var input = document.getElementById('settings-home');
            chrome.storage.local.set({disable_homepage: input.checked});
            chrome.tabs.sendMessage(activeTab.id, {reload: true});
        });
        document.getElementById('settings-login').addEventListener('change', function() {
            var input = document.getElementById('settings-login');
            chrome.storage.local.set({disable_login: input.checked});
            chrome.tabs.sendMessage(activeTab.id, {reload: true});
        });
    }
    
});
