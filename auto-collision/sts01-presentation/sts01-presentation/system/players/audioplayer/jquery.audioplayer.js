/*!
  * Licensed Materials - Property of IBM
  * 5725N95, 5725P55, 5725N96
  * (C) Copyright IBM Corp. 1999, 2014.
  * US Government Users Restricted Rights- Use, duplication or disclosure
  * restricted by GSA ADP Schedule Contract with IBM Corp.
 */

 /* $Id: jquery.audioplayer.js,v 1.1.2.1.2.3 2015/12/11 14:44:14 jconnolly Exp $ */
 
(function($) {
	var defaults = {
		format : {name: 'mp3',codec: 'audio/mpeg; codecs="mp3"'},
		flashAudioPlayerPath: 'libs/niftyplayer.swf',
		flashInstallPath: 'libs/expressInstall.swf',
		playerContainer: 'player',
		loop: false,
		volume: 0.8,
		preload: 'metadata',
		retryInterval: 50,
		numOfTries: 20
	},
	methods = {
		init : function(options) {
			var audioId = "p_" + this.attr('id');
			if(flash){
				this.html("<div id='" + defaults.playerContainer + "'/>");
				swfobject.embedSWF([options.path,"/", defaults.flashAudioPlayerPath,"?file=" +options.src].join(""), defaults.playerContainer, "0", "0", "9.0.0", 
						[options.path, "/", defaults.flashInstallPath].join(""), false, false, {id: audioId});
				if(options.onSoundEnd && !window.HTML5AudioWarn)
				{
					window.HTML5AudioWarn = true;
					alert("This object has failed to make use of events that occur when audio completes.\n\nYou must have HTML5 support in order for this to function.");
				}
			} else {
				var audio = document.createElement("audio");
				audio.src = options.src
				audio.id = audioId;
				audio.volume = defaults.volume;
				audio.preload = defaults.preload;
				this.append(audio);
				if(options.onSoundEnd)
				{
					audio.waitForAudio = true;
					if(document.addEventListener)
						audio.addEventListener('ended',options.onSoundEnd,false);
					else
						audio.attachEvent('onended',options.onSoundEnd);
				}
			}
		},
		play : function() {
			var audio = this[0].firstChild, tries = 0;			
			if(flash) {
				var fn = function() {
					if( audio.PercentLoaded() > 0) {
						audio.TCallLabel('/', 'play');
					} else if(tries < defaults.numOfTries) {
						tries++;
						setTimeout(fn , defaults.retryInterval);
					}
				};
				fn();
			} else {
				audio.play();
			}
		},
		stop : function() {
			try {
				var audio = this[0].firstChild;
				if(flash) {
					audio.TCallLabel('/', 'stop');
				} else {
					// Order of these commands is important for Safari (Win) and IE9. Pause then change currentTime.
					if(audio.paused == false) {
						audio.pause();
						try {
							audio.currentTime = 0;
						} catch(err) {
							audio.pause(0);
						}
					}
				}
			}catch(e) {
				
			}
		},
		canPlay: function(type) {
			if(!document.createElement("audio").canPlayType){
				return false;
			} else {
				return document.createElement("audio").canPlayType(type.codec).match(/maybe|probably/i) ? true : false;
			}
		}
	},
	flash = ! methods.canPlay(defaults.format);

	$.fn.audioplayer = function(method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.audioplayer');
		}
	};

})(jQuery);