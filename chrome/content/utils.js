var mailHopsUtils = {

dkim: function(result){

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
},

spf: function(result){

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

},

dnsbl: function(result,abbr){

	switch(result){

   	case '127.0.0.2':
   	case '127.0.0.3':
         if(abbr)
            return 'SBL';
         else   
			     return 'Static UBE sources, verified spam services and ROKSO spammers.';

		case '127.0.0.4':
		case '127.0.0.5':
		case '127.0.0.6':
		case '127.0.0.7':
         if(abbr)
            return 'XBL';
         else   
            return 'Illegal 3rd party exploits, including proxies, worms and trojan exploits.';

		case '127.0.0.10':
		case '127.0.0.11':
         if(abbr)
            return 'PBL';
         else   
			     return 'IP ranges which should not be delivering unauthenticated SMTP email.';

		default:
			return '';
	}
},

error: function(error_code){
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
},

addCommas: function(nStr){
   nStr += '';
   var x = nStr.split('.');
   var x1 = x[0];
   var x2 = x.length > 1 ? '.' + x[1] : '';
   var rgx = /(\d+)(\d{3})/;
   while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + ',' + '$2');
   }
   return x1 + x2;
},

launchExternalURL: function(url){
  var messenger = Components.classes["@mozilla.org/messenger;1"].createInstance().QueryInterface(Components.interfaces.nsIMessenger);
  messenger.launchExternalURL(url);
},

launchWhoIs: function(ip){
   this.launchExternalURL('http://www.mailhops.com/whois/'+ip);
},

launchSpamHausURL: function(ip){
   this.launchExternalURL('http://www.spamhaus.org/query/bl?ip='+ip);
},

launchMap: function(route,options){

   if(route != ''){
      var lookupURL=options.api_url+'/v1/map/?app='+options.version+'&l='+options.lan+'&u='+options.unit+'&r='+String(route);

    if(options.fkey != '')
      lookupURL += '&fkey='+options.fkey;

      window.openDialog("chrome://mailhops/content/mailhopsMap.xul","MailHops",'toolbar=no,location=no,directories=no,menubar=yes,scrollbars=yes,close=yes,width=1024,height=768,resizable=yes', {src: lookupURL});    
   }
},

getSecureTrans: function(ip, message){
  for(var i=0; i<message.secure.length; i++){
    if(message.secure[i].indexOf(ip+':')!=-1){
      return message.secure[i].substring(message.secure[i].indexOf(':')+1);
    }
  }
  return false;
},

getWeatherIcon: function(icon){
    var forecast_icons = {'clear-day': {'day':'sun', 'night':'sun'}
        , 'clear-night': {'day':'clear_night', 'night':'clear_night'}
        , 'rain': {'day':'rain','night':'rain'}
        , 'snow': {'day':'snow','night':'snow'}
        , 'sleet': {'day':'rain','night':'rain'}
        , 'wind': {'day':'clouds','night':'clouds'}
        , 'fog': {'day':'clouds','night':'clouds'}
        , 'cloudy': {'day':'clouds','night':'cloudy_night'}
        , 'partly-cloudy-day': {'day':'cloudy','night':'cloudy'}
        , 'partly-cloudy-night': {'day':'cloudy_night','night':'cloudy_night'}
        , 'hail': {'day':'rain','night':'rain'}
        , 'thunderstorm': {'day':'thunderstorm','night':'thunderstorm'}
        , 'tornado': {'day':'thunderstorm','night':'thunderstorm'}
    };
    var hr = (new Date).getHours();
    var time = (hr >= 4 && hr <= 18)?'day':'night';
    return 'chrome://mailhops/content/images/weather/'+forecast_icons[icon][time]+'.png';
}

};