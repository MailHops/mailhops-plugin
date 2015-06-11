/*
* @author: Andrew Van Tassel
* @email: andrew@andrewvantassel.com
* @website: http://mailhops.com
*/

var mailHops =
{
  msgURI:	null
  , isLoaded: false
  , options: {'version':'MailHops Postbox 1.0.1','lan':'en','unit':'mi','api_url':'http://api.mailhops.com','debug':false}
  , message: { secure:[] }
  , client_location: null
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

  mailHops.options.client_location = mailHops.getCharPref('mail.mailHops.client_location','');

  mailHops.options.api_url = mailHops.getCharPref('mail.mailHops.api_url','http://api.mailhops.com');
  
  if(mailHops.options.client_location == ''){
		mailHops.setClientLocation(function(response){
      mailHops.options.client_location=response;
    });
  }

  //init display
  mailHopsDisplay.init( mailHops.options );
};

mailHops.StreamListener =
{
  content: "" ,
  found: false ,
  onDataAvailable: function ( request , context , inputStream , offset , count )
  {
    try
    {
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
    }
    catch ( ex ) { }
  } ,
  onStartRequest: function ( request , context )
  {
    this.content = "" ;
    this.found = false ;
  } ,
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

  var received_ips;
  var all_ips = new Array();
  var rline='';
  //empty secure
  mailHops.message.secure = [];

  if(mailHops.options.show_lists){
      mailHopsDisplay.lists( headListUnsubscribe );
  }

  if(mailHops.options.show_lists){
      mailHopsDisplay.auth( headXMailer, headUserAgent, headXMimeOLE, headAuth, headReceivedSPF );
  }

  //loop through the received headers and parse for IP addresses
  if ( headReceived ){
  	var headReceivedArr = headReceived.split('\n');
  	if(headReceivedArr.length != 0){
    	for ( var h=0; h<headReceivedArr.length; h++ ) {
    		//build the received line by concat until semi-colon ; date/time
    		rline += headReceivedArr[h];
    		if(headReceivedArr[h].indexOf(';')==-1)
    			continue;
    		received_ips = rline.match(regexAllIp);

    		//maybe multiple IPs in one Received: line
	      	if(received_ips != null && received_ips.length !=0){
	      		for( var r=0; r<received_ips.length; r++ ){
	      			if(regexIp.test(received_ips[r]) && mailHops.testIP(received_ips[r],rline)){
	      				all_ips.unshift( received_ips[r] );
						    //don't want duplicate IPs from the same Received header
                if(r < received_ips.length && received_ips[r] == received_ips[r+1])
                   break;     
		    		}
		   		}
	      	}
	      //reset the line
	      rline='';
      }
    }
  }
  //get the originating IP address
	if(headXOrigIP){
    //remove brackets
    headXOrigIP = headXOrigIP.replace('[','').replace(']','');
    //IPV6 check
    if(headXOrigIP.indexOf(':') !== -1 && headXOrigIP.match(regexIPV6)){
      all_ips.unshift( headXOrigIP );
    } else {
      var ip = headXOrigIP.match(regexAllIp);
  		if(ip != null && ip.length != 0 && all_ips.indexOf(ip[0])==-1)
  			all_ips.unshift( ip[0] );
    }
	}
  if ( all_ips.length != 0 ){
   mailHops.lookupRoute ( all_ips ) ;
  } else {
	  mailHopsDisplay.clear( true );
  }
};
//another ip check, dates will throw off the regex
mailHops.testIP = function(ip,header){
	var retval = true;

	try
	{
		var firstchar = header.substring(header.indexOf(ip)-1);
			firstchar = firstchar.substring(0,1);
		var lastchar = header.substring((header.indexOf(ip)+ip.length));
			lastchar = lastchar.substring(0,1);

		if(firstchar.match(/\.|\d|\-/)
      || lastchar.match(/\.|\d|\-/)
      || ( firstchar == '?' && lastchar == '?' ) 
      || lastchar == ';'){
			return null;      
    }
    else if(header.indexOf('['+ip+']') !== -1 || header.indexOf('('+ip+')') !== -1){
			retval = true;      
    }
		
    //check if this IP was part of a secure transmission
		if(retval){
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
	}
	catch(ex) {
		retval = true;
	}
	return retval;
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

  try
  {
    value = pref.getCharPref ( strName ) ;
  }
  catch ( exception )
  {
    value = strDefault ;
  }

  return ( value ) ;
};

mailHops.setClientLocation = function(cb,api_url){

	var xmlhttp = new XMLHttpRequest();
	if (!pref){
	    var pref = Components.classes["@mozilla.org/preferences-service;1"].getService( Components.interfaces.nsIPrefBranch ) ;
	}

	 if(api_url)
    xmlhttp.open("GET", api_url+'/v1/lookup/?app='+mailHops.options.version+'&r=&c=1',true);
  else
    xmlhttp.open("GET", mailHops.options.api_url+'/v1/lookup/?app='+mailHops.options.version+'&r=&c=1',true);

	 xmlhttp.onreadystatechange=function() {
	  if (xmlhttp.readyState==4) {
	  try{
         var data = JSON.parse(xmlhttp.responseText);
		   if(data && data.meta.code==200){
		   		//display the result
		   		pref.setCharPref("mail.mailHops.client_location", JSON.stringify(data.response)) ;
          cb(data.response);
		   } else {
			   pref.setCharPref("mail.mailHops.client_location", '') ;
         cb('');
		   }
	   } catch (e){
		  pref.setCharPref("mail.mailHops.client_location", '') ;
      cb('');
	   }
	  }
	 };
	 xmlhttp.send(null);
};

//mailhops lookup
mailHops.lookupRoute = function(header_route){

 //setup loading
 mailHopsDisplay.clear();

 var lookupURL = mailHops.options.api_url+'/v1/lookup/?app='+mailHops.options.version+'&r='+String(header_route)+'&l='+mailHops.options.lan+'&u='+mailHops.options.unit;

 if(mailHops.options.fkey != '')
    lookupURL += '&fkey='+mailHops.options.fkey;

 if(mailHops.options.client_location != '')
    lookupURL+='&c=0';

 mailHops.LOG(lookupURL);

 //check for cache
 var cached_results = mailHops.getResults();

 if(cached_results){
   mailHops.LOG('Found Cached Result');
 	 cached_results = JSON.parse(cached_results);
	 mailHopsDisplay.route(header_route, mailHops.message, cached_results.response, cached_results.meta, lookupURL);
	 return;
 }

 //call mailhops api for lookup
 var xmlhttp = new XMLHttpRequest();

 xmlhttp.open("GET", lookupURL ,true);
 xmlhttp.onreadystatechange=function() {
  if (xmlhttp.readyState==4) {
    try {
       var data = JSON.parse(xmlhttp.responseText);
       if(data && data.meta.code==200){
          var d = new Date();
          data.meta.cached = d.toISOString();

          //save the result
  	   		mailHops.saveResults(JSON.stringify(data));

          //display the result
  	   		mailHopsDisplay.route(header_route, mailHops.message, data.response, data.meta, lookupURL);
  	   } else {
          mailHops.LOG(JSON.stringify(data));
  	    	//display the error
  	   		mailHopsDisplay.error(data);
  	   }
     } catch (ex){
         mailHops.LOG(JSON.stringify(ex));
     	   mailHopsDisplay.error();
     }
  }
 };
 xmlhttp.send(null);
};

mailHops.saveResults = function(results){

	if(!mailHops.msgURI)
		return false;

	var messenger = Components.classes["@mozilla.org/messenger;1"].createInstance().QueryInterface(Components.interfaces.nsIMessenger);
	var msgHdr = messenger.messageServiceFromURI(mailHops.msgURI).messageURIToMsgHdr(mailHops.msgURI);

	if(!msgHdr)
		return false;

	msgHdr.setStringProperty( "MH-Route", results );

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
