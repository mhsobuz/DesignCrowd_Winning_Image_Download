(function () {
    // Image selector (from your HTML)
    const img = document.querySelector(".card-design img");
    if (!img) {
        alert("Image not found!");
        return;
    }

    const imageUrl = img.src;
    
    // Extract original image filename
    const urlParts = imageUrl.split("/");
    const originalName = urlParts[urlParts.length - 1];

    // Username selector (from your HTML)
    const user = document.querySelector("h6.u-inline a");
    if (!user) {
        alert("Username not found!");
        return;
    }

    const username = user.innerText.trim();

    // Final filename: username_originalFilename
    const finalName = `${username}_${originalName}`;

    chrome.runtime.sendMessage({
        type: "download",
        imageUrl: imageUrl,
        filename: finalName
    });
})();
