/*!
  * Licensed Materials - Property of IBM
  * 5725N95, 5725P55, 5725N96
  * (C) Copyright IBM Corp. 1999, 2014.
  * US Government Users Restricted Rights- Use, duplication or disclosure
  * restricted by GSA ADP Schedule Contract with IBM Corp.
 */

 /* $Id: OsList.js,v 1.1.4.6.2.1 2014/01/08 06:53:36 quynhnguyen Exp $ */
OsList = function(id) {
	this.id = id;
	//List of items of the list.
	this.items = [];
	//Animation type: no animation, on click, automatically every n seconds.
	this.aniType = "";
	//delay time in second.
	this.delay = 0;
	//Index of the item being displayed on user's click.
	this.displayItemIdx = 0;
	//Path to the image functioning as visual cue indicating that more list items available.
	this.visualCueIconPath = "";
	this.visualCueIconAlt = "";
};

OsList.ANI_TYPE_NO_ANIMATION = 0;
OsList.ANI_TYPE_ON_CLICK = 1;
OsList.ANI_TYPE_AUTO = 2;

OsList.prototype.invokeAnimation = function (type, args, me) {
	me.onLoad();
}

OsList.prototype.resetAnim = function (type, args, me) {
	if(me.aniType != OsList.ANI_TYPE_NO_ANIMATION) {
		me.displayItemIdx = 0;
		me.init();
		jQuery("#arrow"+me.id).hide();
	}
}

OsList.prototype.startAnimation = function () {
	this.init();
	this.onLoad();
}

OsList.prototype.init = function() {
	var divContainer = jQuery("#div_"+this.id);
	var divHeight = divContainer.height();
	if (OsList.ANI_TYPE_NO_ANIMATION != this.aniType) {
		for (var i = 0; i < this.items.length; i++) {
			var li = jQuery("#item"+this.id + i);
			var span = jQuery("#C"+this.id + "DESC" + (i + 1));
			li.hide();
			span.hide();
		}
		divContainer.removeAttr("style");
	}
	divContainer.height(divHeight);
	this.initialized = true;
}

OsList.prototype.onLoad = function() {
	if(this.aniType == OsList.ANI_TYPE_ON_CLICK) {
		//remove all listeners that were registered via addListener from this element
		YAHOO.util.Event.purgeElement(document.getElementById("C"+this.id), true);
		YAHOO.util.Event.addListener("C"+this.id, "click", this.onClick, this, true);
		//The first item should display immediately with no input from the user.
		//[Bug 37354 List Animation element should display first item on access].
		this.onClick();
	} else if (this.aniType == OsList.ANI_TYPE_AUTO) {
		this.autoDisplayItems();
	}
}

OsList.prototype.onClick = function(e) {
	if (this.displayItemIdx < this.items.length) {
		var item = this.items[this.displayItemIdx];
		item.listId = this.id;
		item.display(0);
		this.toggleVisualCue();
		this.displayItemIdx++;
	} else {
		YAHOO.util.Event.removeListener("C"+this.id, "click", this.onClick);
		this.items = null;
	}
}

OsList.prototype.autoDisplayItems = function() {
	for(var i = 0; i < this.items.length; i++) {
		this.items[i].listId = this.id;
		this.items[i].display(i*this.delay);	
	}
}

/**
 * The List element needs a visual cue to let the learner know more items are
 * available and where to click.  (This is only an issue when the author has
 * configured the element to advance on click rather than automatically).
 */
OsList.prototype.toggleVisualCue = function() {
	if (OsList.ANI_TYPE_ON_CLICK == this.aniType) {
		if(this.displayItemIdx == 0 && this.items.length > 1) {	
			var $arr = jQuery("#arrow"+this.id);
			if($arr.length == 0) {
				var imgContainer = document.createElement("div");
				imgContainer.className="visualCueContainer";
				var image = document.createElement("img");
				image.src= this.visualCueIconPath;
				image.alt= this.visualCueIconAlt;
				image.title= this.visualCueIconAlt;
				imgContainer.id = "arrow"+this.id;
				imgContainer.appendChild(image);
				document.getElementById("div_"+this.id).appendChild(imgContainer);
			} else {
				$arr.show();
			}
		} else if ((this.displayItemIdx == this.items.length-1)){
			jQuery("#arrow"+this.id).hide();			
		}
	}
}

OsList.CustomAnimations = {	
	"scaleie" : {percent: 1},
	"scale" : {percent: 10},
	"sizeie" : {from:{width:1,height:1}},
	"size" : {from:{width:10,height:10}}	
}

OsList.getCustomAniProps = function (animation) {
	if(navigator.userAgent.toLowerCase().indexOf("msie") > -1) {
		animation +="ie";
	}
	var props = OsList.CustomAnimations[animation];	
	return props;
}

OsListItem = function(id, trans, tranSpeed, opt) {	
	this.id = id;
	this.trans = trans;
	this.tranSpeed = tranSpeed;
	this.opt = jQuery.extend(true,{}, opt , OsList.getCustomAniProps(this.trans));	
	//The id of the list that this item belongs to.
	this.listId = "";
}
OsListItem.ID_PREFIX = "DESC";

OsListItem.prototype.display = function(delay) {
	var jItem = jQuery("#C"+this.listId+ OsListItem.ID_PREFIX + (this.id + 1));
	var li = jQuery("#item"+this.listId+ this.id);
	if (this.trans != "") {	
		setTimeout(function() {li.show()}, delay*1000);
		var anim = new de.Anim(jItem, this.trans, 1, delay*1000, this.tranSpeed, this.opt);
		anim.onComplete.subscribe(function(){jItem.removeAttr("style");});
		anim.animate();	
	} else {
		setTimeout(function(){li.show();jItem.show();}, delay*1000);
	}
}