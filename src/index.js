(function(window, undefined){
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};

  window.app = {
    initialize: function() {
      document.addEventListener("deviceready", window.app.onDeviceReady, false);
    },
    onDeviceReady: function() {

      if (window.device.platform === "iOS" && parseFloat(window.device.version) >= 7.0) {
        var appElement = document.getElementsByClassName("app")[0];
        appElement.style.top = "20px";
      }
      
    }
  };

})(window);