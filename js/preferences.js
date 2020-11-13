const MailHopPreferences = {
  api_key: '', //api key
  valid_api_key: false,
  unit: 'mi',
  owm_key: '', //OpenWeatherMap.org api key
  
  init: async function(){
    var self = this;
    this.api_key = document.getElementById("mailhop.api_key");
    this.owm_key = document.getElementById("mailhop.owm_key");
    
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
    
    document.getElementById("step_one").addEventListener("click", function () {
      document.getElementById("step_two").classList.remove('active');
      this.classList.add('active');
      document.getElementById("step_settings").style.display = 'none';
      document.getElementById("step_api_keys").style.display = 'block';
      document.getElementById("saved_message").style.display = 'none';   
      document.getElementById("error_message").style.display = 'none';
    });
    
    document.getElementById("step_two").addEventListener("click", function () {
      document.getElementById("step_one").classList.remove('active');
      this.classList.add('active');      
      document.getElementById("step_settings").style.display = 'block';
      document.getElementById("step_api_keys").style.display = 'none';     
      document.getElementById("saved_message").style.display = 'none';   
      document.getElementById("error_message").style.display = 'none';
    });
    
    const data = await browser.storage.local.get();
    
    if (data.api_key) {
      self.api_key.value = data.api_key;
      document.getElementById("join-link").innerHTML = 'My Account and Dashboard';
      document.getElementById("join-link").setAttribute('href', 'https://mailhops.com/account/' + data.api_key);        
    }      
    if (data.owm_key) {
      self.owm_key.value = data.owm_key;
    }
    if (data.unit) {
      if (data.unit == "mi")
        document.getElementById("unit_mi").setAttribute('checked', 'checked');
      else
        document.getElementById("unit_km").setAttribute('checked', 'checked');
    } else {
      document.getElementById("unit_mi").setAttribute('checked', 'checked');
    }      
    if (typeof data.travel_time_junk != 'undefined') {
      if (data.travel_time_junk == 'on')
        document.getElementById("travel_time_junk_on").setAttribute('checked', 'checked');
      else
        document.getElementById("travel_time_junk_off").setAttribute('checked', 'checked');
    } else {
      document.getElementById("travel_time_junk_on").setAttribute('checked', 'checked');
    }
    
    await this.saveAPIKey(true);
    
    await this.loadAccounts();
  },
  
  loadAccounts: async function () {
    let accounts = await messenger.accounts.list();
    if (accounts.length) {
      accounts.map(a => { 
        if (a.identities.length) {
          if (a.identities.length && a.identities[0].email) {
            var option = document.createElement('option');
            option.value = a.identities[0].email;
            option.text = a.identities[0].email;              
            document.getElementById("accounts").add(option);
          }          
        }
      });
      document.getElementById("accounts").selectedIndex = 0;
    }
  },
  
  savePreferences: function (init) {
    var self = this;
    browser.storage.local.set({
      api_key: self.api_key.value.trim(),
      owm_key: self.owm_key.value.trim(),
      unit: document.querySelector('input[name="unit"]:checked').value,
      travel_time_junk: document.querySelector('input[name="travel_time_junk"]:checked').value,
    });    
    if(!init)
      document.getElementById("saved_message").style.display = 'block';    
    return true;
  },

  sendAPIKey: async function () {
    document.getElementById("saved_message").style.display = 'none';
    document.getElementById("error_message").style.display = 'none';
    
    if (document.getElementById("accounts").selectedIndex && document.getElementById("accounts").selectedIndex >= 0) {
      var email = document.getElementById("accounts").options[document.getElementById("accounts").selectedIndex].text;
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
                 document.getElementById("plan").innerHTML = "Plan: "+data.account.subscriptions.data[0].plan.name;
                 document.getElementById("status").innerHTML = "Status: "+data.account.subscriptions.data[0].status;                 
               } else {
                document.getElementById("plan").innerHTML = "Plan: No Plan Yet";
                document.getElementById("status").innerHTML = "Status: Not Active";                 
               }
                document.getElementById("rate-limit").innerHTML = "Limit: "+data.account.rate.limit;
                document.getElementById("rate-remaining").innerHTML = "Remaining: "+data.account.rate.remaining;
                if(data.account.rate.reset/60 < 60)
                  document.getElementById("rate-reset").innerHTML = "Resets in: "+Math.round(data.account.rate.reset/60)+" min.";
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
             self.planError('Connection Failed to\n '+e+'!');
           }
         }
       };
      xmlhttp.send(null);
      return null;   
  }
  
 };

MailHopPreferences.init();