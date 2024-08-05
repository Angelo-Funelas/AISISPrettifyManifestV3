var loginMoved = false

function prettifyLogin() {
    var header = document.querySelector('form td:nth-child(1)') 
    if (header && header.innerText == 'Sign in') {
        console.log('prettifying login')

        var prettyLoginCont = document.getElementById('ap-prettyLogin')
        var formTable = document.forms['loginForm'].parentElement.parentElement.parentElement
        if (!prettyLoginCont) {
            while (true) {
                if (formTable.firstElementChild.querySelector('form > table > tbody > tr:nth-child(1) > td') && formTable.firstElementChild.querySelector('form > table > tbody > tr:nth-child(1) > td').innerText == 'Sign in') {
                    break
                } else {
                    formTable.removeChild(formTable.firstChild)
                }
            }
            var prettyLoginCont = document.createElement('div')
            var prettyLoginHeading = document.createElement('h1')
            var img = document.createElement('img')
            var icon = chrome.runtime.getURL(`/images/icon.png`)
            img.src = icon
            prettyLoginCont.id = 'ap-prettyLogin'
            prettyLoginHeading.innerText = 'AISIS Prettify Login'
            formTable.firstElementChild.firstElementChild.style.display = 'none'
            formTable.firstElementChild.append(img)
            formTable.firstElementChild.append(prettyLoginHeading)
            formTable.firstElementChild.append(prettyLoginCont)
        }
        if (!loginMoved) {
            var inputs = document.querySelectorAll('form input')
            newform = document.createElement('form')
            newform.id = 'pretty-login-form'
            newform.name = 'loginForm'
            newform.action = '/j_aisis/login.do'
            inputs.forEach(function(e) {
                if (e.type == 'text') {
                    e.placeholder = 'Student ID'
                } else if (e.type =='password') {
                    e.placeholder = 'Password'
                }
                newform.append(e)
            })
            loginMoved = true
            prettyLoginCont.append(newform)
        }
    }
}

function loadLogin() {
    login_form = document.querySelector('form')
    if (login_form) {
        console.log('start login prettify')
        const loginMutationObserver = new MutationObserver(entries => {
            prettifyLogin()
        })
        loginMutationObserver.observe(login_form, {
            childList: true,
            subtree: true
        })
        prettifyLogin()
    } else if (document.readyState !== 'complete') {
        setTimeout(loadLogin, 1)
    }
}

chrome.storage.local.get(['disable_login'], function(result) {
    disable_login = result.disable_login
    if (!result.disable_login) {
        loadLogin()
        document.addEventListener('DOMContentLoaded', function() {
            prettifyLogin()
        })        
    }
})