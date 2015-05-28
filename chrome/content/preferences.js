if (!pref)
{
  var pref = Components.classes["@mozilla.org/preferences-service;1"].getService ( Components.interfaces.nsIPrefBranch ) ;
}

var mailHopPreferences =
{
  use_private: null,
   
  api_url: null,
  
  hosting: null,
  	
  loadPreferences: function()
  {
  	this.use_private = document.getElementById("mailhop.use_private");
  	
  	this.api_url = document.getElementById("mailhop.api_url");
  	
  	this.hosting = document.getElementById("mailhop.hosting");
  
  	if(pref.getCharPref("mail.mailHops.lang",'en')=='en')
	    document.getElementById("mailhop.lang").selectedIndex = 0;
	else
	    document.getElementById("mailhop.lang").selectedIndex = 1;
	    
	if(pref.getCharPref("mail.mailHops.unit",'mi')=='mi')
	    document.getElementById("mailhop.unit").selectedIndex = 0;
	else
	    document.getElementById("mailhop.unit").selectedIndex = 1;
	
	//Display Box Options    
	if(pref.getCharPref("mail.mailHops.show_details",'true')=='true')
		document.getElementById("mailhop.show_details").checked = true;
	else
		document.getElementById("mailhop.show_details").checked = false;
		
	if(pref.getCharPref("mail.mailHops.show_meta",'false')=='true')
		document.getElementById("mailhop.show_meta").checked = true;
	else
		document.getElementById("mailhop.show_meta").checked = false;	
	
	if(pref.getCharPref("mail.mailHops.show_lists",'true')=='true')
		document.getElementById("mailhop.show_lists").checked = true;
	else
		document.getElementById("mailhop.show_lists").checked = false;	
		
	if(pref.getCharPref("mail.mailHops.show_auth",'true')=='true')
		document.getElementById("mailhop.show_auth").checked = true;
	else
		document.getElementById("mailhop.show_auth").checked = false;
		
	//Details Options		
	if(pref.getCharPref("mail.mailHops.show_host",'false')=='true')
		document.getElementById("mailhop.show_host").checked = true;
	else
		document.getElementById("mailhop.show_host").checked = false;
		
	if(pref.getCharPref("mail.mailHops.show_secure",'false')=='true')
		document.getElementById("mailhop.show_secure").checked = true;
	else
		document.getElementById("mailhop.show_secure").checked = false;	
	
	//Auth Options	
	if(pref.getCharPref("mail.mailHops.show_spf",'true')=='true')
		document.getElementById("mailhop.show_spf").checked = true;
	else
		document.getElementById("mailhop.show_spf").checked = false;
		
	if(pref.getCharPref("mail.mailHops.show_dkim",'true')=='true')
		document.getElementById("mailhop.show_dkim").checked = true;
	else
		document.getElementById("mailhop.show_dkim").checked = false;	
	
	if(pref.getCharPref("mail.mailHops.show_mailer",'true')=='true')
		document.getElementById("mailhop.show_mailer").checked = true;
	else
		document.getElementById("mailhop.show_mailer").checked = false;	
		
	if(pref.getCharPref("mail.mailHops.show_dnsbl",'true')=='true')
		document.getElementById("mailhop.show_dnsbl").checked = true;
	else
		document.getElementById("mailhop.show_dnsbl").checked = false;
	
	//Hosting Options
	if(pref.getCharPref("mail.mailHops.hosting",'personal')=='personal')
		document.getElementById("mailhop.hosting").selectedIndex = 0;
	else if(pref.getCharPref("mail.mailHops.hosting",'personal')=='edu')
		document.getElementById("mailhop.hosting").selectedIndex = 1;
	else
		document.getElementById("mailhop.hosting").selectedIndex = 2;		
	
	if(pref.getCharPref("mail.mailHops.use_private",'false')=='true'){
		document.getElementById("mailhop.use_private").checked = true;
		this.api_url.removeAttribute("disabled");
	}
	else
		document.getElementById("mailhop.use_private").checked = false;
	
	if(pref.getCharPref("mail.mailHops.debug",'true')=='true')
		document.getElementById("mailhop.debug").checked = true;
	else
		document.getElementById("mailhop.debug").checked = false;
	
	this.api_url.value = pref.getCharPref("mail.mailHops.api_url",'http://api.mailhops.com');
	
	ResetLocation(document.getElementById("mailhop.refresh_location"));
			
  } ,
  savePreferences: function()
  {
    pref.setCharPref("mail.mailHops.lang", document.getElementById("mailhop.lang").selectedItem.value) ;
    pref.setCharPref("mail.mailHops.unit", document.getElementById("mailhop.unit").selectedItem.value) ;
    pref.setCharPref("mail.mailHops.show_details", String(document.getElementById("mailhop.show_details").checked)) ;
    pref.setCharPref("mail.mailHops.show_meta", String(document.getElementById("mailhop.show_meta").checked)) ;
    pref.setCharPref("mail.mailHops.show_host", String(document.getElementById("mailhop.show_host").checked)) ;
    pref.setCharPref("mail.mailHops.show_secure", String(document.getElementById("mailhop.show_secure").checked)) ;
    pref.setCharPref("mail.mailHops.show_spf", String(document.getElementById("mailhop.show_spf").checked)) ;
    pref.setCharPref("mail.mailHops.show_dkim", String(document.getElementById("mailhop.show_dkim").checked)) ;
    pref.setCharPref("mail.mailHops.show_mailer", String(document.getElementById("mailhop.show_mailer").checked)) ;
    pref.setCharPref("mail.mailHops.show_dnsbl", String(document.getElementById("mailhop.show_dnsbl").checked)) ;
    pref.setCharPref("mail.mailHops.show_lists", String(document.getElementById("mailhop.show_lists").checked)) ;
    pref.setCharPref("mail.mailHops.show_auth", String(document.getElementById("mailhop.show_auth").checked)) ;
    pref.setCharPref("mail.mailHops.use_private", String(document.getElementById("mailhop.use_private").checked)) ;
    pref.setCharPref("mail.mailHops.debug", String(document.getElementById("mailhop.debug").checked)) ;
    pref.setCharPref("mail.mailHops.hosting", document.getElementById("mailhop.hosting").selectedItem.value) ;
    pref.setCharPref("mail.mailHops.api_url", String(document.getElementById("mailhop.api_url").value)) ;
  } 
}

function ChangePrivate(item){
	if(item.checked){
  		mailHopPreferences.api_url.removeAttribute("disabled");
  		mailHopPreferences.api_url.focus();
  	}
  	else{
  		mailHopPreferences.api_url.setAttribute("disabled","true");
  		mailHopPreferences.api_url.value='http://api.mailhops.com';
  	}
}

function TestConnection(e){
	e.style.backgroundImage = 'url(chrome://mailhops/content/images/loader.gif)';
	
	var xmlhttp = new XMLHttpRequest();
	var nativeJSON = Components.classes["@mozilla.org/dom/json;1"].createInstance(Components.interfaces.nsIJSON);
	var lookupURL=mailHopPreferences.api_url.value+'/v1/lookup/?pb&app='+mailHops.appVersion+'&healthcheck';
	xmlhttp.open("GET", lookupURL ,true);
	 xmlhttp.onreadystatechange=function() {
	  if (xmlhttp.readyState==4) {
	  try{
		   var data = JSON.parse(xmlhttp.responseText);
		   if(data && data.meta.code==200){
			   	e.style.backgroundImage='';
		   		alert('Connection Succeeded to '+mailHopPreferences.api_url.value+'!');
		   } else {
		    	//display the error
		    	e.style.backgroundImage='';
		   		alert('Connection Failed to '+mailHopPreferences.api_url.value+'!');
		   }
	   }
	   catch (ex){
		   e.style.backgroundImage=''; 
	   	   alert('Connection Failed to '+mailHopPreferences.api_url.value+'!');
	   }
	  }
	 };
 xmlhttp.send(null);
}

function ResetLocation(e){
	
	e.style.backgroundImage = 'url(chrome://mailhops/content/images/loader.gif)';
	
	//clear the location
	document.getElementById("mailhop.client_location").value='Getting your location...';
	document.getElementById("mailhop.client_location_ip").value = '';
	document.getElementById("mailhop.client_location_host").value = '';
	document.getElementById("mailhop.client_location_whois").value = '';
	
	mailHops.setClientLocation();
	//give the above process a few seconds
	setTimeout(function(){
	
		if(pref.getCharPref("mail.mailHops.client_location", '') != ''){
			var response = JSON.parse(pref.getCharPref("mail.mailHops.client_location", ''));
			var location = '';
			if(response.route[0].city)
				location+=response.route[0].city;
			if(response.route[0].state)
				location+=', '+response.route[0].state;
			if(response.route[0].countryName)
				location+=' ( '+response.route[0].countryName+' )';
			else if(response.route[0].countryCode)
				location+=' ( '+response.route[0].countryCode+' )';
				
			//set location   			
			document.getElementById("mailhop.client_location").value=location;
			
			//set ip
			document.getElementById("mailhop.client_location_ip").value='IP: '+response.route[0].ip;
			
			//set host
			if(response.route[0].host)
				document.getElementById("mailhop.client_location_host").value='Host: '+response.route[0].host;
			
			document.getElementById("mailhop.client_location_whois").value = 'whois';
			document.getElementById("mailhop.client_location_whois").setAttribute('href', 'http://www.mailhops.com/whois/'+response.route[0].ip);
			
			//set country flag
			if(response.route[0].countryCode)
			   	document.getElementById("mailhop.client_location").style.backgroundImage='url(chrome://mailhops/content/images/flags/'+response.route[0].countryCode.toLowerCase()+'.png)';
		}	
		e.style.backgroundImage='';
	
	}, 1000);
}

function ResetConnection(){
	mailHopPreferences.api_url.value='http://api.mailhops.com';
}