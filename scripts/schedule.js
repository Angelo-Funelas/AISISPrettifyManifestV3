chrome.storage.local.get(['show_schedule'], function(result) {
    if (window.location.href == 'https://aisis.ateneo.edu/j_aisis/J_VMCS.do' && !result.show_schedule) {
        var table = document.getElementsByTagName('table')[15].querySelector('tbody')
        var rows = table.querySelectorAll('tr')
        var parsedTable = []
        for (let i = 1; i< rows.length;i++) {
            cells = rows[i].querySelectorAll('td')
            var parsedRow = []
            for (let cell of cells) {
                parsedRow.push(cell.innerText)
            }
            parsedTable.push(parsedRow)
        }
        var gridTable = []
        for (let i=1;i<parsedTable[0].length;i++) {
            var col = []
            var prevSubj = ''
            var subjStart = 0
            for (let j=0;j<parsedTable.length;j++) {
                var curSubj = parsedTable[j][i]
                if (prevSubj!==curSubj) {
                    if (curSubj == " " && prevSubj !== '') {
                        col.push([prevSubj,subjStart,j])
                    } else if (curSubj !== " ") {
                        subjStart = j
                        prevSubj = curSubj
                    }
                }
            }
            gridTable.push(col)
        }
        console.log(gridTable)
    }
})