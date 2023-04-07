// messenger.messages.onNewMailReceived.addListener((folder, messageList) => {
//   if(messageList.messages.length){
//     for (var m = 0; m < messageList.messages.length; m++){
//       browser.messages.getFull(messageList.messages[m].id).then((messagePart) => {
//         MailHops.getRoute(messageList.messages[m].id, messagePart.headers);
//       });
//     }
//   }
// });

// Keep track of MailHops instances per tab.
let tabHops = new Map();

browser.messageDisplayAction.onClicked.addListener((tab) => {
  let mailHop = tabHops.get(tab.id);
  if (mailHop.isLoaded) {
    browser.messageDisplayAction.setPopup({
      tabId: tab.id,
      popup: `content/mailhops_details.xhtml?tabId=${tab.id}`
    });
    browser.messageDisplayAction.openPopup();
  }
});

async function initMessageTab(tab, message) {
  let mailHop = new MailHops();
  let messagePart = await messenger.messages.getFull(message.id);
  await mailHop.init(tab.id, message.id, messagePart.headers);
  tabHops.set(tab.id, mailHop);
}
messenger.messageDisplay.onMessageDisplayed.addListener(initMessageTab);

var port;
function connected(p) {
  port = p;
  port.onMessage.addListener(function (m) {
    switch (m.command) {
      case 'details':
        let mailHop = tabHops.get(m.tabId);
        port.postMessage({
          "cmd": m.command,
          "message": mailHop.message,
          "response": mailHop.response,
          "options": mailHop.options
        });
        break;
    }
  });
}
browser.runtime.onConnect.addListener(connected);


// Update all messages currently displayed.
async function updateAllCurrentMessages() {
  let tabs = await browser.tabs.query({})
  let messageTabs = tabs.filter(tab => ["mail", "messageDisplay"].includes(tab.type));
  for (let messageTab of messageTabs) {
    let message = await browser.messageDisplay.getDisplayedMessage(messageTab.id);
    if (message) {
      await initMessageTab(messageTab, message);
    }
  }
}
updateAllCurrentMessages();
