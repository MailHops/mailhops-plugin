var mailHopPreferences = {
  api_key: '', //api key
  valid_api_key: false,
  distinace_unit: 'mi',
  owm_key: '', //OpenWeatherMap.org api key

  loadPreferences: function(){
    var self = this;
    this.api_key = document.getElementById("mailhop.api_key");
    this.owm_key = document.getElementById("mailhop.owm_key");
    
    document.getElementById("save").addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      self.saveAPIKey();
    });
    
    document.getElementById("save-options").addEventListener("click", function () {
      self.savePreferences();
    });
    
    document.getElementById("step_one").addEventListener("click", function () {
      document.getElementById("step_two").classList.remove('active');
      this.classList.add('active');
      document.getElementById("step_settings").style.display = 'none';
      document.getElementById("step_api_keys").style.display = 'block';
      document.getElementById("saved_message").style.display = 'none';   
    });
    
    document.getElementById("step_two").addEventListener("click", function () {
      document.getElementById("step_one").classList.remove('active');
      this.classList.add('active');      
      document.getElementById("step_settings").style.display = 'block';
      document.getElementById("step_api_keys").style.display = 'none';     
      document.getElementById("saved_message").style.display = 'none';   
    });
    
    
    var getting = browser.storage.local.get();
    getting.then(data => {
      if (data.api_key) {
        self.api_key.value = data.api_key;
        document.getElementById("join-link").innerHTML = 'My Account and Dashboard';
        document.getElementById("join-link").setAttribute('href', 'https://mailhops.com/account/' + data.api_key);
        this.saveAPIKey(true);
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
    }, error => {
      self.planError(JSON.stringify(error));
    });
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
  saveAPIKey: function(init) {
    if(Boolean(this.api_key) && this.api_key.value != ''){
      var xmlhttp = new XMLHttpRequest();
      var apiBase = 'https://api.mailhops.com',
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
                document.getElementById("plan").innerHTML = "Plan: "+data.account.subscriptions.data[0].plan.name;
                document.getElementById("status").innerHTML = "Status: "+data.account.subscriptions.data[0].status;
                document.getElementById("rate-limit").innerHTML = "Limit: "+data.account.rate.limit;
                document.getElementById("rate-remaining").innerHTML = "Remaining: "+data.account.rate.remaining;
                if(data.account.rate.reset/60 < 60)
                  document.getElementById("rate-reset").innerHTML = "Resets in: "+Math.round(data.account.rate.reset/60)+" min.";
                else
                  document.getElementById("rate-reset").innerHTML = "Resets in: " + Math.round(data.account.rate.reset / 60 / 60) + " hr.";
               
                document.getElementById("join-link").innerHTML = 'My Account and Dashboard';
                document.getElementById("join-link").setAttribute('href','https://mailhops.com/account/'+api_key);
                
            } else if (xmlhttp.status === 401) { 
              self.planError("That API key could not be found.");
            }
            else if (!!data.error) {
                self.planError(xmlhttp.status+': '+data.error.message);
             }
             mailHopPreferences.savePreferences(init);
           } catch (e){
             self.planError('Connection Failed to\n '+e+'!');
           }
         }
       };
      xmlhttp.send(null);
      return null;
   } else {
     this.planError('Enter a valid API key above.');
   }
  }
  
 };

mailHopPreferences.loadPreferences();