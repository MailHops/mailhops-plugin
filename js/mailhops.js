/*
* @author: Andrew Van Tassel
* @email: andrew@andrewvantassel.com
* @website: http://Mailhops.com
*/

const MailHops = {
  msgURI:	null,
  isLoaded: false,
  options: {
    version: 'MailHops Plugin 4.0.0',    
    api_key: '',
    owm_key: '',
    lang: 'en',    
    unit: 'mi',    
    api_http: 'https://',    
    api_host: 'api.Mailhops.com',    
    debug: true,    
    country_tag: false,    
    travel_time_junk: false,    
    country_filter: []    
  },
  message: {
    id: null
    , map_url: ''
    , time: null
    , secure: []
    , headers: []   
    , auth: []
    , sender: {
      icon: '/images/refresh.png'
      , title: 'Loading...'
      , description: ''
    }
  },
  response: {},
  meta: {}
};

MailHops.LOG = function(msg) {
  if(!MailHops.options.debug)
    return;
  console.log('MailHops', msg);
};

MailHops.init = function(reload)
{
  var getting = browser.storage.local.get();
  getting.then(data => {
    if (data.api_key) {
      MailHops.options.api_key = data.api_key;
    }
    if (data.owm_key) {
      MailHops.options.owm_key = data.owm_key;
    }
    if (data.lang) {
      MailHops.options.lang = data.lang;
    }
    if (data.unit) {
      MailHops.options.unit = data.unit;
    }    
    MailHops.LOG('load MailHops prefs');    
  }, error => {
    MailHops.LOG('Error loading MailHops prefs');      
  });
};

MailHops.getRoute = function () {
  // set loading icon
  browser.messageDisplayAction.setPopup({ popup: '' });
  browser.messageDisplayAction.setIcon({ path: '/images/refresh.png' });
  browser.messageDisplayAction.setTitle({ title: 'Loading...' });
  if(browser.mailHopsUI)
    browser.mailHopsUI.insertBefore("", '/images/refresh.png', '', "countryIcon", "expandedHeaders2");
  
  //IP regex
  var regexIp=/(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)\.(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)\.(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)\.(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)(\/(?:[012]\d?|3[012]?|[456789])){0,1}$/;
  var regexAllIp = /(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)\.(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)\.(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)\.(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)(\/(?:[012]\d?|3[012]?|[456789])){0,1}/g;
  var regexIPV6 = /s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:)))(%.+)?s*/g;

  var headReceived = MailHops.message.headers['received'] || [];
  var headDate = MailHops.message.headers['date'] ? MailHops.message.headers['date'][0] : '';
  var headXReceived = MailHops.message.headers['x-received'] ? MailHops.message.headers['x-received'][0] : '';
  var headXOrigIP = MailHops.message.headers['x-originating-ip'] ? MailHops.message.headers['x-originating-ip'][0] : '';
  // auth box
  var headXMailer = MailHops.message.headers['x-mailer'] ? MailHops.message.headers['x-mailer'][0] : '';
  var headUserAgent = MailHops.message.headers['user-agent'] ? MailHops.message.headers['user-agent'][0] : '';
  var headXMimeOLE = MailHops.message.headers['x-mimeole'] ? MailHops.message.headers['x-mimeole'][0] : '';
  var headReceivedSPF = MailHops.message.headers['received-spf'] ? MailHops.message.headers['received-spf'][0] : '';
  var headAuth = MailHops.message.headers['authentication-results'] ? MailHops.message.headers['authentication-results'][0] : '';
  var headListUnsubscribe = MailHops.message.headers['list-unsubscribe'] ? MailHops.message.headers['list-unsubscribe'][0] : '';

  var all_ips = new Array();
  var rline = '',firstDate=headDate,lastDate;
  //empty secure and time
  MailHops.message.secure = [];
  MailHops.message.time = null;
  MailHops.message.auth = MailHops.auth( headXMailer, headUserAgent, headXMimeOLE, headAuth, headReceivedSPF );

  //loop through the received headers and parse for IP addresses
  if (Boolean(headReceived)){
    var received_ips = new Array();
	  for( var h=0; h < headReceived.length; h++ ) {
      //build the received line by concat until semi-colon ; date/time
  		rline += headReceived[h];
  		if(headReceived[h].indexOf(';') === -1)
  			continue;
      // first and last dates are used to calculate time traveled
      if(rline.indexOf(';') !== -1){
        if(!firstDate)
          firstDate = rline.substring(rline.indexOf(';')+1).trim();
        if(!lastDate)
          lastDate = rline.substring(rline.indexOf(';')+1).trim();
      }

      // IPV6 check
      rline = rline.replace(/\[IPv6\:/g,'[');
      if(rline.match(regexIPV6)){
          all_ips.unshift( rline.match(regexIPV6)[0] );
          //reset the line
          rline='';
          continue;
      }
      // parse IPs out of Received line
      received_ips = rline.match(regexAllIp);
      //continue if no IPs found
      if(!received_ips){
        //reset the line
        rline='';
        continue;
      }
      //get unique IPs for each Received header
      received_ips = received_ips.filter(function(item, pos) {
                      return received_ips.indexOf(item) === pos;
                    });
      for( var r=received_ips.length; r >= 0 ; r-- ){
        if(regexIp.test(received_ips[r]) && MailHops.testIP(received_ips[r],rline)){
  				all_ips.unshift( received_ips[r] );
  		  }
 		  }
      //reset the line
      rline='';
    }
  }

  // parse dates
  if(firstDate && firstDate.indexOf('(') !==- 1)
    firstDate = firstDate.substring(0,firstDate.indexOf('(')).trim();
  if(lastDate && lastDate.indexOf('(') !== -1)
    lastDate = lastDate.substring(0,lastDate.indexOf('(')).trim();
  if(firstDate && lastDate){
    try {
      firstDate = new Date(firstDate);
      lastDate = new Date(lastDate);
      MailHops.message.time = lastDate - firstDate;
    } catch(e){
      MailHops.LOG('travel dates parse Error: '+JSON.stringify(e));
      MailHops.message.time = null;
    }
  } else {
    MailHops.message.time = null;
  }

  //get the originating IP address
	if(Boolean(headXOrigIP)){
    headXOrigIP = headXOrigIP.replace(/\[IPv6\:/g,'[');
    //IPV6 check
    if(headXOrigIP.match(regexIPV6)){
      var ip = headXOrigIP.match(regexIPV6)
      if(Boolean(ip) && ip.length && all_ips.indexOf(ip[0])==-1)
        all_ips.unshift( ip[0] );
    } else {
      var ip = headXOrigIP.match(regexAllIp);
  		if(Boolean(ip) && ip.length && all_ips.indexOf(ip[0])==-1)
  			all_ips.unshift( ip[0] );
    }
	}

  if ( all_ips.length ){
    MailHops.lookupRoute ( all_ips ) ;
  } else {
	  MailHops.clear();
  }
};

//another ip check, dates will throw off the regex
MailHops.testIP = function(ip,header){
	var validIP = true;

	try {
		var firstchar = header.substring(header.indexOf(ip)-1);
			firstchar = firstchar.substring(0,1);
		var lastchar = header.substring((header.indexOf(ip)+ip.length));
			lastchar = lastchar.substring(0,1);

		if(firstchar.match(/\.|\d|\-/)
        || lastchar.match(/\.|\d|\-/)
        || ( firstchar == '?' && lastchar == '?' )
        || (firstchar == ':' || lastchar == ':')
        || lastchar == ';'
        || header.toLowerCase().indexOf(' id '+ip) !== -1
        || parseInt(ip.substring(0,ip.indexOf('.'))) >= 240 //IANA-RESERVED
    ){
      //only if there is one instance of this IP
      if(header.indexOf(ip) == header.lastIndexOf(ip))
			   validIP = false;
    } else if(header.indexOf('using SSL') !== -1
        || header.indexOf('using TLS') !== -1
        || header.indexOf('version=TLSv1/SSLv3') !== -1
      ){
        //check if this IP was part of a secure transmission
        MailHops.message.secure.push(ip);
		}
	} catch(e) {
		MailHops.LOG('testIP Error: '+JSON.stringify(e));
	}
	return validIP;
};

MailHops.clear = function () {
  MailHops.message.sender = {
    title: 'Local',
    countryCode: '',
    icon: '/images/local.png'
  };
  browser.messageDisplayAction.setIcon({ path: MailHops.message.sender.icon });
  browser.messageDisplayAction.setTitle({ title: MailHops.message.sender.title });
  if (browser.mailHopsUI)    
    browser.mailHopsUI.insertBefore("", MailHops.message.sender.icon, MailHops.message.sender.title, "countryIcon", "expandedHeaders2");
}

MailHops.error = function(status, data){  
  MailHops.message.sender = {
    title: (data && data.error && data.error.message) ? data && data.error.message : 'Service Unavailable',
    countryCode: '',
    icon: '/images/auth/error.png'
  };
  browser.messageDisplayAction.setIcon({ path: MailHops.message.sender.icon });
  browser.messageDisplayAction.setTitle({ title: MailHops.message.sender.title });
  if (browser.mailHopsUI)
    browser.mailHopsUI.insertBefore("", MailHops.message.sender.icon, MailHops.message.sender.title, "countryIcon", "expandedHeaders2");
}

MailHops.auth = function (header_xmailer, header_useragent, header_xmimeole, header_auth, header_spf) {
  let auth = [];
  //SPF
  if(header_spf){
    header_spf = header_spf.replace(/^\s+/, "");
    auth.push({
      type: 'SPF',
      icon: '/images/auth/' + headerSPFArr[0] + '.png',
      copy: header_spf + '\n' + mailHopsUtils.spf(headerSPFArr[0])
    });    
  } 
  //Authentication-Results
  //http://tools.ietf.org/html/rfc5451
  if(header_auth){
    var headerAuthArr=header_auth.split(';');
    var dkim_result;
    var spf_result;
    for(var h=0;h<headerAuthArr.length;h++){
      if(headerAuthArr[h].indexOf('dkim=')!=-1){
        dkim_result = headerAuthArr[h];
        if(header_spf)
          break;
      }
      if(!header_spf && headerAuthArr[h].indexOf('spf=')!=-1){
        spf_result = headerAuthArr[h];
        if(dkim_result)
          break;
      }
    }
    if(dkim_result){
      dkim_result=dkim_result.replace(/^\s+/,"");
      var dkimArr=dkim_result.split(' ');
      auth.push({
        type: 'DKIM',
        icon: '/images/auth/' + dkimArr[0].replace('dkim=','') + '.png',
        copy: dkim_result + '\n' + mailHopsUtils.dkim(dkimArr[0].replace('dkim=', ''))        
      });
    } 
    if(spf_result){
      spf_result=spf_result.replace(/^\s+/,"");
      var spfArr = spf_result.split(' ');
      auth.push({
        type: 'SPF',
        icon: '/images/auth/' + spfArr[0].replace('spf=','') + '.png',
        copy: spf_result + '\n' + mailHopsUtils.spf(spfArr[0].replace('spf=', ''))        
      });
    }
  }   
  return auth;
}

//mailhops lookup
MailHops.lookupRoute = function(header_route){

 var lookupURL = '?'+MailHopsUtils.getAPIUrlParams(MailHops.options)+'&r='+String(header_route)+'&l='+MailHops.options.lang+'&u='+MailHops.options.unit;

 if(MailHops.options.owm_key != '')
    lookupURL += '&owm_key='+MailHops.options.owm_key;
 if(MailHops.message.time != null)
    lookupURL += '&t='+MailHops.message.time;
  
  MailHops.message.map_url = MailHopsUtils.getAPIUrl() + '/map/' + lookupURL;  
  
//call mailhops api for lookup
var xmlhttp = new XMLHttpRequest();  
 xmlhttp.open("GET", MailHopsUtils.getAPIUrl() + '/lookup/' + lookupURL ,true);
 xmlhttp.onreadystatechange=function() {
  if (xmlhttp.readyState===4){
    try {
       var data = JSON.parse(xmlhttp.responseText);
      if (xmlhttp.status === 200) {          
        MailHops.response = data.response;
        MailHops.meta = data.meta;         
        MailHops.message.sender = MailHopsUtils.getSender(data.response.route); 
        
        if (MailHops.message.sender) {
          browser.messageDisplayAction.setIcon({ path: MailHops.message.sender.icon });
          browser.messageDisplayAction.setTitle({ title: MailHops.message.sender.title });
          if (browser.mailHopsUI)
            browser.mailHopsUI.insertBefore("", MailHops.message.sender.icon, MailHops.message.sender.title, "countryIcon", "expandedHeaders2");
        } else {
          browser.messageDisplayAction.setIcon({ path: '/images/local.png' });
          browser.messageDisplayAction.setTitle({ title: 'Local' });
          if (browser.mailHopsUI)
            browser.mailHopsUI.insertBefore("", '/images/local.png', 'Local', "countryIcon", "expandedHeaders2");
        }
          //tag the result
          MailHops.tagResults(data, data.response.route);
          MailHops.isLoaded = true;          
  	   } else if(data.error){
          MailHops.LOG(JSON.stringify(data.error));
  	    	//display the error
          MailHops.error(xmlhttp.status, data);
  	   }
     } catch(e){
       MailHops.LOG(e);
       MailHops.error();
     }
  }
 };
 xmlhttp.send(null);
};

MailHops.tagResults = function(results, route){

  if (!results) {
    return false;
  }

  //Add junk tag on messages taking too long to travel  
  try {      
    if(Boolean(MailHops.options.travel_time_junk) && MailHops.message.time != null && MailHops.message.time > 10000){
      messenger.messages.update(MailHops.message.id, { 'junk': true });
      MailHops.LOG( "Junk: Travel time match" );
    }
  } catch(e){
    MailHops.LOG("Error adding CountryCode tag: " + e);      
  }
};

MailHops.init();