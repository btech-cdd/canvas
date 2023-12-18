/*!
  * Licensed Materials - Property of IBM
  * 5725N95, 5725P55, 5725N96
  * (C) Copyright IBM Corp. 1999, 2014.
  * US Government Users Restricted Rights- Use, duplication or disclosure
  * restricted by GSA ADP Schedule Contract with IBM Corp.
 */

 /* $Id: slideshow.js,v 1.5.298.7.4.4.6.13.2.5 2015/12/11 14:44:14 jconnolly Exp $ */

// don't redefine this object if it already exists
if (typeof(SlideShowManager) == "undefined")
{
	SlideShowManager =
	{
		registry : [],
		add : function(ss)
		{
			this.registry[ss.id] = ss;
		},
		getById : function(id)
		{
			return this.registry[id];
		}
	}
}

SlideShowRT = function()
{
	this.id = "ss"+Math.random();
	SlideShowManager.add(this);

	this.contentId = 0;

	this.slideCnt = 0;
	this.currentSlide = 0;
	this.hasText = true;
	this.stackImages = false;

	this.autoPlay = false;
	this.autoPlayInterval = 0;
	this.autoTimeOutId = 0;

	this.anims = [];
	this.animationRegistry = [];
	
	this.textH = 0;
	this.textW = 0;
	
	this.fadeEnable = true;
	this.autoScaleTextStage = true;
}

SlideShowRT.prototype.invokeAnimation = function(type, args, me) {
	//invoke slide show animation here.
	me.init();
}

SlideShowRT.prototype.resetAnim = function(type, args, me) {
	me.currentSlide = 0;
	me.animationRegistry = [];
	jQuery("#bs_" + me.contentId + ">*").each(
		function(i) {
			var $a  = me.anims[i];
			var $this = jQuery(this);
			if($a && $a.effect != "") {
				$this.hide();
			} else {
				if(i == 0) {//show the first slide that has no animations applied.
					$this.addClass("slideshowactive");
				}
			}
		}
	);
	if(typeof (this.textOf) == 'undefined')
		{
		this.textOf = ' of ';
		}
	YAHOO.util.Dom.get("bc_"+me.contentId).innerHTML = (me.currentSlide+1)+this.textOf+ me.slideCnt;
}

SlideShowRT.prototype.init = function()
{
	// always autosize the text box in case the contents didn't fit	
	this.autoSizeText();
	if(this.autoScaleTextStage) this.autoSizeTextSlide(0);
	var realAnim = this.anims[0];	
	//When applying layout transition, we should not show the first slide image until the layout element invoke the slide to be shown.
	if(realAnim && realAnim.effect != '') {
		YAHOO.util.Dom.setStyle("C"+this.contentId+"IMAGE"+(this.currentSlide+1),"display", "none");
	}
	YAHOO.util.Dom.addClass("C"+this.contentId+"IMAGE"+(this.currentSlide+1),"slideshowactive");
	//show text for the first slide
	if (this.hasText){
		YAHOO.util.Dom.addClass("C"+this.contentId+"TEXT"+(this.currentSlide+1),"slideshowactive");
	}
	// animate first slide if present	
	if(realAnim) {
		this.registerAnimation(realAnim);
		//This is the first slide(index = 0)
		realAnim.animate();
	}		
		
	if (this.autoPlay) this.autoPlaySlides();
}
SlideShowRT.prototype.autoSizeTextSlide = function(index)
{
	var yd = YAHOO.util.Dom;	
	
	var h = this.textH;	
	
	var elm;
	var r;
	
	elm = yd.get("C"+this.contentId+"TEXT"+(index+1));
	if (elm != null)
	{
		r = yd.getRegion(elm);
		h = r.bottom-r.top;
			
	}		
	// set the base and areas to the calculated values
	var base = "bt_"+this.contentId;
	jQuery("#"+base).css("height",h);	
	var pos = yd.getXY(base);		
		
	elm = yd.get("C"+this.contentId+"TEXT"+(index+1));

	yd.setXY(elm,pos);
			
	jQuery(elm).css("height", h);
	
}
SlideShowRT.prototype.autoSizeText = function()
{
	var yd = YAHOO.util.Dom;
	
	var w = this.textW;
	var h = this.textH;
	var maxH = 0;
	var maxW = 0;
	
	// first pass determines the largest box
	var max = 0;
	var elm;
	var r;
	for (var i=0; i<this.slideCnt; i++)
	{
		elm = yd.get("C"+this.contentId+"TEXT"+(i+1));
		if (elm != null)
		{
			r = yd.getRegion(elm);
			if ((r.bottom-r.top)>maxH) 
			{
				maxH = r.bottom-r.top;
			}
			if ((r.right-r.left)>maxW) 
			{
				maxW = r.right-r.left;
			}
		}
	}
	max = maxH * maxW;
	// can't calculate if there are no text areas
	if (max > 0)
	{
		if ((this.textH == 0) && (this.textW == 0))
		{
			// make this into a square
			h = w = Math.ceil(Math.sqrt(max));
			
			// if the controls are in the middle make this into a rectangle with the width longer than the height
			if (this.ctrlPos == "middle")
			{
				h = h/2;
				w = w*2;
			}
		}
		else if (this.textH == 0)
		{
			h = (max/this.textW);
		}
		else 
		{
			if (this.textW == 0)
			{
				w = (max/this.textH);
			} 
			else 
			{
				if (h < maxH) h = maxH;
				if (w < maxW) w = maxW;
			}
		}
		
		// set the base and areas to the calculated values
		var base = "bt_"+this.contentId;
		var $b = jQuery("#" + base);
		$b.css("width", w);
		if(!this.autoScaleTextStage) {
			$b.css("height", h);
		}
		
		var pos = yd.getXY(base), $elm;
		
		for (var i=0; i<this.slideCnt; i++)
		{
			elm = yd.get("C"+this.contentId+"TEXT"+(i+1));

			yd.setXY(elm,pos);
			$elm = jQuery(elm).css("width", w);
			if(!this.autoScaleTextStage) {
				$elm.css("height", h);
			}
		}
		
		// make one more pass to adjust the final box to the size of the largest text box
		// this is necessary because the text won't always fit the calculated area because
		// of wrapping, etc

		var maxR = null;
		for (var i=0; i<this.slideCnt; i++)
		{
			elm = yd.get("C"+this.contentId+"TEXT"+(i+1));
			r = yd.getRegion(elm);
			if ((maxR == null) || (r.getArea() > maxR.getArea()))
			{
				maxR = r;
			}
		}
		if (maxR != null)
		{
			$b.css("width", (maxR.right-maxR.left));
			if(!this.autoScaleTextStage){
				$b.css("height", (maxR.bottom-maxR.top));
			}
		}
	}
}
SlideShowRT.prototype.autoPlaySlides = function()
{
	// do not autoplay if only one slide
	if (this.slideCnt > 1)
	{
		// stop if on the last slide
		if (this.currentSlide == (this.slideCnt -1))
			this.stopAutoSlide();

		if (this.autoPlay)
			this.autoTimeOutId = setTimeout("var slide = SlideShowManager.getById('"+this.id+"'); if (slide) { slide.callNextSlide(); }",this.autoPlayInterval*1000);
	}
}
SlideShowRT.prototype.callNextSlide = function(override)
{
	var audioContainer = document.getElementById("embededPlayer"+this.contentId+"_"+this.currentSlide);
	if(override || !(audioContainer && audioContainer.firstChild && audioContainer.firstChild.tagName.toUpperCase() == "AUDIO" && audioContainer.firstChild.waitForAudio))
		this.nextSlide();
    if (this.autoPlay) this.autoPlaySlides();
}
SlideShowRT.prototype.stopAutoSlide = function()
{
    if (this.autoPlay)
    {
        // stop after one loop
        this.autoPlay = false;
        clearTimeout(this.autoTimeOutId);
    }
}
SlideShowRT.prototype.firstSlide = function()
{
	if ((this.slideCnt <= 1) || this.isSlideShowBusy() || (this.currentSlide == 0))
		return;

    if (this.stackImages)
    {
        for (var i = 1; i < this.slideCnt; i++)
            this.hideSlides(i, true);
    }
    else
    {
        this.hideSlides(this.currentSlide);
    }

    this.currentSlide = 0;                 // set to first slide
    this.buildSlides(this.currentSlide);
    this.toggleButtons();
}
SlideShowRT.prototype.previousSlide = function()
{
	if ((this.slideCnt <= 1) || (this.currentSlide == 0) || this.isSlideShowBusy())
		return;

    this.hideSlides(this.currentSlide, true);
    this.currentSlide--;
    this.buildSlides(this.currentSlide);
    
    this.toggleButtons();
}
SlideShowRT.prototype.toggleButtons = function(){
	if (typeof CONTROL_BUTTON_MAP !== 'undefined'){
		for (var i = CONTROL_BUTTON_MAP.length-1; i >= 0; i--){
			var buttonObject = CONTROL_BUTTON_MAP[i];
			//Get the disabled_condition
			if (typeof buttonObject.disabled_condition !== 'undefined'){
				var buttonElement = jQuery("#a" + buttonObject.id + this.contentId);
				var isDisabled = false;
				
				//Calculate the disabled condition
				if (buttonObject.disabled_condition === 'first'){
					isDisabled = (this.currentSlide == 0);
				}
				else if (buttonObject.disabled_condition === 'last'){
					isDisabled = (this.currentSlide == (this.slideCnt -1));
				}
				
				if (isDisabled){
					//disable button
					swapImage(buttonObject.id + this.contentId, buttonObject.disabled);
					document.images[buttonObject.id + this.contentId].alt = buttonObject.disabled.alt;
					buttonElement.css({cursor:"default"});
					 	 
					//unbind events
					buttonElement.unbind('mouseover');
					buttonElement.unbind('mouseout');
					//remove the mouseover/mouseout set by setOnMouseOver on Last button
					buttonElement.removeAttr('onmouseover');
					buttonElement.removeAttr('onmouseout');
				}
				else
				{			
					//enable button
					swapImage(buttonObject.id + this.contentId, buttonObject.off);
					document.images[buttonObject.id + this.contentId].alt = buttonObject.on.alt;
					buttonElement.css({cursor:"pointer"});
				 
					//bind events
					buttonElement.bind('mouseover',function (fButtonId, fButtonImage){ return function(){swapImage(fButtonId, fButtonImage);return false;}}(buttonObject.id + this.contentId,buttonObject.on));
					buttonElement.bind('mouseout', function (fButtonId, fButtonImage){ return function(){swapImage(fButtonId, fButtonImage);return false;}}(buttonObject.id + this.contentId,buttonObject.off));
				}
			}
		}
	}
}
SlideShowRT.prototype.nextSlide = function()
{
	if ((this.slideCnt <= 1) || this.isSlideShowBusy()) return;

    if ((this.stackImages) && (this.currentSlide == (this.slideCnt - 1)))
    {
        this.firstSlide();
        return;
    }

    this.hideSlides(this.currentSlide);

    if (this.currentSlide == (this.slideCnt - 1))
    {
        // == last slide
        //return to first slide
        this.currentSlide = 0;
    }
    else
    {
        this.currentSlide++;
    }

    this.buildSlides(this.currentSlide);
    this.toggleButtons();
}
SlideShowRT.prototype.lastSlide = function()
{
	if ((this.slideCnt <= 1) || this.isSlideShowBusy() || (this.currentSlide == (this.slideCnt-1)))
		return;

    this.hideSlides(this.currentSlide);
    this.currentSlide = (this.slideCnt - 1);

    if (this.stackImages)
    {
        for (var i = 0; i < this.slideCnt; i++)
            this.buildSlides(i);

        for (var i = 0; i < (this.slideCnt-1); i++)
            this.hideSlides(i);
    }
    else
    {
        this.buildSlides(this.currentSlide);
    }
    this.toggleButtons();
}

SlideShowRT.prototype.fadeOutHandler = function()
{
	YAHOO.util.Dom.removeClass(this.getEl(),"slideshowactive");
}

SlideShowRT.prototype.fadeInHandler = function()
{
	// remove the opacity filter to prevent jagged text in IE
	var el = this.getEl();
	for (var i=0; i<el.length; i++)
	{
		if (jQuery(el[i]).css("filter"))
		{
			el[i].style.removeAttribute("filter");
		}
	}
}

SlideShowRT.prototype.isSlideShowBusy = function()
{
	this.maintainAnimationRegistry();
	return (this.animationRegistry.length > 0);
}

SlideShowRT.prototype.registerAnimation = function(animation)
{
	this.animationRegistry.push(animation);
}

SlideShowRT.prototype.maintainAnimationRegistry = function(animation)
{
	var updated = [];
	for (var i=0; i<this.animationRegistry.length; i++)
	{
		if (this.animationRegistry[i].isAnimated())
			updated.push(this.animationRegistry[i]);
	}
	this.animationRegistry = updated;
}

SlideShowRT.prototype.hideSlides = function(slideIdx, force)
{
	var elements = [];

	if ((!this.stackImages) || (force))
		elements.push("C"+this.contentId+"IMAGE"+(slideIdx+1));

	if (this.hasText)
		elements.push("C"+this.contentId+"TEXT"+(slideIdx+1));
	
	var realAnim = this.anims[slideIdx]; 	
		
	if((!realAnim || realAnim.effect === 'fade' ) && this.fadeEnable) {
		var anim = new YAHOO.util.Anim(elements,{opacity:{to:0,from:1}});	
		anim.onComplete.subscribe(this.fadeOutHandler);
		this.registerAnimation(anim);
		anim.animate();
	} else {		
		YAHOO.util.Dom.removeClass(elements,"slideshowactive");
		if(realAnim) {
			realAnim.hide();
		}
	}	
	
	return true;
}

SlideShowRT.prototype.buildSlides = function(slideIdx)
{
	var realAnim = this.anims[slideIdx]; 
	
	//set global
	this.currentSlide = slideIdx;
	if(this.autoScaleTextStage) this.autoSizeTextSlide(slideIdx);
	
	var elements = [];
	elements.push("C"+this.contentId+"IMAGE"+(slideIdx+1));

	if (this.hasText)
		elements.push("C"+this.contentId+"TEXT"+(this.currentSlide+1));
//alert("buildSlides"+realAnim.effect);
	if((!realAnim || realAnim.effect === 'fade' ) && this.fadeEnable) {
		YAHOO.util.Dom.setStyle(elements, 'opacity', 0);
		YAHOO.util.Dom.addClass(elements,"slideshowactive");	
		var anim = new YAHOO.util.Anim(elements,{opacity:{to:1,from:0}});	
		anim.onComplete.subscribe(this.fadeInHandler);
		this.registerAnimation(anim);
		anim.animate();
		//#50741 Fixed audio only plays on one slide of the slideshow
		realAnim.setAudioObjId("embededPlayer"+this.contentId+"_"+slideIdx);
		realAnim.animate();
	} else {
		YAHOO.util.Dom.addClass(elements,"slideshowactive");
	if(realAnim) {		
		this.registerAnimation(realAnim);
		realAnim.animate();
	}		
	}
			
	
	YAHOO.util.Dom.get("bc_"+this.contentId).innerHTML = (this.currentSlide+1)+this.textOf+this.slideCnt;

    return true;
}
SlideShowRT.soundEndedCallback = function(obj) //static function
{
	clearTimeout(obj.autoTimeOutId);
	obj.callNextSlide(true);
}
//CONTROL IMAGE SWAP
function swapImage(name,image)
{
    document.images[name].src = image.src;
}