// content.js
(async function () {

  // --------------------------
  // Helpers
  // --------------------------
  async function fetchHTML(url) {
    try {
      const res = await fetch(url, { credentials: "omit" });
      if (!res.ok) return null;
      return await res.text();
    } catch (e) {
      console.warn("Fetch failed:", url, e);
      return null;
    }
  }

  function getMainFolderName() {
    const h1 = document.querySelector(".hero__content h1, h1");
    return h1 ? h1.textContent.trim() : document.title || "Contest Folder";
  }

  function getExt(url) {
    if (!url) return "jpg";
    const clean = url.split("?")[0].split("#")[0];
    const ext = clean.slice(clean.lastIndexOf(".") + 1);
    if (ext.length > 5) return "jpg";
    return ext;
  }

  // --------------------------
  // Parse contest page for cards (only design-page links)
  // --------------------------
  async function parseContestPage(url) {
    const html = await fetchHTML(url);
    if (!html) return [];

    const doc = new DOMParser().parseFromString(html, "text/html");

    const cards = Array.from(doc.querySelectorAll(".card-design, .image-frame--contain, .card-design__image"));
    const items = [];

    for (const card of cards) {
      const link = card.querySelector("a[href*='/design/']");
      if (!link) continue;

      const designUrl = link.href;

      const userEl = card.querySelector("a[href*='/designer/']");
      if (!userEl) continue; // skip unknown users
      const username = userEl.textContent.trim();

      items.push({ designUrl, username });
    }

    return items;
  }

  // --------------------------
  // Extract HD image from design page
  // --------------------------
  async function getHDImageFromDesignPage(url) {
    const html = await fetchHTML(url);
    if (!html) return null;

    const doc = new DOMParser().parseFromString(html, "text/html");

    // Most reliable HD selectors
    let img =
      doc.querySelector("img.design-image") ||
      doc.querySelector(".image-frame--contain img") ||
      doc.querySelector("img[src*='_image']") ||
      doc.querySelector(".design img") ||
      doc.querySelector("img");

    if (!img) return null;

    return img.src || img.getAttribute("src") || null;
  }

  // --------------------------
  // Collect pagination URLs
  // --------------------------
  function getPaginationLinks() {
    const links = Array.from(document.querySelectorAll(".pagination li a"))
      .map(a => a.href)
      .filter(Boolean);

    // include current page
    return Array.from(new Set([window.location.href, ...links]));
  }

  // ===================================================================
  // MAIN FLOW
  // ===================================================================
  const MainFolder = getMainFolderName();
  const contestPages = getPaginationLinks();

  const allItems = [];
  for (const page of contestPages) {
    const items = await parseContestPage(page);
    allItems.push(...items);
  }

  // Deduplicate design URLs
  const seen = new Set();
  const unique = [];
  for (const it of allItems) {
    if (!seen.has(it.designUrl)) {
      seen.add(it.designUrl);
      unique.push(it);
    }
  }

  // --------------------------
  // Download all in sequence
  // --------------------------
  const counters = {};
  for (const item of unique) {
    const hdUrl = await getHDImageFromDesignPage(item.designUrl);
    if (!hdUrl) continue;

    if (!counters[item.username]) counters[item.username] = 1;

    const ext = getExt(hdUrl);
    const filename = `${MainFolder}/${item.username}/file_${counters[item.username]}.${ext}`;

    counters[item.username]++;

    chrome.runtime.sendMessage({
      type: "download_file",
      url: hdUrl,
      filename
    });
  }

})();
