function updateBlockedSites() {
    chrome.storage.sync.get(["blockedSites"], (data) => {
        let blockedSites = data.blockedSites || [];

        const rules = blockedSites.map((site, index) => ({
            id: index + 1,
            priority: 1,
            action: { type: "block" },
            condition: { urlFilter: site, resourceTypes: ["main_frame"] }
        }));

        chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: rules.map(rule => rule.id),
            addRules: rules
        });
    });
}

// Run the update when the extension starts
chrome.runtime.onStartup.addListener(updateBlockedSites);
chrome.runtime.onInstalled.addListener(updateBlockedSites);

// Listen for storage changes to update rules
chrome.storage.onChanged.addListener(updateBlockedSites);
