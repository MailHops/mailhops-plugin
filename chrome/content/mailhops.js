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
      'version':'MailHops Plugin 2.0.0',
      'lan':'en',
      'unit':'mi',
      'api_http':'https://',
      'api_host':'api.mailhops.com',
      'debug':false,
      'country_tag':false,
      'country_filter':[]
  },
  message: {
    secure:[]
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

  document.getElementById("mailhopsDataPanePrefsLink").addEventListener("click", function () {
        window.openDialog("chrome://mailhops/content/preferences.xul","","chrome, dialog, modal, centerscreen").focus();
      });

  document.getElementById("mailhopsDataPaneRefreshLink").addEventListener("click", function () {
        mailHops.refreshCache();
      });

  mailHops.isLoaded = true;

};

mailHops.loadPref = function()
{
  mailHops.LOG('load MailHops prefs');
  //get preferences
  mailHops.options.lan = mailHops.getCharPref('mail.mailHops.lang','en');
  mailHops.options.unit = mailHops.getCharPref('mail.mailHops.unit','mi');
  mailHops.options.fkey = mailHops.getCharPref('mail.mailHops.fkey','');//forecast.io api_key

  //Display Boxes
  mailHops.options.show_details = mailHops.getCharPref('mail.mailHops.show_details','true')=='true'?true:false;
  mailHops.options.show_meta = mailHops.getCharPref('mail.mailHops.show_meta','true')=='true'?true:false;
  mailHops.options.show_auth = mailHops.getCharPref('mail.mailHops.show_auth','true')=='true'?true:false;
  mailHops.options.show_lists = mailHops.getCharPref('mail.mailHops.show_lists','true')=='true'?true:false;

  //Details options
  mailHops.options.show_host = mailHops.getCharPref('mail.mailHops.show_host','true')=='true'?true:false;
  mailHops.options.show_secure = mailHops.getCharPref('mail.mailHops.show_secure','true')=='true'?true:false;

  //Auth options
  mailHops.options.show_dkim = mailHops.getCharPref('mail.mailHops.show_dkim','true')=='true'?true:false;
  mailHops.options.show_spf = mailHops.getCharPref('mail.mailHops.show_spf','true')=='true'?true:false;
  mailHops.options.show_mailer = mailHops.getCharPref('mail.mailHops.show_mailer','true')=='true'?true:false;
  mailHops.options.show_dnsbl = mailHops.getCharPref('mail.mailHops.show_dnsbl','true')=='true'?true:false;

  mailHops.options.debug = mailHops.getCharPref('mail.mailHops.debug','false')=='true'?true:false;

  mailHops.options.api_host = mailHops.getCharPref('mail.mailHops.api_host','api.mailhops.com');

  mailHops.options.api_http = mailHops.getCharPref('mail.mailHops.api_http','https://');

  mailHops.options.api_key = mailHops.getCharPref('mail.mailHops.api_key','');

  mailHops.options.map_provider = mailHops.getCharPref('mail.mailHops.map_provider','OpenStreetMap.Mapnik');

  mailHops.options.country_tag = mailHops.getCharPref('mail.mailHops.country_tag','false')=='true'?true:false;

  mailHops.options.country_filter = mailHops.getCharPref('mail.mailHops.country_filter',[]);

  //init display
  mailHopsDisplay.init( mailHops.options );
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

  var headReceived = mailHops.headers.extractHeader ( "Received" , true ) ;
  var headXOrigIP = mailHops.headers.extractHeader ( "X-Originating-IP" , false ) ;
  //auth box
  var headXMailer = (mailHops.options.show_auth && mailHops.options.show_mailer) ? mailHops.headers.extractHeader ( "X-Mailer" , false ) : null;
  var headUserAgent = (mailHops.options.show_auth && mailHops.options.show_mailer) ? mailHops.headers.extractHeader ( "User-Agent" , false ) : null;
  var headXMimeOLE = (mailHops.options.show_auth && mailHops.options.show_mailer) ? mailHops.headers.extractHeader ( "X-MimeOLE" , false ) : null;
  var headReceivedSPF = (mailHops.options.show_auth && mailHops.options.show_spf) ? mailHops.headers.extractHeader ( "Received-SPF" , false ) : null;
  var headAuth = mailHops.options.show_auth ? mailHops.headers.extractHeader ( "Authentication-Results" , false ) : null;
  //lists box
  var headListUnsubscribe = mailHops.options.show_lists ? mailHops.headers.extractHeader ( "List-Unsubscribe" , false ) : null;

  var all_ips = new Array();
  var rline = '';
  //empty secure
  mailHops.message.secure = [];

  if(mailHops.options.show_lists){
      mailHopsDisplay.lists( headListUnsubscribe );
  }

  if(mailHops.options.show_auth){
      mailHopsDisplay.auth( headXMailer, headUserAgent, headXMimeOLE, headAuth, headReceivedSPF );
  }

  //loop through the received headers and parse for IP addresses
  if (!!headReceived){
    var received_ips = new Array();
	  var headReceivedArr = headReceived.split('\n');
    for( var h=0; h < headReceivedArr.length; h++ ) {
      //build the received line by concat until semi-colon ; date/time
  		rline += headReceivedArr[h];
  		if(headReceivedArr[h].indexOf(';')==-1)
  			continue;
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
    mailHops.loadPref();
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
      mailHops.LOG(xmlhttp.status);
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
  if(!!route){
    try{
      var countryCode = mailHopsUtils.getXOriginatingCountryCode(route);
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
        }
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
