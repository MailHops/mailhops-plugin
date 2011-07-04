if (!pref)
{
  var pref = Components.classes["@mozilla.org/preferences-service;1"].getService ( Components.interfaces.nsIPrefBranch ) ;
}

var mailHopPreferences =
{
  loadPreferences: function()
  {
  	if(pref.getCharPref("mail.mailHops.map",'goog')=='goog')
	    document.getElementById("mailhop.map").selectedIndex = 0;
	else
	    document.getElementById("mailhop.map").selectedIndex = 1;
	    
	if(pref.getCharPref("mail.mailHops.unit",'mi')=='mi')
	    document.getElementById("mailhop.unit").selectedIndex = 0;
	else
	    document.getElementById("mailhop.unit").selectedIndex = 1;
	    
	if(pref.getCharPref("mail.mailHops.show_details",'false')=='true')
		document.getElementById("mailhop.show_details").checked = true;
	else
		document.getElementById("mailhop.show_details").checked = false;
		
	if(pref.getCharPref("mail.mailHops.show_weather",'false')=='true')
		document.getElementById("mailhop.show_weather").checked = true;
	else
		document.getElementById("mailhop.show_weather").checked = false;	
	
  } ,
  savePreferences: function()
  {
    pref.setCharPref("mail.mailHops.map", document.getElementById("mailhop.map").selectedItem.value) ;
    pref.setCharPref("mail.mailHops.unit", document.getElementById("mailhop.unit").selectedItem.value) ;
    pref.setCharPref("mail.mailHops.show_details", String(document.getElementById("mailhop.show_details").checked)) ;
    pref.setCharPref("mail.mailHops.show_weather", String(document.getElementById("mailhop.show_weather").checked)) ;
  } 
}
