const script = document.createElement('script')
const script2 = document.createElement('script')
script.src = chrome.runtime.getURL('public/App.js')
script2.src = chrome.runtime.getURL('public/lib/dexie.js')

document.body.appendChild(script);
document.body.appendChild(script2);