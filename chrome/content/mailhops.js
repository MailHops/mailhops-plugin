/*
* @author: Andrew Van Tassel
* @email: andrew@andrewvantassel.com
* @website: http://mailhops.com* 
*/

var mailHops =
{
  resultTextDataPane:		null,
  resultTextDataPane2:		null,
  resultContainerDataPane:	null,
  resultDetailsLink:		null,
  resultContainerDetails: 	null,
  resultDetails:			null,
  resultMapLink:			null,
  mailhopsDataPaneSPF:		null,
  mailhopsDataPaneDKIM:		null,
  mailhopsDataPaneMailer:	null,
  mailhopsAuthContainer:	null,
  isLoaded:     			false,
  showDetails:				false,
  showWeather:				false,
  showAuth:					true,
  map:						'goog',
  unit:						'mi',
  appVersion:				'MailHops Postbox 0.5'  
}

mailHops.init = function()
{
  //load preferences
  mailHops.loadPref();
  
  mailHops.isLoaded = true;

  mailHops.resultContainerDataPane = document.getElementById ( "mailhopsDataPane");
  mailHops.resultTextDataPane = document.getElementById ( "mailhopsDataPaneText");
  mailHops.resultTextDataPane2 = document.getElementById ( "mailhopsDataPaneText2");
  
  mailHops.resultDetailsLink = document.getElementById ( "mailhopsDataPaneDetailsLink");
  mailHops.resultContainerDetails = document.getElementById ( "mailhopsDetailsContainer");  
  mailHops.resultDetails = document.getElementById ( "mailhopsDataPaneDetails");  
  
  mailHops.resultMapLink = document.getElementById ( "mailhopsDataPaneMapLink");  
  
  mailHops.mailhopsAuthContainer = document.getElementById ( "dataPaneMailHopsAuthContainer");    
  mailHops.mailhopsDataPaneSPF = document.getElementById ( "mailhopsDataPaneSPF");   
  mailHops.mailhopsDataPaneDKIM = document.getElementById ( "mailhopsDataPaneDKIM");    
  mailHops.mailhopsDataPaneMailer = document.getElementById ( "mailhopsDataPaneMailer");    
      
  //event listner for route click to launch map
  mailHops.resultMapLink.addEventListener("click", function () { 
  		var route = this.getAttribute("route");
  		if(route)
	  		mailHops.launchMap(String(route)); 
  	}
  , false); 
  mailHops.resultDetailsLink.addEventListener("click", function () { 
  		if(mailHops.resultContainerDetails.style.display=='none'){
	  		mailHops.resultContainerDetails.style.display = 'block';
	  		mailHops.resultDetailsLink.setAttribute('class','text-link dataPaneMoreLink active');
	  	}
	  	else{
	  		mailHops.resultContainerDetails.style.display = 'none';
	  		mailHops.resultDetailsLink.setAttribute('class','text-link dataPaneMoreLink');
	  	}
  	}
  , false); 

};

mailHops.loadPref = function()
{
  //get preferences
  mailHops.map = mailHops.getCharPref('mail.mailHops.map','goog');
  mailHops.unit = mailHops.getCharPref('mail.mailHops.unit','mi');
  mailHops.showDetails = mailHops.getCharPref('mail.mailHops.show_details','false')=='true'?true:false;
  mailHops.showWeather = mailHops.getCharPref('mail.mailHops.show_weather','false')=='true'?true:false;
  mailHops.showAuth = mailHops.getCharPref('mail.mailHops.show_auth','true')=='true'?true:false;
  
  if(!mailHops.showAuth)
	  mailHops.mailhopsAuthContainer.style.display = 'none';
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
    mailHops.getRoute() ;
  }
};

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
};

mailHops.getRoute = function(){
//IP regex
var regexIp=/(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)\.(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)\.(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)\.(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)(\/(?:[012]\d?|3[012]?|[456789])){0,1}$/; 
var regexAllIp = /(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)\.(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)\.(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)\.(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)(\/(?:[012]\d?|3[012]?|[456789])){0,1}/g;

  var headReceived = mailHops.headers.extractHeader ( "Received" , true ) ;
  var headXOrigIP = mailHops.headers.extractHeader ( "X-Originating-IP" , false ) ;
  
  var headXMailer = mailHops.headers.extractHeader ( "X-Mailer" , false ) ;
  var headUserAgent = mailHops.headers.extractHeader ( "User-Agent" , false ) ;
  var headReceivedSPF = mailHops.headers.extractHeader ( "Received-SPF" , false ) ;
  var headAuth = mailHops.headers.extractHeader ( "Authentication-Results" , false ) ;
  
  
  //display auth
  if(mailHops.showAuth)
	  mailHops.displayResultAuth(headXMailer,headUserAgent,headAuth,headReceivedSPF);
  
  var received_ips;
  var all_ips = new Array();
  var rline='';
  //get the originating IP address
	if(headXOrigIP){
		var ip = headXOrigIP.match(regexAllIp);
		if(ip != null && ip.length != 0)
			all_ips.push( ip[0] );
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
	      			//only look at the first IP
	      			if(regexIp.test(received_ips[r]) && all_ips.indexOf(received_ips[r])==-1 && mailHops.testIP(received_ips[r],rline)){
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

mailHops.displayResultAuth = function( header_xmailer, header_useragent, header_auth, header_spf ){

	//SPF
	if(header_spf){
		header_spf=header_spf.replace(/^\s+/,"");
		var headerSPFArr=header_spf.split(' ');
		mailHops.mailhopsDataPaneSPF.setAttribute('value','SPF: '+headerSPFArr[0]);
		mailHops.mailhopsDataPaneSPF.style.backgroundImage = 'url(chrome://mailhops/content/images/auth/'+headerSPFArr[0]+'.png)';
		mailHops.mailhopsDataPaneSPF.setAttribute('tooltiptext',header_spf);   
	}
	else{
		mailHops.mailhopsDataPaneSPF.setAttribute('value','SPF: Missing');
		mailHops.mailhopsDataPaneSPF.style.backgroundImage = 'url(chrome://mailhops/content/images/auth/none.png)';
	}
	//Authentication-Results
	//http://tools.ietf.org/html/rfc5451
	if(header_auth){
		var headerAuthArr=header_auth.split(';');
		var dkim_result;
		for(var h=0;h<headerAuthArr.length;h++){
			if(headerAuthArr[h].indexOf('dkim=')!=-1){
				dkim_result = headerAuthArr[h];
				break;
			}
		}		
		if(dkim_result){
			dkim_result=dkim_result.replace(/^\s+/,"");
			var dkimArr=dkim_result.split(' ');
			mailHops.mailhopsDataPaneDKIM.setAttribute('value','DKIM: '+dkimArr[0].replace('dkim=',''));
			mailHops.mailhopsDataPaneDKIM.style.backgroundImage = 'url(chrome://mailhops/content/images/auth/'+dkimArr[0].replace('dkim=','')+'.png)';
			mailHops.mailhopsDataPaneDKIM.setAttribute('tooltiptext',dkim_result);   
		}
		else{
			mailHops.mailhopsDataPaneDKIM.setAttribute('value','DKIM: Missing');
			mailHops.mailhopsDataPaneDKIM.style.backgroundImage = 'url(chrome://mailhops/content/images/auth/none.png)';
		}
	}
	else{
		mailHops.mailhopsDataPaneDKIM.setAttribute('value','DKIM: Missing');
		mailHops.mailhopsDataPaneDKIM.style.backgroundImage = 'url(chrome://mailhops/content/images/auth/none.png)';
	}
	//X-Mailer or User-Agent
	if(header_xmailer){
		mailHops.mailhopsDataPaneMailer.style.backgroundImage = 'url(chrome://mailhops/content/images/email.png)';
		mailHops.mailhopsDataPaneMailer.setAttribute('value',header_xmailer);
		mailHops.mailhopsDataPaneMailer.setAttribute('tooltiptext',header_xmailer);   
	} else if(header_useragent){
		mailHops.mailhopsDataPaneMailer.style.backgroundImage = 'url(chrome://mailhops/content/images/email.png)';
		mailHops.mailhopsDataPaneMailer.setAttribute('value',header_useragent);
		mailHops.mailhopsDataPaneMailer.setAttribute('tooltiptext',header_useragent); 
	}	
	else {
		mailHops.mailhopsDataPaneMailer.style.backgroundImage = 'url(chrome://mailhops/content/images/email.png)';
		mailHops.mailhopsDataPaneMailer.setAttribute('value','Mailer: Not Found');
	}
	
	mailHops.mailhopsAuthContainer.style.display = 'block';
};

mailHops.authExplainDKIMResult = function(result){

switch(result){

   'none':
   		return 'The message was not signed.';

   'pass':  
   		return 'The message was signed, the signature or signatures were
      acceptable to the verifier, and the signature(s) passed
      verification tests.';

   'fail':  
   		return 'The message was signed and the signature or signatures were
      acceptable to the verifier, but they failed the verification
      test(s).';

   'policy':  
   		return 'The message was signed but the signature or signatures were
      not acceptable to the verifier.';

   'neutral':  
   		return 'The message was signed but the signature or signatures
      contained syntax errors or were not otherwise able to be
      processed.  This result SHOULD also be used for other failures not
      covered elsewhere in this list.';

   'temperror':  
   		return 'The message could not be verified due to some error that
      is likely transient in nature, such as a temporary inability to
      retrieve a public key.  A later attempt may produce a final
      result.';

   'permerror':  
   		return 'The message could not be verified due to some error that
      is unrecoverable, such as a required header field being absent.  A
      later attempt is unlikely to produce a final result.';
     default:
     	return '';
   }
      
};
mailHops.displayResult = function ( header_route, response ){
  var displayText='';
  var distanceText='';
  var image= 'chrome://mailhops/content/images/local.png';
  var city;
  var state;
  var countryName;
  var gotFirst=false;
  
  //remove child details
	while(mailHops.resultDetails.firstChild) {
    	mailHops.resultDetails.removeChild(mailHops.resultDetails.firstChild);
	}
	
  for(var i=0; i<response.route.length;i++){
  			//get the first hop location
	   		if(!gotFirst && !response.route[i].private && !response.route[i].client){
	   			if(response.route[i].countryCode)
		   			image='chrome://mailhops/content/images/flags/'+response.route[i].countryCode.toLowerCase()+'.png';
		   		if(response.route[i].city)
		   			city=response.route[i].city;
		   		if(response.route[i].state)
		   			state=response.route[i].state;
		   		if(response.route[i].countryName)
		   			countryName=response.route[i].countryName;
	   			gotFirst=true;
	   		}
	   		
	   		var label = document.createElement('label');
	   		if(response.route[i].countryCode)
		   		label.style.backgroundImage = 'url(chrome://mailhops/content/images/flags/'+response.route[i].countryCode.toLowerCase()+'.png)';
		   	else
		   		label.style.backgroundImage = 'url(chrome://mailhops/content/images/local.png)';
		   	label.setAttribute('class','dataPaneAddressitem mailhopsDetail');
		   	if(response.route[i].city && response.route[i].state)
			   	label.setAttribute('value','Hop #'+(i+1)+' '+response.route[i].city+', '+response.route[i].state);
			else if(response.route[i].countryName)
				label.setAttribute('value','Hop #'+(i+1)+' '+response.route[i].countryName);
			else 
				label.setAttribute('value','Hop #'+(i+1)+' Private');	
				
			if(response.route[i].host)
			   	label.setAttribute('tooltiptext',response.route[i].ip+', '+response.route[i].host);
			else
			   	label.setAttribute('tooltiptext',response.route[i].ip);
			
			//append details
	   		mailHops.resultDetails.appendChild(label);
	   		
	   		//append weather
	   		if(mailHops.showWeather && response.route[i].weather){
				var weather = document.createElement('label');
				if(response.route[i].weather.image){
					var wimage = response.route[i].weather.image.split('/');
					if((wimage[5].indexOf('clear') != -1 || wimage[5].indexOf('sun') != -1) && !mailHops.isDay())
						wimage[5] = 'clear_night.png';
					else if(wimage[5].indexOf('cloudy') != -1 && !mailHops.isDay())
						wimage[5] = 'cloudy_night.png';						
					weather.style.backgroundImage = 'url(chrome://mailhops/content/images/weather/'+wimage[5]+')';
				}
				if(mailHops.unit=='mi')
					weather.setAttribute('value',response.route[i].weather.cond+' '+response.route[i].weather.temp.F+'\u00B0F');	
				else
					weather.setAttribute('value',response.route[i].weather.cond+' '+response.route[i].weather.temp.C+'\u00B0C');
				weather.setAttribute('class','dataPaneAddressitem mailhopsWeather');
				mailHops.resultDetails.appendChild(weather);
			}
			   			
 }

 if(image.indexOf('local')!=-1) {
  	displayText = ' Local message.';
  }				
  else {
  	if(city && state)
		displayText = city+', '+state;
	else if(countryName)
  		displayText = countryName;
    if(response.distance && response.distance.miles > 0){
    	if(mailHops.unit=='mi')
			distanceText =' ( '+mailHops.addCommas(Math.round(response.distance.miles))+' mi traveled )';
		else
			distanceText =' ( '+mailHops.addCommas(Math.round(response.distance.kilometers))+' km traveled )';
	}
	else if(displayText=='')
		displayText = ' Local message.';	
  } 
  	   	
  //add event for route api map
  mailHops.resultMapLink.setAttribute("route", header_route);
  mailHops.resultTextDataPane.style.backgroundImage = 'url('+image+')';
  mailHops.resultTextDataPane.value = displayText;	  
  mailHops.resultTextDataPane.setAttribute('tooltiptext',displayText+' '+distanceText); 
  
  mailHops.resultTextDataPane2.value = distanceText;	
  mailHops.resultTextDataPane2.setAttribute('tooltiptext',displayText+' '+distanceText);   
  //show the detail link
  mailHops.resultDetailsLink.style.display = 'block';
  mailHops.resultMapLink.style.display = 'block';
  //show details by default
  if(mailHops.showDetails){
  	mailHops.resultContainerDetails.style.display = 'block';
  	mailHops.resultDetailsLink.setAttribute('class','text-link dataPaneMoreLink active');
  }
  else{
  	mailHops.resultContainerDetails.style.display = 'none';
  	mailHops.resultDetailsLink.setAttribute('class','text-link dataPaneMoreLink');
  }
};

mailHops.isDay = function(){
	var d = new Date();
	if(d.getHours()>7 && d.getHours()<19)
		return true;
	else
		return false;
}
//display the connection error message
mailHops.displayError = function(){
	  mailHops.resultMapLink.removeAttribute("route");
	  mailHops.resultTextDataPane.style.backgroundImage = 'url(chrome://mailhops/content/images/error.png)';
	  mailHops.resultTextDataPane.value = ' MailHops Failed.';	  
	  mailHops.resultTextDataPane.setAttribute('tooltiptext',' Could not connect to MailHops.'); 
	  
	  mailHops.resultTextDataPane2.value = '';	
	  mailHops.resultTextDataPane2.style.backgroundImage = '';
	  mailHops.resultTextDataPane2.setAttribute('tooltiptext',''); 
};

mailHops.clearRoute = function(){
	
	mailHops.resultContainerDetails.style.display = 'none';
	mailHops.resultDetailsLink.style.display = 'none';
	mailHops.resultMapLink.style.display = 'none';
	
	mailHops.resultTextDataPane.style.backgroundImage = 'url(chrome://mailhops/content/images/loader.gif)';
	mailHops.resultTextDataPane.value = ' Looking Up Route'; 
	mailHops.resultTextDataPane.setAttribute('tooltiptext','Looking Up Route'); 
	
	mailHops.resultTextDataPane2.value = '';
	mailHops.resultTextDataPane2.style.backgroundImage = '';
	mailHops.resultTextDataPane2.setAttribute('tooltiptext',''); 
	
	//remove child details
	while(mailHops.resultDetails.firstChild) {
    	mailHops.resultDetails.removeChild(mailHops.resultDetails.firstChild);
	}	
};

mailHops.setupEventListener = function(){
  if ( mailHops.isLoaded ){
    return ;
  }

  mailHops.init() ;
  mailHops.registerObserver() ;
 
  var listener = {} ;
  listener.onStartHeaders = function() { mailHops.clearRoute() ; } ;
  listener.onEndHeaders = mailHops.loadHeaderData ;
  gMessageListeners.push ( listener ) ;
};

//preferences observers
mailHops.registerObserver = function(){
  var prefService = Components.classes["@mozilla.org/preferences-service;1"].getService ( Components.interfaces.nsIPrefService ) ;
  mailHops._branch = prefService.getBranch ( "mail.mailHops." ) ;
  mailHops._branch.QueryInterface ( Components.interfaces.nsIPrefBranchInternal ) ;
  mailHops._branch.addObserver ( "" , mailHops , false ) ;
};

mailHops.unregisterObserver = function(){
  if ( !mailHops._branch ){
    return ;
  }

  mailHops._branch.removeObserver ( "" , mailHops ) ;
};

mailHops.observe = function ( aSubject , aTopic , aData )
{
  if ( aTopic != "nsPref:changed" ){
    return ;
  }

  //load preferences
  mailHops.loadPref();
};

mailHops.getCharPref = function ( strName , strDefault ){
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
};

//mailhops lookup
mailHops.lookup = function(header_route){

 //setup loading
 mailHops.clearRoute();
  
  //import nativeJSON 
 var nativeJSON = Components.classes["@mozilla.org/dom/json;1"].createInstance(Components.interfaces.nsIJSON);

 //call mailhops api for lookup	
 var xmlhttp = new XMLHttpRequest();
 
 var lookupURL='http://api.mailhops.com/v1/lookup/?pb&app='+mailHops.appVersion+'&r='+String(header_route);
 
 if(mailHops.showWeather)
 	lookupURL+='&w=1';
 	
 xmlhttp.open("GET", lookupURL ,true);
 xmlhttp.onreadystatechange=function() {
  if (xmlhttp.readyState==4) {
  try{
	   var data = nativeJSON.decode(xmlhttp.responseText);
	   if(data && data.meta.code==200){
	   		//display the result
	   		mailHops.displayResult(header_route,data.response);
	   } else {
	    	//display the error
	   		mailHops.displayError();
	   }
   }
   catch (ex){ 
   	   mailHops.displayError();
   }
  }
 };
 xmlhttp.send(null);
};

mailHops.addCommas = function(nStr){
	nStr += '';
	var x = nStr.split('.');
	var x1 = x[0];
	var x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
};

mailHops.launchMap = function(route){
	//launch mailhops api map
	var lookupURL='http://api.mailhops.com/v1/map/?pb&app='+mailHops.appVersion+'&m='+mailHops.map+'&u='+mailHops.unit+'&r='+String(route);
	 if(mailHops.showWeather)
	 	lookupURL+='&w=1';
	var openwin = window.openDialog(lookupURL,"MailHops",'toolbar=no,location=no,directories=no,menubar=yes,scrollbars=yes,close=yes,width=732,height=332');
	openwin.focus();
};

addEventListener ( "messagepane-loaded" , mailHops.setupEventListener , true ) ;
