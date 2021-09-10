const MailHopPreferences = {
  api_key: '', //api key
  valid_api_key: false,
  unit: 'mi',
  theme: 'light',
  debug: false,
  travel_time_junk: false,
  owm_key: '', //OpenWeatherMap.org api key
  countries: [],
  
  init: async function(){
    var self = this;
    this.api_key = document.getElementById("mailhop.api_key");
    this.owm_key = document.getElementById("mailhop.owm_key");
    
    if (!this.api_key) return;
    
    document.getElementById("mh-save").addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      self.saveAPIKey();
    });
    
    document.getElementById("mh-send-key").addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      self.sendAPIKey();
    });
    
    document.getElementById("mh-save-options").addEventListener("click", function () {
      self.savePreferences();
    });
    
    document.getElementById("mh-save-filter").addEventListener("click", function () {
      self.savePreferences();
    });
    
    document.getElementById("mh-clear-filter").addEventListener("click", function () {
      self.clearCountries();
      self.savePreferences();
    });
    
    document.getElementById("step_one").addEventListener("click", function () {
      document.getElementById("step_two").classList.remove('active');
      document.getElementById("step_three").classList.remove('active');
      this.classList.add('active');
      document.getElementById("step_filter").style.display = 'none';
      document.getElementById("step_settings").style.display = 'none';
      document.getElementById("step_api_keys").style.display = 'block';
      document.getElementById("saved_message").style.display = 'none';   
      document.getElementById("error_message").style.display = 'none';
    });
    
    document.getElementById("step_two").addEventListener("click", function () {
      document.getElementById("step_one").classList.remove('active');
      document.getElementById("step_three").classList.remove('active');
      this.classList.add('active');
      document.getElementById("step_filter").style.display = 'none';
      document.getElementById("step_settings").style.display = 'block';
      document.getElementById("step_api_keys").style.display = 'none';     
      document.getElementById("saved_message").style.display = 'none';   
      document.getElementById("error_message").style.display = 'none';
    });
    
    document.getElementById("step_three").addEventListener("click", function () {
      document.getElementById("step_one").classList.remove('active');
      document.getElementById("step_two").classList.remove('active');
      this.classList.add('active');
      document.getElementById("step_filter").style.display = 'block';
      document.getElementById("step_settings").style.display = 'none';
      document.getElementById("step_api_keys").style.display = 'none';
      document.getElementById("saved_message").style.display = 'none';   
      document.getElementById("error_message").style.display = 'none';
    });
        
    const data = await browser.storage.local.get();
    
    this.theme = data.theme || 'light';
    this.unit = data.unit || 'mi';
    this.travel_time_junk = Boolean(data.travel_time_junk);
    this.debug = Boolean(data.debug);
    
    if (data.countries) {
      this.countries = data.countries.split(',');
    }
    
    let countries = document.getElementsByClassName("country");
    
    for(var i = 0; i < countries.length; i++) {
      (function(index) {
        countries[index].addEventListener("click", function () {
          if (this.checked) {
            self.countries.push(this.value);
          } else if (self.countries.indexOf(this.value) != -1) {
            self.countries.splice(self.countries.indexOf(this.value), 1);
          }
        });
      })(i);
    }
    
    if (data.api_key) {
      self.api_key.value = data.api_key;
      document.getElementById("join-link").innerHTML = 'My Account and Dashboard';
      document.getElementById("join-link").setAttribute('href', 'https://www.mailhops.com/account/' + data.api_key);        
    }
    
    if (data.owm_key) {
      self.owm_key.value = data.owm_key;
    }
    
    if (data.unit == "mi")
      document.getElementById("unit_mi").setAttribute('checked', 'checked');
    else
      document.getElementById("unit_km").setAttribute('checked', 'checked');
    
    if (this.theme == "dark")
      document.getElementById("theme_dark").setAttribute('checked', 'checked');
    else
      document.getElementById("theme_light").setAttribute('checked', 'checked');  
    
    if (this.travel_time_junk)
      document.getElementById("travel_time_junk_on").setAttribute('checked', 'checked');
    else
      document.getElementById("travel_time_junk_off").setAttribute('checked', 'checked');
    
    if (this.debug)
      document.getElementById("debug_on").setAttribute('checked', 'checked');
    else
      document.getElementById("debug_off").setAttribute('checked', 'checked');
  
    this.updateTheme();
    this.updateCountries();
    
    await this.saveAPIKey(true);    
    await this.loadAccounts();
  },
  
  updateTheme: function () {
    if (this.theme == "dark") {
      if (!document.getElementById("mh-main-segment").classList.contains("inverted")) {
        document.getElementById("mh-main-segment").classList.add("inverted");
        document.getElementById("mh-steps").classList.add("inverted");
        document.getElementById("mh-segment").classList.add("inverted");
        document.getElementById("mh-form").classList.add("inverted");
        document.getElementById("step_settings").classList.add("inverted");
        document.getElementById("mh-save").classList.add("inverted");
        document.getElementById("mh-save-options").classList.add("inverted");
        document.getElementById("mh-save-filter").classList.add("inverted");
        document.getElementById("mh-clear-filter").classList.add("inverted");
      }
    } else {
      if (document.getElementById("mh-main-segment").classList.contains("inverted")) {
        document.getElementById("mh-main-segment").classList.remove("inverted");
        document.getElementById("mh-steps").classList.remove("inverted");
        document.getElementById("mh-segment").classList.remove("inverted");
        document.getElementById("mh-form").classList.remove("inverted");
        document.getElementById("step_settings").classList.remove("inverted");
        document.getElementById("mh-save").classList.remove("inverted");
        document.getElementById("mh-save-options").classList.remove("inverted");
        document.getElementById("mh-save-filter").classList.remove("inverted");
        document.getElementsByClassName("checkbox").classList.remove("inverted");
        document.getElementById("mh-clear-filter").classList.remove("inverted");
      }
    }
  },
  
  loadAccounts: async function () {
    let accounts = await messenger.accounts.list();
    if (accounts.length) {
      accounts.map(a => { 
        if (a.identities.length && a.identities[0].email) {          
          var option = document.createElement('option');
          option.value = a.identities[0].email;
          option.text = a.identities[0].email;              
          document.getElementById("email-accounts").add(option);                  
        }
      });
      document.getElementById("email-accounts").selectedIndex = 0;
    }
  },
  
  updateCountries: function (clear) {
    var countries = document.getElementById("country-list").getElementsByClassName("checkbox");
    var self = this;
    for(var i = 0; i < countries.length; i++) {
      (function (index) {
        if (clear)
          countries[index].children[0].checked = false;
        else if (self.countries.indexOf(countries[index].children[0].value) != -1)
          countries[index].children[0].checked = true;
        if (self.theme == 'dark')
          countries[index].classList.add("inverted");
        else
          countries[index].classList.remove("inverted");
      })(i);
    }
  },
  
  clearCountries: function () {
    this.countries = [];
    this.updateCountries(true);
  },
  
  savePreferences: async function (init) {
    var self = this;
    await browser.storage.local.set({      
      api_key: self.api_key.value.trim(),
      owm_key: self.owm_key.value.trim(),
      unit: document.querySelector('input[name="unit"]:checked').value,
      theme: document.querySelector('input[name="theme"]:checked').value,
      travel_time_junk: document.querySelector('input[name="travel_time_junk"]:checked').value == 'on' ? true : false,
      debug: document.querySelector('input[name="debug"]:checked').value == 'on' ? true : false,
      countries: self.countries.join(','),
    });    
    if(!init)
      document.getElementById("saved_message").style.display = 'block';
    
    this.theme = document.querySelector('input[name="theme"]:checked').value;
    this.updateTheme();
    this.updateCountries();
    return true;
  },

  sendAPIKey: async function () {
    document.getElementById("saved_message").style.display = 'none';
    document.getElementById("error_message").style.display = 'none';
    if (document.getElementById("email-accounts").selectedIndex && document.getElementById("email-accounts").selectedIndex >= 0) {
      var email = document.getElementById("email-accounts").options[document.getElementById("email-accounts").selectedIndex].text;
      if (email) {
        var xmlhttp = new XMLHttpRequest();
        var apiBase = 'https://www.mailhops.com/account/lostkey.php'; 
        xmlhttp.open("POST", apiBase, true);
        xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xmlhttp.onreadystatechange = function () {
          if (xmlhttp.readyState === 4) {
            // var data = JSON.parse(xmlhttp.responseText);
            if (xmlhttp.status === 200) {
              document.getElementById("saved_message").style.display = 'block';
            } else {
              document.getElementById("error_message").style.display = 'block';                          
            }
          }          
        };
        xmlhttp.send('email=' + email);     
      } else {
        document.getElementById("error_message").style.display = 'block';
      }     
    } else {
      document.getElementById("error_message").style.display = 'block';
    }
    return false;
  },
  
  planError: function(error){
    this.valid_api_key=false;
    document.getElementById("plan-error").style.display = 'block';
    document.getElementById("plan-error").innerHTML = error;
    document.getElementById("plan").innerHTML = '';
    document.getElementById("status").innerHTML = '';
    document.getElementById("rate-limit").innerHTML = '';
    document.getElementById("rate-remaining").innerHTML = '';
    document.getElementById("rate-reset").innerHTML = '';    
  },
  
  saveAPIKey: async function(init) {
      var xmlhttp = new XMLHttpRequest();
      var apiBase = 'https://api.mailhops.com',
          accountURL = '/v2/accounts/',
          self = this;

      if (Boolean(this.api_key) && this.api_key.value != '') { 
        accountURL += '?api_key='+this.api_key.value.trim();
      }
    
      xmlhttp.open("GET", apiBase+accountURL, true);
       xmlhttp.onreadystatechange=function() {
        if (xmlhttp.readyState===4) {
          try {
             var data = JSON.parse(xmlhttp.responseText);
             if(xmlhttp.status===200){
                self.valid_api_key=true;
                document.getElementById("plan-error").style.display = 'none';
                // set plan info
               if (data.account.subscriptions) {
                 document.getElementById("plan").innerHTML = "Plan: " + data.account.subscriptions.data[0].plan.name;
                 document.getElementById("status").innerHTML = "Status: " + data.account.subscriptions.data[0].status;                 
               } else {
                document.getElementById("plan").innerHTML = "Plan: No Plan Yet";
                document.getElementById("status").innerHTML = "Status: Not Active";                 
               }
                document.getElementById("rate-limit").innerHTML = "Limit: " + data.account.rate.limit;
                document.getElementById("rate-remaining").innerHTML = "Remaining: " + data.account.rate.remaining;
               if (data.account.rate.reset / 60 < 60)                  
                  document.getElementById("rate-reset").innerHTML = "Resets in: " + Math.round(data.account.rate.reset / 60) + " min.";                  
                else
                  document.getElementById("rate-reset").innerHTML = "Resets in: " + Math.round(data.account.rate.reset / 60 / 60) + " hr.";
               
               if (Boolean(self.api_key) && self.api_key.value != '') {
                 document.getElementById("join-link").innerHTML = 'My Account and Dashboard';
                 document.getElementById("join-link").setAttribute('href', 'https://mailhops.com/account/' + self.api_key.value);
               }
                
            } else if (xmlhttp.status === 401) { 
              self.planError("That API key could not be found.");
            }
            else if (!!data.error) {
                self.planError(xmlhttp.status+': '+data.error.message);
             }
             MailHopPreferences.savePreferences(init);
           } catch (e){
             self.planError('Connection Failed to\n ' + e + '!');
           }
         }
       };
      xmlhttp.send(null);
      return null;   
  }
  
 };

MailHopPreferences.init();