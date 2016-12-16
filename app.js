var sectionTable = document.querySelector('table tbody tr:nth-child(5) td table');
sectionTable.classList.add('table-pretty')
var sections = [...Array.from(sectionTable.querySelectorAll('tr')).slice(1)];
sections.map(section => section.classList.add('prettyRow'))

var h = document.createElement('input');
h.setAttribute('type', 'text');
sectionTable.parentNode.insertBefore(h, sectionTable)

var header = Array.from(sectionTable.querySelectorAll('tr')).slice(0,1)[0]
header.setAttribute('id', 'table-header')
var b = document.createElement('button');
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
sectionTable.parentNode.insertBefore(b, sectionTable)

var _selectionEvent = function() {
  //var time = h.value;
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
}

var FilterBox = (function() {
  var profs = new Set();
  var _extractProfs = function() {
    for(var section of sections) {
      profs.add(section.querySelector('td:nth-of-type(7)').innerText)
    }
  }
  var _checkListener = function() {
  for(var section of sections) {
    //if(time === '' && section.classList.contains('hidden')) {
      //section.classList.remove('hidden')
    //}
    if(section.querySelector('td:nth-of-type(7)').innerText.includes(this.value)) {
      //sectionTable.firstChild.nextSibling.insertBefore(section, first)
      if(section.classList.contains('hidden')) section.classList.toggle('hidden')
    } else {
      if(!section.classList.contains('hidden')) section.classList.add('hidden')
    }
  }
  }
  var init = function() {
    var filterBox = document.createElement('div')
    var checkBox = document.createElement('div')
    checkBox.classList.add('checkbox_div')
    filterBox.appendChild(checkBox)
    sectionTable.parentNode.insertBefore(filterBox, h)
    _extractProfs()
    for(let prof of profs) {
      var checkLabel = document.createElement('label')
      var checkSpan = document.createElement('span')
      var check = document.createElement('input')

      check.setAttribute('type', 'checkbox')
      check.addEventListener('change', _checkListener)
      check.setAttribute('value', prof)

      checkSpan.innerText = prof

      checkLabel.appendChild(check)
      checkLabel.appendChild(checkSpan)
      checkBox.appendChild(checkLabel)
    }
  }
  return {
    init: init
  }
})();

FilterBox.init();
