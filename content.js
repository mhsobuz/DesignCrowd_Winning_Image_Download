(function () {
    // Select all design cards
    const cards = document.querySelectorAll(".card-design");

    if (!cards.length) {
        alert("No design cards found!");
        return;
    }

    let downloads = [];

    cards.forEach(card => {
        const img = card.querySelector(".card-design__image img");
        const user = card.querySelector(".user-profile a");

        if (!img || !user) return;

        const imageUrl = img.src;
        const username = user.innerText.trim();

        const parts = imageUrl.split("/");
        const originalName = parts[parts.length - 1];

        const finalName = `${username}_${originalName}`;

        downloads.push({
            imageUrl,
            filename: finalName
        });
    });

    // Send all image data to background.js
    chrome.runtime.sendMessage({
        type: "batchDownload",
        items: downloads
    });

})();
