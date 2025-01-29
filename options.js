document.getElementById("addSite").addEventListener("click", () => {
    const siteInput = document.getElementById("siteInput").value.trim();
    if (!siteInput) return;

    chrome.storage.sync.get(["blockedSites"], (data) => {
        let blockedSites = data.blockedSites || [];
        if (!blockedSites.includes(siteInput)) {
            blockedSites.push(siteInput);
            chrome.storage.sync.set({ blockedSites }, () => {
                displayBlockedSites();
            });
        }
    });
});

function displayBlockedSites() {
    chrome.storage.sync.get(["blockedSites"], (data) => {
        const blockedList = document.getElementById("blockedList");
        blockedList.innerHTML = "";

        (data.blockedSites || []).forEach((site) => {
            const li = document.createElement("li");
            li.textContent = site;

            const removeBtn = document.createElement("button");
            removeBtn.textContent = "Remove";
            removeBtn.style.marginLeft = "10px";
            removeBtn.addEventListener("click", () => removeSite(site));

            li.appendChild(removeBtn);
            blockedList.appendChild(li);
        });
    });
}

function removeSite(site) {
    chrome.storage.sync.get(["blockedSites"], (data) => {
        let blockedSites = data.blockedSites || [];
        blockedSites = blockedSites.filter(s => s !== site);

        chrome.storage.sync.set({ blockedSites }, () => {
            displayBlockedSites();
            updateBlockedRules(); // Update the blocking rules after removal
        });
    });
}

function updateBlockedRules() {
    chrome.storage.sync.get(["blockedSites"], (data) => {
        let blockedSites = data.blockedSites || [];

        const rules = blockedSites.map((site, index) => ({
            id: index + 1,
            priority: 1,
            action: { type: "block" },
            condition: { urlFilter: site, resourceTypes: ["main_frame"] }
        }));

        chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: Array.from({ length: 100 }, (_, i) => i + 1), // Remove all old rules
            addRules: rules
        });
    });
}

displayBlockedSites();
