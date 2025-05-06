let loginMoved = false;

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
            prettyLoginCont.id = 'ap-prettyLogin'
            formTable.firstElementChild.firstElementChild.style.display = 'none'
            formTable.firstElementChild.append(prettyLoginCont)
        }
        if (!loginMoved) {
            var inputs = document.querySelectorAll('form input')
            newform = document.createElement('form');
            var img = document.createElement('div');
            let icon_center = document.createElement('img');
            let icon_border = document.createElement('img');
            icon_center.src = chrome.runtime.getURL(`/images/icon_center.png`);
            icon_border.src = chrome.runtime.getURL(`/images/icon_border.png`);
            img.id = 'ap-login-logo';
            img.append(icon_center, icon_border);
            newform.append(img);

            newform.id = 'pretty-login-form'
            newform.name = 'loginForm'
            newform.action = '/j_aisis/login.do'
            newform.method = 'POST'
            newform.addEventListener('submit', (e) => {
                document.querySelector('.login-inputContainer > input[type=submit]').disabled = true;
            })
            inputs.forEach(function(e) {
                let inputContainer = document.createElement('div');
                let inputIconContainer = document.createElement('div');
                let inputIcon = document.createElement('img');
                inputIconContainer.className = 'login-inputIconContainer';
                inputContainer.className = 'login-inputContainer';
                if (e.type == 'text') {
                    inputIcon.src = chrome.runtime.getURL(`/images/icons/user.png`);
                    e.placeholder = 'Student ID'
                } else if (e.type =='password') {
                    inputIcon.src = chrome.runtime.getURL(`/images/icons/password.png`);
                    e.placeholder = 'Password'
                }
                if (inputIcon.src) {
                    inputIconContainer.append(inputIcon);
                    inputContainer.append(inputIconContainer);
                };
                if (e.type == 'hidden') {
                    newform.append(e);
                } else {
                    inputContainer.append(e);
                    newform.append(inputContainer);
                }
            })
            loginMoved = true
            prettyLoginCont.append(newform)
        }
        loadAds(prettyLoginCont);
    }
}

async function loadAds(container) {
    let ad_data = await fetch('https://www.gemplo.com/ap_ads').then((res) => res.json());
    document.querySelectorAll('.ap-ad').forEach((item) => {item.remove()});
    if (!ad_data || !ad_data.active) return console.error("Error fetching ad");
    let ad_div = document.createElement('div');
    let ad_img = document.createElement('img');
    let ad_link = document.createElement('a');
    ad_link.href = ad_data.url;
    ad_link.target = '_blank';
    ad_link.className = 'ap-ad';
    ad_img.src = ad_data.img;
    ad_div.append(ad_img);
    ad_link.append(ad_div)
    container.append(ad_link);
    console.log("Successfully loaded ad")
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