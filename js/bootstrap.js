// messenger.messages.onNewMailReceived.addListener((folder, messageList) => {
//   if(messageList.messages.length){
//     for (var m = 0; m < messageList.messages.length; m++){
//       browser.messages.getFull(messageList.messages[m].id).then((messagePart) => {
//         MailHops.getRoute(messageList.messages[m].id, messagePart.headers);
//       });
//     }
//   }
// });

browser.messageDisplayAction.onClicked.addListener((tabId) => {
  if (MailHops.isLoaded) {
    browser.messageDisplayAction.setPopup({popup: "content/mailhops_details.xhtml"});
    browser.messageDisplayAction.openPopup();    
  }
});

messenger.messageDisplay.onMessageDisplayed.addListener((tabId, message) => { 
  
  messenger.messages.getFull(message.id).then((messagePart) => {    
    // get route
    MailHops.init(message.id, messagePart.headers);    
  });
  
});

var port;
function connected(p) {
  port = p;
  port.onMessage.addListener(function(m) {
    switch (m.command) {
      case 'details':
        port.postMessage({
          "cmd": m.command,
          "message": MailHops.message,
          "response": MailHops.response,
          "options": MailHops.options
        });
        break;      
    }
  });
}
browser.runtime.onConnect.addListener(connected);