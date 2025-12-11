(async function () {
    const cards = document.querySelectorAll(".card-design");

    if (!cards.length) {
        alert("No design cards found!");
        return;
    }

    let downloads = [];

    for (const card of cards) {
        const pageLink = card.querySelector(".card-design__image a");
        const user = card.querySelector(".user-profile a");

        if (!pageLink || !user) continue;

        const username = user.innerText.trim().replace(/\s+/g, "-");
        const designPageUrl = pageLink.href;

        // Fetch the design page HTML
        const html = await fetch(designPageUrl).then(r => r.text());

        // Parse HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        // Extract HD image
        const hdImg = doc.querySelector(".image-frame--tall img");

        if (!hdImg) continue;

        const hdUrl = hdImg.src;

        // Extract original filename
        const parts = hdUrl.split("/");
        const originalName = parts[parts.length - 1];

        const finalName = `${username}/${originalName}`;

        downloads.push({
            imageUrl: hdUrl,
            filename: finalName
        });
    }

    chrome.runtime.sendMessage({
        type: "batchDownload",
        items: downloads
    });

})();
