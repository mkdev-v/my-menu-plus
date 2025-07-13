const tableBody = document.querySelector("#urlTable tbody");
const addRowBtn = document.getElementById("addRow");
const saveBtn = document.getElementById("save");
const refreshBtn = document.getElementById("refresh");

function createRow(data = { title: "", url: "" }) {
    const row = document.createElement("tr");

    // Title
    const titleCell = document.createElement("td");
    const titleInput = document.createElement("input");
    titleInput.value = data.title;
    titleCell.appendChild(titleInput);
    row.appendChild(titleCell);

    // const urlCell = document.createElement("td");
    // const urlInput = document.createElement("input");
    // urlInput.value = data.url;
    // urlCell.appendChild(urlInput);
    // row.appendChild(urlCell);

    // URL
    const urlCell = document.createElement("td");
    const urlTextarea = document.createElement("textarea");
    urlTextarea.value = data.url;
    urlCell.appendChild(urlTextarea);
    row.appendChild(urlCell);
    
    // Action buttons
    const actionCell = document.createElement("td");

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = () => row.remove();
    actionCell.appendChild(deleteBtn);

    // Up button
    const upBtn = document.createElement("button");
    upBtn.textContent = "↑";
    upBtn.onclick = () => {
        const prev = row.previousElementSibling;
        if (prev) tableBody.insertBefore(row, prev);
    };
    actionCell.appendChild(upBtn);

    // Down button
    const downBtn = document.createElement("button");
    downBtn.textContent = "↓";
    downBtn.onclick = () => {
        const next = row.nextElementSibling;
        if (next) tableBody.insertBefore(next, row);
    };
    actionCell.appendChild(downBtn);

    row.appendChild(actionCell);
    tableBody.appendChild(row);
}

// Save
saveBtn.onclick = () => {
    const rows = tableBody.querySelectorAll("tr");
    const data = Array.from(rows).map(row => {
        const titleInput = row.querySelector("input");
        const urlTextarea = row.querySelector("textarea");
        return {
            title: titleInput ? titleInput.value : "",
            url: urlTextarea ? urlTextarea.value : ""
        };
    });
    chrome.storage.local.set({ urls: data }).then(() => {
        alert("Saved Successfully!");
        // Send message to backgroud to rebuild menu
        chrome.runtime.sendMessage({ type: "rebuild-context-menu" });
    });
};

// Refresh
refreshBtn.onclick = () => {
    window.location.reload(true);
}

// Add
addRowBtn.onclick = () => createRow();

// Loding process
chrome.storage.local.get("urls").then(result => {
    (result.urls || []).forEach(data => createRow(data));
});
