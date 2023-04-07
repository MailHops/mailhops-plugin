const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const tabId = parseInt(urlParams.get("tabId"), 10);

var port = browser.runtime.connect({ name: "MailHops" });
port.postMessage({ command: "details", tabId });

port.onMessage.addListener(function (msg) {
  updateContent(msg);
  document.getElementById("mh-map-button").addEventListener("click", function () {
    // rebuild map url if it's not there
    if (!msg.message.map_url && msg.response && msg.response.route && msg.response.route.length) {
      let header_route = msg.response.route.map(r => r.ip).join(',');
      let lookupURL = '?'+MailHopsUtils.getAPIUrlParams(msg.options)+'&r='+String(header_route)+'&l='+msg.options.lang+'&u='+msg.options.unit;

      if(msg.options.owm_key != '')
        lookupURL += '&owm_key='+msg.options.owm_key;
      if(msg.message.time != null)
        lookupURL += '&t=' + msg.message.time;
      if(msg.message.date != null)
        lookupURL += '&d='+msg.message.date;
      
      msg.message.map_url = MailHopsUtils.getAPIUrl() + '/map/' + lookupURL;
    }
    if(msg.message.map_url)
      browser.tabs.create({ url: msg.message.map_url });  
  });
});

document.getElementById("mh-options-button").addEventListener("click", function () {
  browser.tabs.create({ url: '/content/preferences.html' });  
});

function updateContent(msg, noauth) {  
  //setup reload
  document.getElementById("mh-reload-button").addEventListener("click", async function () { 
    let data = await browser.storage.local.get('messages');
    if (data.messages && data.messages.list[msg.message.hash]) {
      delete data.messages.list[msg.message.hash];
      await browser.storage.local.set({messages: data.messages});      
    }
    this.innerHTML = "Removed!";
    document.location.reload();
  });
  
  if (msg.message.error) {
    document.getElementById('hop-message').classList.add('warning');
    document.getElementById('mh-map-button').style.display = 'none';    
    document.getElementById('hop-message-header').innerHTML = msg.message.error;
    return;
  }
  document.getElementById('hop-message').classList.remove('warning');
  document.getElementById('mh-map-button').style.display = 'inline-block';
  
  const route = msg.response.route || [];
  const sender = msg.message.sender || null;
  const unit = msg.options.unit || "mi";
  const theme = msg.options.theme || "light";
  let client = null;
  let items = [];
  
  // update theme
  if (theme == "dark") {
    if (!document.getElementById("hop-message").classList.contains("inverted")) {
      document.getElementById('mh-body').classList.add('inverted');
      document.getElementById('hop-message').classList.add('brown');
      document.getElementById('hop-list').classList.add('inverted');
      document.getElementById('mh-pop-segment').classList.add('inverted');
      document.getElementById('mh-map-button').classList.add('inverted');
      document.getElementById('mh-reload-button').classList.add('inverted');
      document.getElementById('mh-options-button').classList.add('inverted');
    }
  } else {
    if (document.getElementById("hop-message").classList.contains("inverted")) {
      document.getElementById('mh-body').classList.remove('inverted');
      document.getElementById('hop-message').classList.remove('brown');
      document.getElementById('hop-list').classList.remove('inverted');
      document.getElementById('mh-pop-segment').classList.remove('inverted');
      document.getElementById('mh-map-button').classList.remove('inverted');
      document.getElementById('mh-reload-button').classList.remove('inverted');
      document.getElementById('mh-options-button').classList.remove('inverted');
    }
  }
  
  for (var i = 0; i < route.length; i++) { 
    var header = 'Private';
    var icon = '/images/local.png';
    // set the client route
    if (route[i].client)
      client = route[i];
    
    if(route[i].countryCode)
      icon = '/images/flags/' + route[i].countryCode.toLowerCase() + '.png';
    
    if(route[i].city && route[i].state)      
      header = route[i].city + ', ' + route[i].state;                
    else if(route[i].city && route[i].countryCode)      
      header = route[i].city + ', ' + route[i].countryCode;        
    else if (route[i].city)              
      header = route[i].city;               
    else if (route[i].state)              
      header = route[i].state;               
    else if (route[i].countryName)           
      header = route[i].countryName;                
    
    var description = '<a href="https://www.mailhops.com/whois/' + route[i].ip + '" target="_blank" title="Who Is?">' + route[i].ip + '</a><br/>';
    
    if (msg.message.secure.indexOf(route[i].ip) !== -1) {
      description += '<img src="/images/auth/lock.png" title="Used TLS or SSL" /> ';
    }
    
    if (route[i].host)          
      description += route[i].host;
    if (route[i].whois && route[i].whois.descr)          
      description += MailHopsUtils.htmlEncode(route[i].whois.descr);
    if (route[i].whois && route[i].whois.netname)          
      description += MailHopsUtils.htmlEncode(route[i].whois.netname);
    
    var weather = '';
    if (route[i].weather) {
      weather = ' <img src="' + route[i].weather.icon_url + '" width="25" /> ';
      weather += Math.round(route[i].weather.temp).toString() + '°' + route[i].weather.temp_unit+' ';        
      weather += route[i].weather.summary;        
    }
      
    var asn = '';
    if (route[i].asn) {
      asn = '<br/>ASN Org: ' + MailHopsUtils.htmlEncode(route[i].asn.autonomous_system_organization);
      asn += ' (<a href="https://dnschecker.org/asn-whois-lookup.php?query='+route[i].asn.autonomous_system_number+'" target="_blank" title="ASN Lookup">' + route[i].asn.autonomous_system_number + '</a>)'
    }
    
    var auth = '';
    if (!noauth && msg.message.auth.length) {
      for (var a = 0; a < msg.message.auth.length; a++){
        if (msg.message.auth[a].icon) {
          auth += '<label class="tiny ui label ' + msg.message.auth[a].color + '"><img src="' + msg.message.auth[a].icon + '"/>' + msg.message.auth[a].type + ' ' + msg.message.auth[a].copy + '</label>';          
        }
        else if (msg.message.auth[a].link) {
          if (msg.message.auth[a].link.indexOf(',')) {
            auth += '<a class="tiny ui label ' + msg.message.auth[a].color + '" href="'+msg.message.auth[a].link.substr(0,msg.message.auth[a].link.indexOf(','))+'" target="_blank">' + msg.message.auth[a].type + '</a>';            
          }
          else {
            auth += '<a class="tiny ui label ' + msg.message.auth[a].color + '" href="'+msg.message.auth[a].link+'" target="_blank">' + msg.message.auth[a].type + '</a>';            
          }
        }
      }
    }
    // append child
    items.push('<div class="item"><div class="content"><div class="header"><img src="'+ icon + '" /> ' + header + weather +' <label class="ui circular label icon" style="float: right;">'+ (i + 1) +'</label></div><div class="description">'+ description + asn + '</div></div></div>');    
  }
  // header
  document.getElementById('hop-message-header').innerHTML = `${route.length} Hops`;
  if (sender && client) {    
    document.getElementById('hop-message-header').innerHTML += ' over '+MailHopsUtils.getDistance(sender, client, unit) + ' ' + unit;    
  }

  // hop list
  document.getElementById('hop-list').innerHTML = items.join('');
  try {
    document.getElementById('mh-auth').innerHTML = auth;    
  } catch (error) {
    if(error)
      console.error('MailHops', error);
    // if auth has bad html load without auth
    if(!noauth)
      updateContent(msg, true);
  }
}
