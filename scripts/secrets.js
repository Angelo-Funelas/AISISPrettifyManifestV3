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
            }, 4000)
        }
        if (typeof e.key !== "undefined" && e.key.length === 1 && e.key.match(/[a-z]/i)) {
            document.getElementById('secret_input').value += e.key;
        }
        secret_value = document.getElementById('secret_input').value
        if (secret_value == 'gelo') {
            showS_img('gelo')
            // playSfx('6')
            document.getElementById('secret_input').value = ''
        } else if (secret_value == 'kuho') {
            // playSfx('4')
            document.getElementById('secret_input').value = ''
        } else if (secret_value == 'krapky') {
            // playSfx('4')
            document.getElementById('secret_input').value = ''
        } else if (secret_value == 'jozco') {
            // playSfx('4')
            document.getElementById('secret_input').value = ''
        } else if (secret_value == 'kael') {
            // playSfx('4')
            document.getElementById('secret_input').value = ''
        } else if (secret_value == 'carpaltunnel') {
            playBM(maps[0])
            document.getElementById('secret_input').value = ''
        }
    })
})