let cachingIPS = false;
let cachingTabID = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "cacheIPS") {
    cachingIPS = true;
    cachingTabID = sender.tab.id;
    chrome.tabs.create({
      url: message.url,
      active: false
    });
  } else if (message.action === "cachedIPS" && cachingTabID !== null ) {
    chrome.tabs.sendMessage(cachingTabID, {
        action: "IPSCached"
    })
  }
});

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
        // First time install
        chrome.tabs.create({
            url: "/html/welcome.html" // or any page in your extension
        });
    } else if (details.reason === "update") {
        // Extension updated
        chrome.tabs.create({
            url: "/html/update.html"
        });
        chrome.storage.local.get({"data_welcome_shown": false}, (result) => {
          if (!result.data_welcome_shown) {
            chrome.tabs.create({
                url: "/html/welcome.html" // or any page in your extension
            });
          }
        })
    }
});