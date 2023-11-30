/*!
  * Licensed Materials - Property of IBM
  * 5725N95, 5725P55, 5725N96
  * (C) Copyright IBM Corp. 1999, 2014.
  * US Government Users Restricted Rights- Use, duplication or disclosure
  * restricted by GSA ADP Schedule Contract with IBM Corp.
 */

 /* $Id: os_mouseover.js,v 1.25.156.4.4.1.8.17.2.1 2014/01/08 06:53:35 quynhnguyen Exp $ */

osMouseOver = function(contentID)
{
	this.contentID = contentID;
	this.textareas = [];
	this.PersistText = 0;
	this.FrameBorder = 0;
	// create a storage array for the areas
	this.areas = [];
	this.popupArr = [];	
	
	this.imgX = 0;
	this.imgY = 0;
	this.offsetX = 0;
	this.maxZIndex = 0;
	
	this.isRoundPopup = false;
	this.isRoundPopupGradientBG = false;
	this.roundPopupCornerWidth = 10;
	this.roundPopupBorderWidth = 0;
	this.roundPopupShadowWidth = 0;
	this.roundPopupFillColor = "#FFFFCC";
	this.roundPopupToColor = "#FFFFCC";
	this.roundPopupBorderColor = "#FFFFCC";
	this.roundPopupShadowColor = "#BBB";
	
	YAHOO.util.Event.addListener("canvas"+contentID, "mousemove", this.trackMouse, this, true);
	YAHOO.util.Event.addListener("canvas"+contentID, "mousedown", this.trackMouse, this, true);
	YAHOO.util.Event.addListener("canvas"+contentID, "mouseout", this.trackMouse, this, true);
}

// static constants
osMouseOver.TYPE_MOUSEOVER = 0;
osMouseOver.TYPE_MOUSECLICK = 1;
osMouseOver.MAX_WIDTH = 350;

osMouseOver.prototype.invokeAnimation = function(type, args, me){
	//Invoke mouse over animation here.
	me.init();
}


osMouseOver.prototype.init = function()
{
	this.initMaxSize();
	this.addListenersOnPopups();
}

osMouseOver.prototype.addListenersOnPopups = function() {
	var Event = YAHOO.util.Event;	
	for ( var i = 0; i < this.areas.length; i++) {
		(function(i,po,id, isRoundPopup, PersistText) {		
		var popupContainerId = "mo"+id+"area"+i;		
		po.init(popupContainerId, id, isRoundPopup);
		po.PersistText = PersistText;
		po.popupNum = i;
		Event.addListener(popupContainerId, "mousemove", po.listenMouseEventOnPopup, po, true);
		Event.addListener(popupContainerId, "mousedown",po.listenMouseEventOnPopup, po, true);
		Event.addListener(popupContainerId, "mouseout", po.listenMouseEventOnPopup, po, true);
		Event.addListener(popupContainerId, "keypress", po.listenKeyEventOnPopup, po, true);
		})(i,this.popupArr[i],this.contentID, this.isRoundPopup, this.PersistText);
	}
}

osMouseOver.prototype.initMaxSize = function()
{
	var maxX, maxY = 0, b, c;
	var area,elm,er, canvas ;

	var yd = YAHOO.util.Dom;
	canvas = yd.get("canvas"+this.contentID);
	
	var $base = jQuery("#basemouseover"+this.contentID);
	
	// when the base has margin left attribute
	this.offsetX = $base.outerWidth(true) - $base.width();		
	maxX = this.imgX + $base.position().left + $base.width();
	maxY = this.imgY + $base.position().top + $base.height();	
	for(var i=0; i<this.areas.length;i++)
	{
		area = this.areas[i];
		// area
		// Support for rectangle, circle, polygon
		switch(area.type) {
			case 1:
				b = area.cy + area.r;
				c = area.cx + area.r;
				break;
			case 2:
				var x = area.x;
				var y = area.y;
				c = x.x0;
				b = y.y0;
				// get max of x coordinate
				for (var k =0; k < area.numPoint; k++) {					
					if (x["x"+k] > c) {
						c = x["x" + k];
					}
					if (y["y"+k] > b) {
						b = y["y" + k];
					}
				}
				break;
			default:
				b = area.y + area.h;
				c = area.x + area.w;
		}
		// area					
		if (maxY < b) maxY = b;	
		if (maxX < c) maxX = c;
		
		// popup
		elm = jQuery("#mo"+this.contentID+"text"+i);		
		elm.css('display','inline');	
		b = elm.position().top + elm.outerHeight() + 5;			
		if (maxY < b) maxY = b;		
		c = elm.position().left + elm.outerWidth() + 5;
		if (maxX < c) maxX = c;	
		
		jQuery(elm).css("left", this.offsetX + jQuery(elm).position().left);			
	}	
	//yd.setStyle(canvas,"width",maxX + this.FrameBorder);
	//yd.setStyle(canvas,"height",maxY + this.FrameBorder);\
	jQuery(canvas).css({width: maxX + this.FrameBorder, height: maxY + this.FrameBorder});
}
osMouseOver.isWithin = function(e,base,area)
{
	var yd = YAHOO.util.Dom;
	var ye = YAHOO.util.Event;
	
	// use coordinates relative to the base
	var ec = ye.getXY(e);
	var bc = yd.getXY(base);	
	var result = false;
	
	switch(area.type) {
		case 1:
			result = Shape.isWithinCircle(ec[0], ec[1], bc[0] + area.cx, bc[1] + area.cy, area.r);
			break;
		case 2:			
			var x = area.x;
			var y = area.y;
			var numPoint = area.numPoint;
			var arrX = new Array(numPoint);
			var arrY = new Array(numPoint);
			// divide into arrayX, arrayY
			for (var i = 0; i < numPoint; i++) {
				arrX[i] = parseFloat(x["x"+i]) + bc[0];
				arrY[i] = parseFloat(y["y"+i]) + bc[1];				
			}
			result = Shape.isWithinPolygon(ec[0], ec[1], numPoint, arrX, arrY);
			break;			
		default:
			result = Shape.isWithinRectangle(ec[0], ec[1], bc[0] + area.x, bc[1] + area.y, area.w, area.h);			
	}
	return result;
}

osMouseOver.prototype.trackMouse = function(e)
{
	var yd = YAHOO.util.Dom;
	
	var base = yd.get("basemouseover"+this.contentID);	
	var cursor = "default";
	
	for (var i=0; i<this.areas.length; i++)
	{
	(function(i, me) {	
		var a = me.areas[i];
		var popup = me.popupArr[i];
		
		var elm = yd.get("mo"+me.contentID+"area"+i);		
		var dock = yd.get("mo"+me.contentID+"text"+i);		
		if ((e.type == "mousemove") || (e.type == "mouseout"))
		{
			if (me.type == osMouseOver.TYPE_MOUSEOVER)
			{
				me.showPopup(e, base, elm, a, popup, i , dock);
			}
			else
			{
				if (osMouseOver.isWithin(e,base,a))
				{
					cursor = "hand";					
				}
			}
		}
		else if (e.type == "mousedown")
		{
			me.showPopup(e, base, elm, a, popup, i, dock);
		}
	})(i, this);
	}
	
	yd.setStyle(base,"cursor",cursor);
	if(this.PersistText == 0) {
		YAHOO.util.Event.stopPropagation(e);
	}
}

osMouseOver.prototype.showPopup = function(e, base, elm, a, popup, areaIdx, dock) {
	if (osMouseOver.isWithin(e,base,a)) {
		if (jQuery(elm).filter(':not(:animated)').length ==1 && !popup.enFlag ) {
			if (!this.textareas[areaIdx]) {		
				this.showDefaultAreas(e, elm, a , dock , areaIdx);
				popup.afterDisplayStyle = jQuery(elm).attr("style");
			}
			popup.display(true);			
		}
		
		if(this.PersistText != 0) {
			this.maxZIndex = this.maxZIndex + 1;
			jQuery(dock).css("z-index", this.maxZIndex);				
		}	
	} else {
		if (jQuery(elm).css("display") != "none" && this.PersistText == 0 && !popup.exFlag) {
			popup.display(false);
		}		
	}
}

osMouseOver.prototype.showDefaultAreas = function(e,elm,a, dock, areaIdx)
{
	var yd = YAHOO.util.Dom;
	var elements = [dock, elm];		
	var base = yd.get("canvas"+this.contentID);	
	// get the coordinates of the event
	var c = YAHOO.util.Event.getXY(e);
	var x = c[0];
	var y = c[1];
	var elDisplay = yd.getStyle(elm, "display");
	yd.setStyle(elm, "visibility", "hidden");
	yd.setStyle(elm, "display", "block");
	
	// move to the event position	
	yd.setXY(elements,[x,y]);	
	er = yd.getRegion(elm);
	
	// set the width to the max width if it has been exceeded or the height is greater than the width
	var er = yd.getRegion(elm);
	var h = (er.bottom - er.top);
	var w = (er.right - er.left);
	yd.setStyle(dock,"width",w);	
	yd.setStyle(dock,"height",h);
	
	//#48945:Fixed the Legacy Mouseover images are askew
	var spanElm = yd.get("mo"+this.contentID + "areaspan" + areaIdx);
	var imgElm = jQuery(spanElm).find("img");
	if(null != imgElm && imgElm.length == 0) {
		if ((w > osMouseOver.MAX_WIDTH) || (h > osMouseOver.MAX_WIDTH) || (h > w))
		{
			yd.setStyle(elements,"width",osMouseOver.MAX_WIDTH);		
			er = yd.getRegion(elm);
		}
	}
	
	// if the popup exceeded the bases boundaries attempt to adjust it
	var br = yd.getRegion(base);
	if (!br.contains(er))
	{
		// move the x
		if (er.right > br.right)
		{
			var d = br.right-er.right
			if ((x+d) >= br.left)
			{
				// move back within the base				
				yd.setX(elements,this.offsetX + x+d);			
			}
			else
			{
				// exceeded the left boundary align it to the left					
				yd.setX(elements,this.offsetX + br.left);				
			}

			er = yd.getRegion(elm);
		}

		// move the y
		if (er.bottom > br.bottom)
		{
			var d = br.bottom-er.bottom
			if ((y+d) >= br.top)
			{
				// move back within the base				
				yd.setY(elements,y+d);				
			}
			else
			{
				// exceeded the top so align it to the top				
				yd.setY(elements,br.top);				
			}			
		}

	}		
	
	if(this.isRoundPopup) {
		this.drawRoundCanvas(elm);
	}	
	
	yd.setStyle(elm, "display", elDisplay);
	yd.setStyle(elm, "visibility", "visible");
	
}

osMouseOver.prototype.drawRoundCanvas = function(elm)
{
	var bgStyle = "fill";
	
	if(this.isRoundPopupGradientBG) {
		bgStyle = "gradient{from:" + this.roundPopupFillColor + ";to:" + this.roundPopupToColor + "}" ;
	}else {
		bgStyle = bgStyle + "{color:" + this.roundPopupFillColor + "}";
	}	
	
	var canvasStyle = "[";	
	
	if(this.roundPopupShadowWidth > 0) {
		canvasStyle = canvasStyle + (" shadow{color:" + this.roundPopupShadowColor + ";width:" + this.roundPopupShadowWidth + "}");  
	}	
	
	if(this.roundPopupBorderWidth > 0) {
		canvasStyle = canvasStyle + ("border{color:" + this.roundPopupBorderColor + ";width:" + this.roundPopupBorderWidth + "}");  
	}		
		
	canvasStyle = canvasStyle + " " + bgStyle + "]" + " => roundedRect{radius:" + this.roundPopupCornerWidth + "}";	
	
	jQuery(elm).filter(".mouseoverarea").liquidCanvas(canvasStyle);
};

MouseOverPopup = function(animation) {
	this.animation = animation;
	this.containerId = "";	
	this.parentId = "";
	this.enFlag = false;
	this.exFlag = false;
	this.initialStyle = "";
	this.popupNum = 0;
	this.isRoundPopup = false;
	this.PersistText = 0;
}

MouseOverPopup.prototype.init = function(containerId, parentId, isRoundPopup) {	
	this.containerId = containerId;
	this.parentId = parentId;
	this.isRoundPopup = isRoundPopup;
	this.initialStyle = jQuery("#"+this.containerId).attr("style");	
	
	if(this.afterDisplayStyle) {
		this.afterDisplayStyle = this.initialStyle.replace("display: none");
	}	
	
}

MouseOverPopup.prototype.display = function(isShown) {
	this.exFlag = !isShown;
	this.enFlag = isShown;
	var popupContainer = jQuery("#"+this.containerId);	
	popupContainer.stop(true, true);	
	var anim;
	var me = this;
	if(isShown) {
		anim = new de.Anim(popupContainer, this.animation.enTrans, 
				de.Animation.ACTION_ENTRANCE, 0, this.animation.enSpeed, this.animation.enOpt);
		if(this.animation.audioId) {
			anim.setAudioObjId("embededPlayer" + this.animation.audioId);
		}
		anim.animate();			
	} else {
		var initialStyle = this.initialStyle;		
		popupContainer.attr("style", this.afterDisplayStyle);
		anim = new de.Anim(popupContainer, this.animation.exTrans, 
				de.Animation.ACTION_EXIT, 0, this.animation.exSpeed, this.animation.exOpt);		
		anim.onComplete.subscribe(function(){			
			if(me.isRoundPopup) {
				popupContainer.parent().children("canvas, div").filter(":not('.mouseoverarea')").remove();
			}	
			popupContainer.attr("style", initialStyle);	
		}, this);	
		anim.animate();			
	}
}

MouseOverPopup.prototype.listenMouseEventOnPopup = function(e) {
	//Stay focus on the popup
	jQuery("#"+this.containerId).focus();
}

MouseOverPopup.prototype.listenKeyEventOnPopup = function(e) {
	if (e.keyCode == YAHOO.util.KeyListener.KEY.ESCAPE) {
		this.display(false);
	}
};