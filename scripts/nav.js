function cleanNav() {
    const style = document.createElement("style");
    style.textContent = `
        body > div > table > tbody > tr:nth-child(1) > td > table > tbody > tr:nth-child(2),
        body > div:nth-child(3) > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(1),
        body > div:nth-child(3) > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td:nth-child(2) > table > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(2),
        body > div:nth-child(3) > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td:nth-child(2) > table > tbody > tr:nth-child(4) {
            display: none;
        }
        body > div:nth-child(3) > table > tbody > tr:nth-child(1) > td > table > tbody > tr:nth-child(1) > td > table > tbody > tr > td,
        body > div > table > tbody > tr:nth-child(1) > td > table > tbody > tr:nth-child(1) > td > table > tbody > tr > td {
            background: #274f97;
        }
        body > div:nth-child(3) > table > tbody > tr:nth-child(1) > td > table > tbody > tr:nth-child(1) > td > table > tbody > tr > td > img,
        body > div > table > tbody > tr:nth-child(1) > td > table > tbody > tr:nth-child(1) > td > table > tbody > tr > td > img {
            visibility: hidden;
            opacity: 0;
        }
        body > div:nth-child(3) > table > tbody > tr:nth-child(1) > td > table > tbody > tr:nth-child(1) > td > table,
        body > div > table > tbody > tr:nth-child(1) > td > table > tbody > tr:nth-child(1) > td > table { 
            box-shadow: rgba(145, 145, 145, 0.25) 0px 0px 4px 1px;
        }
        body > div:nth-child(3) > table > tbody > tr:nth-child(1) > td > table > tbody > tr:nth-child(1) > td > table > tbody > tr > td:nth-child(4) > table > tbody > tr:nth-child(1) > td > img,
        body > div > table > tbody > tr:nth-child(1) > td > table > tbody > tr:nth-child(1) > td > table > tbody > tr > td:nth-child(4) > table > tbody > tr:nth-child(1) > td > img {
            visibility: hidden;
            opacity: 0;
        }
        body > div:nth-child(3) > table > tbody > tr:nth-child(1) > td > table > tbody > tr:nth-child(1) > td > table > tbody > tr > td:nth-child(2) > h3,
        body > div > table > tbody > tr:nth-child(1) > td > table > tbody > tr:nth-child(1) > td > table > tbody > tr > td:nth-child(2) > h3 {
            white-space: nowrap;
            color: white;
            margin: 0;
            font-family: 'Inter', sans-serif;
            font-weight: bold;
            font-size: 100%;
        }`
    document.head?.append(style)
    loadNavTitle();
}

function loadNavTitle() {
    const navTitle = document.querySelector("body > div:nth-child(3) > table > tbody > tr:nth-child(1) > td > table > tbody > tr:nth-child(1) > td > table > tbody > tr > td:nth-child(2)") || document.querySelector("body > div > table > tbody > tr:nth-child(1) > td > table > tbody > tr:nth-child(1) > td > table > tbody > tr > td:nth-child(2)");
    if (!navTitle) return;
    navTitle.innerHTML = "";
    const title = document.createElement("h3");
    title.innerText = "AISIS ONLINE";
    navTitle.append(title);
}

chrome.storage.local.get({'settings_nav': true}, function(result) {
    if (!result.settings_nav) return;
    const mutationObserver = new MutationObserver((mutations, obs) => {
        if (document.head !== undefined) {
            cleanNav();
            obs.disconnect();
        }
    })
    mutationObserver.observe(document, {
        childList: true,
        subtree: true
    })
    document.addEventListener('DOMContentLoaded', function() {
        cleanNav();
    })
})