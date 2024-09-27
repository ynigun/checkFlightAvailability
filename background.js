// מאזין להודעות מ-content script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "updateBadge") {
    // עדכון הטקסט על סמל התוסף
    chrome.action.setBadgeText({text: request.count.toString()});
    // הגדרת צבע הרקע של הטקסט על סמל התוסף
    chrome.action.setBadgeBackgroundColor({color: "#4688F1"});
  }
});

// מאזין לעדכוני טאבים
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete') {
    // הפעלת content script כאשר הדף נטען במלואו
    chrome.scripting.executeScript({
      target: {tabId: tabId},
      files: ['content.js']
    });
  }
});