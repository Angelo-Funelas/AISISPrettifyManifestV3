document.addEventListener('DOMContentLoaded', function() {
    var secret_input = document.createElement('input');
    secret_input.id = 'secret_input'
    document.body.append(secret_input)
    function showS_img(name) {
        s_img = document.createElement('img')
        s_img.src = chrome.runtime.getURL(`/images/hutao/${RandomInt(1,3+1)}.png`)
        s_img.className = 's_img';
        document.body.append(s_img)
        s_img.style.left = `calc(${RandomInt(0, 100)}vw - 5em)`
        s_img.addEventListener('animationend', function(e) {
            e.currentTarget.remove()
        })
        s_img.addEventListener('click', function(e) {
            // e.currentTarget.remove()
            e.currentTarget.className = 'popend'
            // playSfx('5')
        })
    }
    document.addEventListener("keydown", function(e) {
        if (document.getElementById('secret_input').value == '') {
            setTimeout(function() {
                document.getElementById('secret_input').value = ''
            }, 2000)
        }
        if (typeof e.key !== "undefined" && e.key.length === 1 && e.key.match(/[a-z]/i)) {
            document.getElementById('secret_input').value += e.key;
        }
        secret_value = document.getElementById('secret_input').value
        switch (secret_value) {
            case 'gelo':
                showS_img('gelo');
                // playSfx('6');
                document.getElementById('secret_input').value = '';
                break;
        
            case 'kuho':
            case 'krapky':
            case 'jozco':
            case 'kael':
                // playSfx('4');
                document.getElementById('secret_input').value = '';
                break;
        
            case 'carpaltunnel':
                playBM(maps[0]);
                document.getElementById('secret_input').value = '';
                break;
        
            case 'destroy':
                destroyAISIS();
                document.getElementById('secret_input').value = '';
                break;
        
            default:
                // Optional: Handle any other cases if needed
                break;
        }
    })
});
/******************************************************************************
* This script detects the Konami code 
* Licence: WTFPL (http://es.wikipedia.org/wiki/WTFPL)
* Developed by @nestoralvaro
*******************************************************************************/
(function() {
    "use strict";
    var up = 38,
	    down = 40,
	    left = 37,
	    right = 39,
	    A = 65,
	    B = 66;
    var	konamiCode = [up,up,down,down,left,right,left,right,B,A];
    var konamiDetected = [];
    function attachCustomEvent(el, eventName, desiredFunction) {
	    if (el.addEventListener) {
		    el.addEventListener(eventName,desiredFunction,false);
	    } else {
		    el.attachEvent('on' + eventName,desiredFunction);
	    }
    }
    function detachCustomEvent(el, eventName, desiredFunction) {
	    if (el.removeEventListener) {
		    el.removeEventListener(eventName,desiredFunction,false);
	    } else {
		    el.detachEvent('on' + eventName,desiredFunction);
	    }
    }
    function startUpKonami() {
	    detachCustomEvent(document,"keydown",isKonamiKey);
	    konamiIsDetected();
    }
    function isKonamiKey(e) {
	    var evt = e || window.event;
        var key = evt.keyCode ? evt.keyCode : evt.which;
	    var codeOk = true;
        konamiDetected.push(key);
        if (konamiDetected.length < konamiCode.length) {
		    for (var i = 0, max = konamiDetected.length; i < max ; i++) {
        		if(konamiDetected[i] !== konamiCode[i]) {
	        		codeOk = false;
        		}
        	}
        	if (!codeOk) {
        		konamiDetected = [];
        		konamiDetected.push(key);
        	}
        } else if (konamiDetected.length === konamiCode.length) {
        	for (var j = 0, max = konamiDetected.length; j < max ; j++) {
        		if(konamiDetected[j] !== konamiCode[j]) {
	        		codeOk = false;
        		}
        	}
        	konamiDetected = [];
        	if (codeOk) {
	        	startUpKonami();
        	}
        } else {
	        konamiDetected = [];
        }
    }
    attachCustomEvent(document,"keydown",isKonamiKey);
})();
function konamiIsDetected() {
    destroyAISIS();
}