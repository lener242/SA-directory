let ukFilter = "all";
let ukSearchQuery = "";

function applyUkFilters() {
    let filtered = [...UK_DATA];
    if (ukSearchQuery) filtered = filtered.filter(i => i.article.includes(ukSearchQuery) || i.name.includes(ukSearchQuery) || i.desc.includes(ukSearchQuery));
    if (ukFilter === "sud") filtered = filtered.filter(i => i.sud);
    else if (ukFilter === "sh") filtered = filtered.filter(i => i.fine);
    else if (ukFilter === "5star") filtered = filtered.filter(i => i.stars === "⭐⭐⭐⭐⭐");
    renderUkList(filtered);
}

function setUkFilter(filter) {
    ukFilter = filter;
    document.querySelectorAll("#uk .f").forEach(btn => {
        btn.classList.remove("fall", "fsud", "fsh", "ftazh");
        if (btn.getAttribute("data-filter") === filter) {
            if (filter === "all") btn.classList.add("fall");
            else if (filter === "sud") btn.classList.add("fsud");
            else if (filter === "sh") btn.classList.add("fsh");
            else if (filter === "5star") btn.classList.add("ftazh");
        } else btn.classList.add("f");
    });
    applyUkFilters();
}