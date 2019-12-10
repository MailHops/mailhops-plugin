var columnHandler = {
    getCellText:         function(row, col) {return null;},
    getSortStringForRow: function(msgHdr) {
        msgHdr.getStringProperty( "MH-Route" );
        var countryCode = null;
        var cached_results = msgHdr.getStringProperty( "MH-Route" );
          if(cached_results){
            try {
                cached_results = JSON.parse(cached_results);
                if(cached_results.sender && cached_results.sender.countryCode){
                    countryCode = cached_results.sender.countryCode;
                } else {
                    countryCode = mailHopsUtils.getOriginatingCountryCode(cached_results.response.route);
                }
                if(countryCode){
                    return 'chrome://mailhops/content/images/flags/'+countryCode.toLowerCase()+'.png';
                }
            } catch(e) {
                return countryCode;      
            }
        }          
        return countryCode;
    },
    isString:            function() {return true;},
 
    getCellProperties: function (row, col, props) {
        return 'colMailHops';
    },
    getRowProperties:    function(row, props){},
    getImageSrc: function (row, col) {
          var msgKey = gDBView.getKeyAt(row);
          var msgHdr = gDBView.db.GetMsgHdrForKey(msgKey);
          var countryCode = null;
          var cached_results = msgHdr.getStringProperty( "MH-Route" );
          if(cached_results){
            try {
                cached_results = JSON.parse(cached_results);
                if(cached_results.sender && cached_results.sender.countryCode){
                    countryCode = cached_results.sender.countryCode;
                } else {
                    countryCode = mailHopsUtils.getOriginatingCountryCode(cached_results.response.route);
                }
                if(countryCode){
                    return 'chrome://mailhops/content/images/flags/'+countryCode.toLowerCase()+'.png';
                }
            } catch(e) {
                return null;      
            }
        }          
        return null;
    },
    getSortLongForRow:   function(hdr) {return 0;}
 };

var CreateDbObserver = {
    // Components.interfaces.nsIObserver
    observe: function(aMsgFolder, aTopic, aData)
    {  
       addCustomColumnHandler();
    }
};
  
function doOnceLoaded() {
  var ObserverService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
  ObserverService.addObserver(CreateDbObserver, "MsgCreateDBView", false);
}

function addCustomColumnHandler() {
    gDBView.addColumnHandler("colMailHops", columnHandler);
    if ("COLUMNS_MAP_NOSORT" in gFolderDisplay) {
        gFolderDisplay.COLUMNS_MAP_NOSORT.add("colMailHops");
    }    
}

window.addEventListener("load", doOnceLoaded, false);