document.addEventListener("DOMContentLoaded", () => {
    const manifest = chrome.runtime.getManifest();
    const page = window.location.pathname;
    document.querySelectorAll(".manifest-version").forEach((el) => el.textContent = manifest.version)

    if (page.endsWith("welcome.html")) chrome.storage.local.set({['data_welcome_shown']: true});
    else if (page.endsWith("update.html")) {
        document.head.querySelector("title").innerText = `AISIS Prettify v${manifest.version} Update`
    }
});
