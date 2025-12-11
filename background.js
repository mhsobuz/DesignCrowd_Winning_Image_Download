chrome.action.onClicked.addListener(async (tab) => {
    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"]
    });
});

chrome.runtime.onMessage.addListener((msg, sender) => {
    if (msg.type === "batchDownload") {
        msg.items.forEach(item => {
            chrome.downloads.download({
                url: item.imageUrl,
                filename: item.filename
            });
        });
    }
});
