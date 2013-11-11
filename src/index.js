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
      // get the canvas element and its context
      function getAbsolutePosition(el) {
        var x = el.offsetLeft;
        var y = el.offsetTop;
        var offsetParent = el.offsetParent;
       
        while((el = el.parentNode) && el.scrollLeft !== undefined) {
          x -= el.scrollLeft;
          y -= el.scrollTop;
          if (el === offsetParent)
          {
            x += el.offsetLeft;
            y += el.offsetTop;
            offsetParent = el.offsetParent;
          }
        }
       
        return {
          "x": x,
          "y": y
        };
      }
      if ($.os.ios && parseFloat(window.device.version) >= 7.0) {
        $(".app").css({"top":"20px"}); // status bar hax
      }
      var canvas = document.getElementById('canvas');
      canvas.width = $(".main").width();
      canvas.height = $(".main").height();
      var offset = getAbsolutePosition(canvas);
      var context = canvas.getContext('2d');
      var auto = true,
        devicePixelRatio = window.devicePixelRatio || 1,
        backingStoreRatio = context.webkitBackingStorePixelRatio ||
                            context.mozBackingStorePixelRatio ||
                            context.msBackingStorePixelRatio ||
                            context.oBackingStorePixelRatio ||
                            context.backingStorePixelRatio || 1,

        ratio = devicePixelRatio / backingStoreRatio;

      // ensure we have a value set for auto.
      // If auto is set to false then we
      // will simply not upscale the canvas
      // and the default behaviour will be maintained
      if (typeof auto === 'undefined') {
          auto = true;
      }

      // upscale the canvas if the two ratios don't match
      if (auto && devicePixelRatio !== backingStoreRatio) {

          var oldWidth = canvas.width;
          var oldHeight = canvas.height;

          canvas.width = oldWidth * ratio;
          canvas.height = oldHeight * ratio;

          canvas.style.width = oldWidth + 'px';
          canvas.style.height = oldHeight + 'px';

          // now scale the context to counter
          // the fact that we've manually scaled
          // our canvas element
          context.scale(ratio, ratio);
      }

      // create a drawer which tracks touch movements
      var drawer = {
         isDrawing: false,
         hasDrawing: false,
         touchstart: function(coors){
            context.lineWidth = 4;
            context.beginPath();
            context.moveTo(coors.x, coors.y);
            this.isDrawing = true;
            $(".save, .clear").removeClass("disabled");
         },
         touchmove: function(coors){
            if (this.isDrawing) {
              context.lineTo(coors.x, coors.y);
              context.stroke();
            }
         },
         touchend: function(){
            if (this.isDrawing) {
              this.isDrawing = false;
            }
         }
      };

      // create a function to pass touch events and coordinates to drawer
      function draw(event){
        // get the touch coordinates
        var coors = {
          x: event.touches[0].pageX - offset.x,
          y: event.touches[0].pageY - offset.y
        };
        // pass the coordinates to the appropriate handler
        drawer[event.type](coors);
      }
       
      // attach the touchstart, touchmove, touchend event listeners.
      canvas.addEventListener('touchstart',draw, false);
      canvas.addEventListener('touchmove',draw, false);
      canvas.addEventListener('touchend',draw, false);

      context.fillStyle = "rgb(255,255,255)";
      context.fillRect (0, 0, canvas.width, canvas.height);

      $(".clear").on("tap", function() {
        if ($(this).hasClass("disabled")) {
          return;
        }
        var canvas = document.getElementById('canvas');
        var context = canvas.getContext('2d');
        context.fillStyle = "rgb(255,255,255)";
        context.fillRect (0, 0, canvas.width, canvas.height);
        drawer.hasDrawing = false;
        $(".save, .clear").addClass("disabled");
      });

      $(".save").on("tap", function(){
        if ($(this).hasClass("disabled")) {
          return;
        }
        navigator.notification.confirm(
          "Save the sketch?",
          function(btn) {
            if (btn === 2) {
              return;
            }
            window.canvas2ImagePlugin.saveImageDataToLibrary(
              function(msg) {
                  navigator.notification.alert(
                    msg,
                    function(){},
                    "Complete",
                    "OK");
              },
              function(err) {
                  navigator.notification.alert(
                    err,
                    function(){},
                    "Error",
                    "OK");
              },
              document.getElementById('canvas')
            );
            $(".save").addClass("disabled");
          },
          "Save",
          ["OK","Cancel"]);
      });
    }
  };

})(window);