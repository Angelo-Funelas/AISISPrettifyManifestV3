const icon_sizes = ['16','48','128'];
function loadTabIcons() {
    for (let size of icon_sizes) {
        const icon = document.createElement('link');
        icon.rel = 'icon';
        icon.sizes = `${size}x${size}`;
        icon.href = chrome.runtime.getURL(`/images/icon_${size}.png`)
        document.head.append(icon)
    }
}

function importFont() {
    const fontUrl = chrome.runtime.getURL("styles/fonts/InterVariable.ttf");
    const style = document.createElement("style");
    style.textContent = `
        @font-face {
            font-family: 'Inter';
            src: url('${fontUrl}') format('truetype');
        }
    `;
    document.head.appendChild(style);
}

document.addEventListener('DOMContentLoaded', () => {
    loadTabIcons();
    importFont();
});