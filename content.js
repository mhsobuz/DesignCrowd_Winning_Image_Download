async function fetchHTML(url) {
    let res = await fetch(url);
    return await res.text();
}

async function getHDImage(url) {
    let html = await fetchHTML(url);
    let doc = new DOMParser().parseFromString(html, "text/html");

    let img = doc.querySelector(".image-frame--tall img, .card-design__image img");
    if (!img) return null;

    return img.src.replace("_thumbnail", "_image");
}

async function processPage(url, allImages) {
    console.log("Processing:", url);

    let html = await fetchHTML(url);
    let doc = new DOMParser().parseFromString(html, "text/html");

    let cards = doc.querySelectorAll(".card-design");

    for (let card of cards) {
        let a = card.querySelector(".card-design__image a");
        if (!a) continue;

        let designURL = a.href;
        let hd = await getHDImage(designURL);
        if (!hd) continue;

        let userEl = card.querySelector(".user-profile__small-text a");
        let username = userEl ? userEl.textContent.trim().replace(/\s+/g, "_") : "unknown";

        if (!allImages[username]) allImages[username] = [];
        if (!allImages[username].includes(hd)) allImages[username].push(hd);
    }

    // go to next page
    let next = doc.querySelector(".pagination-next a");
    if (next) {
        await processPage(next.href, allImages);
    }
}

async function startDownload() {
    let all = {};

    await processPage(window.location.href, all);

    for (let username in all) {
        let list = all[username];

        for (let i = 0; i < list.length; i++) {
            chrome.runtime.sendMessage({
                type: "download_file",
                url: list[i],
                filename: `${username}/file_${i + 1}.jpg`
            });
        }
    }

    alert("Download started!");
}

startDownload();
