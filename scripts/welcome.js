document.addEventListener("DOMContentLoaded", () => {
    const manifest = chrome.runtime.getManifest();
    document.getElementById("version").textContent = manifest.version;
});
