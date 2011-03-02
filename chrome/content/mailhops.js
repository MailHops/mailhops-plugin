/*
* @author: Andrew Van Tassel
* @email: andrew@andrewvantassel.com
* @website: http://mailhops.com
* @TODO: Add caching of lookup, display country flag in column
*/
//import nativeJSON 
var nativeJSON = Components.classes["@mozilla.org/dom/json;1"].createInstance(Components.interfaces.nsIJSON);
//IP regex
var gIPRegEx=/(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)\.(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)\.(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)\.(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)(\/(?:[012]\d?|3[012]?|[456789])){0,1}$/; 
var gAllIPRegEx = /((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])/g;

var mailHops =
{
  resultBox:	null,
  resultImage:	null,
  resultText:	null,
  container:	null,
  isLoaded:      false
}

mailHops.startLoading = function()
{
  mailHops.isLoaded = true;
  mailHops.container = document.getElementById ( "mailhops" ) ;
  mailHops.resultBox = document.getElementById ( "mailhopsResult" ) ;
  mailHops.resultImage = document.getElementById ( "mailhopsResultImage" ) ;  
  mailHops.resultText = document.getElementById ( "mailhopsResultText" ) ;
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
  var headReceived = new Array ( mailHops.headers.extractHeader ( "Received" , true ) ) ;
  var headXOrigIP = mailHops.headers.extractHeader ( "X-Originating-IP" , false ) ;
  var received_ips;
  var all_ips = new Array();
  
  //get the originating IP address
	if(headXOrigIP){
		var ip = headXOrigIP.match(gAllIPRegEx);
		if(ip != null && ip.length>0)
			all_ips.push(ip[0])
	}
  //loop through the received headers and parse for IP addresses	
  if ( headReceived.length > 0 ){
    for ( var i = 0 ; i < headReceived.length ; i++ ) {
      	received_ips = headReceived[i].match(gAllIPRegEx);	
      	//maybe multiple IPs in one Received: line	
      	if(received_ips != null){
	      	for (var p=0; p < received_ips.length; p++){
	      		//if we don't already have the IP then add it to the array
		      	if(gIPRegEx.test(received_ips[p]) && all_ips.indexOf(received_ips[p]) == -1 && mailHops.testIP(received_ips[p],headReceived[i]))
	    	    	all_ips.push(received_ips[p]);  
	      	}
      	}
    }
  }
  if ( all_ips.length > 0 ){
   mailHops.lookup ( all_ips ) ;
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
	catch(ex)
	{
		retval = true;
	}
	return retval;
	
};

mailHops.displayResult = function ( distance, image, city, state, route )
{
  if(distance){
    if(distance.miles > 0)
		mailHops.resultText.textContent = city+', '+state+' ( '+Math.round(distance.miles)+' miles to you )';
	else
		mailHops.resultText.textContent = city+', '+state;
	mailHops.container.setAttribute("onclick","launchMap('"+route.toString()+"');");
  } else {
  	mailHops.resultText.textContent = ' There was a problem.'; 
  }
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
 
  var listener = {} ;
  listener.onStartHeaders = function() { mailHops.clearRoute() ; } ;
  listener.onEndHeaders = mailHops.loadHeaderData ;
  gMessageListeners.push ( listener ) ;
} ;

mailHops.lookup = function(route){

 //setup loading
 mailHops.clearRoute();
  
 //call mailhops api for lookup	
 var xmlhttp = new XMLHttpRequest();
 var flag= 'chrome://mailhops/content/images/local.png';
 var city;
 var state;
 
 xmlhttp.open("GET", 'http://api.mailhops.com/v1/lookup/?tb&route='+route.toString(),true);
 xmlhttp.onreadystatechange=function() {
  if (xmlhttp.readyState==4) {
   var data = nativeJSON.decode(xmlhttp.responseText);
   if(data && data.meta.code==200){
   	for(var i=0; i<data.response.route.length;i++){
   		if(!data.response.route[i].local){
   			if(data.response.route[i].countryCode)
	   			flag='chrome://mailhops/content/images/flags/'+data.response.route[i].countryCode.toLowerCase()+'.png';
   			city=data.response.route[i].city;
   			state=data.response.route[i].state;
   			break;
   		}   			
   	}
   	//display the result
   	mailHops.displayResult(data.response.distance,flag,city,state,route);
   } else {
    //display the error
   	mailHops.displayResult(null,'chrome://mailhops/content/images/error.png',null,null,null);
   }
  }
 };
 xmlhttp.send(null);

};

function launchMap(route)
{
	//launch mailhops api map
	var openwin = window.openDialog('http://api.mailhops.com/v1/map/?tb&route='+route,"MailHops",'toolbar=no,location=no,directories=no,menubar=yes,scrollbars=yes,close=yes,width=730,height=330');
	openwin.focus();
}

addEventListener ( "messagepane-loaded" , mailHops.setupEventListener , true ) ;
