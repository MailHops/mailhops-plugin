var mailHopsDisplay =
{
  resultBox:              null,
  resultText:             null,
  resultDetails:          null,
  mailhopsDataPaneHops:   null,
  mailhopsDataPaneSPF:    null,
  mailhopsDataPaneDKIM:   null,
  mailhopsDataPaneMailer: null,
  mailhopsDataPaneDNSBL:  null,
  mailhopsResultWeather:  null,
  mailhopsUnsubscribe:    null,
  mailHopsAccountMessage: null,
  mhBox:                  null,
  options:                null,

  init: function(options, reload){

    this.options = options;
    this.mhBox = document.getElementById("mailhopsNoficationBox");
    this.mhNoteBox = document.getElementById("mailhopsNotification");
    this.resultBox = document.getElementById("mailhopsResult");
    this.resultText = document.getElementById("mailhopsResultText");
    this.mailhopsResultWeather = document.getElementById("mailhopsResultWeather");
    this.mailhopsUnsubscribe = document.getElementById("mailhopsUnsubscribe");
    this.resultDetails = document.getElementById("mailhopsDataPaneDetails");
    this.mailHopsAccountMessage = document.getElementById("mailHopsAccountMessage");
    this.mailhopsDataPaneHops = document.getElementById("mailhopsDataPaneHops");
        
    //auth
    this.mailhopsDataPaneSPF = document.getElementById("mailhopsDataPaneSPF");
    this.mailhopsDataPaneDKIM = document.getElementById("mailhopsDataPaneDKIM");
    this.mailhopsDataPaneMailer = document.getElementById("mailhopsDataPaneMailer");
    this.mailhopsDataPaneDNSBL = document.getElementById("mailhopsDataPaneDNSBL");

    //wait for message to be selected before showing
    if (!reload && this.mhBox)
      this.mhBox.style.display = 'none';

    //event listner for route click to launch map
    this.mailhopsDataPaneDNSBL.addEventListener("click", function () {
      if(this.hasAttribute('data-ip'))
        mailHopsUtils.launchSpamHausURL( this.getAttribute('data-ip') );
    });

    this.resultText.addEventListener("click", function () {
      if(this.value.indexOf('Rate Limit')!==-1)
        window.openDialog("chrome://mailhops/content/preferences.xul","","chrome, dialog, modal, centerscreen").focus();
      else if(this.hasAttribute('data-route'))
        mailHopsUtils.launchMap( String(this.getAttribute('data-route')), options );
    });

    this.mailhopsResultWeather.addEventListener("click", function () {
      mailHopsUtils.launchExternalURL(this.getAttribute('href'));
    });

    this.mailHopsAccountMessage.addEventListener("click", function () {
      mailHopsUtils.launchExternalURL(this.getAttribute('href'));
      this.style.display = 'none';
    });

    this.mailhopsDataPaneHops.addEventListener("click", function () {
      this.classList.toggle('active');
      if(mailHopsDisplay.resultDetails.style.display !== 'block')
        mailHopsDisplay.resultDetails.style.display = 'block';
      else
        mailHopsDisplay.resultDetails.style.display = 'none';
    });

    this.mailhopsUnsubscribe.addEventListener("click", function () {
      if(this.getAttribute('href'))
        mailHopsUtils.launchExternalURL(this.getAttribute('href'));
    });

    if(!!options.bar_color)
      this.mhNoteBox.style.background = options.bar_color;
    else
      this.mhNoteBox.style.background = '';

    if(!!options.font_size)
      this.mhNoteBox.style.fontSize = options.font_size;

    if(!!options.font_color){
      this.resultText.style.color = options.font_color;
      this.mailhopsResultWeather.style.color = options.font_color;
      this.mailhopsUnsubscribe.style.color = options.font_color;
      this.mailhopsDataPaneSPF.style.color = options.font_color;
      this.mailhopsDataPaneDKIM.style.color = options.font_color;
      this.mailhopsDataPaneMailer.style.color = options.font_color;
      this.mailhopsDataPaneDNSBL.style.color = options.font_color;
    }
  },

  lists: function( header_unsubscribe ){

    this.mailhopsUnsubscribe.style.display='none';

  	if(header_unsubscribe){
      this.mailhopsUnsubscribe.style.display='';
  		var listArr=header_unsubscribe.split(',');
  		var href='';
  		if(listArr.length){
  			for(var h=0;h<listArr.length;h++){
  				href = listArr[h].replace('<','').replace('>','');
  				if(href.indexOf('mailto:')!=-1){
  					if(href.toLowerCase().indexOf('subject=')==-1){
  						if(href.indexOf('?')==-1)
  							href+='?subject=Unsubscribe';
  						else
  							href+='&subject=Unsubscribe';
  					}
  				}
  				this.mailhopsUnsubscribe.setAttribute('href',href);
  			}
  		}
  	}
  },

  auth: function( header_xmailer, header_useragent, header_xmimeole, header_auth, header_spf ){
    //SPF
    if(header_spf){
      header_spf=header_spf.replace(/^\s+/,"");
      var headerSPFArr=header_spf.split(' ');
      this.mailhopsDataPaneSPF.setAttribute('value','SPF: '+headerSPFArr[0]);
      this.mailhopsDataPaneSPF.style.backgroundImage = "url('chrome://mailhops/content/images/auth/"+headerSPFArr[0]+".png')";
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
        this.mailhopsDataPaneDKIM.style.backgroundImage = "url('chrome://mailhops/content/images/auth/"+dkimArr[0].replace('dkim=','')+".png')";
        this.mailhopsDataPaneDKIM.setAttribute('tooltiptext',dkim_result+'\n'+mailHopsUtils.dkim(dkimArr[0].replace('dkim=','')));
        this.mailhopsDataPaneDKIM.style.display='block';
      } else {
        this.mailhopsDataPaneDKIM.style.display='none';
      }
      if(this.options.show_spf && spf_result){
        spf_result=spf_result.replace(/^\s+/,"");
        var spfArr=spf_result.split(' ');
        this.mailhopsDataPaneSPF.setAttribute('value','SPF: '+spfArr[0].replace('spf=',''));
        this.mailhopsDataPaneSPF.style.backgroundImage = "url('chrome://mailhops/content/images/auth/"+spfArr[0].replace('spf=','')+".png')";
        this.mailhopsDataPaneSPF.setAttribute('tooltiptext',spf_result+'\n'+mailHopsUtils.spf(spfArr[0].replace('spf=','')));
        this.mailhopsDataPaneSPF.style.display='block';
      }
    } else {
      this.mailhopsDataPaneDKIM.style.display='none';
    }
    //X-Mailer, User-Agent or X-MimeOLE
    if(header_xmailer){
      this.mailhopsDataPaneMailer.style.backgroundImage = "url('chrome://mailhops/content/images/email.png')";
      if(header_xmailer.indexOf('(')!=-1)
        this.mailhopsDataPaneMailer.setAttribute('value',header_xmailer.substring(0,header_xmailer.indexOf('(')));
      else if(header_xmailer.indexOf('[')!=-1)
        this.mailhopsDataPaneMailer.setAttribute('value',header_xmailer.substring(0,header_xmailer.indexOf('[')));
      else
        this.mailhopsDataPaneMailer.setAttribute('value',header_xmailer);
      this.mailhopsDataPaneMailer.setAttribute('tooltiptext',header_xmailer);
      this.mailhopsDataPaneMailer.style.display='block';
    } else if(header_useragent){
      this.mailhopsDataPaneMailer.style.backgroundImage = "url('chrome://mailhops/content/images/email.png')";
      if(header_useragent.indexOf('(')!=-1)
        this.mailhopsDataPaneMailer.setAttribute('value',header_useragent.substring(0,header_useragent.indexOf('(')));
      else if(header_useragent.indexOf('[')!=-1)
        this.mailhopsDataPaneMailer.setAttribute('value',header_useragent.substring(0,header_useragent.indexOf('[')));
      else
        this.mailhopsDataPaneMailer.setAttribute('value',header_useragent);
      this.mailhopsDataPaneMailer.setAttribute('tooltiptext',header_useragent);
      this.mailhopsDataPaneMailer.style.display='block';
    } else if(header_xmimeole){
      this.mailhopsDataPaneMailer.style.backgroundImage = "url('chrome://mailhops/content/images/email.png')";

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

  error: function(status,data){
    this.resultText.style.backgroundImage = "url('chrome://mailhops/content/images/auth/error.png')";
    if(data && data.error){
      this.resultText.setAttribute('value', status+': '+data.error.message);
      this.resultText.setAttribute('tooltiptext',data.error.message);
    } else {
      this.resultText.setAttribute('value', ' Service Unavailable.');
      this.resultText.setAttribute('tooltiptext',' Could not connect to MailHops API.');
    }
  },

  clear: function(no_ips){
    this.mhBox.style.display = '';
    this.mailhopsDataPaneDNSBL.style.display = 'none';
    this.mailhopsResultWeather.style.display = 'none';
    this.resultText.removeAttribute('data-route');
    this.resultText.style.backgroundImage = '';
    //remove child details
    while(this.resultDetails.firstChild) {
        this.resultDetails.removeChild(this.resultDetails.firstChild);
    }
    this.mailHopsAccountMessage.style.display = 'none';
    
    if(no_ips){
      this.resultText.style.backgroundImage = "url('chrome://mailhops/content/images/local.png')";
      this.resultText.value = ' Looks like a local message';
    } else {
      this.resultText.style.backgroundImage = "url('chrome://mailhops/content/images/refresh.png')";
      this.resultText.value = ' Looking Up Route...';
    }
  },

  route: function ( header_route, message, response, meta, lookup_url ){

  var displayText=''
    , distanceText=''
    , image='chrome://mailhops/content/images/local.png'
    , weatherRoute=null
    , first=null;

  //remove child details
  while(this.resultDetails.firstChild) {
      this.resultDetails.removeChild(this.resultDetails.firstChild);
  }

  if(response && response.route && response.route.length){

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
              this.resultText.setAttribute('tooltiptext','View Map');
            }

            var hop = document.createElement('label');
            var label = '';

            if(response.route[i].countryCode)
              hop.style.backgroundImage = "url('chrome://mailhops/content/images/flags/"+response.route[i].countryCode.toLowerCase()+".png')";
            else if(response.route[i].coords)
              hop.style.backgroundImage = "url('chrome://mailhops/content/images/auth/none.png')";
            else
              hop.style.backgroundImage = "url('chrome://mailhops/content/images/local.png')";

            if(response.route[i].coords){

              hop.setAttribute('class','bar-link hop');

              if(response.route[i].city && response.route[i].state)
                label='Hop #'+(i+1)+' '+response.route[i].city+', '+response.route[i].state;
              else if(response.route[i].city && response.route[i].countryCode)
                label='Hop #'+(i+1)+' '+response.route[i].city+', '+response.route[i].countryCode;
              else if(response.route[i].city)
                label='Hop #'+(i+1)+' '+response.route[i].city;
              else if(response.route[i].state)
                label='Hop #'+(i+1)+' '+response.route[i].state;
              else if(response.route[i].countryName)
                label='Hop #'+(i+1)+' '+response.route[i].countryName;
              else
                label='Hop #'+(i+1);

              hop.setAttribute('data-ip',response.route[i].ip);
              hop.setAttribute('tooltiptext','Click for whois');
              hop.addEventListener("click", function () {
                  mailHopsUtils.launchWhoIs(this.getAttribute('data-ip'));
                }
              , false);
          } else {
            hop.setAttribute('class','hop');
            label='Hop #'+(i+1)+' Private';
          }

          label+=' '+response.route[i].ip;
          hop.setAttribute('value',label);

          //append the hop
          this.resultDetails.appendChild(hop);

          //append the host
          label = '';
          if(response.route[i].host)
            label += response.route[i].host;
          if(response.route[i].whois && response.route[i].whois.descr)
            label += response.route[i].whois.descr;
          if(response.route[i].whois && response.route[i].whois.netname)
            label += response.route[i].whois.netname;

          if(label !== ''){
            hop = document.createElement('label');
            if(message.secure.indexOf(response.route[i].ip) !== -1)
              hop.style.backgroundImage = "url('chrome://mailhops/content/images/auth/secure.png')";
            else if(!response.route[i].client)
              hop.style.backgroundImage = "url('chrome://mailhops/content/images/auth/not_secure.png')";
            hop.setAttribute('class','host');
            hop.setAttribute('value',label);
            this.resultDetails.appendChild(hop);
          }

          //append weather
          if(!weatherRoute && !!response.route[i].weather){
            weatherRoute = response.route[i];
          }

            //auth & dnsbl
          if(!response.route[i].private && response.route[i].dnsbl && response.route[i].dnsbl.listed){
            this.mailhopsDataPaneDNSBL.setAttribute('value','Blacklisted '+mailHopsUtils.dnsbl(response.route[i].dnsbl.record,true));
            this.mailhopsDataPaneDNSBL.setAttribute('data-ip',response.route[i].ip);
            if(response.route[i].dnsbl.record)
              this.mailhopsDataPaneDNSBL.setAttribute('tooltiptext','Click for more details.\n'+mailHopsUtils.dnsbl(response.route[i].dnsbl.record));
            else
              this.mailhopsDataPaneDNSBL.setAttribute('tooltiptext','Click for more details.');
            this.mailhopsDataPaneDNSBL.style.backgroundImage = "url('chrome://mailhops/content/images/auth/bomb.png')";
            this.mailhopsDataPaneDNSBL.style.display = 'block';
          }
        }
    }

    //set weather of sender
    if(weatherRoute){
      this.mailhopsResultWeather.style.display = 'block';
      this.mailhopsResultWeather.setAttribute('tooltiptext','Weather in '+weatherRoute.city+' '+weatherRoute.state);
      this.mailhopsResultWeather.value = weatherRoute.weather.summary+' '+Math.round(weatherRoute.weather.temp)+'\u00B0';
      this.mailhopsResultWeather.style.backgroundImage = "url('"+mailHopsUtils.getWeatherIcon(weatherRoute.weather.icon)+"')";
      if(weatherRoute.coords)
        this.mailhopsResultWeather.setAttribute('href','https://darksky.net/forecast/'+weatherRoute.coords[1]+','+weatherRoute.coords[0]);
      else if(weatherRoute.lat)
        this.mailhopsResultWeather.setAttribute('href','https://darksky.net/forecast/'+weatherRoute.lat+','+weatherRoute.lng);
    }

    if(image.indexOf('local') !== -1) {
      displayText = ' Local message.';
      this.mailHopsAccountMessage.style.display = 'none';
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
          distanceText = mailHopsUtils.addCommas(Math.round(response.distance.kilometers))+' km traveled';
        else if(response.distance.miles > 0)
          distanceText = mailHopsUtils.addCommas(Math.round(response.distance.miles))+' mi traveled';
      } else if(displayText=='')
        displayText = ' Local message.';
    }

    if(!!message.time && message.time >= 0){
      message.time = message.time/1000;
      if(message.time < 60)
        distanceText += ' in '+message.time+' sec.';
      else if(message.time < 3600) //something is wrong if it takes this long
        distanceText += ' in '+Math.round(message.time/60)+' min.';
      else //something is wrong if it takes this long
        distanceText += ' in '+Math.round(message.time/60/60)+' hr.';
    }

    if(header_route)
      this.resultText.setAttribute("data-route", header_route);
    else
      this.resultText.removeAttribute("data-route");

    this.resultText.setAttribute('value', displayText+' ( '+distanceText+' )');
    this.resultText.style.backgroundImage = "url('"+image+"')";

    if(meta && meta.message){
      this.mailHopsAccountMessage.style.display = 'inline';
      if(meta.message.text)
        this.mailHopsAccountMessage.value = meta.message.text;
      if(meta.message.url)
        this.mailHopsAccountMessage.setAttribute('href', meta.message.url);
    } else {
      this.mailHopsAccountMessage.style.display = 'none';
    }
  }, //end route

  toggleMailHopsBar: function(show){
    if(show && this.mhBox.style.display == 'none')
      this.mhBox.style.display = '';
    else if(!show && this.mhBox.style.display == '')
      this.mhBox.style.display = 'none';
  }
};
