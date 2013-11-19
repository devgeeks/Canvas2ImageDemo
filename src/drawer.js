(function(drawer, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};

  drawer = {
    init: function(canvas) {
      this.canvas = canvas;
      this.that = this;
      var main = document.getElementsByClassName("main")[0];
      canvas.width = main.offsetWidth;
      canvas.height = main.offsetHeight - 20;
      this.offset = this.getAbsolutePosition(canvas);
      this.context = canvas.getContext('2d');
      var auto = true,
        devicePixelRatio = window.devicePixelRatio || 1,
        backingStoreRatio = this.context.webkitBackingStorePixelRatio ||
                            this.context.mozBackingStorePixelRatio ||
                            this.context.msBackingStorePixelRatio ||
                            this.context.oBackingStorePixelRatio ||
                            this.context.backingStorePixelRatio || 1,
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

          // now scale the this.context to counter
          // the fact that we've manually scaled
          // our canvas element
          this.context.scale(ratio, ratio);
      }

      this.context.fillStyle = "rgb(255,255,255)";
      this.context.fillRect (0, 0, canvas.width, canvas.height);
    },
    getAbsolutePosition: function(el) {
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
    },
    isDrawing: false,
    hasDrawing: false,
    touchstart: function(coors){
      var saveButton = document.getElementsByClassName("save")[0];
      var clearButton = document.getElementsByClassName("clear")[0];
      this.context.lineWidth = 4;
      this.context.beginPath();
      this.context.moveTo(coors.x, coors.y);
      this.isDrawing = true;
      // $(".save, .clear").removeClass("disabled");
      saveButton.classList.remove("disabled");
      clearButton.classList.remove("disabled");
    },
    touchmove: function(coors){
      if (this.isDrawing) {
        this.context.lineTo(coors.x, coors.y);
        this.context.stroke();
      }
    },
    touchend: function(){
      if (this.isDrawing) {
        this.isDrawing = false;
      }
    },
    draw: function(event){
      // get the touch coordinates
      var offset = drawer.getAbsolutePosition(drawer.canvas);
      var coors = {
        x: event.touches[0].pageX - offset.x,
        y: event.touches[0].pageY - offset.y
      };
      // pass the coordinates to the appropriate handler
      drawer[event.type](coors);
    }
  };

  var canvas = document.getElementById("canvas");
  var saveButton = document.getElementsByClassName("save")[0];
  var clearButton = document.getElementsByClassName("clear")[0];
  drawer.init(canvas);

  canvas.addEventListener('touchstart', drawer.draw, false);
  canvas.addEventListener('click', drawer.draw, false);
  canvas.addEventListener('touchmove', drawer.draw, false);
  canvas.addEventListener('touchend', drawer.draw, false);

  clearButton.addEventListener('touchend', function() {
    if ("disabled" in this.classList) {
      return;
    }
    var canvas = drawer.canvas;
    var context = drawer.context;
    context.fillStyle = "rgb(255,255,255)";
    context.fillRect (0, 0, canvas.width, canvas.height);
    drawer.hasDrawing = false;
    saveButton.classList.add("disabled");
    clearButton.classList.add("disabled");
  }, false);

  saveButton.addEventListener('touchend', function() {
    if ("disabled" in this.classList) {
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
          drawer.canvas
        );
        saveButton.classList.add("disabled");
      },
      "Save",
      ["OK","Cancel"]);
  });


})(window.drawer = window.drawer || {}, window);