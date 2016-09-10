if (!pref) {
  var pref = Components.classes["@mozilla.org/preferences-service;1"].getService ( Components.interfaces.nsIPrefBranch ) ;
}

var mailHopPreferences = {
  api_host: 'api.mailhops.com', //mailhops api url
  api_http: 'https://', //ssl?
  api_key: '', //api key
  fkey: '', //forecast.io api key
  country_filter: [],

  loadPreferences: function(){

    this.api_host = document.getElementById("mailhop.api_host");

    this.api_http = document.getElementById("mailhop.api_http");

    this.api_key = document.getElementById("mailhop.api_key");

    this.fkey = document.getElementById("mailhop.fkey");

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
    this.api_key.value = pref.getCharPref("mail.mailHops.api_key",'');

    this.api_http.value = pref.getCharPref("mail.mailHops.api_http",'https://');
    if(this.api_http.value=='https://')
      this.api_http.selectedIndex = 0;
    else
      this.api_http.selectedIndex = 1;

    this.api_host.value = pref.getCharPref("mail.mailHops.api_host",'api.mailhops.com');

    this.fkey.value = pref.getCharPref("mail.mailHops.fkey",'');

    // Country Filter and tagging
    this.country_filter = JSON.parse(pref.getCharPref("mail.mailHops.country_filter",null) || []);
    if(this.country_filter.length){
      for(c in this.country_filter){
        document.getElementById("country_"+this.country_filter[c]).checked=true;
      }
    }
    if(!!this.api_key.value){
      document.getElementById("mailhops-membership-link").value='My Account';
      document.getElementById("mailhops-membership-link").setAttribute('data-account-url','https://mailhops.com/account/'+this.api_key.value);
    }
    if(pref.getCharPref("mail.mailHops.country_tag",'false')=='false')
  		document.getElementById("mailhop.country_tag").checked = false;
  	else
  		document.getElementById("mailhop.country_tag").checked = true;

    document.getElementById("mailhops-membership-link").addEventListener("click", function () {
      mailHopsUtils.launchExternalURL(this.getAttribute('data-account-url'));
    });
    document.getElementById("forecastio").addEventListener("click", function () {
      mailHopsUtils.launchExternalURL('https://developer.forecast.io/');
    });
    this.saveAPIKey();
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
    if(document.getElementById("key_details").getAttribute("valid") == "false")
      this.api_key.value='';
    pref.setCharPref("mail.mailHops.api_key", this.api_key.value);
    pref.setCharPref("mail.mailHops.api_http", this.api_http.value);
    pref.setCharPref("mail.mailHops.api_host", this.api_host.value);

    pref.setCharPref("mail.mailHops.fkey", String(this.fkey.value));

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
  },

  saveAPIKey: function() {

    if(!!this.api_key && this.api_key.value != ''){
      var xmlhttp = new XMLHttpRequest();
      var nativeJSON = Components.classes["@mozilla.org/dom/json;1"].createInstance(Components.interfaces.nsIJSON);
      var apiBase = this.api_http.value+this.api_host.value,
          accountURL = '/v2/accounts/?api_key='+this.api_key.value,
          api_key = this.api_key.value;

      xmlhttp.open("GET", apiBase+accountURL,true);
       xmlhttp.onreadystatechange=function() {
        if (xmlhttp.readyState===4) {
          try{
             var data = JSON.parse(xmlhttp.responseText);
             if(xmlhttp.status===200){
                document.getElementById("mailhops-membership-link").value='My Account';
                document.getElementById("mailhops-membership-link").setAttribute('data-account-url','https://mailhops.com/account/'+api_key);
                document.getElementById("key_details").innerHTML = JSON.stringify(data.account).replace(/\,/g,'\n');
                document.getElementById("key_details").setAttribute("valid","true");
             } else if(!!data.error){
                document.getElementById("mailhops-membership-link").value='Join MailHops';
                document.getElementById("mailhops-membership-link").setAttribute('data-account-url','https://mailhops.com');
                document.getElementById("key_details").innerHTML = xmlhttp.status+': '+data.error.message;
                document.getElementById("key_details").setAttribute("valid","false");
             }
           }
           catch (ex){
             document.getElementById("key_details").innerHTML = 'Connection Failed to\n '+apiBase+'!';
             document.getElementById("key_details").setAttribute("valid","false");
           }
         }
       };
     xmlhttp.send(null);
   } else {
     document.getElementById("key_details").innerHTML = 'Enter a valid API key above.';
     document.getElementById("key_details").setAttribute("valid","false");
   }
 },

  TestConnection: function(){
 	var xmlhttp = new XMLHttpRequest();
 	var nativeJSON = Components.classes["@mozilla.org/dom/json;1"].createInstance(Components.interfaces.nsIJSON);
 	var apiBase = this.api_http.value+this.api_host.value,
       lookupURL = '/v1/lookup/?healthcheck';

   xmlhttp.open("GET", apiBase+lookupURL,true);
 	 xmlhttp.onreadystatechange=function() {
 	  if (xmlhttp.readyState===4) {
   	  try{
   		   var data = JSON.parse(xmlhttp.responseText);
   		   if(xmlhttp.status===200){
   			   	alert('Connection Succeeded to\n '+apiBase+'!');
   		   } else {
   		    	//display the error
   		    	alert('Connection Failed to\n '+apiBase+'!');
   		   }
   	   }
   	   catch (ex){
   		    alert('Connection Failed to\n '+apiBase+'! '+JSON.stringify(ex));
   	   }
      }
 	 };
  xmlhttp.send(null);
},

  ResetConnection: function(){
   this.api_http.value=="https://";
   this.api_http.selectedIndex = 0;
 	 this.api_host.value='api.mailhops.com';
 }
};
