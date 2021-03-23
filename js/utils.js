const MailHopsUtils = {

countries: ["ad","ae","af","ag","ai","al","am","an","ao","ar","as","at","au","aw","ax","az","ba","bb","bd","be","bf","bg","bh","bi","bj","bm","bn","bo","br","bs","bt","bv","bw","by","bz","ca","catalonia","cc","cd","cf","cg","ch","ci","ck","cl","cm","cn","co","cr","cs","cu","cv","cx","cy","cz","de","dj","dk","dm","do","dz","ec","ee","eg","eh","england","er","es","et","europeanunion","fam","fi","fj","fk","fm","fo","fr","ga","gb","gd","ge","gf","gh","gi","gl","gm","gn","gp","gq","gr","gs","gt","gu","gw","gy","hk","hm","hn","hr","ht","hu","id","ie","il","in","io","iq","ir","is","it","jm","jo","jp","ke","kg","kh","ki","km","kn","kp","kr","kw","ky","kz","la","lb","lc","li","lk","lr","ls","lt","lu","lv","ly","ma","mc","md","me","mg","mh","mk","ml","mm","mn","mo","mp","mq","mr","ms","mt","mu","mv","mw","mx","my","mz","na","nc","ne","nf","ng","ni","nl","no","np","nr","nu","nz","om","pa","pe","pf","pg","ph","pk","pl","pm","pn","pr","ps","pt","pw","py","qa","re","ro","rs","ru","rw","sa","sb","sc","scotland","sd","se","sg","sh","si","sj","sk","sl","sm","sn","so","sr","st","sv","sy","sz","tc","td","tf","tg","th","tj","tk","tl","tm","tn","to","tr","tt","tv","tw","tz","ua","ug","um","us","uy","uz","va","vc","ve","vg","vi","vn","vu","wales","wf","ws","ye","yt","za","zm","zw"],

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

launchSpamHausURL: function(ip){
   this.launchExternalURL('http://www.spamhaus.org/query/bl?ip=' + ip);
},

getAPIUrl: function(){
  return 'https://api.mailhops.com/v2';
},

getAPIUrlParams: function(options){
  if(!!options.api_key && options.api_key != '')
    return 'app='+options.version+'&api_key='+options.api_key;
  return 'app='+options.version;
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
},

getDistance: function(from, to, unit) {
    if(!from || !to || !from.coords)
      return 0;

		var lat = parseFloat(from.coords[1]);
		var lon1 = parseFloat(from.coords[0]);
		var lat2 = parseFloat(to.coords[1]);
		var lon2 = parseFloat(to.coords[0]);
    unit = unit || 'mi'; //mi or km

		lat *= (Math.PI/180);
		lon1 *= (Math.PI/180);
		lat2 *= (Math.PI/180);
		lon2 *= (Math.PI/180);

		var dist = 2*Math.asin(Math.sqrt( Math.pow((Math.sin((lat-lat2)/2)),2) + Math.cos(lat)*Math.cos(lat2)*Math.pow((Math.sin((lon1-lon2)/2)),2))) * 6378.137;

		if (unit == 'mi') {
			dist = (dist / 1.609344);
		}
		return this.addCommas(Math.round(dist));
	},
  getSender: function(route) {
    if(route && route.length){
      for (var r = 0; r < route.length; r++){        
        if (typeof route[r].local == 'undefined' &&          
          typeof route[r].client == 'undefined' &&
          Boolean(route[r].countryCode)) {
          // set icon
          route[r].icon = '/images/flags/' + route[r].countryCode.toLowerCase() + '.png';
          // set title
          route[r].title = (route[r].city && route[r].state)
            ? `${route[r].city}, ${route[r].state}`
            : (route[r].city ? `${route[r].city}, ${route[r].countryCode}` : route[r].countryName);
          return route[r];          
        }
      }
    }
    return null;
  },
  htmlEncode: function (text) {
    return text.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  }
};
