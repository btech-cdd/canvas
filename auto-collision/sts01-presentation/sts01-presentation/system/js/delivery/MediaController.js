/*!
 * IBM Confidential
 * OCO Source Materials
 * 5725N95, 5725P55, 5725N96
 * (C) Copyright IBM Corp. 1999, 2014
 * The source code for this program is not published or otherwise
 * divested of its trade secrets, irrespective of what has been
 * deposited with the U.S. Copyright Office.
 */

 /* $Id: MediaController.js,v 1.1.4.13.2.3 2015/04/13 19:41:58 jconnolly Exp $ */
 
BasePlayer = function(playerObj)
{
	this.window = null;
	this.playerObj = playerObj;
	this.autoplay = true;
	this.showcontrol = true;	
	this.isClosedCaption = false;
	this.loop=false;
	this.isPlaying=true;
}
BasePlayer.prototype.init = function()
{	
}
BasePlayer.prototype.back = function()
{	
}
BasePlayer.prototype.forward = function()
{	
}
BasePlayer.prototype.rewind = function()
{	
}
BasePlayer.prototype.play = function()
{	
}
BasePlayer.prototype.stop = function()
{		
}
BasePlayer.prototype.pause = function()
{	
}
BasePlayer.prototype.mute = function()
{	
}
BasePlayer.prototype.unmute = function()
{	
}
BasePlayer.prototype.volume = function(volumelevel)
{	
}
BasePlayer.prototype.showCaptions = function()
{	
}
BasePlayer.prototype.hideCaptions = function()
{	
}
BasePlayer.prototype.setPlayerObj = function(obj) {
	this.playerObj = obj; 
}
BasePlayer.prototype.validPlayerObj = function() {
	return true; 
}
BasePlayer.prototype.getObjectById = function(objectIdStr) {
	return document.getElementById(objectIdStr);   
}
BasePlayer.prototype.getParam = function(name)
{
	var params = this.elm.childNodes;
	var param;
	var paramname;
	var paramvalue;
	for (var i=0; i<params.length;i++)
	{
		param = params[i];
		if (param.attributes != null && param.attributes["name"])
		{
			paramname = param.attributes["name"].nodeValue;
			if (paramname.toUpperCase() == name.toUpperCase() )
			{
				paramvalue = param.attributes["value"];
				if (paramvalue) paramvalue = paramvalue.nodeValue;
				break;
			}
		}
		else 
		{			
			continue;
		}
	}
	return paramvalue;
};

RealMedia = function(elm) {
	this.elm = elm;
	if(this.elm) {
		this.playerObj = this.getObjectById(elm.id);
	}		
}
RealMedia.prototype = new BasePlayer();
RealMedia.prototype.init = function()
{
	this.settings = {
			back : false,
			forward : true,
			rewind : true,
			play : true,
			stop : true,
			pause: true,
			mute : true,
			unmute : true,
			volume : true,
			showCaptions : false,
			hideCaptions : false
		};
	
	if(typeof this.playerObj.DoPlayPause == "undefined") {	
		for (var prop in this.settings) {
			this.settings[prop] = false; 
		}	
	}
	
	this.autoplay = this.getParam("AUTOSTART");		
	if(typeof(this.autoplay) == "undefined" || this.autoplay === 'true' ) this.autoplay = true;	
	else this.autoplay = false;	
		
	this.isPlaying=this.autoplay;
}
RealMedia.prototype.getObjectById = function(objectIdStr) {	
    var r = null;
    var o = document.getElementById(objectIdStr);   
    if (o && o.nodeName == "OBJECT") {    	
        if (typeof o.DoPlayPause != 'undefined') {           	
            r = o;            
        }
        else {
            var n = o.getElementsByTagName("OBJECT")[0];          
            if (n) {            	
                r = n;
            }
        }
    }
    return r;
}
RealMedia.prototype.validPlayerObj = function() {
	if (typeof this.playerObj.DoPlayPause != 'undefined')
		return true;
	return false;
}
RealMedia.prototype.play = function()
{
	this.playerObj.DoPlayPause();
	this.isPlaying=true;
}
RealMedia.prototype.forward = function()
{
	var currentPos = this.playerObj.GetPosition();
	this.playerObj.SetPosition(currentPos + 1000);
	if (this.isPlaying) this.play();
	else this.pause();
}
RealMedia.prototype.rewind = function()
{
	//this.playerObj.SetPosition(0);
	var prevPos = this.playerObj.GetPosition() - 1000;
	if (prevPos <0) prevPos=0;
	this.playerObj.SetPosition(prevPos);
	if (this.isPlaying) this.play();
	else this.pause();	
}
RealMedia.prototype.stop = function()
{
	this.playerObj.DoStop();
	this.isPlaying=false;
}
RealMedia.prototype.pause = function()
{
	this.playerObj.DoPause();
	this.isPlaying=false;
}
RealMedia.prototype.mute = function()
{
	this.playerObj.SetMute(true); 
}
RealMedia.prototype.unmute = function()
{
	this.playerObj.SetMute(false); 
}
RealMedia.prototype.volume = function(volumelevel)
{
	this.playerObj.SetVolume(volumelevel);
};
QuickTime = function(elm) {
	this.elm = elm;
	if(this.elm) {
		this.playerObj = this.getObjectById(elm.id);
	}		
}
QuickTime.prototype = new BasePlayer();
QuickTime.prototype.init = function()
{
	this.settings = {
			back : true,
			forward : true,
			rewind : true,
			play : true,
			stop : true,
			pause: true,
			mute : true,
			unmute : true,
			volume : true,
			showCaptions : false,
			hideCaptions : false
		};	
	
	if(typeof this.playerObj.Play == "undefined") {
		for (var prop in this.settings) {
			this.settings[prop] = false; 
		}	
	}
	
	this.showcontrol = this.getParam("DISPLAYCONTROL");	
	
	if(typeof(this.showcontrol) == "undefined" || this.showcontrol === "true") this.showcontrol = true;
	else this.showcontrol = false;
	
	this.autoplay = this.getParam("AUTOSTART");	
	if(typeof(this.autoplay) == "undefined" || this.autoplay === "true") this.autoplay = true;	
	else this.autoplay = false;
	
	if (typeof this.playerObj.Play != "undefined"  && !this.showcontrol) this.playerObj.SetControllerVisible(false);
		
	this.isPlaying=this.autoplay;
}
QuickTime.prototype.getObjectById = function(objectIdStr) {	
    var r = null;
    var o = document.getElementById(objectIdStr);   
    if (o && o.nodeName == "OBJECT") {    	
        if (typeof o.Play != 'undefined') {        	 
            r = o;            
        }
        else {
            var n = o.getElementsByTagName("OBJECT")[0];          
            if (n) {
                r = n;
            }
        }
    }
    return r;
}
QuickTime.prototype.validPlayerObj = function() {
	if (typeof this.playerObj.Play != 'undefined')
		return true;
	return false;
}
QuickTime.prototype.rewind = function()
{
	this.back();
}
QuickTime.prototype.back = function()
{
	this.playerObj.Step(-10);
	if (this.isPlaying) this.play();
	else this.pause();
}
QuickTime.prototype.forward = function()
{
	this.playerObj.Step(10);
	if (this.isPlaying) this.play();
	else this.pause();
}
QuickTime.prototype.play = function()
{
	this.playerObj.Play();
	this.isPlaying=true;
}
QuickTime.prototype.stop = function()
{
	this.playerObj.Stop();
	this.isPlaying=false;
}
QuickTime.prototype.pause = function()
{
	this.playerObj.Stop();
	this.isPlaying=false;
}
QuickTime.prototype.mute = function()
{
	this.playerObj.SetMute(true);
}
QuickTime.prototype.unmute = function()
{
	this.playerObj.SetMute(false);
}
QuickTime.prototype.volume = function(volumelevel)
{
	this.playerObj.SetVolume(volumelevel);
};
WindowPlayback = function(elm) {	
	this.elm = elm;
	if(this.elm) {
		this.playerObj = this.getObjectById(elm.id);
	}		
}
WindowPlayback.prototype = new BasePlayer();
WindowPlayback.prototype.getObjectById = function(objectIdStr) {	
    var r = null;
    var o = document.getElementById(objectIdStr);
    if (o && o.nodeName == "OBJECT") {
        if (typeof o.controls != 'undefined') {
            r = o;
        }
        else {
            var n = o.getElementsByTagName("OBJECT")[0];
            if (n) {
                r = n;
            }
        }
    }
    return r;
}
WindowPlayback.prototype.validPlayerObj = function() {
	if (typeof this.playerObj.controls != 'undefined' && typeof this.playerObj.controls.play != 'undefined')
		return true;
	return false;
}
WindowPlayback.prototype.back = function()
{
	this.playerObj.controls.currentPosition = this.playerObj.controls.currentPosition - 5;
}
WindowPlayback.prototype.fastForward = function()
{
	this.playerObj.controls.fastForward();
}
WindowPlayback.prototype.fastReverse = function()
{
	this.playerObj.controls.fastReverse();
}
WindowPlayback.prototype.forward = function()
{
	this.playerObj.controls.currentPosition = this.playerObj.controls.currentPosition + 5;
}
WindowPlayback.prototype.rewind = function()
{
	this.back();
}
WindowPlayback.prototype.play = function()
{
	this.playerObj.controls.play();
}
WindowPlayback.prototype.stop = function()
{
	this.playerObj.controls.stop();
}
WindowPlayback.prototype.pause = function()
{
	this.playerObj.controls.pause();
}
WindowPlayback.prototype.init = function()
{		
	this.settings = {
			back : true,
			forward : true,
			rewind : true,
			play : true,
			stop : true,
			pause: true,
			mute : true,
			unmute : true,
			volume : true,
			showCaptions : false,
			hideCaptions : false
		};	
	
	if(!this.playerObj.controls) {
		for (var prop in this.settings) {
			this.settings[prop] = false; 
		}	
	}
	
	this.showcontrol = this.getParam("DISPLAYCONTROL");	
	
	if(typeof(this.showcontrol) == "undefined" || this.showcontrol === "true") this.showcontrol = true;
	else this.showcontrol = false;
	
	this.autoplay = this.getParam("AUTOSTART");	
	if(typeof(this.autoplay) == "undefined" || this.autoplay === "true") this.autoplay = true;	
	else this.autoplay = false;
	
	//Tam Le fix #42756
	if(this.playerObj.uiMode!='invisible') this.ShowControl(this.showcontrol);
	
	// Local file
	var href = this.window.document.location.href;
	var basepath = this.getBasePath(href);
	if (basepath != "")
	{
		var value = "";
		if (typeof(this.playerObj.url) != "undefined")
		{
			value = this.getParam("url");
			var url = unescape(this.getFilePath(basepath, value));
			if ((value) && (value != "")) this.playerObj.url = url;
		} 
		else 
			if (typeof(this.playerObj.filename) != "undefined") {
				value = this.getParam("filename");
				var filename = unescape(this.getFilePath(basepath, value));
				if ((value) && (value != "")) this.playerObj.filename  = filename;
			}
	}			
	
}
WindowPlayback.prototype.getFilePath = function(basepath, url)
{
	var filepath = url;
	var count = 0;
	var i = -1;
	i = url.indexOf("..");
	while (i>=0)
	{
		i = url.indexOf("..", i+2);
		count ++;
	}
	if (count>0)
	{
		i = url.lastIndexOf("../");
		var last = url.substring(i+3);
		var basepathArr = basepath.split("/");
		filepath = basepathArr[0];
		
		for(i=1; i<(basepathArr.length - count);i++)
		{
			filepath = filepath + "/" + basepathArr[i];
		}
		filepath = filepath + "/" + last;
	}
	return filepath;
}
WindowPlayback.prototype.getBasePath = function(url)
{
	var path = "";
	if ((url) && (url.indexOf("http")<0))
	{
		url = url.replace("\\", "/");
		var i = url.lastIndexOf(".");
		if (i>=0)
		{
			var i = url.lastIndexOf("/");
			path = url.substring(0,i);
		}
	}
	return path;
}
WindowPlayback.prototype.ShowControl = function(b)
{
	if (b)
		this.playerObj.uiMode = "full"; 
	else 
		this.playerObj.uiMode = "none";
}
WindowPlayback.prototype.mute = function()
{
	this.playerObj.settings.mute = true;
}
WindowPlayback.prototype.unmute = function()
{
	this.playerObj.settings.mute = false;
}
WindowPlayback.prototype.volume = function(volumelevel)
{
	this.playerObj.settings.volume = volumelevel;
};

FlashPlack = function(elm) {
	this.elm = elm;
	if(this.elm) {
		this.playerObj = this.getObjectById(elm.id);
	}
	
}
FlashPlack.prototype = new BasePlayer();
FlashPlack.prototype.init = function()
{
	this.settings = {
			back : true,
			forward : true,
			rewind : true,
			play : true,
			stop : true,
			pause: true,
			mute : false,
			unmute : false,
			volume : false,
			showCaptions : false,
			hideCaptions : false
		};	
	
	if(typeof this.playerObj.Play == "undefined") {
		for (var prop in this.settings) {
			this.settings[prop] = false; 
		}	
	}
	
	//Tam Le: Fix #40317
	this.autoplay = this.getParam("AUTOPLAY");	
	if(typeof(this.autoplay) == "undefined" || this.autoplay === 'true') this.autoplay = true;	
	else this.autoplay=false;
	
}
FlashPlack.prototype.getObjectById = function(objectIdStr) {	
    var r = null;
    var o = document.getElementById(objectIdStr);
    if (o && o.nodeName == "OBJECT") {
        if (typeof o.SetVariable != 'undefined') {
            r = o;
        }
        else {
            var n = o.getElementsByTagName("OBJECT")[0];
            if (n) {
                r = n;
            }
        }
    }
    return r;
}
FlashPlack.prototype.back = function()
{
	var isPlaying=this.playerObj.object.isPlaying();
	var currentFrame=this.playerObj.CurrentFrame();
	this.playerObj.GoToFrame(currentFrame-20);
	if (isPlaying) this.play();
	else this.pause();
	
}
FlashPlack.prototype.forward = function()
{
	var isPlaying=this.playerObj.object.isPlaying();
	var currentFrame=this.playerObj.CurrentFrame();
	this.playerObj.GoToFrame(currentFrame+20);
	if (isPlaying) this.play();
	else this.pause();
	
}
FlashPlack.prototype.rewind = function()
{
	this.back();
}
FlashPlack.prototype.validPlayerObj = function() {
	if (typeof this.playerObj.object != 'undefined' && typeof this.playerObj.object.Play != 'undefined')
		return true;
	return false;
}
FlashPlack.prototype.play = function()
{
	this.playerObj.object.Play();
}
FlashPlack.prototype.stop = function()
{
	this.playerObj.object.StopPlay();
	this.playerObj.Rewind();
}
FlashPlack.prototype.pause = function()
{
	this.playerObj.object.StopPlay();
};

CaptivatePlack = function(elm) {	
	this.playerObj = new CaptivateController(this.getObjectById(elm.id));	
	this.elm = elm;
}
CaptivatePlack.prototype = new FlashPlack();
CaptivatePlack.prototype.init = function()
{
	this.settings = {
			back : true,
			forward : true,
			rewind : true,
			play : true,
			stop : true,
			pause: true,
			mute : true,
			unmute : true,
			volume : true,
			showCaptions : true,
			hideCaptions : true
		};	
	
	if(!this.playerObj.resume) {
		for (var prop in this.settings) {
			this.settings[prop] = false; 
		}	
	}
	
	//Disable mute/volume if it is not support
	if (this.playerObj.query('cpCmndVolume')==null){
		this.settings.mute=false;
		this.settings.unmute=false;
		this.settings.volume=false;
	}
	
	
	this.autoplay = this.getParam("AUTOSTART");	
	if(typeof(this.autoplay) == "undefined" || this.autoplay === 'true' ) this.autoplay = true;	
	else this.autoplay = false;
	
	//Get Loop attribute
	this.loop=this.getParam("LOOPPLAY");
	if(typeof(this.loop) == "undefined" || this.loop === 'false' ) this.loop = false;	
	else this.loop = true;
	
	
	this.play();//Always play to initiliaze the CaptivateController due to its limitation
	
	//Stop if autoplay is false
	if(this.autoplay==false) {
		this.isPlaying=false;
		MediaController.captivateController=this.playerObj;
		var myinterval=window.setInterval(
			    function(){
			       if (MediaController.captivateController)	{
				       MediaController.captivateController.pause();
				       MediaController.captivateController=null;
	 	               window.clearInterval(myinterval);
			       }
			    },500);
	}
	
	var cc = this.playerObj.query('cpCmndCC');
		
	if(cc == null) {
		cc = this.playerObj.query('rdcmndCC');
	}	
				
	if(cc === '0' ){
		this.isClosedCaption = true;
	}	
	
	//Process for loop. CaptivateController not support currently
	//Do the alternative way
	if (this.loop==true){
		var myInterval = window.setInterval(function () {
			  //alert(this);
			  if (MediaController.players.length <1) return ;
			  for (var i=0;i<MediaController.players.length;i++)
			  {
					player = MediaController.players[i];
					if(player.elm.id.indexOf('Captivate') > -1 && player.loop==true){
						var totalFrame=player.playerObj.query('rdinfoFrameCount');
						var currentFrame=player.playerObj.query('rdinfoCurrentFrame');
						if (totalFrame==currentFrame){
							player.playerObj.rewindAndPlay();
						}
					}
					return;
					
			  }
			},2000);
	}
}
CaptivatePlack.prototype.back = function()
{
	var totalFrame=parseInt(this.playerObj.query('rdinfoFrameCount'));
	var currentFrame=parseInt(this.playerObj.query('rdinfoCurrentFrame'));
	if (currentFrame<totalFrame){
		if (this.isPlaying) this.playerObj.gotoFrameAndPlay(currentFrame-20);
		else this.playerObj.gotoFrameAndStop(currentFrame-20);
	}
}
CaptivatePlack.prototype.forward = function()
{
	var totalFrame=parseInt(this.playerObj.query('rdinfoFrameCount'));
	var currentFrame=parseInt(this.playerObj.query('rdinfoCurrentFrame'));
	if (currentFrame<totalFrame){
		if (this.isPlaying) this.playerObj.gotoFrameAndPlay(currentFrame+20);
		else this.playerObj.gotoFrameAndStop(currentFrame+20);
	}
}
CaptivatePlack.prototype.rewind = function()
{
	this.back();
}
CaptivatePlack.prototype.validPlayerObj = function() {
	if (typeof this.playerObj.resume != 'undefined')
		return true;
	return false;
}
CaptivatePlack.prototype.play = function()
{
	this.playerObj.resume();
	this.isPlaying=true;
}
CaptivatePlack.prototype.stop = function()
{
	this.playerObj.pause();
}
CaptivatePlack.prototype.pause = function()
{
	this.playerObj.pause();
	this.isPlaying=false;
}
CaptivatePlack.prototype.mute = function()
{
	this.playerObj.mute();
}
CaptivatePlack.prototype.unmute = function()
{
	this.playerObj.unmute();
}
CaptivatePlack.prototype.showCaptions = function()
{
	this.playerObj.showCaptions();
}
CaptivatePlack.prototype.hideCaptions = function()
{
	this.playerObj.hideCaptions();
}
CaptivatePlack.prototype.volume = function(volumelevel)
{
	this.playerObj.volume(volumelevel);
};
HTML5Player = function(elm) {	
	this.elm = elm;
	if(this.elm) {
		this.playerObj = this.getObjectById(elm.id);
	}		
}
HTML5Player.prototype = new BasePlayer();
HTML5Player.prototype.getObjectById = function(objectIdStr) {	
    var r = null;
    var o = document.getElementById(objectIdStr);
    if (o && o.nodeName == "VIDEO") {
        if (typeof o.controls != 'undefined') {
            r = o;
        }
        else {
            var n = o.getElementsByTagName("VIDEO")[0];
            if (n) {
                r = n;
            }
        }
    }
    return r;
}
HTML5Player.prototype.validPlayerObj = function() {
	return true;
}
HTML5Player.prototype.forward = function()
{
	this.playerObj.currentTime += 5;
}
HTML5Player.prototype.rewind = function()
{
	this.playerObj.currentTime -= 5;
}
HTML5Player.prototype.play = function()
{
	this.playerObj.play();
}
HTML5Player.prototype.pause = function()
{
	this.playerObj.pause();
}
HTML5Player.prototype.init = function()
{
	this.settings = {
			forward : true,
			rewind : true,
			play : true,
			pause: true,
			mute : true,
			unmute : true,
			volume : true
		};

	if(!this.playerObj.controls) {
		for (var prop in this.settings) {
			this.settings[prop] = false; 
		}	
	}
	this.playerObj.volume = 0.5;
	this.autoplay = this.playerObj.autoplay;
}
HTML5Player.prototype.mute = function()
{
	this.playerObj.muted = true;
}
HTML5Player.prototype.unmute = function()
{
	this.playerObj.muted = false;
}
HTML5Player.prototype.volume = function(volumelevel)
{
	this.playerObj.volume = volumelevel / 100;
};

MediaController = 
{
	window:null,
	clsIdMap:
	{
		"D27CDB6E-AE6D-11cf-96B8-444553540000":101,
		"CFCDAA03-8BE4-11cf-B84B-0020AFBBCCFA":102,
		"22D6F312-B0F6-11D0-94AB-0080C74C7E95":104,
		"02BF25D5-8C17-4B23-BC80-D3488ABDDC6B":103,
		"6BF52A52-394A-11D3-B153-00C04F79FAA6":104
	},	
	players:[],
	captivateController:null,
	initAll:function()
	{
		var objs = jQuery('object.objectouter');
		MediaController.window = window;
		if (objs)
		{
			for (var i=0;i<objs.length;i++)
			{
				obj = objs[i];
				this.players.push(this.init(obj));
			}
		}
								
		OSDeliveryEngine.events.media_loaded.fire(this.players);	
		OSDeliveryEngine.events.load.subscribe(function() { MediaController.reload(); });
		
	},
	init:function(playerObj)
	{
		var player = this.getPlayer(playerObj);
		if (player) player.init();		
		return player;
		
	},
	reload:function(){
		var objs = jQuery('object.objectouter');
		MediaController.window = window;
		if (objs)
		{
			for (var i=0;i<objs.length;i++)
			{
				obj = objs[i];
				this.players.push(this.init(obj));
			}
		}
	},
	getPlayer:function(elm)
	{
		var p = null;
		if (elm)
		{
			var clsId = elm.attributes["classid"];
			var elmId = elm.attributes["id"].nodeValue;			
			if (clsId)
			{	
				clsId = clsId.nodeValue;
				var i = clsId.indexOf(":");
				if (i>=0) clsId = clsId.substring(i+1);
				if (MediaController.clsIdMap[clsId])
				{
					id = MediaController.clsIdMap[clsId];
					if (id == 101) //Flash
					{
						p = new CaptivatePlack(elm);
						if (p.playerObj.captivateVersion()==false){
							p = new FlashPlack(elm);
						}	
					}
					else if (id == 102) 
					{
						p = new RealMedia(elm);
					}
					else if (id == 103)
					{
						p = new QuickTime(elm);
					}
					else if (id == 104) //Window Media
					{
						if(elm.parentNode.tagName == 'VIDEO')
						{
							p = new HTML5Player(elm.parentNode);
							p.window = this.window;
						}
						else
						{
							p = new WindowPlayback(elm);
							p.window = this.window;
						}
					}
				}
			}
		}		
		return p;
	}
};

// Wait for the delivery engine to be loaded instead of binding to the window load event
OSDeliveryEngine.events.engine_loaded.subscribe(MediaController.initAll,MediaController,true);

/* 
CaptivateController()
Version 0.9.2, works with Adobe Captivate 2, 3, 4 & 5
Copyright (c) 2009-2010 Philip Hutchison
http://pipwerks.com/lab/captivate
MIT-style license. Full license text can be found at 
http://www.opensource.org/licenses/mit-license.php
*/
var CaptivateController=function(m,l){if(typeof m==="undefined"){return false;}var f="cpSkinLoader_mc.",n="rdcmnd",p="cpCmnd",r,z="undefined",y="unknown",o="number",g=true,q=false,h=this,e=null,x="",t=q,d="",b="GetVariable",u="SetVariable",c="CaptivateVersion",a=q,j=q,v=m;if(!v){return q;}var s=function(){var W=null,A=null,C=null,L=null,S=null,F=null,K=q,Z=q,V=q,X,D,E,H,Y,R;if(typeof v.cpEIGetValue!==z){try{C=v.cpEIGetValue(c);}catch(Q){}try{L=v.cpEIGetValue(f+c);}catch(P){}}if(typeof v.cpGetValue!==z){try{W=v.cpGetValue(c);}catch(N){}try{A=v.cpGetValue(f+c);}catch(M){}}if(typeof v.GetVariable!==z){try{S=v.GetVariable(c);}catch(J){}try{F=v.GetVariable(f+c);}catch(I){}}X=typeof S;D=typeof F;E=typeof W;H=typeof A;Y=typeof C;R=typeof L;V=(X!==z&&X!==y&&S!==null)||(D!==z&&D!==y&&F!==null)||q;K=((E!==z&&E!==y&&W!==null)||(H!==z&&H!==y&&A!==null))||q;Z=((Y!==z&&Y!==y&&C!==null)||(R!==z&&R!==y&&L!==null))||q;x=(Z)?C||L||q:(K)?W||A||q:S||F||q;t=(x!==q);if(!t){return q;}e=parseInt(x.replace(/v/gi,"").split(".")[0],10);a=(e>4||(e>3&&!V));if(Z){b="cpEIGetValue";u="cpEISetValue";}else{if(K){b="cpGetValue";u="cpSetValue";}}if(!l){var O=(e>3)?"isCPMovie":"rdIsMainMovie",B=q;try{var T=v[b](f+O),G=typeof T;B=(G!==z&&G!==y&&T!==null);}catch(U){}l=B;}d=(l)?f:"";r=(e>3)?p:n;};var w=function(){if(e===null){s();}return t;};var k=function(B,A){if(!w()){return q;}if(typeof A===z){A=1;}switch(B){case"pause":B=n+"Pause";break;case"resume":B=n+"Resume";break;case"next":B=n+"NextSlide";break;case"previous":B=n+"Previous";break;case"rewindAndStop":if(e===5){B=r+"GotoSlide";A=0;}else{B=n+"RewindAndStop";}break;case"rewindAndPlay":B=(e===5)?q:n+"RewindAndPlay";if(e===5){v[u](d+n+"Pause",1);B=n+"GotoFrameAndResume";}else{B=n+"RewindAndPlay";}break;case"gotoSlideAndPlay":if(!j){A=A-1;}v[u](d+r+"GotoSlide",A);B=r+"Resume";A=1;break;case"gotoSlideAndStop":if(!j){A=A-1;}B=r+"GotoSlide";break;case"gotoFrameAndPlay":v[u](d+n+"Pause",1);B=n+"GotoFrameAndResume";break;case"gotoFrameAndStop":B=n+"GotoFrame";break;case"volume":B=p+"Volume";break;case"mute":B=r+"Mute";break;case"unmute":B=r+"Mute";A=0;break;case"muteAndShowCaptions":v[u](d+r+"Mute",1);B=r+"CC";break;case"unmuteAndHideCaptions":v[u](d+r+"Mute",0);B=r+"CC";A=0;break;case"showCaptions":B=r+"CC";break;case"hideCaptions":B=r+"CC";A=0;break;case"info":B=(e===5)?q:n+"Info";break;case"hidePlaybar":B=(e>3)?p+"ShowPlaybar":n+"HidePlaybar";A=(e>3)?0:1;break;case"showPlaybar":B=(e>3)?p+"ShowPlaybar":n+"HidePlaybar";A=(e>3)?1:0;break;case"lockTOC":B=(e>3)?"cpLockTOC":q;break;case"unlockTOC":B=(e>3)?"cpLockTOC":q;A=0;break;case"exit":B=n+"Exit";break;default:B=q;}if(B){v[u](d+B,A);}return h;};var i=function(B,A){if(!w()){return q;}var L=null,K=(typeof A!==z&&A)?"":d;switch(B){case"rdinfoHasPlaybar":try{L=v[b](B);}catch(I){}if(typeof L===z||L===null){try{L=v[b](K+B);}catch(H){}}L=(typeof L!==z)?L:q;break;case"playbarHeight":case"playbarPosition":if(!a){try{L=v.GetVariable(B);}catch(G){try{L=v.GetVariable(K+B);}catch(F){}}}else{if(e===5){K="";}L=v[b](K+B);}break;case"movieXML":case"PlaybarProperties":try{L=v.cpEIXMLGetValue(K+B);}catch(E){}if(typeof L===z||L===null){try{L=v.cpEIXMLGetValue(B);}catch(D){}}break;default:try{L=v[b](K+B);}catch(C){}if(typeof L===z||L===null){try{L=v[b](B);}catch(J){}}}return(typeof L!==z)?L:null;};this.swf=v;this.useZeroIndex=function(A){j=(A)?g:q;};this.pause=function(){return k("pause");};this.resume=function(){return k("resume");};this.next=function(){return k("next");};this.previous=function(){return k("previous");};this.rewindAndStop=function(){return k("rewindAndStop");};this.rewindAndPlay=function(){return k("rewindAndPlay");};this.gotoSlideAndStop=function(A){if(typeof A===o){return k("gotoSlideAndStop",A);}};this.gotoSlideAndPlay=function(A){if(typeof A===o){return k("gotoSlideAndPlay",A);}};this.gotoFrameAndStop=function(A){if(typeof A===o){return k("gotoFrameAndStop",A);}};this.gotoFrameAndPlay=function(A){if(typeof A===o){return k("gotoFrameAndPlay",A);}};this.showInfoBox=function(){return k("info");};this.exit=function(){return k("exit");};this.lockTOC=function(){return k("lockTOC");};this.unlockTOC=function(){return k("unlockTOC");};this.hidePlaybar=function(){return k("hidePlaybar");};this.showPlaybar=function(){return k("showPlaybar");};this.mute=function(){return k("mute");};this.unmute=function(){return k("unmute");};this.muteAndShowCaptions=function(){return k("muteAndShowCaptions");};this.unmuteAndHideCaptions=function(){return k("unmuteAndHideCaptions");};this.showCaptions=function(){return k("showCaptions");};this.hideCaptions=function(){return k("hideCaptions");};this.volume=function(A){if(w()&&(e>3)){if(typeof A===o){k("volume",A);}return i("cpCmndVolume");}return null;};this.query=function(A){return i(A);};this.queryExternalSkin=function(A){return i(A,g);};this.captivateVersion=function(){return(w())?e:q;};this.asVersion=function(){return(w())?(a)?3:2:q;};this.hasSkinSWF=function(){return(w())?l:q;};this.hasTOC=function(){return(w()&&i("NoOfTOCEntries")!==null)?g:q;};this.width=function(){return(w()&&(e>3))?i("cpMovieWidth"):v.TGetProperty("/",8);};this.height=function(){return(w()&&(e>3))?i("cpMovieHeight"):v.TGetProperty("/",9);};this.FPS=function(){if(!w()){return q;}return i("rdinfoFPS")||i("cpInfoFPS")||"";};this.hasPlaybar=function(){if(!w()){return q;}if(e>3){return(i("cpInfoHasPlaybar"))?g:q;}return(i("rdinfoHasPlaybar"))?g:q;};this.percentLoaded=function(){return v.PercentLoaded();};this.getname=function(){return v.TGetProperty("/",13);};this.geturl=function(){return v.TGetProperty("/",15);};return this;};
