"use strict"

// if app exists use the existing copy
// else create a new empty object literal
var app = app || {};

app.audioHandler = {

  SOUND_PATHS: {
    //Flight by Test Shot Starfish
    //https://soundcloud.com/testshotstarfish/flight?in=testshotstarfish/sets/music-for-space
    FLIGHT: "media\\music\\TestShotStarfish_Flight.wav",
    //Delta IV: Launch by NASA is licensed under a  Creative Commons License.
    //https://soundcloud.com/nasa/delta-iv-launch?in=nasa/sets/rocket-engine-sounds
    ENGINE: "media\\music\\DeltaIVAudio.wav"
  },

  SOUNDS: {
    FLIGHT: undefined,
    ENGINE: undefined,
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
         if(target=="FLIGHT") app.audioHandler.playSound(app.audioHandler.SOUNDS[target]);

       });
      }
      request.send();
    },

    playSound: function (soundBuffer) {
      //debugger;
      var source = this.audioCTX.createBufferSource();
      source.buffer = soundBuffer;
      source.connect(this.audioCTX.destination);
      source.start(0);
    },

    playLoop: function (soundBuffer, startTime, duration = 0) {
      var source = this.audioCTX.createBufferSource();
      source.buffer = soundBuffer;
      source.loop = true;
      source.connect(this.audioCTX.destination);
      if(duration<=0) {
        source.start(0, startTime);
      }
      else {
        source.start(0, startTime, duration);
      }

    },

    stopSound: function (soundBuffer) {

    }

  }
