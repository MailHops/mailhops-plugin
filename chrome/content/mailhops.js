/*
* @author: Andrew Van Tassel
* @email: andrew@andrewvantassel.com
* @website: http://mailhops.com
*/

var mailHops =
{
  msgURI:	null,
  isLoaded: false,
  options: {
      'version':'MailHops Plugin 3.0.1',
      'lan':'en',
      'unit':'mi',
      'api_http':'https://',
      'api_host':'api.mailhops.com',
      'debug':false,
      'bar_color': '#5E7A9B',
      'font_color': '#FFF',
      'font_size': '14px',
      'country_tag':false,
      'travel_time_junk':false,
      'country_filter':[]
  },
  message: {
    secure:[]
    ,time: null
  }
};

mailHops.LOG = function(msg) {
  if(!mailHops.options.debug)
    return;
  var consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
  consoleService.logStringMessage('MailHops: '+msg);
};

mailHops.init = function() {
  //import nativeJSON
  var nativeJSON = Components.classes["@mozilla.org/dom/json;1"].createInstance(Components.interfaces.nsIJSON);

  //load preferences
  mailHops.loadPref();

  document.getElementById("mailhopsLogo").addEventListener("click", function () {
        window.openDialog("chrome://mailhops/content/preferences.xul","","chrome, dialog, modal, centerscreen").focus();
      });

  document.getElementById("mailhopsDataPaneRefreshLink").addEventListener("click", function () {
        mailHops.refreshCache();
      });

  mailHops.isLoaded = true;

};

mailHops.loadPref = function(reload)
{
  mailHops.LOG('load MailHops prefs');
  //get preferences
  mailHops.options.lan = mailHops.getCharPref('mail.mailHops.lang','en');
  mailHops.options.unit = mailHops.getCharPref('mail.mailHops.unit','mi');
  mailHops.options.fkey = mailHops.getCharPref('mail.mailHops.fkey','');//forecast.io api_key

  //Display
  mailHops.options.bar_color = mailHops.getCharPref('mail.mailHops.bar_color','#5E7A9B');

  mailHops.options.font_color = mailHops.getCharPref('mail.mailHops.font_color','#FFF');

  mailHops.options.font_size = mailHops.getCharPref('mail.mailHops.font_size','14px');

  mailHops.options.debug = mailHops.getCharPref('mail.mailHops.debug','false')=='true'?true:false;

  mailHops.options.api_host = mailHops.getCharPref('mail.mailHops.api_host','api.mailhops.com');

  mailHops.options.api_http = mailHops.getCharPref('mail.mailHops.api_http','https://');

  mailHops.options.api_key = mailHops.getCharPref('mail.mailHops.api_key','');

  mailHops.options.map_provider = mailHops.getCharPref('mail.mailHops.map_provider','OpenStreetMap.Mapnik');

  mailHops.options.country_tag = mailHops.getCharPref('mail.mailHops.country_tag','false')=='true'?true:false;

  mailHops.options.travel_time_junk = mailHops.getCharPref('mail.mailHops.travel_time_junk','false')=='true'?true:false;

  mailHops.options.country_filter = mailHops.getCharPref('mail.mailHops.country_filter',[]);

  //init display
  mailHopsDisplay.init( mailHops.options, reload );
};

mailHops.StreamListener =
{
  content: "" ,
  found: false ,
  onDataAvailable: function ( request , context , inputStream , offset , count )
  {
    try {
      var sis = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance ( Components.interfaces.nsIScriptableInputStream ) ;
      sis.init( inputStream ) ;

      if( !this.found )
      {
        this.content += sis.read ( count ) ;
        this.content = this.content.replace ( /\r/g , "" ) ;
        var pos = this.content.indexOf ( "\n\n" ) ;

        if ( pos > -1 )
        {
          // last header line must end with LF -> pos+1 !!!
          this.content = this.content.substr ( 0 , pos + 1 ) ;
          this.found = true ;
        }
      }
    } catch(e) {
      //failed to read input stream
      mailHops.LOG('StreamListener Error: '+JSON.stringify(e));
    }
  },
  onStartRequest: function ( request , context )
  {
    this.content = "" ;
    this.found = false ;
  },
  onStopRequest: function ( aRequest , aContext , aStatusCode )
  {
    mailHops.headers = Components.classes["@mozilla.org/messenger/mimeheaders;1"].createInstance ( Components.interfaces.nsIMimeHeaders ) ;
    mailHops.headers.initialize ( this.content , this.content.length ) ;
    mailHops.getRoute() ;
  }
};

/**
*	loop through the header, find out if we have received-from headers
*/
mailHops.loadHeaderData = function() {
  var msgURI = null ;

  if ( gDBView ){
    msgURI = gDBView.URIForFirstSelectedMessage;
  }
  if ( msgURI == null ){
    return;
  }
  mailHops.msgURI = msgURI;
  var messenger = Components.classes["@mozilla.org/messenger;1"].createInstance ( Components.interfaces.nsIMessenger ) ;
  var msgService = messenger.messageServiceFromURI ( msgURI ) ;
  msgService.CopyMessage ( msgURI , mailHops.StreamListener , false , null , msgWindow , {} ) ;
};

mailHops.getRoute = function(){
  //IP regex
  var regexIp=/(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)\.(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)\.(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)\.(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)(\/(?:[012]\d?|3[012]?|[456789])){0,1}$/;
  var regexAllIp = /(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)\.(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)\.(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)\.(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)(\/(?:[012]\d?|3[012]?|[456789])){0,1}/g;

  // TODO test IPV6 regex for Received headers, currently only used for X-Originating-IP
  // IPv6 addresses including compressed and IPv4-embedded variants (RFC 2373)
  // http://regexlib.com/REDetails.aspx?regexp_id=2919
  var regexIPV6 = /(::|(([a-fA-F0-9]{1,4}):){7}(([a-fA-F0-9]{1,4}))|(:(:([a-fA-F0-9]{1,4})){1,6})|((([a-fA-F0-9]{1,4}):){1,6}:)|((([a-fA-F0-9]{1,4}):)(:([a-fA-F0-9]{1,4})){1,6})|((([a-fA-F0-9]{1,4}):){2}(:([a-fA-F0-9]{1,4})){1,5})|((([a-fA-F0-9]{1,4}):){3}(:([a-fA-F0-9]{1,4})){1,4})|((([a-fA-F0-9]{1,4}):){4}(:([a-fA-F0-9]{1,4})){1,3})|((([a-fA-F0-9]{1,4}):){5}(:([a-fA-F0-9]{1,4})){1,2}))/;

  var headReceived = mailHops.headers.extractHeader ( "Received" , true );
  var headDate = mailHops.headers.extractHeader ( "Date" , true );
  var headXReceived = mailHops.headers.extractHeader ( "X-Received" , false );
  var headXOrigIP = mailHops.headers.extractHeader ( "X-Originating-IP" , false );
  // auth box
  var headXMailer = mailHops.headers.extractHeader ( "X-Mailer" , false );
  var headUserAgent = mailHops.headers.extractHeader ( "User-Agent" , false );
  var headXMimeOLE = mailHops.headers.extractHeader ( "X-MimeOLE" , false );
  var headReceivedSPF = mailHops.headers.extractHeader ( "Received-SPF" , false );
  var headAuth = mailHops.headers.extractHeader ( "Authentication-Results" , false );
  var headListUnsubscribe = mailHops.headers.extractHeader ( "List-Unsubscribe" , false ) ;

  var all_ips = new Array();
  var rline = '',firstDate=headDate,lastDate;
  //empty secure and time
  mailHops.message.secure = [];
  mailHops.message.time = null;

  mailHopsDisplay.lists( headListUnsubscribe );

  mailHopsDisplay.auth( headXMailer, headUserAgent, headXMimeOLE, headAuth, headReceivedSPF );

  //loop through the received headers and parse for IP addresses
  if (!!headReceived){
    var received_ips = new Array();
	  var headReceivedArr = headReceived.split('\n');
    for( var h=0; h < headReceivedArr.length; h++ ) {
      //build the received line by concat until semi-colon ; date/time
  		rline += headReceivedArr[h];
  		if(headReceivedArr[h].indexOf(';') === -1)
  			continue;
      // first and last dates are used to calculate time traveled
      if(rline.indexOf(';') !== -1){
        if(!firstDate)
          firstDate = rline.substring(rline.indexOf(';')+1).trim();
        if(!lastDate)
          lastDate = rline.substring(rline.indexOf(';')+1).trim();
      }

      // parse IPs out of Received line
      received_ips = rline.match(regexAllIp);
      //continue if no IPs found
      if(!received_ips)
        continue;
      //get unique IPs for each Received header
      received_ips = received_ips.filter(function(item, pos) {
                      return received_ips.indexOf(item) == pos;
                    });
      for( var r=0; r < received_ips.length; r++ ){
        if(regexIp.test(received_ips[r]) && mailHops.testIP(received_ips[r],rline)){
  				all_ips.unshift( received_ips[r] );
  		  }
 		  }
      //reset the line
      rline='';
    }
  }

  // parse dates
  if(firstDate && firstDate.indexOf('(')!==-1)
    firstDate = firstDate.substring(0,firstDate.indexOf('(')).trim();
  if(lastDate && lastDate.indexOf('(')!==-1)
    lastDate = lastDate.substring(0,lastDate.indexOf('(')).trim();
  if(firstDate && lastDate){
    try {
      firstDate = new Date(firstDate);
      lastDate = new Date(lastDate);
      mailHops.message.time = lastDate - firstDate;
    } catch(e){
      mailHops.LOG('travel dates parse Error: '+JSON.stringify(e));
      mailHops.message.time = null;
    }
  } else {
    mailHops.message.time = null;
  }

  //get the originating IP address
	if(!!headXOrigIP){
    //remove brackets
    headXOrigIP = headXOrigIP.replace('[','').replace(']','');
    //IPV6 check
    if(headXOrigIP.indexOf(':') !== -1 && headXOrigIP.match(regexIPV6)){
      all_ips.unshift( headXOrigIP );
    } else {
      var ip = headXOrigIP.match(regexAllIp);
  		if(!!ip && ip.length && all_ips.indexOf(ip[0])==-1)
  			all_ips.unshift( ip[0] );
    }
	}

  if ( all_ips.length ){
    mailHops.lookupRoute ( all_ips ) ;
  } else {
	  mailHopsDisplay.clear( true );
  }
};
//another ip check, dates will throw off the regex
mailHops.testIP = function(ip,header){
	var validIP = true;

	try {
		var firstchar = header.substring(header.indexOf(ip)-1);
			firstchar = firstchar.substring(0,1);
		var lastchar = header.substring((header.indexOf(ip)+ip.length));
			lastchar = lastchar.substring(0,1);

		if(firstchar.match(/\.|\d|\-/)
        || lastchar.match(/\.|\d|\-/)
        || ( firstchar == '?' && lastchar == '?' )
        || lastchar == ';'
        || header.toLowerCase().indexOf('id '+ip) !== -1
        || parseInt(ip.substring(0,ip.indexOf('.'))) >= 240 //IANA-RESERVED
    ){
      //only if there is one instance of this IP
      if(header.indexOf(ip) == header.lastIndexOf(ip))
			   validIP = false;
    } else {
      //check if this IP was part of a secure transmission
      if(header.indexOf('using SSL') != -1){
        if(header.substring(header.indexOf('using SSL')+11,header.indexOf('using SSL')+12) == '.')
          mailHops.message.secure.push(ip+':'+header.substring(header.indexOf('using SSL'),header.indexOf('using TLS')+14));
        else
				  mailHops.message.secure.push(ip+':'+header.substring(header.indexOf('using SSL'),header.indexOf('using TLS')+11));
      }
			else if(header.indexOf('using TLS') != -1){
        if(header.substring(header.indexOf('using TLS')+11,header.indexOf('using TLS')+12) == '.')
				  mailHops.message.secure.push(ip+':'+header.substring(header.indexOf('using TLS'),header.indexOf('using TLS')+14));
        else
          mailHops.message.secure.push(ip+':'+header.substring(header.indexOf('using TLS'),header.indexOf('using TLS')+11));
      }
			else if(header.indexOf('version=TLSv1/SSLv3') != -1)
				mailHops.message.secure.push(ip+':'+'using TLSv1/SSLv3');
		}
	} catch(e) {
		mailHops.LOG('testIP Error: '+JSON.stringify(e));
	}
	return validIP;
};

mailHops.setupEventListener = function(){
  if ( mailHops.isLoaded ){
    return ;
  }

  mailHops.init();
  mailHops.registerObserver();

  var listener = {
    onStartHeaders: function() { mailHopsDisplay.clear(); }
    , onEndHeaders: mailHops.loadHeaderData
  };
  gMessageListeners.push( listener );
};

//preferences observers
mailHops.registerObserver = function(){
  var prefService = Components.classes["@mozilla.org/preferences-service;1"].getService( Components.interfaces.nsIPrefService ) ;
  mailHops._branch = prefService.getBranch( "mail.mailHops." ) ;
  mailHops._branch.QueryInterface( Components.interfaces.nsIPrefBranchInternal ) ;
  mailHops._branch.addObserver( "" , mailHops , false ) ;
};

mailHops.unregisterObserver = function(){
  if ( !mailHops._branch ){
    return ;
  }

  mailHops._branch.removeObserver ( "" , mailHops ) ;
};

mailHops.observe = function ( aSubject , aTopic , aData )
{
  if ( aTopic == "nsPref:changed" )
    mailHops.loadPref(true);
};

mailHops.getCharPref = function ( strName , strDefault ){
  var value;
  if (!pref){
      var pref = Components.classes["@mozilla.org/preferences-service;1"].getService( Components.interfaces.nsIPrefBranch ) ;
  }
  try {
    value = pref.getCharPref ( strName ) ;
  } catch(e){
    value = strDefault ;
  }
  return ( value ) ;
};

//mailhops lookup
mailHops.lookupRoute = function(header_route){

 //setup loading
 mailHopsDisplay.clear();

 var lookupURL = mailHopsUtils.getAPIUrl(mailHops.options)+'/lookup/?'+mailHopsUtils.getAPIUrlParams(mailHops.options)+'&r='+String(header_route)+'&l='+mailHops.options.lan+'&u='+mailHops.options.unit;

 if(mailHops.options.fkey != '')
    lookupURL += '&fkey='+mailHops.options.fkey;
 if(mailHops.message.time != null)
    lookupURL += '&t='+mailHops.message.time;

 //check for cache
 var cached_results = mailHops.getResults();

 if(cached_results){
   mailHops.LOG('Found Cached Result');
   try {
   	 cached_results = JSON.parse(cached_results);
  	 mailHopsDisplay.route(header_route, mailHops.message, cached_results.response, cached_results.meta, lookupURL);
	   return;
   } catch(e){
     mailHops.LOG('Failed to parse cached result: '+JSON.stringify(e));
   }
 }

mailHops.LOG(lookupURL);

 //call mailhops api for lookup
 var xmlhttp = new XMLHttpRequest();

 xmlhttp.open("GET", lookupURL ,true);
 xmlhttp.onreadystatechange=function() {
  if (xmlhttp.readyState===4){
    try {
       var data = JSON.parse(xmlhttp.responseText);
       if(xmlhttp.status===200){
          var d = new Date();
          data.meta.cached = d.toISOString();
          //save the result
  	   		mailHops.saveResults(JSON.stringify(data),data.response.route);
          //display the result
  	   		mailHopsDisplay.route(header_route, mailHops.message, data.response, data.meta, lookupURL);
  	   } else if(data.error){
          mailHops.LOG(JSON.stringify(data));
  	    	//display the error
  	   		mailHopsDisplay.error(xmlhttp.status,data);
  	   }
     } catch(e){
       mailHops.LOG(e);
       mailHopsDisplay.error();
     }
  }
 };
 xmlhttp.send(null);
};

mailHops.saveResults = function(results,route){

	if(!mailHops.msgURI)
		return false;

	var messenger = Components.classes["@mozilla.org/messenger;1"].createInstance().QueryInterface(Components.interfaces.nsIMessenger);
	var msgHdr = messenger.messageServiceFromURI(mailHops.msgURI).messageURIToMsgHdr(mailHops.msgURI);

	if(!msgHdr)
		return false;

  msgHdr.setStringProperty( "MH-Route", results );

  //Add tag
  if(!!route && !!mailHops.options.api_key){
    try {
      var countryCode = mailHopsUtils.getOriginatingCountryCode(route);
      var msg = Components.classes["@mozilla.org/array;1"].createInstance(Components.interfaces.nsIMutableArray);
      msg.clear();
      msg.appendElement(msgHdr, false);

      if(!!mailHops.options.country_tag){
        var tagService = Components.classes["@mozilla.org/messenger/tagservice;1"].getService(Components.interfaces.nsIMsgTagService);
          if(!tagService)
            return;

        if(!tagService.getKeyForTag(countryCode))
          tagService.addTag(countryCode,'',0);

        msgHdr.folder.addKeywordsToMessages(msg, countryCode );
        mailHops.LOG( "Added CountryCode tag: "+countryCode );
      }

      if(!!mailHops.options.country_filter && mailHops.options.country_filter.length){
        if(mailHops.options.country_filter.indexOf(countryCode.toLowerCase()) !== -1){
          msgHdr.folder.setJunkScoreForMessages(msg, "100");
          mailHops.LOG( "Junk: Country Filter match" );
        }
      }
      // tag as junk if travel time is longer than 10 seconds
      if(!!mailHops.options.travel_time_junk && mailHops.message.time != null && mailHops.message.time > 10000){
        msgHdr.folder.setJunkScoreForMessages(msg, "100");
        mailHops.LOG( "Junk: Travel time match" );
      }

    } catch(e){
      mailHops.LOG( "Error adding CountryCode tag: "+e );
    }
  }
};

mailHops.getResults = function(){

	if(!mailHops.msgURI)
		return false;

	var messenger = Components.classes["@mozilla.org/messenger;1"].createInstance().QueryInterface(Components.interfaces.nsIMessenger);
	var msgHdr = messenger.messageServiceFromURI(mailHops.msgURI).messageURIToMsgHdr(mailHops.msgURI);

	if(!msgHdr)
		return false;

  return msgHdr.getStringProperty( "MH-Route" );
};

mailHops.refreshCache = function(){
	mailHops.saveResults('');
	mailHops.getRoute();
};

addEventListener ( "messagepane-loaded" , mailHops.setupEventListener , true ) ;
