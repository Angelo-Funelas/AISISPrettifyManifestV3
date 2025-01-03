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
const importantLinks = new Set(["ENLIST IN CLASS"])

function prettifyHome() {
    var sitemap = document.getElementsByTagName('table')[11]
    parsedTable = parseTable(sitemap)
    if (!parsedTable || parsedTable[0][0][0] !== 'Site Map') return false;
    sitemap.classList.add('hidden')
    try {
        var newSiteMap = document.querySelector('#ap-sitemap')
        if (newSiteMap==undefined) {
            newSiteMap = document.createElement('div')
            newSiteMap.id = 'ap-sitemap'
            sitemap.parentElement.append(newSiteMap)
        } else {
            while(newSiteMap.firstChild && newSiteMap.removeChild(newSiteMap.firstChild));
        }

        for (let i=1;i<parsedTable.length;i++) {
            var navData = parsedTable[i]
            var link = document.createElement('a')
            var navElement = document.createElement('div')
            var elIcon = document.createElement('img')
            var elHeading = document.createElement('h3')
            var elDesc = document.createElement('p')

            if (icon_map[navData[0][0]] !== undefined) {
                elIcon.src = chrome.runtime.getURL(`/images/icons/${icon_map[navData[0][0]]}.png`)
            } else {
                elIcon.src = chrome.runtime.getURL(`/images/icons/empty.png`)
            }
            elHeading.innerText = navData[0][0]
            if (importantLinks.has(navData[0][0])) navElement.className = 'home-highlight'
            elDesc.innerText = navData[1]
            navElement.append(elIcon,elHeading,elDesc)
            if (navData[0].length>1) {
                link.href = navData[0][1].href
                link.appendChild(navElement)
                newSiteMap.appendChild(link)
            } else {
                newSiteMap.appendChild(navElement)
            }
        }
        var header = document.createElement('div')
        var headerh = document.createElement('h2')
        var headera = document.createElement('a')
        var headerp = document.createElement('p')
        var manifest = chrome.runtime.getManifest()
        headerh.innerText = `AISIS Prettify v${manifest.version}`
        headerp.innerText = 'by Gelo Funelas'
        headera.href = 'https://gemplo.com'
        headera.target = '_blank'
        headera.appendChild(headerp)
        header.append(headerh,headera)
        newSiteMap.append(header)
        try {
            document.querySelectorAll(".text04")[7].innerText = document.querySelectorAll(".text04")[7].innerText.replace("Access all the information you need with just a click of your mouse!\n\n\n","")
            document.querySelectorAll(".header08")[1].innerText = document.querySelectorAll(".header08")[1].innerText.replace("Reminder: Please download your online syllabus, if this is already available. To facilitate the discussion of the syllabus during the first few days of classes, bring to your class either the printed copy or the soft copy that is in your laptop or other device/s.","")
        } catch {}
        return true
    } catch (err) {
        sitemap.classList.remove('hidden')
        console.error(err)
        return false;
    }
}

function loadHomepage() {
    home_table = document.querySelectorAll('table')[11]
    if (home_table !== undefined) {
        const mutationObserver = new MutationObserver(entries => {
            prettifyHome()
        })
        mutationObserver.observe(home_table, {
            childList: true,
            subtree: true
        })
        prettifyHome()
    } else if (document.readyState !== 'complete') {
        setTimeout(loadHomepage, 1)
    }
}

chrome.storage.local.get(['disable_home'], function(result) {
    console.log('loaded storage')
    // ((window.location.href.includes('https://aisis.ateneo.edu/j_aisis/welcome.do')) || (window.location.href.includes('https://aisis.ateneo.edu/j_aisis/login.do'))) && 
    if (!result.disable_home) {
        loadHomepage()
        document.addEventListener('DOMContentLoaded', function() {
            prettifyHome()
        })
    }
})