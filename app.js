/* Variable definitions */
var sectionTable = document.querySelector('table tbody tr:nth-child(5) td table');
var sections = [...Array.from(sectionTable.querySelectorAll('tr')).slice(1)];
var header = Array.from(sectionTable.querySelectorAll('tr')).slice(0,1)[0]
var h = document.createElement('input');
var b = document.createElement('button');

var root = document.querySelector('div[align="center"]')
var drops = document.querySelector('div[align="center"] > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2)')
var footer = document.querySelector('div[align="center"] > table > tbody > tr:last-child > td > table');


var nDiv = document.createElement('div')
nDiv.classList.add('newWrapper')

root.parentNode.appendChild(nDiv)
nDiv.appendChild(sectionTable)
nDiv.appendChild(footer)


var newFooter = document.querySelector('.newWrapper > table:last-child > tbody > tr:first-child')
var lSpacer = newFooter.querySelector('tbody > tr:first-child > td:first-child')
newFooter.removeChild(lSpacer)

sectionTable.removeAttribute('width')
sectionTable.removeAttribute('border')
//root.parentNode.insertBefore(sectionTable, footer)
//root.parentNode.insertBefore(drops, sectionTable)
//root.removeChild(root.firstChild)

sectionTable.classList.add('sectionTable')
nDiv.setAttribute('style', 'background-color: white;')

sections.map(section => section.classList.add('prettyRow'))

h.setAttribute('type', 'text');
//sectionTable.parentNode.insertBefore(h, sectionTable)

b.innerText = 'Search'
b.addEventListener('click', function() {
  var time = h.value;
  var first = header.nextSibling.nextSibling
  for(var section of sections) {
    if(time === '' && section.classList.contains('hidden')) {
      section.classList.remove('hidden')
    }
    if(section.querySelector('td:nth-of-type(5)').innerText.includes(time)) {
      //sectionTable.firstChild.nextSibling.insertBefore(section, first)
      if(section.classList.contains('hidden')) section.classList.toggle('hidden')
    } else {
      if(!section.classList.contains('hidden')) section.classList.add('hidden')
    }
  }
})

//sectionTable.parentNode.insertBefore(b, sectionTable)

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
    }
  }

  var _checkBoxInitializations = function(column, filterContainer) {
    var checkBox = document.createElement('div')
    var columnSet = new Array();
    var orderedSet = new Set();
    var boxTitle = document.createElement('h1')
    var checkBoxContainer = document.createElement('div')

    boxTitle.innerText = column
    boxTitle.setAttribute('style', 'text-align: center; text-transform: capitalize;')

    checkBoxContainer.appendChild(boxTitle)
    checkBoxContainer.appendChild(checkBox)

    checkBox.classList.add('checkbox_div')
    filterContainer.appendChild(checkBoxContainer)
    //sectionTable.parentNode.insertBefore(filterContainer, h)
    sectionTable.parentNode.insertBefore(filterContainer, sectionTable)
    //document.querySelector('body').appendChild(filterContainer)

    _extractData(columnSet, columnData[column])
    columnSet.sort()
    for(let d of columnSet) { orderedSet.add(d) }

    for(let row of orderedSet) {
      var checkLabel = document.createElement('label')
      var checkSpan = document.createElement('span')
      var check = document.createElement('input')

      check.setAttribute('type', 'checkbox')
      check.addEventListener('change', _genericCheckListener)
      check.setAttribute('value', row)
      check.setAttribute('data-column', columnData[column])

      checkSpan.innerText = row.toLowerCase();
      checkSpan.classList.add('checkBox')

      checkLabel.appendChild(check)
      checkLabel.appendChild(checkSpan)
      checkBox.appendChild(checkLabel)
    }
  }

  var _radioInitalization = function(column, filterContainer) {
    var checkBox = document.createElement('div')
    var columnSet = new Set();

    checkBox.classList.add('checkbox_div')
    filterContainer.appendChild(checkBox)
    sectionTable.parentNode.insertBefore(filterContainer, h)

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
    var filterBox = document.createElement('div')
    for(var section of sections) {
      section.classList.add('hidden')
    }
    _checkBoxInitializations('instructor', filterBox)
    //_radioInitalization('lang', filterBox)
  }
  return {
    init: init
  }
})();

FilterBox.init();
