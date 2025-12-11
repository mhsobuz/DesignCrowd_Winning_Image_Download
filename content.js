(async function () {

    async function fetchHtml(url) {
        return await fetch(url).then(r => r.text());
    }

    async function parseDesignCards(doc) {
        const cards = doc.querySelectorAll(".card-design");
        const parser = new DOMParser();
        let results = [];

        for (const card of cards) {
            const designLink = card.querySelector(".card-design__image a");
            const userLink = card.querySelector(".user-profile a");

            if (!designLink || !userLink) continue;

            const username = userLink.innerText.trim().replace(/\s+/g, "-");
            const designUrl = designLink.href;

            // Fetch design page for HD image
            const designHtml = await fetchHtml(designUrl);
            const doc2 = parser.parseFromString(designHtml, "text/html");

            const fullImg = doc2.querySelector(".image-frame--tall img");
            if (!fullImg) continue;

            const imgUrl = fullImg.src;
            const fileName = imgUrl.split("/").pop();

            results.push({
                username: username,
                imageUrl: imgUrl,
                filename: `${username}/${fileName}`
            });
        }

        return results;
    }

    // ===== Collect all pagination links =====
    const paginationLinks = Array.from(document.querySelectorAll(".pagination li a"))
        .map(a => a.href)
        .filter(href => href.includes("contest/4107921")); // Optional: filter by contest

    // Include current page as well
    const currentPage = window.location.href;
    if (!paginationLinks.includes(currentPage)) paginationLinks.unshift(currentPage);

    let allDownloads = [];

    for (const pageUrl of paginationLinks) {
        console.log("Fetching page:", pageUrl);
        const html = await fetchHtml(pageUrl);
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        const items = await parseDesignCards(doc);
        allDownloads.push(...items);
    }

    chrome.runtime.sendMessage({
        type: "batchDownload",
        items: allDownloads
    });

})();
