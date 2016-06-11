var mailHopsDisplay =
{
  resultTextDataPane:		null,
  resultTextDataPane2:		null,
  resultTextDataPane3:      null,
  resultContainerDataPane:	null,
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
  options: 					null,

  init: function(options){

  	  this.options = options;

  	  this.resultContainerDataPane = document.getElementById ( "mailhopsDataPane");
  	  this.resultTextDataPane = document.getElementById ( "mailhopsDataPaneText");
  	  this.resultTextDataPane2 = document.getElementById ( "mailhopsDataPaneText2");
  	  this.resultTextDataPane3 = document.getElementById ( "mailhopsDataPaneText3");

  	  this.resultContainerDetails = document.getElementById ( "mailhopsDetailsContainer");
  	  this.resultDetails = document.getElementById ( "mailhopsDataPaneDetails");
  	  this.resultMeta = document.getElementById ( "mailhopsDataPaneMeta");
  	  this.resultMapLink = document.getElementById ( "mailhopsDataPaneMapLink");

  	  //auth
  	  this.mailhopsAuthContainer = document.getElementById ( "dataPaneMailHopsAuthContainer");
  	  this.mailhopsDataPaneSPF = document.getElementById ( "mailhopsDataPaneSPF");
  	  this.mailhopsDataPaneDKIM = document.getElementById ( "mailhopsDataPaneDKIM");
  	  this.mailhopsDataPaneMailer = document.getElementById ( "mailhopsDataPaneMailer");
  	  this.mailhopsDataPaneDNSBL = document.getElementById ( "mailhopsDataPaneDNSBL");
  	  //list
  	  this.mailhopsListContainer = document.getElementById ( "dataPaneMailHopsListContainer");

  	  this.resultListDataPane = document.getElementById ( "mailhopsListDataPane");

  	  if(this.options.show_meta)
   	    document.getElementById('dataPaneMailHopsMetaContainer').style.display='';
   	  else
   	  	document.getElementById('dataPaneMailHopsMetaContainer').style.display='none';

  	  //event listner for route click to launch map
  	  this.resultMapLink.addEventListener("click", function () {
	  		if(this.hasAttribute("data-route"))
		  		mailHopsUtils.launchMap( String(this.getAttribute("data-route")), options );
	  	});

	  this.mailhopsDataPaneDNSBL.addEventListener("click", function () {
			if(this.hasAttribute('data-ip'))
		  		mailHopsUtils.launchSpamHausURL(this.getAttribute('data-ip'));
	  	});

	  //display auth
	  if(!this.options.show_auth)
		  this.displayResultAuth(headXMailer,headUserAgent,headXMimeOLE,headAuth,headReceivedSPF);
	  else
	      this.mailhopsAuthContainer.style.display='none';

	  //display unsubscribe link
	  if(!this.options.show_lists)
	  	this.mailhopsListContainer.style.display='none';

  }, //end init

  lists: function( header_unsubscribe ){
  	while(this.resultListDataPane.firstChild) {
    	this.resultListDataPane.removeChild(this.resultListDataPane.firstChild);
	}
	this.mailhopsListContainer.style.display='';
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
				this.resultListDataPane.appendChild(label);
			}
		}
	}
  },

  auth: function( header_xmailer, header_useragent, header_xmimeole, header_auth, header_spf ){
  	this.mailhopsAuthContainer.style.display='';
	//SPF
	if(header_spf){
		header_spf=header_spf.replace(/^\s+/,"");
		var headerSPFArr=header_spf.split(' ');
		this.mailhopsDataPaneSPF.setAttribute('value','SPF: '+headerSPFArr[0]);
		this.mailhopsDataPaneSPF.style.backgroundImage = 'url(chrome://mailhops/content/images/auth/'+headerSPFArr[0]+'.png)';
		this.mailhopsDataPaneSPF.setAttribute('tooltiptext',header_spf+'\n'+mailHopsUtils.spf(headerSPFArr[0]));
		this.mailhopsDataPaneSPF.style.display='block';
	} else {
		this.mailhopsDataPaneSPF.style.display='none';
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

		if(this.options.show_dkim && dkim_result){
			dkim_result=dkim_result.replace(/^\s+/,"");
			var dkimArr=dkim_result.split(' ');
			this.mailhopsDataPaneDKIM.setAttribute('value','DKIM: '+dkimArr[0].replace('dkim=',''));
			this.mailhopsDataPaneDKIM.style.backgroundImage = 'url(chrome://mailhops/content/images/auth/'+dkimArr[0].replace('dkim=','')+'.png)';
			this.mailhopsDataPaneDKIM.setAttribute('tooltiptext',dkim_result+'\n'+mailHopsUtils.dkim(dkimArr[0].replace('dkim=','')));
			this.mailhopsDataPaneDKIM.style.display='block';
		} else {
			this.mailhopsDataPaneDKIM.style.display='none';
		}

		if(this.options.show_spf && spf_result){
			spf_result=spf_result.replace(/^\s+/,"");
			var spfArr=spf_result.split(' ');
			this.mailhopsDataPaneSPF.setAttribute('value','SPF: '+spfArr[0].replace('spf=',''));
			this.mailhopsDataPaneSPF.style.backgroundImage = 'url(chrome://mailhops/content/images/auth/'+spfArr[0].replace('spf=','')+'.png)';
			this.mailhopsDataPaneSPF.setAttribute('tooltiptext',spf_result+'\n'+mailHopsUtils.spf(spfArr[0].replace('spf=','')));
			this.mailhopsDataPaneSPF.style.display='block';
		}
	} else {
		this.mailhopsDataPaneDKIM.style.display='none';
	}
	//X-Mailer, User-Agent or X-MimeOLE
	if(header_xmailer){
		this.mailhopsDataPaneMailer.style.backgroundImage = 'url(chrome://mailhops/content/images/email.png)';
		if(header_xmailer.indexOf('(')!=-1)
			this.mailhopsDataPaneMailer.setAttribute('value',header_xmailer.substring(0,header_xmailer.indexOf('(')));
		else if(header_xmailer.indexOf('[')!=-1)
			this.mailhopsDataPaneMailer.setAttribute('value',header_xmailer.substring(0,header_xmailer.indexOf('[')));
		else
			this.mailhopsDataPaneMailer.setAttribute('value',header_xmailer);
		this.mailhopsDataPaneMailer.setAttribute('tooltiptext',header_xmailer);
		this.mailhopsDataPaneMailer.style.display='block';
	} else if(header_useragent){
		this.mailhopsDataPaneMailer.style.backgroundImage = 'url(chrome://mailhops/content/images/email.png)';
		if(header_useragent.indexOf('(')!=-1)
			this.mailhopsDataPaneMailer.setAttribute('value',header_useragent.substring(0,header_useragent.indexOf('(')));
		else if(header_useragent.indexOf('[')!=-1)
			this.mailhopsDataPaneMailer.setAttribute('value',header_useragent.substring(0,header_useragent.indexOf('[')));
		else
			this.mailhopsDataPaneMailer.setAttribute('value',header_useragent);
		this.mailhopsDataPaneMailer.setAttribute('tooltiptext',header_useragent);
		this.mailhopsDataPaneMailer.style.display='block';
	} else if(header_xmimeole){
		this.mailhopsDataPaneMailer.style.backgroundImage = 'url(chrome://mailhops/content/images/email.png)';

		if(header_xmimeole.indexOf('(')!=-1)
			header_xmimeole = header_xmimeole.substring(0,header_xmimeole.indexOf('('));
		else if(header_xmimeole.indexOf('[')!=-1)
			header_xmimeole = header_xmimeole.substring(0,header_xmimeole.indexOf('['));

		if(header_xmimeole.indexOf('Produced By ')!=-1)
			this.mailhopsDataPaneMailer.setAttribute('value',header_xmimeole.replace('Produced By ',''));
		else
			this.mailhopsDataPaneMailer.setAttribute('value',header_xmimeole);

		this.mailhopsDataPaneMailer.setAttribute('tooltiptext',header_xmimeole);
		this.mailhopsDataPaneMailer.style.display='block';
	} else {
		this.mailhopsDataPaneMailer.style.display='none';
	}
  },

  error: function(data){
  	this.resultMapLink.removeAttribute("route");
	  if(data && data.meta.code==410)
	  	this.resultTextDataPane.style.backgroundImage = 'url(chrome://mailhops/content/images/info.png)';
	  else
	  	this.resultTextDataPane.style.backgroundImage = 'url(chrome://mailhops/content/images/auth/error.png)';

	  if(data && data.error){
	  	this.resultTextDataPane.value = mailHopsUtils.error(data.meta.code);
	  	this.resultTextDataPane.setAttribute('tooltiptext',data.error.message);
	  } else {
	  	this.resultTextDataPane.value = ' Service Unavailable.';
	  	this.resultTextDataPane.setAttribute('tooltiptext',' Could not connect to MailHops API.');
	  }
	  this.resultTextDataPane2.style.display = 'none';
	  this.resultTextDataPane2.value = '';
	  this.resultTextDataPane2.style.backgroundImage = '';
	  this.resultTextDataPane2.setAttribute('tooltiptext','');

    this.resultTextDataPane3.style.display = 'none';
    this.resultTextDataPane3.value = '';
  },

  clear: function(no_ips){
  	this.resultTextDataPane2.style.display = 'none';
  	this.resultContainerDetails.style.display = 'none';
  	this.resultMapLink.style.display = 'none';
  	this.mailhopsDataPaneDNSBL.style.display = 'none';

  	if(no_ips){
  		this.resultTextDataPane.style.backgroundImage = 'url(chrome://mailhops/content/images/help.png)';
  		this.resultTextDataPane.value = ' No IPs';
  		this.resultTextDataPane.setAttribute('tooltiptext','There were no received headers found');
  	} else {
  		this.resultTextDataPane.style.backgroundImage = 'url(chrome://mailhops/content/images/loader.gif)';
  		this.resultTextDataPane.value = ' Looking Up Route';
  		this.resultTextDataPane.setAttribute('tooltiptext','Looking Up Route');
  	}

  	this.resultTextDataPane2.value = '';
  	this.resultTextDataPane2.style.backgroundImage = '';
  	this.resultTextDataPane2.setAttribute('tooltiptext','');

      this.resultTextDataPane3.style.display = 'none';
      this.resultTextDataPane3.value = '';

  	//remove child details
  	while(this.resultDetails.firstChild) {
      	this.resultDetails.removeChild(this.resultDetails.firstChild);
  	}
    if(this.options.show_meta){
 	    while(this.resultMeta.firstChild) {
    		this.resultMeta.removeChild(this.resultMeta.firstChild);
  		}
    }
  },

  route: function(header_route, message, response, meta, lookup_url){

	  var displayText=''
		  , distanceText=''
		  , image='chrome://mailhops/content/images/local.png'
		  , secureToolTipText=false
		  , weather=null
		  , first=null;

	  //remove child details
	  while(this.resultDetails.firstChild) {
	    	this.resultDetails.removeChild(this.resultDetails.firstChild);
	  }

  	//append meta
	if(this.options.show_meta){
 			for(var index in meta){
			var mlabel = document.createElement('label');
			mlabel.setAttribute('value',index+': '+meta[index]);
			this.resultMeta.appendChild(mlabel);
		}
		var mlabel = document.createElement('label');
			mlabel.setAttribute('value','api url');
			mlabel.setAttribute('class','text-link');
			mlabel.setAttribute('href',lookup_url);
			this.resultMeta.appendChild(mlabel);

	}

  if(response && response.route && response.route.length > 0){

  		if(this.options.client_location){
  			var client_location = JSON.parse(this.options.client_location);
        //get distance from last route to client_location and add to response.distance.miles or kilometers
        if(!response.route[response.route.length-1]['private']){
          if(this.options.unit=='km')
            response.distance.kilometers += mailHopsUtils.getDistance(response.route[response.route.length-1],client_location.route[0],this.options.unit);
          else
            response.distance.miles += mailHopsUtils.getDistance(response.route[response.route.length-1],client_location.route[0],this.options.unit);
        }
        //push client location to the end of the route
        response.route.push(client_location.route[0]);
  		}

   		for(var i=0; i<response.route.length;i++){
  			//get the first hop location
	   		if(!first && !response.route[i].private && !response.route[i].client){
	   			first = response.route[i];
	   			if(!!response.route[i].countryCode)
		   			image='chrome://mailhops/content/images/flags/'+response.route[i].countryCode.toLowerCase()+'.png';
	   		}

	   		var label = document.createElement('label');
	   		if(response.route[i].countryCode)
		   		label.style.backgroundImage = 'url(chrome://mailhops/content/images/flags/'+response.route[i].countryCode.toLowerCase()+'.png)';
		   	else
		   		label.style.backgroundImage = 'url(chrome://mailhops/content/images/local.png)';
		   	label.setAttribute('class','dataPaneAddressitem mailhopsDetail');

	   		if(response.route[i].city && response.route[i].state){
		   		label.setAttribute('value','Hop #'+(i+1)+' '+response.route[i].city+', '+response.route[i].state);
	   			label.setAttribute('onclick','mailHopsUtils.launchWhoIs("'+response.route[i].ip+'");');
	   		}
		   	else if(response.route[i].city){
		   		label.setAttribute('value','Hop #'+(i+1)+' '+response.route[i].city+', '+response.route[i].countryCode);
		   		label.setAttribute('onclick','mailHopsUtils.launchWhoIs("'+response.route[i].ip+'");');
		   	}
  			else if(response.route[i].countryName){
  				label.setAttribute('value','Hop #'+(i+1)+' '+response.route[i].countryName);
  				label.setAttribute('onclick','mailHopsUtils.launchWhoIs("'+response.route[i].ip+'");');
  			}
  			else
  				label.setAttribute('value','Hop #'+(i+1)+' Private');

			//build tooltip
			var tiptext = response.route[i].ip;

			if(!this.options.show_host){
				if(response.route[i].host)
				   	tiptext+=' '+response.route[i].host;
				if(response.route[i].whois && response.route[i].whois.descr)
				   	tiptext+=' '+response.route[i].whois.descr;
				if(response.route[i].whois && response.route[i].whois.netname)
				   	tiptext+=' '+response.route[i].whois.netname;
			}

			label.setAttribute('tooltiptext','Click for whois '+tiptext);

			//append details
	   		this.resultDetails.appendChild(label);

	        //append weather
	        if(!weather && response.route[i].weather){
	          weather = response.route[i].weather;
	        }

	   		if(this.options.show_secure){
				//reset the tooltip
				secureToolTipText=mailHopsUtils.getSecureTrans(response.route[i].ip, message);
				//check for secure transmission
				if(secureToolTipText){
					var secure = document.createElement('label');
					secure.setAttribute('class','dataPaneAddressitem mailhopsSecure');
					secure.setAttribute('value','secured '+secureToolTipText);
					this.resultDetails.appendChild(secure);
				}
			}

	   		//append host
	   		if(this.options.show_host && response.route[i].host){
				var host = document.createElement('label');
				host.setAttribute('value',response.route[i].host);
				if(secureToolTipText)
					host.setAttribute('class','dataPaneAddressitem mailhopsSecureHost');
				else
					host.setAttribute('class','dataPaneAddressitem mailhopsHost');
				this.resultDetails.appendChild(host);
			}

			//auth & dnsbl
			if(!response.route[i].private && response.route[i].dnsbl && response.route[i].dnsbl.listed){
				this.mailhopsDataPaneDNSBL.setAttribute('value','Blacklisted '+mailHopsUtils.dnsbl(response.route[i].dnsbl.record,true));
				this.mailhopsDataPaneDNSBL.setAttribute('data-ip',response.route[i].ip);
				if(response.route[i].dnsbl.record)
					this.mailhopsDataPaneDNSBL.setAttribute('tooltiptext','Click for more details.\n'+mailHopsUtils.dnsbl(response.route[i].dnsbl.record));
				else
					this.mailhopsDataPaneDNSBL.setAttribute('tooltiptext','Click for more details.');
				this.mailhopsDataPaneDNSBL.style.backgroundImage = 'url(chrome://mailhops/content/images/auth/bomb.png)';
				this.mailhopsDataPaneDNSBL.style.display = 'block';
			}

	      // if(response.route[i].ip.indexOf(':') !== -1){
	      //   var ipv6 = document.createElement('label');
	      //     ipv6.setAttribute('class','dataPaneAddressitem mailhopsipv6');
	      //     ipv6.setAttribute('value','IPV6');
	      //     this.resultDetails.appendChild(ipv6);
	      // }

	      if(response.route[i].w3w){
	          var w3w = document.createElement('label');
	          w3w.setAttribute('class','dataPaneAddressitem mailhopsW3w');
	          w3w.setAttribute('value',response.route[i].w3w.words.join('.'));
	          w3w.setAttribute('onclick','mailHopsUtils.launchExternalURL("'+response.route[i].w3w.url+'");');
	          this.resultDetails.appendChild(w3w);
	      }
 	  }
 }

 if(image.indexOf('local')!=-1) {
  	displayText = ' Local message.';
  } else {

  	if(!!first){
      if(!!first.city && !!first.state)
          displayText = first.city+', '+first.state;
      else if(!!first.city)
          displayText = first.city+', '+first.countryCode;
      else if(!!first.countryName)
          displayText = first.countryName;
    }

    if(response.distance){
    	if(this.options.unit=='km' && response.distance.kilometers > 0)
			   distanceText =' ( '+mailHopsUtils.addCommas(Math.round(response.distance.kilometers))+' km traveled )';
		  else if(response.distance.miles > 0)
			   distanceText =' ( '+mailHopsUtils.addCommas(Math.round(response.distance.miles))+' mi traveled )';
	  }
  	else if(displayText=='')
  		displayText = ' Local message.';
  }

  if(header_route)
  	this.resultMapLink.setAttribute("data-route", header_route);
  else
	this.resultMapLink.removeAttribute("data-route");

  this.resultTextDataPane.style.backgroundImage = 'url('+image+')';
  this.resultTextDataPane.value = displayText;
  this.resultTextDataPane.setAttribute('tooltiptext',displayText+' '+distanceText);

  if(distanceText){
	this.resultTextDataPane2.style.display = 'block';
	this.resultTextDataPane2.value = distanceText;
  	this.resultTextDataPane2.setAttribute('tooltiptext',displayText+' '+distanceText);
  } else {
  	this.resultTextDataPane2.style.display = 'none';
  }

  //set weather of sender
  if(weather){
    this.resultTextDataPane3.style.display = 'block';
    this.resultTextDataPane3.setAttribute('tooltiptext',new Date(weather.time*1000));
    this.resultTextDataPane3.value = weather.summary+' '+Math.round(weather.temp)+'\u00B0';
    this.resultTextDataPane3.style.backgroundImage = 'url('+mailHopsUtils.getWeatherIcon(weather.icon)+')';
  }

  //show the detail link
  this.resultMapLink.style.display = 'block';
  this.resultContainerDetails.style.display = 'block';

	} //end route
};
