(function(window, undefined){
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var $ = window.Zepto;

  window.app = {
    initialize: function() {
      document.addEventListener("deviceready", window.app.onDeviceReady, false);
    },
    onDeviceReady: function() {

      if ($.os.ios && parseFloat(window.device.version) >= 7.0) {
        $(".app").css({"top":"20px"}); // status bar hax
      }
      
    }
  };

})(window);