let loginMoved = false;

function isLogin() {
    let header = document.querySelector('form td:nth-child(1)') 
    return (header && header.innerText == 'Sign in');
}

function prettifyLogin() {
    const originalForm = document.querySelector("form");
    if (!isLogin()) return;

    let prettyLoginCont = document.getElementById('ap-prettyLogin')
    let formTable = document.forms['loginForm'].parentElement.parentElement.parentElement
    if (!prettyLoginCont) {
        // Remove extra rows used by aisis for spacing
        while (true) {
            if (formTable.firstElementChild.querySelector('form > table > tbody > tr:nth-child(1) > td') && formTable.firstElementChild.querySelector('form > table > tbody > tr:nth-child(1) > td').innerText == 'Sign in') {
                break
            } else {
                formTable.removeChild(formTable.firstChild)
            }
        }
        prettyLoginCont = document.createElement('div')
        prettyLoginCont.id = 'ap-prettyLogin'
        formTable.firstElementChild.firstElementChild.style.display = 'none'
        formTable.firstElementChild.append(prettyLoginCont)
    }
    if (!loginMoved) {
        let inputs = document.querySelectorAll('form input')
        if (inputs.length < 2) return;
        let newform = document.createElement('form');
        let img = document.createElement('div');
        let icon_center = document.createElement('img');
        let icon_border = document.createElement('img');
        icon_center.src = chrome.runtime.getURL(`/images/icon_center.png`);
        icon_border.src = chrome.runtime.getURL(`/images/icon_border.png`);
        img.id = 'ap-login-logo';
        img.append(icon_center, icon_border);
        newform.append(img);

        newform.id = 'pretty-login-form'
        newform.name = 'loginForm'
        newform.action = originalForm.action
        newform.method = 'POST'
        newform.addEventListener('submit', (e) => {
            document.querySelector('.login-inputContainer > input[type=submit]').disabled = true;
            setTimeout(() => {
                document.querySelector('.login-inputContainer > input[type=submit]').disabled = false;
            }, 2*1000);
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
            if (e.type == 'submit') {
                newform.append(document.querySelector('form .text09'))
            }
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

async function loadAds(container) {
    let ad_data = await fetch('https://www.gemplo.com/ap_ads')
    .then((res) => res.json())
    .catch(() => {
        return null;
    });
    document.querySelectorAll('.ap-ad').forEach((item) => {item.remove()});
    if (!ad_data || !ad_data.active) return;
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
    // console.log("Successfully loaded ad")
}

chrome.storage.local.get({'settings_login': true}, function(result) {
    if (!result.settings_login) return;
    const mutationObserver = new MutationObserver((mutations, obs) => {
        if (isLogin()) {
            prettifyLogin();
            obs.disconnect();
        }
    })
    mutationObserver.observe(document, {
        childList: true,
        subtree: true
    })
    document.addEventListener('DOMContentLoaded', function() {
        prettifyLogin();
    })
})