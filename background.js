chrome.action.onClicked.addListener(async (tab) => {
    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"]
    });
});

// Receive data from content script
chrome.runtime.onMessage.addListener((msg, sender) => {
    if (msg.type === "download") {
        chrome.downloads.download({
            url: msg.imageUrl,
            filename: msg.filename
        });
    }
});
