function readData(key){
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(key, (data) => {
            const value = data[key];
            if (value === undefined) {
                console.log(`"${key}" key not exists`);
                resolve(null);
            }
            resolve(value);
        })
    });
}

function setData(key, value){
    chrome.storage.sync.set({[key]: value});
}

async function getCurrentTab() {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

export { readData, setData, getCurrentTab };