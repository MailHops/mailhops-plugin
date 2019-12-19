if (!pref) {
  var pref = Components.classes["@mozilla.org/preferences-service;1"].getService ( Ci.nsIPrefBranch ) ;
}

var mailHopPreferences = {
  api_host: 'api.mailhops.com', //mailhops api url
  api_http: 'https://', //ssl?
  api_key: '', //api key
  valid_api_key: false,
  fkey: '', //forecast.io api key
  country_filter: [],
  previewBar: null,

  loadPreferences: function(){
    var self = this;

    this.api_host = document.getElementById("mailhop.api_host");

    this.api_http = document.getElementById("mailhop.api_http");

    this.api_key = document.getElementById("mailhop.api_key");

    this.fkey = document.getElementById("mailhop.fkey");

    this.previewBar = document.getElementById("display_preview");

    document.getElementById("mailhop.lang").value = pref.getCharPref("mail.mailHops.lang",'en');

  	document.getElementById("mailhop.map_provider").value = pref.getCharPref("mail.mailHops.map_provider",'OpenStreetMap.Mapnik');

  	if(pref.getCharPref("mail.mailHops.unit",'mi')=='mi')
  	    document.getElementById("mailhop.unit").selectedIndex = 0;
  	else
  	    document.getElementById("mailhop.unit").selectedIndex = 1;

  	//Display Box styles
  	document.getElementById("mailhop.bar_color").value = pref.getCharPref("mail.mailHops.bar_color",'#FFF');
    document.getElementById("mailhop.font_color").value = pref.getCharPref("mail.mailHops.font_color",'#777');
    document.getElementById("mailhop.font_size").value = pref.getCharPref("mail.mailHops.font_size",'14px');

    //Update styles
    this.previewBar.style.background = document.getElementById("mailhop.bar_color").value;
    this.previewBar.style.color = document.getElementById("mailhop.font_color").value;
    this.previewBar.style.fontSize = document.getElementById("mailhop.font_size").value;

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
    if(!!this.api_key.value.trim()){
      document.getElementById("mailhops-membership-link").value='My Account';
      document.getElementById("mailhops-membership-link").setAttribute('href','https://mailhops.com/account/'+this.api_key.value.trim());
    }
    if(pref.getCharPref("mail.mailHops.country_tag",'false')=='false')
  		document.getElementById("mailhop.country_tag").checked = false;
  	else
  		document.getElementById("mailhop.country_tag").checked = true;

    if(pref.getCharPref("mail.mailHops.travel_time_junk",'false')=='false')
      document.getElementById("mailhop.travel_time_junk").checked = false;
    else
      document.getElementById("mailhop.travel_time_junk").checked = true;

    if(pref.getCharPref("mail.mailHops.hide_compact",'false')=='false')
      document.getElementById("mailhop.hide_compact").checked = false;
    else
      document.getElementById("mailhop.hide_compact").checked = true;

    this.saveAPIKey();

    document.getElementById("mailhop.bar_color").addEventListener("input", function () {
      self.previewBar.style.background = this.value;
    });
    document.getElementById("mailhop.font_color").addEventListener("input", function () {
      self.previewBar.style.color = this.value;
    });
    document.getElementById("mailhop.font_size").addEventListener("input", function () {
      self.previewBar.style.fontSize = this.value;
    });
    document.addEventListener("dialogaccept", function(event) {
      mailHopPreferences.savePreferences();
    });
  },
  savePreferences: function() {
    pref.setCharPref("mail.mailHops.lang", document.getElementById("mailhop.lang").selectedItem.value);
    pref.setCharPref("mail.mailHops.map_provider", document.getElementById("mailhop.map_provider").selectedItem.value);
    pref.setCharPref("mail.mailHops.unit", document.getElementById("mailhop.unit").selectedItem.value);
    pref.setCharPref("mail.mailHops.bar_color", String(document.getElementById("mailhop.bar_color").value));
    pref.setCharPref("mail.mailHops.font_color", String(document.getElementById("mailhop.font_color").value));
    pref.setCharPref("mail.mailHops.font_size", String(document.getElementById("mailhop.font_size").value));
    pref.setCharPref("mail.mailHops.debug", String(document.getElementById("mailhop.debug").checked));
    pref.setCharPref("mail.mailHops.hide_compact", String(document.getElementById("mailhop.hide_compact").checked));

    //API vars
    if(!this.valid_api_key)
      this.api_key.value='';
    pref.setCharPref("mail.mailHops.api_key", this.api_key.value.trim());
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
    pref.setCharPref("mail.mailHops.travel_time_junk", String(document.getElementById("mailhop.travel_time_junk").checked));

    return true;
  },

  countryListSelectAll: function(all){
    if(this.valid_api_key){
      for(c in mailHopsUtils.countries){
        document.getElementById("country_"+mailHopsUtils.countries[c]).checked=all;
      }
    }
  },
  planError: function(error){
    this.valid_api_key=false;
    document.getElementById("plan-error").style.display = 'block';
    document.getElementById("plan-error").value=error;
    document.getElementById("plan").value='';
    document.getElementById("status").value='';
    document.getElementById("rate-limit").value='';
    document.getElementById("rate-remaining").value='';
    document.getElementById("rate-reset").value='';
    document.getElementById("mailhops-membership-link").value='Join MailHops';
    document.getElementById("mailhops-membership-link").setAttribute('href','https://mailhops.com');
    var items = document.getElementsByClassName('filters');
    for(x in items){ 
      items[x].disabled = true; 
    }
    var items = document.getElementsByClassName('country');
    for(x in items){ 
      items[x].disabled = true; 
      if(items[x].label) 
        items[x].label = items[x].label.toUpperCase();
    }
  },
  saveAPIKey: function() {

    if(!!this.api_key && this.api_key.value != ''){
      var xmlhttp = new XMLHttpRequest();
      var apiBase = this.api_http.value+this.api_host.value,
          accountURL = '/v2/accounts/?api_key='+this.api_key.value.trim(),
          api_key = this.api_key.value.trim(),
          self = this;

      xmlhttp.open("GET", apiBase+accountURL, true);
       xmlhttp.onreadystatechange=function() {
        if (xmlhttp.readyState===4) {
          try {
             var data = JSON.parse(xmlhttp.responseText);
             if(xmlhttp.status===200){
                self.valid_api_key=true;
                document.getElementById("plan-error").style.display = 'none';
                // set plan info
                document.getElementById("plan").value = "Plan: "+data.account.subscriptions.data[0].plan.name;
                document.getElementById("status").value = "Status: "+data.account.subscriptions.data[0].status;
                document.getElementById("rate-limit").value = "Limit: "+data.account.rate.limit;
                document.getElementById("rate-remaining").value = "Remaining: "+data.account.rate.remaining;
                if(data.account.rate.reset/60 < 60)
                  document.getElementById("rate-reset").value = "Resets in: "+Math.round(data.account.rate.reset/60)+" min.";
                else
                  document.getElementById("rate-reset").value = "Resets in: "+Math.round(data.account.rate.reset/60/60)+" hr.";
                document.getElementById("mailhops-membership-link").value='My Account';
                document.getElementById("mailhops-membership-link").setAttribute('href','https://mailhops.com/account/'+api_key);

                var items = document.getElementsByClassName('filters');
                for(x in items){ items[x].disabled = false;}
                var items = document.getElementsByClassName('country');
                for(x in items){ items[x].disabled = false; if(items[x].label) items[x].label = items[x].label.toUpperCase();}
             } else if(!!data.error){
                self.planError(xmlhttp.status+': '+data.error.message);
             }
             mailHopPreferences.savePreferences();
           } catch (e){
             self.planError('Connection Failed to\n '+e+'!');
           }
         }
       };
     xmlhttp.send(null);
   } else {
     this.planError('Enter a valid API key above.');
   }
 },

  TestConnection: function(){
 	var xmlhttp = new XMLHttpRequest();
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
 },

 ResetDisplay: function(bar,font,size){
   if(bar){
     if(bar.indexOf('rgb(')===0)
      document.getElementById("mailhop.bar_color").value = this.rgb2hex(bar);
     else
      document.getElementById("mailhop.bar_color").value = bar;
   }
   if(font) {
     if(font.indexOf('rgb(')===0)
      document.getElementById("mailhop.font_color").value = this.rgb2hex(font);
     else
      document.getElementById("mailhop.font_color").value = font;
   }
   if(size) document.getElementById("mailhop.font_size").value = size;
   this.previewBar.style.background = document.getElementById("mailhop.bar_color").value;
   this.previewBar.style.color = document.getElementById("mailhop.font_color").value;
   this.previewBar.style.fontSize = document.getElementById("mailhop.font_size").value;
 },

  rgb2hex: function(rgb) {
      rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
      function hex(x) {
          return ("0" + parseInt(x).toString(16)).slice(-2);
      }
      return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
  }

 };
