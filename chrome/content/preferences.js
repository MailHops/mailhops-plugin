if (!pref) {
  var pref = Components.classes["@mozilla.org/preferences-service;1"].getService ( Components.interfaces.nsIPrefBranch ) ;
}

var mailHopPreferences = {
  api_url: '', //mailhops api url
  api_ssl: '', //ssl?
  api_key: '', //api key
  fkey: '', //forecast.io api key
  country_filter: [],

  loadPreferences: function(){

    this.api_url = document.getElementById("mailhop.api_url").value;

    this.api_ssl = document.getElementById("mailhop.api_ssl").value;

    this.api_key = document.getElementById("mailhop.api_key").value;

    this.fkey = document.getElementById("mailhop.fkey").value;

    document.getElementById("mailhop.api_ssl").value = "true";

    document.getElementById("mailhop.lang").value = pref.getCharPref("mail.mailHops.lang",'en');

  	document.getElementById("mailhop.map_provider").value = pref.getCharPref("mail.mailHops.map_provider",'OpenStreetMap.Mapnik');

  	if(pref.getCharPref("mail.mailHops.unit",'mi')=='mi')
  	    document.getElementById("mailhop.unit").selectedIndex = 0;
  	else
  	    document.getElementById("mailhop.unit").selectedIndex = 1;

  	//Display Box Options
  	if(pref.getCharPref("mail.mailHops.show_meta",'true')=='true')
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
  	if(pref.getCharPref("mail.mailHops.show_host",'true')=='true')
  		document.getElementById("mailhop.show_host").checked = true;
  	else
  		document.getElementById("mailhop.show_host").checked = false;

  	if(pref.getCharPref("mail.mailHops.show_secure",'true')=='true')
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

  	if(pref.getCharPref("mail.mailHops.debug",'true')=='true')
  		document.getElementById("mailhop.debug").checked = true;
  	else
  		document.getElementById("mailhop.debug").checked = false;

    // API info
    this.api_key = pref.getCharPref("mail.mailHops.api_key",'');

    this.api_url = pref.getCharPref("mail.mailHops.api_url",'https://api.mailhops.com');

    if(this.api_url.indexOf('https')===0)
      this.api_ssl = "true";
    else
      this.api_ssl = "false";

    this.api_url = this.api_url.replace('http://','').replace('https://','');

  	this.fkey = pref.getCharPref("mail.mailHops.fkey",'');

    // Country Filter and tagging
    this.country_filter = JSON.parse(pref.getCharPref("mail.mailHops.country_filter",null) || []);
    if(this.country_filter.length){
      for(c in this.country_filter){
        document.getElementById("country_"+this.country_filter[c]).checked=true;
      }
    }

    if(pref.getCharPref("mail.mailHops.country_tag",'false')=='false')
  		document.getElementById("mailhop.country_tag").checked = false;
  	else
  		document.getElementById("mailhop.country_tag").checked = true;

    saveAPIKey();

  	ResetLocation(document.getElementById("mailhop.refresh_location"));
  },
  savePreferences: function() {
    pref.setCharPref("mail.mailHops.lang", document.getElementById("mailhop.lang").selectedItem.value);
    pref.setCharPref("mail.mailHops.map_provider", document.getElementById("mailhop.map_provider").selectedItem.value);
    pref.setCharPref("mail.mailHops.unit", document.getElementById("mailhop.unit").selectedItem.value);
    pref.setCharPref("mail.mailHops.show_meta", String(document.getElementById("mailhop.show_meta").checked));
    pref.setCharPref("mail.mailHops.show_host", String(document.getElementById("mailhop.show_host").checked));
    pref.setCharPref("mail.mailHops.show_secure", String(document.getElementById("mailhop.show_secure").checked));
    pref.setCharPref("mail.mailHops.show_spf", String(document.getElementById("mailhop.show_spf").checked));
    pref.setCharPref("mail.mailHops.show_dkim", String(document.getElementById("mailhop.show_dkim").checked));
    pref.setCharPref("mail.mailHops.show_mailer", String(document.getElementById("mailhop.show_mailer").checked));
    pref.setCharPref("mail.mailHops.show_dnsbl", String(document.getElementById("mailhop.show_dnsbl").checked));
    pref.setCharPref("mail.mailHops.show_lists", String(document.getElementById("mailhop.show_lists").checked));
    pref.setCharPref("mail.mailHops.show_auth", String(document.getElementById("mailhop.show_auth").checked));
    pref.setCharPref("mail.mailHops.debug", String(document.getElementById("mailhop.debug").checked));

    //API vars
    pref.setCharPref("mail.mailHops.api_key", this.api_key);

    this.api_url = this.api_url.replace('http://','').replace('https://','');
    if(this.api_ssl=="true")
      pref.setCharPref("mail.mailHops.api_url", 'https://'+this.api_url);
    else
      pref.setCharPref("mail.mailHops.api_url", 'http://'+this.api_url);

    pref.setCharPref("mail.mailHops.fkey", String(this.fkey));

    // Country Filter and tagging
    this.country_filter = [];
    for(c in mailHopsUtils.countries){
      if(document.getElementById("country_"+mailHopsUtils.countries[c]).checked)
        this.country_filter.push(document.getElementById("country_"+mailHopsUtils.countries[c]).getAttribute('value'));
    }
    pref.setCharPref("mail.mailHops.country_filter", String(JSON.stringify(this.country_filter)));
    pref.setCharPref("mail.mailHops.country_tag", String(document.getElementById("mailhop.country_tag").checked));

    return true;
  },

  countryListSelectAll: function(all){
    for(c in mailHopsUtils.countries){
      document.getElementById("country_"+mailHopsUtils.countries[c]).checked=all;
    }
  }
};

function saveAPIKey() {

  if(!!mailHopPreferences.api_key && mailHopPreferences.api_key != ''){
    var xmlhttp = new XMLHttpRequest();
    var nativeJSON = Components.classes["@mozilla.org/dom/json;1"].createInstance(Components.interfaces.nsIJSON);
    var apiBase = mailHopPreferences.api_url,
        accountURL = '/v2/accounts/?app='+mailHops.options.version+'&api_key='+mailHopPreferences.api_key;

    if(mailHopPreferences.api_ssl=="true")
      apiBase='https://'+apiBase;
    else
      apiBase='http://'+apiBase;

    xmlhttp.open("GET", apiBase+accountURL,true);
     xmlhttp.onreadystatechange=function() {
      if (xmlhttp.readyState==4 && !!xmlhttp.responseText) {
        try{
           var data = JSON.parse(xmlhttp.responseText);
           if(!!data && data.meta.code==200){
              document.getElementById("key_details").innerHTML = JSON.stringify(data.account).replace(/\,/g,'\n');
           } else if(!!data.meta.message){
              document.getElementById("key_details").innerHTML = data.meta.message;
           } else {
              document.getElementById("key_details").innerHTML = 'Invalid API Key';
           }
         }
         catch (ex){
           document.getElementById("key_details").innerHTML = 'Connection Failed to\n '+apiBase+'!';
         }
       } else {
         document.getElementById("key_details").innerHTML = 'Connection Failed to\n '+apiBase+'!';
       }
     };
   xmlhttp.send(null);
 } else {
   document.getElementById("key_details").innerHTML = 'Enter a valid API key above.';
 }
}

function TestConnection(e){
	var xmlhttp = new XMLHttpRequest();
	var nativeJSON = Components.classes["@mozilla.org/dom/json;1"].createInstance(Components.interfaces.nsIJSON);
	var apiBase = mailHopPreferences.api_url || 'https://api.mailhops.com',
      lookupURL = '/v1/lookup/?app='+mailHops.options.version+'&healthcheck';

  if(mailHopPreferences.api_ssl=="true")
    apiBase='https://'+apiBase;
  else
    apiBase='http://'+apiBase;

  if(mailHopPreferences.api_key != '')
    lookupURL = '/v2/lookup/?app='+mailHops.options.version+'&healthcheck&api_key='+mailHopPreferences.api_key;

	xmlhttp.open("GET", apiBase+lookupURL,true);
	 xmlhttp.onreadystatechange=function() {
	  if (xmlhttp.readyState==4) {
	  try{
		   var data = JSON.parse(xmlhttp.responseText);
		   if(!!data && data.meta.code==200){
			   	e.style.backgroundImage='';
		   		alert('Connection Succeeded to\n '+apiBase+'!');
		   } else {
		    	//display the error
		    	e.style.backgroundImage='';
		   		alert('Connection Failed to\n '+apiBase+'!');
		   }
	   }
	   catch (ex){
		   e.style.backgroundImage='';
	   	   alert('Connection Failed to\n '+apiBase+'!');
	   }
	  }
	 };
 xmlhttp.send(null);
}

function ResetLocation(e){

	//clear the location
	document.getElementById("mailhop.client_location").value='Getting your location...';
	document.getElementById("mailhop.client_location_ip").value = '';
	document.getElementById("mailhop.client_location_host").value = '';
	document.getElementById("mailhop.client_location_whois").value = '';

  var MH_APIURL = mailHopPreferences.api_ssl=="true"?'https://'+mailHopPreferences.api_url:'http://'+mailHopPreferences.api_url;

	mailHops.setClientLocation(function(response){

		if(response){
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
			document.getElementById("mailhop.client_location_whois").setAttribute('href', 'https://www.mailhops.com/whois/'+response.route[0].ip);

			//set country flag
			if(response.route[0].countryCode)
			   	document.getElementById("mailhop.client_location").style.backgroundImage='url(chrome://mailhops/content/images/flags/'+response.route[0].countryCode.toLowerCase()+'.png)';

		} else {
			document.getElementById("mailhop.client_location").value='Failed connecting...';
		}
	},MH_APIURL);
}

function ResetConnection(){
  mailHopPreferences.api_ssl=="true";
  mailHopPreferences.api_ssl.selectedIndex = 0;
	mailHopPreferences.api_url='api.mailhops.com';
}
