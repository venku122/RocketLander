"use strict"

// if app exists use the existing copy
// else create a new empty object literal
var app = app || {};

app.audioHandler = {


  Sounds: {
    //Flight by Test Shot Starfish
    //https://soundcloud.com/testshotstarfish/flight?in=testshotstarfish/sets/music-for-space
    FLIGHT: { path:"media\\music\\TestShotStarfish_Flight.wav" , buffer: undefined , nodes:[]},
    //Delta IV: Launch by NASA is licensed under a  Creative Commons License.
    //https://soundcloud.com/nasa/delta-iv-launch?in=nasa/sets/rocket-engine-sounds
    ENGINE: { path:"media\\music\\DeltaIVAudio.wav", buffer: undefined , nodes:[]}
  },

  audioCTX:  undefined, //initialized by init()

  init: function() {
    //create audio context
    this.audioCTX = new AudioContext();

    //for each path, load the sound asynchronously and add sound;
    for( var sound in this.Sounds) {
      if(!this.Sounds.hasOwnProperty(sound)) continue;

      //load from path, save buffer to SOUNDS
      this.loadSound(this.Sounds[sound]);
      console.log("loaded " + this.Sounds[sound].path + " to " + this.Sounds[sound].buffer);
    }
  },

  loadSound: function(sound) {
    var request = new XMLHttpRequest();
    request.open('GET', sound.path, true);
    request.responseType = 'arraybuffer';

    request.onload = function() {

      app.audioHandler.audioCTX.decodeAudioData(request.response, function(buffer) {
         sound.buffer = buffer;
       });
      }
      request.send();
    },

    playSound: function (sound) {
      if(sound.nodes.length==0) {
        var source = this.audioCTX.createBufferSource();
        source.buffer = sound.buffer;
        source.connect(this.audioCTX.destination);
        sound.nodes.push(source);
      }
        for(var i = 0; i < sound.nodes.length; i++) {
          sound.nodes[i].start(0);
        }
    },

    playLoop: function (sound, startTime = 0, duration = 0) {

      if(sound.nodes.length == 0) {
        var source = this.audioCTX.createBufferSource();
        source.buffer = sound.buffer;
        source.loop = true;
        source.connect(this.audioCTX.destination);
        sound.nodes.push(source);
      }

        if(duration<=0) {
          for(var i = 0; i < sound.nodes.length; i++) {
            sound.nodes[i].start(0, startTime);
          }
        }
        else {
          for(var i = 0; i < sound.nodes.length; i++) {
            sound.nodes[i].start(0, startTime, duration);
          }
        }
    },

    stopSound: function (sound) {
      if(sound.nodes.length!=0) {
        for(var i = 0; i < sound.nodes.length; i++) {
          sound.nodes[i].stop();
          sound.nodes.pop();
        }
      }
    },

    muteAudio: function() {
      this.Sounds.FLIGHT.nodes[0].stop();
    }
  }
