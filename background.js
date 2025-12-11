chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"]
    });
});

// Receive download request from content.js
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "download_file") {
        chrome.downloads.download({
            url: msg.url,
            filename: msg.filename,
            conflictAction: "overwrite"
        });
    }
});
