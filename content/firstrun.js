var Prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
Prefs = Prefs.getBranch("extensions.ccffext.");

var Overlay = {
	
  init: function(){ 


      var ver = -1, firstrun = true;

      try{
	  firstrun = Prefs.getBoolPref("firstrun");
      }catch(e){
	  //nothing
      }finally{

	  if (firstrun) {

	      window.setTimeout(function(){
		  var nb = gBrowser.getNotificationBox();

		  var buttons = [{
		      'label':'More information',
		      'accessKey':'I',
		      callback: function(n, btn) {
			  nb.removeTransientNotifications();

			  gBrowser.selectedTab = gBrowser.addTab("http://openattribute.com/first-run");
			  return true;
		      }
		  }];
				
		  nb.appendNotification(
		      "You've installed OpenAttribute, an add-on that helps you find CC licensed works and properly attribute them.",
		      'installed-oa',
		      'chrome://ccffext/skin/icon32.png',
		      nb.PRIORITY_INFO_LOW,
		      buttons);
	  	
	      }, 2000);

	      Prefs.setBoolPref("firstrun",false);
	  }
      }

      window.removeEventListener("load",Overlay.init,false);
  }

};

window.addEventListener("load",Overlay.init,false);
