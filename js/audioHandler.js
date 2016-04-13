"use strict"

// if app exists use the existing copy
// else create a new empty object literal
var app = app || {};

app.audioHandler = {

  SOUND_PATHS: {
    FLIGHT: "media\\music\\TestShotStarfish_Flight.wav"
  },

  SOUNDS: {
    FLIGHT: undefined ,
  },

  audioCTX:  undefined, //initialized by init()

  init: function() {
    //create audio context
    this.audioCTX = new AudioContext();

    //for each path, load the sound asynchronously and add sound;
    for( var path in this.SOUND_PATHS) {
      //load from path, save buffer to SOUNDS
      this.loadSound(this.SOUND_PATHS[path], path);
      console.log("loaded " + this.SOUND_PATHS[path] + " to " + path);
    }




  },

  loadSound: function(soundPath, target) {
    var request = new XMLHttpRequest();
    request.open('GET', soundPath, true);
    request.responseType = 'arraybuffer';

    request.onload = function() {

      app.audioHandler.audioCTX.decodeAudioData(request.response, function(buffer) {
         app.audioHandler.SOUNDS[target] = buffer;
         app.audioHandler.playSound(app.audioHandler.SOUNDS[target]);
       });
      }
      request.send();
    },

    playSound: function (soundBuffer) {
      debugger;
      var source = this.audioCTX.createBufferSource();
      source.buffer = soundBuffer;
      source.connect(this.audioCTX.destination);
      source.start(0);
    },

  }
