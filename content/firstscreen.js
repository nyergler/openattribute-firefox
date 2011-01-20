var Prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
Prefs = Prefs.getBranch("extensions.ccffext.");

var Overlay = {
	
  init: function(){ 
  
    var ver = -1, firstrun = true;

    var gExtensionManager = Components.classes["@mozilla.org/extensions/manager;1"].getService(Components.interfaces.nsIExtensionManager);
    var current = gExtensionManager.getItemForID("ccffext@code.creativecommons.org").version;

    try{
	
		ver = Prefs.getCharPref("version");
		firstrun = Prefs.getBoolPref("firstrun");
		
		
    }catch(e){
      //nothing
    }finally{
		
	  Prefs.setBoolPref("firstrun",false);
      Prefs.setCharPref("version",current);
	  
	  if (firstrun) {
	  
	  	window.setTimeout(function(){
	  	
	  		var win = window.open("chrome://ccffext/content/firstscreen.xul", "aboutMyExtension", "chrome,centerscreen,alwaysRaised=yes,titlebar=no");
	  		
	  	}, 4000);
	  	
	  }		
      
      if (ver!=current && !firstrun){ // !firstrun ensures that this section does not get loaded if its a first run.
        Prefs.setCharPref("version",current);
	  }        
      
    }
    window.removeEventListener("DOMContentLoaded",function(){ Overlay.init(); },true);
 }
};

window.addEventListener("DOMContentLoaded",Overlay.init(),true);