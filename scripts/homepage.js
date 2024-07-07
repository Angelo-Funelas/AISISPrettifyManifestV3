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
    'ENLIST IN CLASS':`enlist`
}



chrome.storage.local.get(['disable_homepage'], function(result) {
    if (((window.location.href.includes('https://aisis.ateneo.edu/j_aisis/welcome.do')) || (window.location.href.includes('https://aisis.ateneo.edu/j_aisis/login.do'))) && !result.disable_homepage) {
        document.addEventListener('DOMContentLoaded', function() {
            var sitemap = document.getElementsByTagName('table')[11]
            parsedTable = parseTable(sitemap)
            if (parsedTable[0][0] == 'Site Map') {
                sitemap.classList.add('hidden')
                var newSiteMap = document.createElement('div')
                newSiteMap.id = 'ap-sitemap'
                sitemap.parentElement.append(newSiteMap)
    
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
                headerh.innerText = 'AISIS Prettify'
                headerp.innerText = 'by Gelo Funelas'
                headera.href = 'https://gemplo.com'
                headera.target = '_blank'
                headera.appendChild(headerp)
                header.append(headerh,headera)
                newSiteMap.append(header)
            }
        })
    }
})