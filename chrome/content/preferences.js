if (!pref)
{
  var pref = Components.classes["@mozilla.org/preferences-service;1"].getService ( Components.interfaces.nsIPrefBranch ) ;
}

var mailHopPreferences =
{
  loadPreferences: function()
  {
  	if(mailHops.getCharPref("mail.mailHops.map",'goog')=='goog')
	    document.getElementById("mailhop.map").selectedIndex = 0;
	else
	    document.getElementById("mailhop.map").selectedIndex = 1;
	if(mailHops.getCharPref("mail.mailHops.unit",'mi')=='mi')
	    document.getElementById("mailhop.unit").selectedIndex = 0;
	else
	    document.getElementById("mailhop.unit").selectedIndex = 1;
  } ,
  savePreferences: function()
  {
    mailHopPreferences.setCharPref("mail.mailHops.map", document.getElementById("mailhop.map").selectedItem.value) ;
    mailHopPreferences.setCharPref("mail.mailHops.unit", document.getElementById("mailhop.unit").selectedItem.value) ;
  } ,
  setCharPref: function( strName , strValue )
  {
    pref.setCharPref ( strName , strValue ) ;
  }
}
