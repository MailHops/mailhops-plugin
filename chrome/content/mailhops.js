/*
* @author: Andrew Van Tassel
* @email: andrew@andrewvantassel.com
* @website: http://mailhops.com
* @TODO: cache result and display country flag in column
*/
//import nativeJSON 
var gNativeJSON = Components.classes["@mozilla.org/dom/json;1"].createInstance(Components.interfaces.nsIJSON);
//IP regex
var gIPRegEx=/(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)\.(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)\.(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)\.(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)(\/(?:[012]\d?|3[012]?|[456789])){0,1}$/; 
var gAllIPRegEx = /(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)\.(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)\.(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)\.(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)(\/(?:[012]\d?|3[012]?|[456789])){0,1}/g;
var gApp = 'Postbox';

var mailHops =
{
  resultBox:	null,
  resultImage:	null,
  resultText:	null,
  container:	null,
  isLoaded:     false,
  map:			'goog',
  unit:			'mi',
  appVersion:	'MailHops '+gApp+' 0.4.3'
}

mailHops.startLoading = function()
{
  mailHops.isLoaded = true;
  mailHops.container = document.getElementById ( "mailhopsBox" ) ;
  mailHops.resultBox = document.getElementById ( "mailhopsResult" ) ;
  mailHops.resultImage = document.getElementById ( "mailhopsResultImage" ) ;  
  mailHops.resultText = document.getElementById ( "mailhopsResultText" ) ;
  //get preferences
  mailHops.map = mailHops.getCharPref('mail.mailHops.map','goog');
  mailHops.unit = mailHops.getCharPref('mail.mailHops.unit','mi');  
} ;

mailHops.StreamListener =
{
  content: "" ,
  found: false ,
  onDataAvailable: function ( request , context , inputStream , offset , count )
  {
    try
    {
      var sis = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance ( Components.interfaces.nsIScriptableInputStream ) ;
      sis.init ( inputStream ) ;

      if ( ! this.found )
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
    mailHops.dispRoute() ;
  }
} ;

/**
*	loop through the header, find out if we have received-from headers
*/
mailHops.loadHeaderData = function()
{
  var msgURI = null ;

  if ( gDBView )
  {
    msgURI = gDBView.URIForFirstSelectedMessage ;
  }

  if ( msgURI == null )
  {
    return ;
  }

  var messenger = Components.classes["@mozilla.org/messenger;1"].createInstance ( Components.interfaces.nsIMessenger ) ;
  var msgService = messenger.messageServiceFromURI ( msgURI ) ;
  msgService.CopyMessage ( msgURI , mailHops.StreamListener , false , null , msgWindow , {} ) ;
} ;

mailHops.dispRoute = function()
{

  var headReceived = mailHops.headers.extractHeader ( "Received" , true ) ;
  var headXOrigIP = mailHops.headers.extractHeader ( "X-Originating-IP" , false ) ;
  var received_ips;
  var all_ips = new Array();
  var rline='';
  //get the originating IP address
	if(headXOrigIP){
		var ip = headXOrigIP.match(gAllIPRegEx);
		if(ip != null && ip.length != 0)
			all_ips.push( ip[0] );
	}
  //loop through the received headers and parse for IP addresses	
  if ( headReceived ){
  	var headReceivedArr = headReceived.split('\n');
  	if(headReceivedArr.length != 0){
    	for ( var h=0; h<headReceivedArr.length; h++ ) {
    		//build the received line by concat until semi-colon ; date/time
    		if(headReceivedArr[h].indexOf(';')==-1){
    			rline += headReceivedArr[h];
    			continue;
    		}    		
    		received_ips = rline.match(gAllIPRegEx);	
	      	//maybe multiple IPs in one Received: line	
	      	if(received_ips != null && received_ips.length !=0){
	      		for( var r=0; r<received_ips.length; r++ ){	      			
	      			//only look at the first IP
	      			if(gIPRegEx.test(received_ips[r]) && all_ips.indexOf(received_ips[r])==-1 && mailHops.testIP(received_ips[r],rline)){
						all_ips.push( received_ips[r] );
						break;		    	    
		    	}
		   	}
	      }
	      //reset the line
	      rline='';
      }
    } 
  }
  if ( all_ips.length != 0 ){
   mailHops.lookup ( all_ips ) ;
  } else {
	  mailHops.displayResult('chrome://mailhops/content/images/local.png',null,null,null,null,null);
  }
};
//another ip check, dates will throw off the regex
mailHops.testIP = function(ip,header){

	var retval;
	try
	{
		if(header.indexOf(ip) == -1)
			retval = true;
		var firstchar = header.substring(header.indexOf(ip)-1);
			firstchar = firstchar.substring(0,1);	
		var lastchar = header.substring((header.indexOf(ip)+ip.length));
			lastchar = lastchar.substring(0,1);
		if(firstchar == '[' && lastchar == ']')
			retval = true;
		else if(firstchar == '(' && lastchar == ')')
			retval = true;
		else if(firstchar.match(/\.|\d|\-/))
			retval = null;
		else if(lastchar.match(/\.|\d|\-/))
			retval = null;		
		else
			retval = true;
	}
	catch(ex) {
		retval = true;
	}
	return retval;
	
};

mailHops.displayResult = function ( image, distance, city, state, countryName, route )
{
  var displayText='';
  		
  if(image.indexOf('error')!=-1) {
  	displayText = ' There was a problem connecting to MailHops.'; 
  }
  else if(image.indexOf('local')!=-1) {
  	displayText = ' Local message.';
  }				
  else {
  	if(city && state)
		displayText = city+', '+state;
	else if(countryName)
  		displayText = countryName;
    if(distance && distance.miles > 0){
    	if(mailHops.unit=='mi')
			displayText +=' ( '+addCommas(Math.round(distance.miles))+' mi traveled )';
		else
			displayText +=' ( '+addCommas(Math.round(distance.kilometers))+' km traveled )';
	}
	else if(displayText=='')
		displayText = ' Local message.';	
  } 
  //add event for route api map
  	if(route)
		mailHops.container.setAttribute("onclick","launchMap('"+route.toString()+"');");
	else
		mailHops.container.removeAttribute("onclick");
   
  mailHops.resultText.textContent = displayText;
  mailHops.resultImage.src=image; 
} ;

mailHops.clearRoute = function(){
	mailHops.resultImage.src='chrome://mailhops/content/images/loader.gif';
	mailHops.resultText.textContent = ' Looking Up Route'; 
} ;

mailHops.setupEventListener = function()
{
  if ( mailHops.isLoaded ){
    return ;
  }

  mailHops.startLoading() ;
  mailHops.registerObserver() ;
 
  var listener = {} ;
  listener.onStartHeaders = function() { mailHops.clearRoute() ; } ;
  listener.onEndHeaders = mailHops.loadHeaderData ;
  gMessageListeners.push ( listener ) ;
} ;

//preferences observers
mailHops.registerObserver = function()
{
  var prefService = Components.classes["@mozilla.org/preferences-service;1"].getService ( Components.interfaces.nsIPrefService ) ;
  mailHops._branch = prefService.getBranch ( "mail.mailHops." ) ;
  mailHops._branch.QueryInterface ( Components.interfaces.nsIPrefBranchInternal ) ;
  mailHops._branch.addObserver ( "" , mailHops , false ) ;
} ;

mailHops.unregisterObserver = function()
{
  if ( !mailHops._branch ){
    return ;
  }

  mailHops._branch.removeObserver ( "" , mailHops ) ;
} ;

mailHops.observe = function ( aSubject , aTopic , aData )
{
  if ( aTopic != "nsPref:changed" ){
    return ;
  }

  mailHops.startLoading();
} ;

mailHops.getCharPref = function ( strName , strDefault )
{
  var value;

  try
  {
    value = pref.getCharPref ( strName ) ;
  }
  catch ( exception )
  {
    value = strDefault ;
  }

  return ( value ) ;
} ;

//mailhops lookup
mailHops.lookup = function(route){

 //setup loading
 mailHops.clearRoute();
  
 //call mailhops api for lookup	
 var xmlhttp = new XMLHttpRequest();
 var flag= 'chrome://mailhops/content/images/local.png';
 var city;
 var state;
 var countryName;
 
 xmlhttp.open("GET", 'http://api.mailhops.com/v1/lookup/?tb&app='+mailHops.appVersion+'&r='+route.toString(),true);
 xmlhttp.onreadystatechange=function() {
  if (xmlhttp.readyState==4) {
  try{
	   var data = gNativeJSON.decode(xmlhttp.responseText);
	   if(data && data.meta.code==200){
	   	for(var i=0; i<data.response.route.length;i++){
	   		if(!data.response.route[i].private && !data.response.route[i].client){
	   			if(data.response.route[i].countryCode)
		   			flag='chrome://mailhops/content/images/flags/'+data.response.route[i].countryCode.toLowerCase()+'.png';
	   			city=data.response.route[i].city;
	   			state=data.response.route[i].state;
	   			countryName=data.response.route[i].countryName;
	   			break;
	   		}   			
	   	}
	   	//display the result
	   	mailHops.displayResult(flag,data.response.distance,city,state,countryName,route);
	   } else {
	    //display the error
	   	mailHops.displayResult('chrome://mailhops/content/images/error.png',null,null,null,null,null);
	   }
   }
   catch (ex){ 
	   mailHops.displayResult('chrome://mailhops/content/images/error.png',null,null,null,null,null);
   }
  }
 };
 xmlhttp.send(null);

};

function addCommas(nStr)
{
	nStr += '';
	var x = nStr.split('.');
	var x1 = x[0];
	var x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}

function launchMap(route)
{
	//launch mailhops api map
	var openwin = window.openDialog('http://api.mailhops.com/v1/map/?tb&app='+mailHops.appVersion+'&m='+mailHops.map+'&u='+mailHops.unit+'&r='+route,"MailHops",'toolbar=no,location=no,directories=no,menubar=yes,scrollbars=yes,close=yes,width=730,height=330');
	openwin.focus();
}

addEventListener ( "messagepane-loaded" , mailHops.setupEventListener , true ) ;
