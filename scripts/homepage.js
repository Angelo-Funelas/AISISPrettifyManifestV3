const icon_map = [`google`,`ips`,`print`,`curriculum`,`studentinfo`,`classes`,`grades`,`holdorder`,`change`,`schedule`,`password`,`list`]
chrome.storage.local.get(['disable_homepage'], function(result) {
    if (window.location.href == 'https://aisis.ateneo.edu/j_aisis/welcome.do' && !result.disable_homepage) {
        var sitemap = document.getElementsByTagName('table')[11]
        parsedTable = parseTable(sitemap)
        if (parsedTable[0][0] == 'Site Map') {
            sitemap.classList.add('hidden')
            var newSiteMap = document.createElement('div')
            newSiteMap.id = 'ap-sitemap'
            for (let i=1;i<parsedTable.length;i++) {
                var navData = parsedTable[i]
                var link = document.createElement('a')
                var navElement = document.createElement('div')
                var elIcon = document.createElement('img')
                var elHeading = document.createElement('h3')
                var elDesc = document.createElement('p')

                if (i-1<icon_map.length) {
                    elIcon.src = chrome.runtime.getURL(`/images/icons/${icon_map[i-1]}.png`)
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
    
            sitemap.parentElement.append(newSiteMap)
        }
    }
})