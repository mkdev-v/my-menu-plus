const PARENT_MENU_ID = "my-menu-plus-root";
const MENU_TITLE = "MyMenu+";

// Rebuild context menu
function rebuildContextMenu(urls) {
    // Delete old menu
    browser.contextMenus.removeAll().then(() => {
        // Create root menu 
        browser.contextMenus.create({
            id: PARENT_MENU_ID,
            title: MENU_TITLE,
            contexts: ["all"]
        });

        // Add URLs menu
        urls.forEach((item, index) => {
            browser.contextMenus.create({
                id: `url-${index}`,
                parentId: PARENT_MENU_ID,
                title: item.title || item.url,
                contexts: ["all"]
            });
        });

        // Add separator
        browser.contextMenus.create({
            id: "separator-1",
            parentId: PARENT_MENU_ID,
            type: "separator",
            contexts: ["all"]
        });

        // Add action menu
        browser.contextMenus.create({
            id: "add-current-page",
            parentId: PARENT_MENU_ID,
            title: "Add This Page",
            contexts: ["all"]
        });

        // Add option menu
        browser.contextMenus.create({
            id: "open-options",
            parentId: PARENT_MENU_ID,
            title: "Options",
            contexts: ["all"]
        });

    });
}

// Initial loading
browser.runtime.onInstalled.addListener(() => {
    // Initialize menu
    browser.storage.local.set({
        urls:
            [
                { title: "Google", url: "https://www.google.com/" },
                { title: "YouTube", url: "https://www.youtube.com/" },
            ]
    })

    browser.storage.local.get("urls").then(result => {
        const urls = result.urls || [];
        rebuildContextMenu(urls);
    });
});

// Startup loading
browser.runtime.onStartup.addListener(() => {
    browser.storage.local.get("urls").then(result => {
        const urls = result.urls || [];
        rebuildContextMenu(urls);
    });
});

// Post option save loading 
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "rebuild-context-menu") {
        browser.storage.local.get("urls").then(result => {
            const urls = result.urls || [];
            rebuildContextMenu(urls);
        });
    }
});

// Click menu process
browser.contextMenus.onClicked.addListener((info, tab) => {
    // Options
    if (info.menuItemId === "open-options") {
        browser.runtime.openOptionsPage();
        return;
    }

    // Add page
    if (info.menuItemId === "add-current-page") {
        browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
            const currentTab = tabs[0];
            if (!currentTab || !currentTab.url || !currentTab.title) return;

            browser.storage.local.get("urls").then(result => {
                const urls = result.urls || [];

                urls.push({
                    title: currentTab.title,
                    url: currentTab.url
                });

                browser.storage.local.set({ urls }).then(() => {
                    rebuildContextMenu(urls);
                });
            });
        });

        return;
    }

    // URLs
    const match = info.menuItemId.match(/^url-(\d+)$/);
    if (match) {
        const index = parseInt(match[1]);
        browser.storage.local.get("urls").then(result => {
            const urls = result.urls || [];
            if (urls[index]) {
                browser.tabs.create({ url: urls[index].url });
            }
        });
    }
});

// Open options to clicked addon icon
browser.browserAction.onClicked.addListener(() => {
    browser.runtime.openOptionsPage();
});
