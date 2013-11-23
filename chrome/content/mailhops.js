/*
* @author: Andrew Van Tassel
* @email: andrew@andrewvantassel.com
* @website: http://mailhops.com
*/

var mailHops =
{
  msgURI:					null,
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
  mailhopsDataPaneDNSBL:	null,
  mailhopsListContainer:	null,
  mailhopsAuthContainer:	null,
  resultListDataPane:		null,
  resultMeta:				null,
  
  isLoaded:     			false,
  options:					{'map':'goog','unit':'mi','api_url':'http://api.mailhops.com','debug':false},
  appVersion:				'MailHops Postbox 0.8.2',  
  message:					{secure:[]},
  client_location:			null
}

function LOG(msg) {
  var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
                                 .getService(Components.interfaces.nsIConsoleService);
  consoleService.logStringMessage('MailHops: '+msg);
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
  mailHops.resultMeta = document.getElementById ( "mailhopsDataPaneMeta");  
  mailHops.resultMapLink = document.getElementById ( "mailhopsDataPaneMapLink");
    
  //auth
  mailHops.mailhopsAuthContainer = document.getElementById ( "dataPaneMailHopsAuthContainer");
  mailHops.mailhopsDataPaneSPF = document.getElementById ( "mailhopsDataPaneSPF");   
  mailHops.mailhopsDataPaneDKIM = document.getElementById ( "mailhopsDataPaneDKIM");    
  mailHops.mailhopsDataPaneMailer = document.getElementById ( "mailhopsDataPaneMailer");    
  mailHops.mailhopsDataPaneDNSBL = document.getElementById ( "mailhopsDataPaneDNSBL");      
  //list
  mailHops.mailhopsListContainer = document.getElementById ( "dataPaneMailHopsListContainer");
  
  mailHops.resultListDataPane = document.getElementById ( "mailhopsListDataPane");   
  
  //event listner for route click to launch map
  mailHops.resultMapLink.addEventListener("click", function () { 
  		if(this.hasAttribute("data-route"))
	  		mailHops.launchMap(String(this.getAttribute("data-route"))); 
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
  
  mailHops.mailhopsDataPaneDNSBL.addEventListener("click", function () { 
		if(this.hasAttribute('data-ip'))
	  		mailHops.launchSpamHausURL(this.getAttribute('data-ip'));
  	}
  , false);
  
  document.getElementById("mailhopsDataPanePrefsLink").addEventListener("click", function () { 
		window.openDialog("chrome://mailhops/content/preferences.xul","mailHopsPreferences",null,null);
  	}
  , false);
  
  document.getElementById("mailhopsDataPaneRefreshLink").addEventListener("click", function () { 
		mailHops.refreshCache();
  	}
  , false);
};

mailHops.loadPref = function()
{
  //get preferences
  mailHops.options.map = mailHops.getCharPref('mail.mailHops.map','goog');
  mailHops.options.unit = mailHops.getCharPref('mail.mailHops.unit','mi');
  
  //Display Boxes
  mailHops.options.show_details = mailHops.getCharPref('mail.mailHops.show_details','false')=='true'?true:false;
  mailHops.options.show_meta = mailHops.getCharPref('mail.mailHops.show_meta','false')=='true'?true:false;
  mailHops.options.show_auth = mailHops.getCharPref('mail.mailHops.show_auth','true')=='true'?true:false;
  mailHops.options.show_lists = mailHops.getCharPref('mail.mailHops.show_lists','true')=='true'?true:false;
  
  //Details options
  mailHops.options.show_host = mailHops.getCharPref('mail.mailHops.show_host','false')=='true'?true:false;
  mailHops.options.show_weather = mailHops.getCharPref('mail.mailHops.show_weather','false')=='true'?true:false;
  mailHops.options.show_secure = mailHops.getCharPref('mail.mailHops.show_secure','false')=='true'?true:false;
  
  //Auth options
  mailHops.options.show_dkim = mailHops.getCharPref('mail.mailHops.show_dkim','true')=='true'?true:false;
  mailHops.options.show_spf = mailHops.getCharPref('mail.mailHops.show_spf','true')=='true'?true:false;
  mailHops.options.show_mailer = mailHops.getCharPref('mail.mailHops.show_mailer','true')=='true'?true:false;
  mailHops.options.show_dnsbl = mailHops.getCharPref('mail.mailHops.show_dnsbl','true')=='true'?true:false;  
  
  //Hosting
  mailHops.options.use_private = mailHops.getCharPref('mail.mailHops.use_private','false')=='true'?true:false;
  mailHops.options.hosting = mailHops.getCharPref('mail.mailHops.hosting','personal');
  mailHops.options.debug = mailHops.getCharPref('mail.mailHops.debug','false')=='true'?true:false;

  mailHops.options.client_location = mailHops.getCharPref('mail.mailHops.client_location','');
  
  if(mailHops.options.use_private)
  	mailHops.options.api_url = mailHops.getCharPref('mail.mailHops.api_url','http://api.mailhops.com');    
  else
  	mailHops.options.api_url='http://api.mailhops.com';
  
  if(mailHops.options.client_location == ''){
		mailHops.setClientLocation();	  
  }
  
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
  mailHops.msgURI = msgURI;
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
  //auth box
  var headXMailer = (mailHops.options.show_auth && mailHops.options.show_mailer) ? mailHops.headers.extractHeader ( "X-Mailer" , false ) : null;
  var headUserAgent = (mailHops.options.show_auth && mailHops.options.show_mailer) ? mailHops.headers.extractHeader ( "User-Agent" , false ) : null;
  var headXMimeOLE = (mailHops.options.show_auth && mailHops.options.show_mailer) ? mailHops.headers.extractHeader ( "X-MimeOLE" , false ) : null;
  var headReceivedSPF = (mailHops.options.show_auth && mailHops.options.show_spf) ? mailHops.headers.extractHeader ( "Received-SPF" , false ) : null;
  var headAuth = mailHops.options.show_auth ? mailHops.headers.extractHeader ( "Authentication-Results" , false ) : null;
  //lists box
  var headListUnsubscribe = mailHops.options.show_lists ? mailHops.headers.extractHeader ( "List-Unsubscribe" , false ) : null;
  
  //display auth
  if(mailHops.options.show_auth)
	  mailHops.displayResultAuth(headXMailer,headUserAgent,headXMimeOLE,headAuth,headReceivedSPF);
  else 
      mailHops.mailhopsAuthContainer.style.display='none';
  	
  //display unsubscribe link
  if(mailHops.options.show_lists)
	  mailHops.displayResultLists(headListUnsubscribe);
  else
  	  mailHops.mailhopsListContainer.style.display='none';
  
  var received_ips;
  var all_ips = new Array();
  var rline='';
  //empty secure
  mailHops.message.secure = [];
      
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
	      			if(regexIp.test(received_ips[r]) && mailHops.testIP(received_ips[r],rline)){
	      				all_ips.unshift( received_ips[r] );
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
		var ip = headXOrigIP.match(regexAllIp);
		if(ip != null && ip.length != 0 && all_ips.indexOf(ip[0])==-1)
			all_ips.unshift( ip[0] );
	}
  if ( all_ips.length != 0 ){
   mailHops.lookupRoute ( all_ips ) ;
  } else {
	  mailHops.displayResult();
  }
};
//another ip check, dates will throw off the regex
mailHops.testIP = function(ip,header){
	var retval=true;
	try
	{
		var firstchar = header.substring(header.indexOf(ip)-1);
			firstchar = firstchar.substring(0,1);	
		var lastchar = header.substring((header.indexOf(ip)+ip.length));
			lastchar = lastchar.substring(0,1);
		
		if(firstchar.match(/\.|\d|\-/))
			retval = null;		
		else if(lastchar.match(/\.|\d|\-/))
			retval = null;
			
		if(firstchar == '?' && lastchar == '?')
			retval = null;		
		else if(header.indexOf('['+ip+']') != -1)
			retval = true;
		else if(header.indexOf('('+ip+')') != -1)
			retval = true;	
		//check if this IP was part of a secure transmission
		if(retval){
			if(header.indexOf('using SSL') != -1)
				mailHops.message.secure.push(ip+':'+header.substring(header.indexOf('using SSL'),header.indexOf('using TLS')+11));
			else if(header.indexOf('using TLS') != -1)
				mailHops.message.secure.push(ip+':'+header.substring(header.indexOf('using TLS'),header.indexOf('using TLS')+11));
			else if(header.indexOf('version=TLSv1/SSLv3') != -1)
				mailHops.message.secure.push(ip+':'+'using TLSv1/SSLv3');				
		}		
	}
	catch(ex) {
		retval = true;
	}	
	return retval;	
};

mailHops.displayResultLists = function( header_unsubscribe ){
	
	while(mailHops.resultListDataPane.firstChild) {
    	mailHops.resultListDataPane.removeChild(mailHops.resultListDataPane.firstChild);
	}
	mailHops.mailhopsListContainer.style.display='';
	if(header_unsubscribe){
		var listArr=header_unsubscribe.split(',');
		var href='';
		if(listArr.length!=0){
			for(var h=0;h<listArr.length;h++){
				href = listArr[h].replace('<','').replace('>','');
				var label = document.createElement('label');
				
				label.setAttribute('class','text-link dataPaneURLitem');
		
				if(href.indexOf('mailto:')!=-1){
					label.setAttribute('value','Unsubscribe via Email');
					if(href.toLowerCase().indexOf('subject=')==-1){
						if(href.indexOf('?')==-1)
							href+='?subject=Unsubscribe';
						else
							href+='&subject=Unsubscribe';
					}
				}
				else{
					label.setAttribute('value','Unsubscribe via Web');					
				}
				label.setAttribute('tooltiptext',href);
				label.setAttribute('href',href);				
				mailHops.resultListDataPane.appendChild(label);
			}
		} 
	}
};

mailHops.displayResultAuth = function( header_xmailer, header_useragent, header_xmimeole, header_auth, header_spf ){

	mailHops.mailhopsAuthContainer.style.display='';
	//SPF
	if(header_spf){
		header_spf=header_spf.replace(/^\s+/,"");
		var headerSPFArr=header_spf.split(' ');
		mailHops.mailhopsDataPaneSPF.setAttribute('value','SPF: '+headerSPFArr[0]);
		mailHops.mailhopsDataPaneSPF.style.backgroundImage = 'url(chrome://mailhops/content/images/auth/'+headerSPFArr[0]+'.png)';
		mailHops.mailhopsDataPaneSPF.setAttribute('tooltiptext',header_spf+'\n'+mailHops.authExplainSPF(headerSPFArr[0]));   
		mailHops.mailhopsDataPaneSPF.style.display='block';
	}
	else{
		mailHops.mailhopsDataPaneSPF.style.display='none';
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
		if(mailHops.options.show_dkim && dkim_result){
			dkim_result=dkim_result.replace(/^\s+/,"");
			var dkimArr=dkim_result.split(' ');
			mailHops.mailhopsDataPaneDKIM.setAttribute('value','DKIM: '+dkimArr[0].replace('dkim=',''));
			mailHops.mailhopsDataPaneDKIM.style.backgroundImage = 'url(chrome://mailhops/content/images/auth/'+dkimArr[0].replace('dkim=','')+'.png)';
			mailHops.mailhopsDataPaneDKIM.setAttribute('tooltiptext',dkim_result+'\n'+mailHops.authExplainDKIM(dkimArr[0].replace('dkim=','')));   
			mailHops.mailhopsDataPaneDKIM.style.display='block';
		}
		else{
			mailHops.mailhopsDataPaneDKIM.style.display='none';
		}
		if(mailHops.options.show_spf && spf_result){
			spf_result=spf_result.replace(/^\s+/,"");
			var spfArr=spf_result.split(' ');
			mailHops.mailhopsDataPaneSPF.setAttribute('value','SPF: '+spfArr[0].replace('spf=',''));
			mailHops.mailhopsDataPaneSPF.style.backgroundImage = 'url(chrome://mailhops/content/images/auth/'+spfArr[0].replace('spf=','')+'.png)';
			mailHops.mailhopsDataPaneSPF.setAttribute('tooltiptext',spf_result+'\n'+mailHops.authExplainSPF(spfArr[0].replace('spf=','')));   
			mailHops.mailhopsDataPaneSPF.style.display='block';
		}
	}
	else{
		mailHops.mailhopsDataPaneDKIM.style.display='none';
	}
	//X-Mailer, User-Agent or X-MimeOLE
	if(header_xmailer){
		mailHops.mailhopsDataPaneMailer.style.backgroundImage = 'url(chrome://mailhops/content/images/email.png)';
		if(header_xmailer.indexOf('(')!=-1)
			mailHops.mailhopsDataPaneMailer.setAttribute('value',header_xmailer.substring(0,header_xmailer.indexOf('(')));
		else if(header_xmailer.indexOf('[')!=-1)
			mailHops.mailhopsDataPaneMailer.setAttribute('value',header_xmailer.substring(0,header_xmailer.indexOf('[')));
		else
			mailHops.mailhopsDataPaneMailer.setAttribute('value',header_xmailer);
		mailHops.mailhopsDataPaneMailer.setAttribute('tooltiptext',header_xmailer);   
		mailHops.mailhopsDataPaneMailer.style.display='block';
	} else if(header_useragent){
		mailHops.mailhopsDataPaneMailer.style.backgroundImage = 'url(chrome://mailhops/content/images/email.png)';
		if(header_useragent.indexOf('(')!=-1)
			mailHops.mailhopsDataPaneMailer.setAttribute('value',header_useragent.substring(0,header_useragent.indexOf('(')));
		else if(header_useragent.indexOf('[')!=-1)
			mailHops.mailhopsDataPaneMailer.setAttribute('value',header_useragent.substring(0,header_useragent.indexOf('[')));
		else
			mailHops.mailhopsDataPaneMailer.setAttribute('value',header_useragent);		
		mailHops.mailhopsDataPaneMailer.setAttribute('tooltiptext',header_useragent); 
		mailHops.mailhopsDataPaneMailer.style.display='block';
	}
	else if(header_xmimeole){
		mailHops.mailhopsDataPaneMailer.style.backgroundImage = 'url(chrome://mailhops/content/images/email.png)';
		
		if(header_xmimeole.indexOf('(')!=-1)
			header_xmimeole = header_xmimeole.substring(0,header_xmimeole.indexOf('('));
		else if(header_xmimeole.indexOf('[')!=-1)
			header_xmimeole = header_xmimeole.substring(0,header_xmimeole.indexOf('['));
		
		if(header_xmimeole.indexOf('Produced By ')!=-1)
			mailHops.mailhopsDataPaneMailer.setAttribute('value',header_xmimeole.replace('Produced By ',''));		
		else
			mailHops.mailhopsDataPaneMailer.setAttribute('value',header_xmimeole);		
		
		mailHops.mailhopsDataPaneMailer.setAttribute('tooltiptext',header_xmimeole); 
		mailHops.mailhopsDataPaneMailer.style.display='block';
	}	
	else {
		mailHops.mailhopsDataPaneMailer.style.display='none';
	}

};

mailHops.authExplainDKIM = function(result){

switch(result){

   case 'none':
   		return 'The message was not signed.';

   case 'pass':  
   		return 'The message was signed, the signature or signatures were acceptable to the verifier, and the signature(s) passed verification tests.';

   case 'fail':
   case 'hardfail':  
   		return 'The message was signed and the signature or signatures were acceptable to the verifier, but they failed the verification test(s).';

   case 'policy':  
   		return 'The message was signed but the signature or signatures were not acceptable to the verifier.';

   case 'neutral':  
   		return 'The message was signed but the signature or signatures contained syntax errors or were not otherwise able to be processed.  This result SHOULD also be used for other failures not covered elsewhere in this list.';

   case 'temperror':  
   		return 'The message could not be verified due to some error that is likely transient in nature, such as a temporary inability to retrieve a public key.  A later attempt may produce a final result.';

   case 'permerror':  
   		return 'The message could not be verified due to some error that is unrecoverable, such as a required header field being absent.  A later attempt is unlikely to produce a final result.';
      
     default:
     	return '';
   }
      
};

mailHops.authExplainSPF = function(result){

switch(result){

   case 'none':
		return 'No policy records were published at the sender\'s DNS domain.';

   case 'neutral':  
   		return 'The sender\'s ADMD has asserted that it cannot or does not want to assert whether or not the sending IP address is authorized to send mail using the sender\'s DNS domain.';

   case 'pass':  
   		return 'The client is authorized by the sender\'s ADMD to inject or relay mail on behalf of the sender\'s DNS domain.';

   case 'policy':  
   		return 'The client is authorized to inject or relay mail on behalf of the sender\'s DNS domain according to the authentication method\'s algorithm, but local policy dictates that the result is unacceptable.'

   case 'hardfail':  
   		return 'This client is explicitly not authorized to inject or relay mail using the sender\'s DNS domain.';

   case 'softfail':  
   		return 'The sender\'s ADMD believes the client was not authorized to inject or relay mail using the sender\'s DNS domain, but is unwilling to make a strong assertion to that effect.';

   case 'temperror':  
   		return 'The message could not be verified due to some error that is likely transient in nature, such as a temporary inability to retrieve a policy record from DNS.  A later attempt may produce a final result.';

   case 'permerror':  
   		return 'The message could not be verified due to some error that is unrecoverable, such as a required header field being absent or a syntax error in a retrieved DNS TXT record.  A later attempt is unlikely to produce a final result.';
      
    default:
     	return '';
   }
      
};

mailHops.authExplainDNSBL = function(result){

	switch(result){

   		case '127.0.0.2':
   		case '127.0.0.3':
			return 'Static UBE sources, verified spam services and ROKSO spammers.';
		
		case '127.0.0.4':
		case '127.0.0.5':
		case '127.0.0.6':
		case '127.0.0.7':
			return 'Illegal 3rd party exploits, including proxies, worms and trojan exploits.';
		
		case '127.0.0.10':
		case '127.0.0.11':
			return 'IP ranges which should not be delivering unauthenticated SMTP email.';
			
		default:
			return '';
	}
};

mailHops.authExplainDNSBL_server = function(result){

	switch(result){

   		case '127.0.0.2':
   		case '127.0.0.3':
			return 'SBL';
		
		case '127.0.0.4':
		case '127.0.0.5':
		case '127.0.0.6':
		case '127.0.0.7':
			return 'XBL';
		
		case '127.0.0.10':
		case '127.0.0.11':
			return 'PBL';
			
		default:
			return '';
	}
};

mailHops.displayResult = function ( header_route, response, meta, lookup_url ){
  var displayText='';
  var distanceText='';
  var image='chrome://mailhops/content/images/local.png';
  var city;
  var state;
  var countryName;
  var gotFirst=false;
  var secureToolTipText=false;

  //remove child details
  while(mailHops.resultDetails.firstChild) {
    	mailHops.resultDetails.removeChild(mailHops.resultDetails.firstChild);
  }

  	//append meta	   		
	if(mailHops.options.show_meta){
 	    document.getElementById('dataPaneMailHopsMetaContainer').style.display='';
		while(mailHops.resultMeta.firstChild) {
    		mailHops.resultMeta.removeChild(mailHops.resultMeta.firstChild);
  		}
  		for(var index in meta){
			var mlabel = document.createElement('label');
			mlabel.setAttribute('value',index+': '+meta[index]);
			mailHops.resultMeta.appendChild(mlabel);
		}	   			
		var mlabel = document.createElement('label');
			mlabel.setAttribute('value','api url');
			mlabel.setAttribute('class','text-link');
			mlabel.setAttribute('href',lookup_url);
			mailHops.resultMeta.appendChild(mlabel);
		
	} else {
		document.getElementById('dataPaneMailHopsMetaContainer').style.display='none';
  }	
	   		
  if(response && response.route && response.route.length > 0){
  	
  		if(mailHops.options.client_location){
  			var client_location = JSON.parse(mailHops.options.client_location);
	  		response.route.push(client_location.route[0]);
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
		   	
		   	if(response.route[i].city && response.route[i].state){
			   	label.setAttribute('value','Hop #'+(i+1)+' '+response.route[i].city+', '+response.route[i].state);
			   	label.setAttribute('onclick','mailHops.launchWhoIs("'+response.route[i].ip+'");');
			}
			else if(response.route[i].countryName){
				label.setAttribute('value','Hop #'+(i+1)+' '+response.route[i].countryName);
				label.setAttribute('onclick','mailHops.launchWhoIs("'+response.route[i].ip+'");');
			}
			else 
				label.setAttribute('value','Hop #'+(i+1)+' Private');	
			
			//build tooltip
			var tiptext = response.route[i].ip;
			
			if(!mailHops.options.show_host){
				if(response.route[i].host)
				   	tiptext+=' '+response.route[i].host;
				if(response.route[i].whois && response.route[i].whois.descr)
				   	tiptext+=' '+response.route[i].whois.descr;
				if(response.route[i].whois && response.route[i].whois.netname)
				   	tiptext+=' '+response.route[i].whois.netname;
			}
			
			label.setAttribute('tooltiptext','Click for whois '+tiptext);
			
			//append details
	   		mailHops.resultDetails.appendChild(label);
	   		
	   		if(mailHops.options.show_secure){
				//reset the tooltip
				secureToolTipText=mailHops.getSecureTrans(response.route[i].ip);
				//check for secure transmission
				if(secureToolTipText){
					var secure = document.createElement('label');
					secure.setAttribute('class','dataPaneAddressitem mailhopsSecure');
					secure.setAttribute('value','secured '+secureToolTipText);
					mailHops.resultDetails.appendChild(secure);
				}
			}
	   		
	   		//append host
	   		if(mailHops.options.show_host && response.route[i].host){
				var host = document.createElement('label');
				host.setAttribute('value',response.route[i].host);
				if(secureToolTipText)
					host.setAttribute('class','dataPaneAddressitem mailhopsSecureHost');
				else
					host.setAttribute('class','dataPaneAddressitem mailhopsHost');
				mailHops.resultDetails.appendChild(host);
			}
						
	   		//append weather
	   		if(mailHops.options.show_weather && response.route[i].weather){
				var weather = document.createElement('label');
				if(response.route[i].weather.image){
					var wimage = response.route[i].weather.image.split('/');
					if((wimage[5].indexOf('clear') != -1 || wimage[5].indexOf('sun') != -1) && !mailHops.isDay())
						wimage[5] = 'clear_night.png';
					else if(wimage[5].indexOf('cloudy') != -1 && !mailHops.isDay())
						wimage[5] = 'cloudy_night.png';						
					weather.style.backgroundImage = 'url(chrome://mailhops/content/images/weather/'+wimage[5]+')';
				}
				if(mailHops.options.unit=='mi')
					weather.setAttribute('value',response.route[i].weather.cond+' '+response.route[i].weather.temp.F+'\u00B0F');	
				else
					weather.setAttribute('value',response.route[i].weather.cond+' '+response.route[i].weather.temp.C+'\u00B0C');
				weather.setAttribute('class','dataPaneAddressitem mailhopsWeather');
				mailHops.resultDetails.appendChild(weather);
			}
			
			//auth & dnsbl
			if(!response.route[i].private && response.route[i].dnsbl && response.route[i].dnsbl.listed){
				mailHops.mailhopsDataPaneDNSBL.setAttribute('value','Blacklisted '+mailHops.authExplainDNSBL_server(response.route[i].dnsbl.record));
				mailHops.mailhopsDataPaneDNSBL.setAttribute('data-ip',response.route[i].ip);
				if(response.route[i].dnsbl.record)
					mailHops.mailhopsDataPaneDNSBL.setAttribute('tooltiptext','Click for more details.\n'+mailHops.authExplainDNSBL(response.route[i].dnsbl.record));
				else
					mailHops.mailhopsDataPaneDNSBL.setAttribute('tooltiptext','Click for more details.');
				mailHops.mailhopsDataPaneDNSBL.style.backgroundImage = 'url(chrome://mailhops/content/images/auth/bomb.png)';
				mailHops.mailhopsDataPaneDNSBL.style.display = 'block';
			}
			   			
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
    	if(mailHops.options.unit=='mi')
			distanceText =' ( '+mailHops.addCommas(Math.round(response.distance.miles))+' mi traveled )';
		else
			distanceText =' ( '+mailHops.addCommas(Math.round(response.distance.kilometers))+' km traveled )';
	}
	else if(displayText=='')
		displayText = ' Local message.';	
  } 
    	   	
  if(header_route)  	
  	mailHops.resultMapLink.setAttribute("data-route", header_route);
  else
	mailHops.resultMapLink.removeAttribute("data-route");
	  
  mailHops.resultTextDataPane.style.backgroundImage = 'url('+image+')';
  mailHops.resultTextDataPane.value = displayText;	  
  mailHops.resultTextDataPane.setAttribute('tooltiptext',displayText+' '+distanceText); 
  
  if(distanceText){ 
	mailHops.resultTextDataPane2.style.display = 'block';
	mailHops.resultTextDataPane2.value = distanceText;	
  	mailHops.resultTextDataPane2.setAttribute('tooltiptext',displayText+' '+distanceText);   
  } else {
  	mailHops.resultTextDataPane2.style.display = 'none';
  }
  //show the detail link
  mailHops.resultDetailsLink.style.display = 'block';
  mailHops.resultMapLink.style.display = 'block';
  //show details by default
  if(mailHops.options.show_details){
  	mailHops.resultContainerDetails.style.display = 'block';
  	mailHops.resultDetailsLink.setAttribute('class','text-link dataPaneMoreLink active');
  }
  else{
  	mailHops.resultContainerDetails.style.display = 'none';
  	mailHops.resultDetailsLink.setAttribute('class','text-link dataPaneMoreLink');
  }
};

mailHops.getSecureTrans = function(ip){
	for(var i=0; i<mailHops.message.secure.length; i++){
		if(mailHops.message.secure[i].indexOf(ip+':')!=-1){
			return mailHops.message.secure[i].substring(mailHops.message.secure[i].indexOf(':')+1);
		}
	}
	return false;
};

mailHops.isDay = function(){
	var d = new Date();
	if(d.getHours()>7 && d.getHours()<19)
		return true;
	else
		return false;
};

//display the connection error message
mailHops.displayError = function(data){
	  mailHops.resultMapLink.removeAttribute("route");
	  if(data && data.meta.code==410)
	  	mailHops.resultTextDataPane.style.backgroundImage = 'url(chrome://mailhops/content/images/info.png)';
	  else
	  	mailHops.resultTextDataPane.style.backgroundImage = 'url(chrome://mailhops/content/images/auth/error.png)';
	  
	  if(data && data.error){
	  	mailHops.resultTextDataPane.value = mailHops.getErrorTitle(data.meta.code);	  
	  	mailHops.resultTextDataPane.setAttribute('tooltiptext',data.error.message); 
	  }else{
	  	mailHops.resultTextDataPane.value = ' Service Unavailable.';	  
	  	mailHops.resultTextDataPane.setAttribute('tooltiptext',' Could not connect to MailHops.'); 
	  }	  
	  mailHops.resultTextDataPane2.style.display = 'none';
	  mailHops.resultTextDataPane2.value = '';	
	  mailHops.resultTextDataPane2.style.backgroundImage = '';
	  mailHops.resultTextDataPane2.setAttribute('tooltiptext',''); 
};

mailHops.getErrorTitle = function(error_code){
	switch(error_code){
   		case 400:
   			return 'Missing route parameter';
   		case 410:
   			return 'Down for Maintenance';
   		case 500:
   			return 'Server Error';
   		default:
   			return 'Service Unavailable';
   	}
};

mailHops.clearRoute = function(){
	
	mailHops.resultTextDataPane2.style.display = 'none';
	mailHops.resultContainerDetails.style.display = 'none';
	mailHops.resultDetailsLink.style.display = 'none';
	mailHops.resultMapLink.style.display = 'none';
	mailHops.mailhopsDataPaneDNSBL.style.display = 'none';
	
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
  if ( aTopic == "nsPref:changed" )
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

mailHops.setClientLocation = function(){
	
	var xmlhttp = new XMLHttpRequest();
	if (!pref){
	    var pref = Components.classes["@mozilla.org/preferences-service;1"].getService ( Components.interfaces.nsIPrefBranch ) ;
	}
	
	 xmlhttp.open("GET", mailHops.options.api_url+'/v1/lookup/?tb&app='+mailHops.appVersion+'&r=&c=1',true);
	 xmlhttp.onreadystatechange=function() {
	  if (xmlhttp.readyState==4) {
	  try{
	  	   var data = JSON.parse(xmlhttp.responseText);
		   if(data && data.meta.code==200){
		   		//display the result
		   		pref.setCharPref("mail.mailHops.client_location", JSON.stringify(data.response)) ;
		   } else {
			   pref.setCharPref("mail.mailHops.client_location", '') ;	   
		   } 
	   }
	   catch (e){ 
		pref.setCharPref("mail.mailHops.client_location", '') ;	   
	   }
	  }
	 };
	 xmlhttp.send(null);
};

//mailhops lookup
mailHops.lookupRoute = function(header_route){

 //setup loading
 mailHops.clearRoute();
  
  //import nativeJSON 
 var nativeJSON = Components.classes["@mozilla.org/dom/json;1"].createInstance(Components.interfaces.nsIJSON);
  
 var lookupURL=mailHops.options.api_url+'/v1/lookup/?pb&app='+mailHops.appVersion+'&r='+String(header_route);
 
 if(mailHops.options.show_weather)
 	lookupURL+='&w=1';
 if(mailHops.options.client_location != '')
 	lookupURL+='&c=0';
 	
 //check for cache
 var cached_results=mailHops.getResults();

 if(cached_results){
  if(mailHops.options.debug)
    LOG('Found Cached Result');
 	 cached_results = JSON.parse(cached_results);
	 mailHops.displayResult(header_route, cached_results.response, cached_results.meta, lookupURL);
	 return;
 }

if(mailHops.options.debug)
    LOG(lookupURL);

 //call mailhops api for lookup	
 var xmlhttp = new XMLHttpRequest();
 		
 xmlhttp.open("GET", lookupURL ,true);
 xmlhttp.onreadystatechange=function() {
  if (xmlhttp.readyState==4) {
  try{
	   var data = JSON.parse(xmlhttp.responseText);
	   if(data && data.meta.code==200){
	   		var d = new Date();
	   		data.meta.cached = d.toISOString();
	   		//save the result
	   		mailHops.saveResults(JSON.stringify(data));
	   		//display the result
	   		mailHops.displayResult(header_route,data.response,data.meta, lookupURL);	   		
	   } else {
      if(mailHops.options.debug)
        LOG(JSON.stringify(data));
	    	//display the error
	   		mailHops.displayError(data);
	   }
   }
   catch (ex){ 
    if(mailHops.options.debug)
        LOG(JSON.stringify(ex));
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
mailHops.launchWhoIs = function(ip){
	var messenger = Components.classes["@mozilla.org/messenger;1"].createInstance().QueryInterface(Components.interfaces.nsIMessenger);
	messenger.launchExternalURL('http://www.mailhops.com/whois/'+ip);
};
mailHops.launchSpamHausURL = function(ip){
	var messenger = Components.classes["@mozilla.org/messenger;1"].createInstance().QueryInterface(Components.interfaces.nsIMessenger);
	messenger.launchExternalURL('http://www.spamhaus.org/query/bl?ip='+ip);
};

mailHops.launchMap = function(route){
	
	if(route != '')	{
		var lookupURL=mailHops.options.api_url+'/v1/map/?pb&app='+mailHops.appVersion+'&m='+mailHops.options.map+'&u='+mailHops.options.unit+'&r='+String(route);
		 if(mailHops.options.show_weather)
		 	lookupURL+='&w=1';
		 	
		window.openDialog("chrome://mailhops/content/mailhopsMap.xul","MailHops",'toolbar=no,location=no,directories=no,menubar=yes,scrollbars=yes,close=yes,width=742,height=385,resizable=yes', {src: lookupURL});
	}
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
