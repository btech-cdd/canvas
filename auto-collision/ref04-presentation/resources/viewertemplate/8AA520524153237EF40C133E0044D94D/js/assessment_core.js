/*
 * Copyright (c) 2000, 2001 OutStart, Inc. All rights reserved.
 *
 * $Id: assessment_core.js,v 1.1.2.2.4.2 2011/09/14 16:18:17 achase Exp $
 */
 
AssessmentUI =
{
	currentPage:0,
	buttons:{},
	init:function()
	{
		AssessmentEngine.questionsPerPage = 1;
		AssessmentEngine.events.timerUpdated.subscribe(AssessmentUI.updateTimer);
		
		// initialize the buttons
		var btn, elm;
		for (var id in this.buttons)
		{
			btn = this.buttons[id];
			elm = jQuery("#btn"+id+" img");
			if (elm.length > 0)
			{
				elm.bind("mouseover", btn, function(e) { if (e.data.state) { this.src = e.data.on; }});
				elm.bind("mouseout", btn, function(e) { if (e.data.state) { this.src = e.data.off; }});
			}
		}

		// show first page
		this.page(1);
	},
	page:function(p)
	{
		var elms = jQuery(".page");

		if (!p)
		{
			var p = parseInt(jQuery("#pgctl").val());
			if (isNaN(p) || p < 1 || p > elms.length)
			{
				return;
			}
		}
		
		this.currentPage = p;
		AssessmentEngine.currentPage = p;
		
		for (var i=0; i<elms.length; i++)
		{
			if ((i+1)==p)
			{
				jQuery(elms[i]).css("visibility","visible");
			}
			else
			{
				jQuery(elms[i]).css("visibility","hidden");
			}
		}
		
		var unit = AssessmentUI.layout.getUnitById("content");
		jQuery(unit.body).scrollTop(0); // for Firefox
		jQuery("#content").scrollTop(0); // for IE
		
		jQuery("#curcnt").html(p);
		
		AssessmentUI.updateButton("back",(p != 1));
		AssessmentUI.updateButton("next",(p != elms.length));
	},
	addButton:function(cfg)
	{
		var btn = AssessmentUI.buttons[cfg.id] = cfg;
			btn.state = true;
	},
	updateButton:function(id,state,src)
	{
		var elm = jQuery("#btn"+id+" img");
		if (elm.length > 0)
		{
			var btn = AssessmentUI.buttons[id];
			if (btn != null)
			{
				btn.state = state;
				elm.attr("src", (state) ? btn.off : btn.disabled);
				elm.attr("alt", (state) ? btn.label : btn.disabled_label);
			}
		}
	},
	previous:function()
	{
		if ( this.currentPage > 1 )
		{
			this.page(this.currentPage-1);
		}
	},
	next:function()
	{
		var ae = AssessmentEngine;
		
		var pageCount = jQuery(".page").length;

		if ( this.currentPage != pageCount )
		{
			if ((!ae.assessment.allowSkipQuestions && !ae.assessment.allowBackwardsNavigation) && !ae.isPageCompleted(this.currentPage))
			{
				// not allowed to navigate backwards and not allowed to skip and the page has unanswered questions
				alert(ae.skippedNotAllowedMsg);
			}
			else
			{
				this.page(this.currentPage+1);
			}
		}
	},
	updateTimer : function()
	{
		if (AssessmentEngine.remaining > 0)
		{
			var elm = jQuery("#tmrval");
			if (elm.length > 0)
			{
				elm.html(AssessmentUI.formatDisplayTime(AssessmentEngine.remaining));
			}
		}
	},
	formatDisplayTime : function(r) 
	{
		var h = 0;
		var m = 0;
		var s = 0;
		
		if ( r < 60 ) 
		{
			s = r;
		}
		else if ( r < 3600 ) 
		{
			m = Math.floor(r / 60);
			s = (r - (m * 60));
		}
		else {
			h = Math.floor( r / 3600 );
			m = Math.floor(( r - (h * 3600)) / 60 );
			s = (r - ( h * 3600 ) - ( m * 60 ));
		}
		
		if (m < 10) m = "0"+m;
		if (s < 10) s = "0"+s;
		
		return h+":"+m+":"+s;
	},
	showLoading : function()
	{
		var cfg = 
		{ 
			fixedcenter:true, 
			close:false, 
			draggable:false, 
			modal:false,
			visible:true,
			width:"240px"
		}
		
		this.loading = new YAHOO.widget.Overlay("loading", cfg);
		this.loading.setBody("<div style=\"text-align:center;\"><img src=\""+this.loadingImage+"\"/></div>");
		this.loading.render(document.body);
	}
}
YAHOO.util.Event.addListener(window,"load",AssessmentUI.init,AssessmentUI,true);