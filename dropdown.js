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
