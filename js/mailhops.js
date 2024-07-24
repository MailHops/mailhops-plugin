/*
* @author: Andrew Van Tassel
* @email: andrew@andrewvantassel.com
* @website: http://Mailhops.com
*/

class MailHops {
  msgURI = null
  isLoaded = false
  loading = false
  tabId = null
  options = {
    version: 'MailHops Plugin 4.5.0',
    api_key: '',
    owm_key: '',
    lang: 'en',
    unit: 'mi',
    theme: 'light',
    api_http: 'https://',
    api_host: 'api.Mailhops.com',
    travel_time_junk: false,
    extrainfo: false,
    debug: false,
    country_filter: []
  }
  message = {
    id: null
    , map_url: ''
    , time: null
    , date: new Date().toISOString()
    , hash: ''
    , secure: []
    , headers: []
    , auth: []
    , sender: {
      icon: '/images/refresh.png'
      , title: 'Loading...'
      , description: ''
    },
    error: ''
  }
  response = {}

  LOG(msg) {
    if (!this.options.debug)
      return;
    console.log(msg);
  }

  async init(tabId, id, headers) {
    this.tabId = tabId;
    try {
      var data = await browser.storage.local.get();
      if (data.api_key) {
        this.options.api_key = data.api_key;
      }
      if (data.owm_key) {
        this.options.owm_key = data.owm_key;
      }
      if (data.lang) {
        this.options.lang = data.lang;
      }
      if (data.unit) {
        this.options.unit = data.unit;
      }
      if (data.theme) {
        this.options.theme = data.theme;
      }
      if (data.travel_time_junk && data.travel_time_junk != 'off') {
        this.options.travel_time_junk = Boolean(data.travel_time_junk);
      }
      if (data.extrainfo) {
        this.options.extrainfo = Boolean(data.extrainfo);
      }
      if (data.debug) {
        this.options.debug = Boolean(data.debug);
      }
      if (data.countries) {
        this.options.country_filter = data.countries.split(',');
      }
      this.LOG('load MailHops prefs');
      // reset message
      this.message = {
        id: id
        , map_url: ''
        , time: null
        , date: new Date().toISOString()
        , hash: ''
        , secure: []
        , headers: headers
        , auth: []
        , sender: {
          icon: '/images/refresh.png'
          , title: 'Loading...'
          , description: ''
        },
        error: ''
      };
      this.getRoute();
    } catch (e) {
      this.LOG('Error loading MailHops prefs');
    }
  }

  async getRoute() {
    if (this.loading) return;

    this.loading = true;
    // set loading icon
    browser.messageDisplayAction.setPopup({ popup: '', tabId: this.tabId });
    browser.messageDisplayAction.setIcon({ path: '/images/refresh.png', tabId: this.tabId });
    browser.messageDisplayAction.setTitle({ title: 'Loading...', tabId: this.tabId });

    //IP regex
    var regexIp = /(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)\.(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)\.(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)\.(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)(\/(?:[012]\d?|3[012]?|[456789])){0,1}$/;
    var regexAllIp = /(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)\.(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)\.(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)\.(1\d{0,2}|2(?:[0-4]\d{0,1}|[6789]|5[0-5]?)?|[3-9]\d?|0)(\/(?:[012]\d?|3[012]?|[456789])){0,1}/g;
    var regexIPV6 = /s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:)))(%.+)?s*/g;

    var headReceived = this.message.headers['received'] || [];
    var headDate = this.message.headers['date'] ? this.message.headers['date'][0] : '';
    var headXReceived = this.message.headers['x-received'] ? this.message.headers['x-received'][0] : '';
    var headXOrigIP = this.message.headers['x-originating-ip'] ? this.message.headers['x-originating-ip'][0] : '';
    // auth box
    var headXMailer = this.message.headers['x-mailer'] ? this.message.headers['x-mailer'][0] : '';
    var headUserAgent = this.message.headers['user-agent'] ? this.message.headers['user-agent'][0] : '';
    var headXMimeOLE = this.message.headers['x-mimeole'] ? this.message.headers['x-mimeole'][0] : '';
    var headReceivedSPF = this.message.headers['received-spf'] ? this.message.headers['received-spf'][0] : '';
    var headAuth = this.message.headers['authentication-results'] ? this.message.headers['authentication-results'][0] : '';
    var headListUnsubscribe = this.message.headers['list-unsubscribe'] ? this.message.headers['list-unsubscribe'][0] : '';

    var all_ips = new Array();
    var rline = '';
    var firstDate = headDate;
    var lastDate;
    //empty secure and time
    this.message.secure = [];
    this.message.time = null;
    try {
      this.message.date = new Date(headDate).toISOString();
    } catch (error) {
      headDate = headDate.substring(0, headDate.lastIndexOf(' '));
    }
    try {
      this.message.date = new Date(headDate).toISOString();
    } catch (error) {
      headDate = new Date();
    }

    this.message.auth = this.auth(headXMailer, headUserAgent, headXMimeOLE, headAuth, headReceivedSPF, headListUnsubscribe);

    //loop through the received headers and parse for IP addresses
    if (Boolean(headReceived)) {
      var received_ips = new Array();
      for (var h = 0; h < headReceived.length; h++) {
        //build the received line by concat until semi-colon ; date/time
        rline += headReceived[h];
        if (headReceived[h].indexOf(';') === -1)
          continue;
        // first and last dates are used to calculate time traveled
        if (rline.indexOf(';') !== -1) {
          if (!firstDate)
            firstDate = rline.substring(rline.indexOf(';') + 1).trim();
          if (!lastDate)
            lastDate = rline.substring(rline.indexOf(';') + 1).trim();
        }

        // IPV6 check
        rline = rline.replace(/\[IPv6\:/g, '[');
        if (rline.match(regexIPV6)) {
          all_ips.unshift(rline.match(regexIPV6)[0]);
          //reset the line
          rline = '';
          continue;
        }
        // parse IPs out of Received line
        received_ips = rline.match(regexAllIp);
        //continue if no IPs found
        if (!received_ips) {
          //reset the line
          rline = '';
          continue;
        }
        //get unique IPs for each Received header
        received_ips = received_ips.filter(function (item, pos) {
          return received_ips.indexOf(item) === pos;
        });
        for (var r = received_ips.length; r >= 0; r--) {
          if (regexIp.test(received_ips[r]) && this.testIP(received_ips[r], rline)) {
            all_ips.unshift(received_ips[r]);
          }
        }
        //reset the line
        rline = '';
      }
    }

    // parse dates
    if (firstDate && firstDate.indexOf('(') !== - 1)
      firstDate = firstDate.substring(0, firstDate.indexOf('(')).trim();
    if (lastDate && lastDate.indexOf('(') !== -1)
      lastDate = lastDate.substring(0, lastDate.indexOf('(')).trim();
    if (firstDate && lastDate) {
      try {
        firstDate = new Date(firstDate);
        lastDate = new Date(lastDate);
        this.message.time = lastDate - firstDate;
      } catch (e) {
        this.LOG('travel dates parse Error: ' + JSON.stringify(e));
        this.message.time = null;
      }
    } else {
      this.message.time = null;
    }

    //get the originating IP address
    if (Boolean(headXOrigIP)) {
      headXOrigIP = headXOrigIP.replace(/\[IPv6\:/g, '[');
      //IPV6 check
      if (headXOrigIP.match(regexIPV6)) {
        var ip = headXOrigIP.match(regexIPV6)
        if (Boolean(ip) && ip.length && all_ips.indexOf(ip[0]) == -1)
          all_ips.unshift(ip[0]);
      } else {
        var ip = headXOrigIP.match(regexAllIp);
        if (Boolean(ip) && ip.length && all_ips.indexOf(ip[0]) == -1)
          all_ips.unshift(ip[0]);
      }
    }
    if (all_ips.length) {
      // set the message hash
      this.message.hash = btoa(this.message.date + '' + all_ips.join(','));
      const cached = await this.getCacheResponse();
      if (cached) {
        this.displayRoute(cached);
        this.isLoaded = true;
        this.loading = false;
      } else {
        this.lookupRoute(all_ips.join(','));
      }
    } else {
      this.clear();
    }
  };

  //another ip check, dates will throw off the regex
  testIP(ip, header) {
    var validIP = true;

    try {
      var firstchar = header.substring(header.indexOf(ip) - 1);
      firstchar = firstchar.substring(0, 1);
      var lastchar = header.substring((header.indexOf(ip) + ip.length));
      lastchar = lastchar.substring(0, 1);

      if (firstchar.match(/\.|\d|\-/)
        || lastchar.match(/\.|\d|\-/)
        || (firstchar == '?' && lastchar == '?')
        || (firstchar == ':' || lastchar == ':')
        || lastchar == ';'
        || header.toLowerCase().indexOf(' id ' + ip) !== -1
        || parseInt(ip.substring(0, ip.indexOf('.'))) >= 240 //IANA-RESERVED
      ) {
        //only if there is one instance of this IP
        if (header.indexOf(ip) == header.lastIndexOf(ip))
          validIP = false;
      } else if (header.indexOf('using SSL') !== -1
        || header.indexOf('using TLS') !== -1
        || header.indexOf('version=TLSv1/SSLv3') !== -1
      ) {
        //check if this IP was part of a secure transmission
        this.message.secure.push(ip);
      }
    } catch (e) {
      this.LOG('testIP Error: ' + JSON.stringify(e));
    }
    return validIP;
  }

  clear() {
    this.message.sender = {
      title: 'Local',
      countryCode: '',
      icon: '/images/local.png'
    };
    browser.messageDisplayAction.setIcon({ path: this.message.sender.icon, tabId: this.tabId });
    browser.messageDisplayAction.setTitle({ title: this.message.sender.title, tabId: this.tabId });
    this.isLoaded = true;
    this.loading = false;
  }

  error(status, data) {
    this.message.error = (data && data.error && data.error.message) ? data && data.error.message : 'Service Unavailable';
    this.message.sender = {
      title: (data && data.error && data.error.message) ? data && data.error.message : 'Service Unavailable',
      countryCode: '',
      icon: '/images/auth/error.png'
    };
    browser.messageDisplayAction.setIcon({ path: this.message.sender.icon, tabId: this.tabId });
    browser.messageDisplayAction.setTitle({ title: this.message.sender.title, tabId: this.tabId });
  }

  extractMaybeQuotedValue(line, key) {
    let ret = [ ];
    let new_line = line;

    console.assert (key.length);

    // The possible combinations we might be interested in.
    let dQuote = new RegExp (key + '="(.*?)"');
    let sQuote = new RegExp (key + "='(.*?)'");
    let nQuote = new RegExp (key + '=(.*?)(?:\\s|$)');

    let match = line.match (dQuote);
    if (null !== match) {
      ret.push (match[1]);
    }

    if (!ret.length) {
      match = line.match (sQuote);
      if (null !== match) {
        ret.push (match[1]);
      }
    }

    if (!ret.length) {
      match = line.match (nQuote);
      if (null !== match) {
        ret.push (match[1]);
      }
    }

    if (ret.length) {
      // Match length must be non-zero.
      console.assert (match[0].length);

      // Drop data leading up to the match.
      new_line = new_line.substring (match.index);

      // Drop the match itself.
      new_line = new_line.substring (match[0].length);

      // Add to return value.
      ret.push (new_line);
    }

    return ret;
  }

  sanitizeString(str) {
    return str.replace (/\t/g, ' ').replace (/\s+/g, ' ').replace (/</g, '&lt;').replace (/>/g, '&gt;').trim ();
  }

  auth(header_xmailer, header_useragent, header_xmimeole, header_auth, header_spf, header_unsubscribe) {
    let auth = [];
    //SPF
    if (header_spf) {
      // Compact whitespace, make sure addresses enclosed in <> parse as valid
      // XHTMl later on.
      header_spf = this.sanitizeString (header_spf);

      // Split value on whitespace. We'll extract data from this.
      var headerSPFArr = header_spf.split(' ');

      // First element should always indicate the state.
      var spfState = headerSPFArr.shift ();

      // Additionally, we might have a reason description, enclosed in parenthesis.
      // Example: spfState = "Pass", reason description: "(mailfrom)"
      var spfStateReason = '';
      if (-1 != headerSPFArr[0].search (/^\(.*\)$/)) {
        spfStateReason = ' ' + headerSPFArr.shift ();
      }

      // Put it all together, with extra information if requested.
      var copy = spfState + spfStateReason;
      if (this.options.extrainfo) {
        copy += '\n<br />' + headerSPFArr.join (' ') + '\n<br />';
      }
      copy += '\n<br />' + MailHopsUtils.spf(spfState.toLowerCase ()).trim ();

      this.LOG ("SPF state and data: " + copy);
      auth.push({
        type: 'SPF',
        color: 'green',
        icon: '/images/auth/' + spfState.toLowerCase () + '.png',
        copy: copy
      });
    }
    //Authentication-Results
    //http://tools.ietf.org/html/rfc8601
    if (header_auth) {
      this.LOG ('Authentication-Results header found, parsing...\n');
      var headerAuthArr = [];

      // The header might contain multiple lines, so iterate above them.
      var headerAuthArr_ = header_auth.split('\n');
      var dkimState = '';
      var spfState = '';
      var dkimReason = '';
      var spfReason = '';
      var dkimAux = '';
      var spfAux = '';
      var gotDkimState = false;
      var gotSpfState = false;
      for (var i = 0; i < headerAuthArr_.length; ++i) {
        var curLine = headerAuthArr_[i];
        this.LOG ('current header line: ' + curLine + '\n');

        // This is the actual fun part.
        // The AH can very funky and naïve field splitting often leads to
        // wrong results.
        // We'll heave to tread carefully and parse data in a more
        // sophisticated way, relying on arcane knowledge.
        //
        // It might be temping to try to merge the dkim and spf sections below,
        // but doing so is not really possible, since the formats are
        // different.
        let statePos = 0;
        let stateWork = curLine;
        while ((!gotDkimState) &&
               (-1 !== (statePos = stateWork.indexOf ('dkim=')))) {
          // Fetch "dkim=" value, potentially quoted.
          // While the RFC doesn't mention anything about quote-enclosing
          // values, it probably doesn't hurt to support it.
          let extract = this.extractMaybeQuotedValue (stateWork, 'dkim');

          if (extract.length) {
            dkimState = extract[0];
            stateWork = extract[1];
            gotDkimState = true;
            this.LOG ("extracted DKIM state: " + dkimState + "; continuing with new line: " + stateWork);
          }
          else {
            // Nothing found on this line, continue.
            this.LOG ("nothing found on current line (leftover) '" + truncatedWork + "', continuing...");
            continue;
          }

          // Look ahead to find the next "dkim=" section. This will mark the
          // end of our current chunk (if it exists).
          let stateEnd = -1;
          let truncatedWork = stateWork;
          if (-1 !== (stateEnd = stateWork.indexOf ('dkim=', 5))) {
            truncatedWork = truncatedWork.substring (0, stateEnd);
          }

          // Now fetch additional data.
          // Typically, that should be "reason=".
          extract = this.extractMaybeQuotedValue (truncatedWork, 'reason');

          if (extract.length) {
            dkimReason = extract[0];
            truncatedWork = extract[1];
            this.LOG ("extracted DKIM reason: " + dkimReason + "; continuing with new line: " + truncatedWork);
          }

          // Same MTA append a string such as "(1024-bit key; unprotected)",
          // add this to the reason.
          const key_data = new RegExp ('\\(\\d+-bit key(?:; .+?)?\\)');
          let match = truncatedWork.match (key_data);
          if (null !== match) {
            if (dkimReason.length) {
              dkimReason += ' ';
            }
            dkimReason += match[0];
            truncatedWork = truncatedWork.substring (match.index);
            truncatedWork = truncatedWork.substring (match[0].length);
          }

          // Others enclose the reason in parentheses.
          const paren_reason = new RegExp ('\\(.+?\\)');
          match = truncatedWork.match (paren_reason);
          if (null !== match) {
            if (dkimReason.length) {
              dkimReason += ' ';
            }
            dkimReason += match[0];
            truncatedWork = truncatedWork.substring (match.index);
            truncatedWork = truncatedWork.substring (match[0].length);
          }

          // Everything else should be additional data, up until the first
          // semicolon or end of the line.
          const aux_data = new RegExp ('(.+?)(?:;|$)');
          match = truncatedWork.match (aux_data);
          if (null !== match) {
            dkimAux = match[1];
          }
        }

        // Do the same for SPF data.
        statePos = 0;
        stateWork = curLine;
        while ((!gotSpfState) &&
               (-1 !== (statePos = stateWork.indexOf ('spf=')))) {
          // Refer to the DKIM section above for more information.
          let extract = this.extractMaybeQuotedValue (stateWork, 'spf');

          if (extract.length) {
            spfState = extract[0];
            stateWork = extract[1];
            gotSpfState = true;
          }
          else {
            // Nothing found on this line, continue.
            this.LOG ("nothing found on current line (leftover) '" + stateWork + "', continuing...");
            continue;
          }

          let stateEnd = -1;
          let truncatedWork = stateWork;
          if (-1 !== (stateEnd = stateWork.indexOf ('spf=', 4))) {
            truncatedWork = truncatedWork.substring (0, stateEnd);
          }

          // Now fetch additional data.
          // Reason is usually enclosed in parentheses.
          const paren_reason = new RegExp ('\\(.+?\\)');
          let match = truncatedWork.match (paren_reason);
          if (null !== match) {
            spfReason = match[0];
            truncatedWork = truncatedWork.substring (match.index);
            truncatedWork = truncatedWork.substring (match[0].length);
          }

          // Everything else is additional data.
          const aux_data = new RegExp ('(.+?)[;|$]');
          match = truncatedWork.match (aux_data);
          if (null !== match) {
            spfAux = match[1];
          }
        }
      }

      if (gotDkimState) {
        // Just sanitize our data.
        dkimState = this.sanitizeString (dkimState);
        dkimReason = this.sanitizeString (dkimReason);
        dkimAux = this.sanitizeString (dkimAux);

        var copy = dkimState;
        if (dkimReason.length) {
          copy += ' - ' + dkimReason;
        }
        if ((this.options.extrainfo) && (dkimAux.length)) {
          copy += '\n<br />' + dkimAux;
        }
        copy += '\n<br />\n<br />' + MailHopsUtils.dkim(dkimState).trim();

        this.LOG ("DKIM state and data: " + copy);
        auth.push({
          type: 'DKIM',
          color: 'green',
          icon: '/images/auth/' + dkimState.toLowerCase () + '.png',
          copy: copy
        });
      }
      if (gotSpfState) {
        spfState = this.sanitizeString (spfState);
        spfReason = this.sanitizeString (spfReason);
        spfAux = this.sanitizeString (spfAux);

        var copy = spfState;
        if (spfReason.length) {
          copy += ' ' + spfReason;
        }
        if ((this.options.extrainfo) && (spfAux.length)) {
          copy += '\n<br />' + spfAux;
        }
        copy += '\n<br />\n<br />' + MailHopsUtils.spf(spfState).trim();

        this.LOG ("SPF state and data: " + copy);
        auth.push({
          type: 'SPF',
          color: 'green',
          icon: '/images/auth/' + spfState.toLowerCase () + '.png',
          copy: copy
        });
      }
    }
    if (header_unsubscribe) {
      var unsubscribeArr = header_unsubscribe.split(',');

      for (var i = 0; i < unsubscribeArr.length; ++i) {
        auth.push({
          type: 'Unsubscribe',
          color: 'grey',
          link: unsubscribeArr[i].replace(/</, '').replace(/>/, '').trim()
        });
      }
    }
    return auth;
  }

  //mailhops lookup
  lookupRoute(header_route) {
    let mailHop = this;

    let lookupURL = '?' + MailHopsUtils.getAPIUrlParams(this.options) + '&r=' + String(header_route) + '&l=' + this.options.lang + '&u=' + this.options.unit;

    if (this.options.owm_key != '')
      lookupURL += '&owm_key=' + this.options.owm_key;
    if (this.message.time != null)
      lookupURL += '&t=' + this.message.time;
    if (this.message.date != null)
      lookupURL += '&d=' + this.message.date;

    this.message.map_url = MailHopsUtils.getAPIUrl() + '/map/' + lookupURL;

    //call mailhops api for lookup
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", MailHopsUtils.getAPIUrl() + '/lookup/' + lookupURL, true);
    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState === 4) {
        try {
          let data = JSON.parse(xmlhttp.responseText);
          if (xmlhttp.status === 200) {
            mailHop.cacheResponse(data.response);
            mailHop.displayRoute(data.response);
            //tag the result
            mailHop.tagResults(data, data.response.route);
          } else if (data.error) {
            mailHop.LOG(JSON.stringify(data.error));
            //display the error
            mailHop.error(xmlhttp.status, data);
          }
        } catch (e) {
          mailHop.LOG(e);
          mailHop.error();
        }
      }
      mailHop.isLoaded = true;
      mailHop.loading = false;
    };
    xmlhttp.send(null);
  }

  displayRoute(response) {
    this.response = response;
    this.message.sender = MailHopsUtils.getSender(response.route);

    if (this.message.sender) {
      browser.messageDisplayAction.setIcon({ path: this.message.sender.icon, tabId: this.tabId });
      browser.messageDisplayAction.setTitle({ title: this.message.sender.title, tabId: this.tabId });
    } else {
      browser.messageDisplayAction.setIcon({ path: '/images/local.png', tabId: this.tabId });
      browser.messageDisplayAction.setTitle({ title: 'Local', tabId: this.tabId });
    }
  }

  // keep a daily cache
  async cacheResponse(response) {
    let data = await browser.storage.local.get('messages');
    let cached_date = new Date();
    let messages = {
      cached: cached_date.getUTCFullYear() + '-' + cached_date.getUTCMonth() + '-' + cached_date.getUTCDate(),
      list: []
    };
    if (data.messages && data.messages.list && data.messages.cached === messages.cached) {
      messages.list = data.messages.list;
    }
    messages.list[this.message.hash] = response;
    await browser.storage.local.set({ messages: messages });
    this.LOG('Cached Message ' + this.message.id + ' hash ' + this.message.hash);
  }

  // get cached message
  async getCacheResponse() {
    let data = await browser.storage.local.get('messages');
    if (data.messages && data.messages.list[this.message.hash]) {
      this.LOG('Found Cached Message ' + this.message.hash);
      return data.messages.list[this.message.hash];
    }
    return false;
  };

  tagResults(results, route) {
    if (!results) {
      return false;
    }

    //Add junk tag on messages taking too long to travel  
    try {
      if (Boolean(this.options.travel_time_junk) && this.message.time != null && this.message.time > 10000) {
        messenger.messages.update(this.message.id, { 'junk': true });
        this.LOG("Junk: Travel time match for " + this.message.time);
      }
      if (this.options.country_filter.length && this.message.sender && this.message.sender.countryCode) {
        if (this.options.country_filter.indexOf(this.message.sender.countryCode.toUpperCase()) != -1) {
          messenger.messages.update(this.message.id, { 'junk': true });
          this.LOG("Junk: Country code match for " + this.message.sender.countryCode);
        }
      }
    } catch (e) {
      this.LOG("Error tagResults: " + e);
    }
  }
}
