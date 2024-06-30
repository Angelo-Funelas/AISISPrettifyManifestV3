function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

chrome.runtime.onMessage.addListener(function(request) {
  if (request.reload) {
    location.reload()
  }
}
);

chrome.storage.local.get(['disable_filter'], function(result) {
  if (window.location.href == 'https://aisis.ateneo.edu/j_aisis/J_VCSC.do' && !result.disable_filter) {

    activeFilter = []

    var _nodeCompare = function(a, b) {
      if(a.innerText < b.innerText) return -1
      if(a.innerText > b.innerText) return 1
      return 0
    }
    
    var cats = document.querySelector('select[name="subjCode"]').childNodes
    var opts = []
    for(var cat of cats) {
      if(cat.nodeName == 'OPTION') opts.push(cat.cloneNode(true))
    }
    console.log(opts)
    opts.sort(_nodeCompare)
    console.log(opts)
    var myNode = document.querySelector('select[name="subjCode"]')
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }
    for(var i = 0; i < opts.length; i++) {
      myNode.appendChild(opts[i])
    }
  
      
    // chrome.runtime.onMessage.addListener(function(request) {
    //   if (request.byemessage) {
    //       var submit = document.getElementsByClassName('VfPpkd-Bz112c-LgbsSe yHy1rc eT1oJ tWDL4c Cs0vCd')[0];
    //       if (!submit) {
    //           alert('This requires the chatbox to be opened at least once.');
    //       } else {
    //           document.querySelectorAll('textarea')[0].value = request.byemessage;
    //           submit.disabled = false;
    //           submit.click();
    //       }
    //   }
    //   return true;
    // }
    // );

    /* Variable definitions */
    var sectionTable = document.querySelectorAll('table.needspadding')[1]
    var sections = [...Array.from(sectionTable.querySelectorAll('tr')).slice(1)];
    var header = Array.from(sectionTable.querySelectorAll('tr')).slice(0,1)[0]
    
    var h = document.createElement('input');
  
    var root = document.querySelector('div[align="center"]')
    var drops = document.querySelector('div[align="center"] > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2)')
    var footer = document.querySelector('div[align="center"] > table > tbody > tr:last-child > td > table')
  
    sectionTable.classList.add('sectionTable')
  
    sections.map(section => section.classList.add('prettyRow'))
  
    h.setAttribute('type', 'text');
  
    /* Event Handlers */
  
    /* Filter Box Definition */
    var FilterBox = (function() {
      var columnData = {
        'schedule': 'td:nth-of-type(5)',
        'room': 'td:nth-of-type(6)',
        'instructor': 'td:nth-of-type(7)',
        'languages': 'td:nth-of-type(9)'
      }
  
      var _extractData = function(set, queryString) {
        for(var section of sections) {
          //set.add(section.querySelector(queryString).innerText)
          set.push(section.querySelector(queryString).innerText)
        }
      }
  
      /* Event Handlers */
      var _genericCheckListener = function() {
        for(var section of sections) {
          if(section.querySelector(this.dataset.column).innerText.includes(this.value)) {
            if(this.checked) section.classList.remove('hidden')
            if(!this.checked) section.classList.add('hidden')
            //if(section.classList.contains('hidden')) section.classList.toggle('hidden')
          }
        }
      }
  
      var _genericRadioListener = function() {
        for(var section of sections) {
          console.log(this.dataset.column)
          if(section.querySelector(this.dataset.column).innerText.includes(this.value)) {
            if(this.checked) section.classList.remove('hidden')
            if(!this.checked) section.classList.add('hidden')
            //if(section.classList.contains('hidden')) section.classList.toggle('hidden')
          }
        }
      }
  
      var _filterInstructorInitialization = function(column, filterContainer) {
        var datalist = document.createElement('datalist')
        var columnSet = new Array();
        var orderedSet = new Set();
        var boxTitle = document.createElement('p')
        boxTitle.className = 'filter-heading'

        var searchBox = document.createElement('input')
        searchBox.type = 'search'
        searchBox.setAttribute('list', `${column}-options`)
        searchBox.addEventListener('keypress', function(event) {
          if (event.key === 'Enter') {
              event.preventDefault();
          }
        });


        var checkBoxContainer = document.createElement('tr')

        var col1 = document.createElement('td')
        col1.className = 'text01'
        var col2 = document.createElement('td')

        col1.appendChild(boxTitle)

        boxTitle.innerText = column
  
        col2.appendChild(searchBox)
        col2.appendChild(datalist)

        checkBoxContainer.appendChild(col1)
        checkBoxContainer.appendChild(col2)
        datalist.id = `${column}-options`
        filterContainer.appendChild(checkBoxContainer)
        document.querySelectorAll('table.needspadding table > tbody ')[0].appendChild(checkBoxContainer)
  
        _extractData(columnSet, columnData[column])
        columnSet.sort()
        for(let d of columnSet) { orderedSet.add(d) }
  
        for(let row of orderedSet) {
          var option = document.createElement('option')
          option.value = capitalizeFirstLetter(row);
          datalist.appendChild(option)
        }
      }

      var _checkBoxInitialization = function(column, filterContainer) {
        var checkboxContainer = document.createElement('div')
        var columnSet = new Array();
        var orderedSet = new Set();
        var boxTitle = document.createElement('p')
        boxTitle.className = 'filter-heading'

        var checkBoxContainer = document.createElement('tr')

        var col1 = document.createElement('td')
        col1.className = 'text01'
        var col2 = document.createElement('td')

        col1.appendChild(boxTitle)

        boxTitle.innerText = column
        col2.appendChild(checkboxContainer)

        checkBoxContainer.appendChild(col1)
        checkBoxContainer.appendChild(col2)
        
        checkboxContainer.classList.add('checkbox_div')
        checkboxContainer.id = `${column}-options`
        filterContainer.appendChild(checkBoxContainer)
        document.querySelectorAll('table.needspadding table > tbody ')[0].appendChild(checkBoxContainer)
  
        _extractData(columnSet, columnData[column])
        columnSet.sort()
        for(let d of columnSet) { orderedSet.add(d) }
  
        for(let row of orderedSet) {
          var checkLabel = document.createElement('label')
          var check = document.createElement('input')
  
          check.setAttribute('type', 'checkbox')
          check.addEventListener('change', _genericCheckListener)
          check.setAttribute('value', row)
          check.setAttribute('data-column', columnData[column])
  
          checkLabel.innerHTML += row
          checkLabel.prepend(check)
          checkboxContainer.appendChild(checkLabel)
        }
      }
  
      var _radioInitalization = function(column, filterContainer) {
        var checkBox = document.createElement('div')
        var columnSet = new Set();
        var checkBoxContainer = document.createElement('div')
        var radioTitle = document.createElement('p')
        radioTitle.innerText = column
        radioTitle.className = 'filter-heading'
        checkBoxContainer.appendChild(radioTitle)
        checkBoxContainer.appendChild(checkBox)
  
        checkBox.classList.add('checkbox_div')
        filterContainer.appendChild(checkBoxContainer)
        sectionTable.parentNode.insertBefore(filterContainer, sectionTable)
  
        _extractData(columnSet, columnData[column])
  
        for(let row of columnSet) {
          var checkLabel = document.createElement('label')
          var checkSpan = document.createElement('span')
          var check = document.createElement('input')
  
          check.setAttribute('type', 'radio')
          check.addEventListener('change', _genericRadioListener)
          check.setAttribute('value', row)
          check.setAttribute('name', column)
          check.setAttribute('data-column', columnData[column])
  
          checkSpan.innerText = row
  
          checkLabel.appendChild(check)
          checkLabel.appendChild(checkSpan)
          checkBox.appendChild(checkLabel)
        }
      }
  
      var init = function() {
        var filterBox = document.createElement('tr')
        filterBox.className = 'filterbox'
        // for(var section of sections) {
        //   section.classList.add('hidden')
        // }
        _filterInstructorInitialization('instructor', filterBox)
        _checkBoxInitialization('languages', filterBox)
  
      }
      return {
        init: init
      }
    })();
  
    FilterBox.init();
  
  }
  
});

