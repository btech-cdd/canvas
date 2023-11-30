/*!
 * IBM Confidential
 * OCO Source Materials
 * 5725N95, 5725P55, 5725N96
 * (C) Copyright IBM Corp. 1999, 2014
 * The source code for this program is not published or otherwise
 * divested of its trade secrets, irrespective of what has been
 * deposited with the U.S. Copyright Office.
 */

 /* $Id: BaseAssessmentContent_practice.js,v 1.1.2.7.24.5.16.9 2016/04/14 08:34:02 valubell Exp $ */
 
BaseAssessmentContent.buildRemediationHTML = function(cfg)
{
	var s = [];
	
	if (cfg.messages)
	{
		s.push("<ul class=\"remediation_message\">");
		for (var i=0; i<cfg.messages.length; i++)
		{
			s.push("<li>"+cfg.messages[i]+"</li>");
		}
		s.push("</ul>");
	}
	
	if (cfg.feedback)
	{
		s.push("<hr width=\"80%\"></hr>");
		s.push("<ul class=\"remediation_feedback\">");

		for (var i=0; i<cfg.feedback.length; i++)
			s.push("<li>"+cfg.feedback[i]+"</li>");
			
		s.push("</ul>");
	}
	
	if (cfg.links) {
		s.push("<hr width=\"80%\"></hr>");
		s.push("<div class=\"remediation_links_header\">"+moreInfoText+"</div>");
		s.push("<ul class=\"remediation_links\">");

		for (var i=0; i<cfg.links.length; i++)
			s.push("<li>"+cfg.links[i]+"</li>");

		s.push("</ul>");
	}
	if (cfg.answerLinks) {
		s.push("<hr width=\"80%\"></hr>");
		s.push("<ul class=\"remediation_links\">");

		for (var i=0; i<cfg.answerLinks.length; i++)
			s.push("<li>"+cfg.answerLinks[i]+"</li>");

		s.push("</ul>");
	}
	
	return s.join("");
}
BaseAssessmentContent.getValidRemediation = function(list)
{
	var v = [];
	if (list)
	{
		for (var i=0; i<list.length; i++)
		{
			if ((list[i] != null) && (list[i] != "") && (list[i] != "null"))
			{
				v.push(list[i]);
			}
		}
	}
	return v;
}
BaseAssessmentContent.prototype.addRemediation = function(rc, state)
{
	// get the chosen answer
	for (var i = 0; i < this.chosenAnswers.length; i++) {
		if ("Y" == this.chosenAnswers[i]) {
			rc.answerLinks = this.getAnswerLinks(this.answers[i].links);
			if (this.answers[i].auto) {
				rc.answerAutoLinks = this.answers[i].auto;
			}
			break;
		}
	}
	
	if (state)
	{
		// correct remediation messages
		for (var i=0; i<this.remediation.correct.length; i++)
			rc.messages.push(this.remediation.correct[i]);
		
		// always remediation messages	
		for (var i=0; i<this.remediation.always.length; i++)
			rc.messages.push(this.remediation.always[i]);
			
		rc.links = this.getFeedbackLinks(2);
		rc.auto = this.getAutomaticLink(true);
	}
	else if (this.attempts == this.tries)
	{
		// incorrect remediation messages
		for (var i=0; i<this.remediation.incorrect.length; i++)
			rc.messages.push(this.remediation.incorrect[i]);
		
		// always remediation messages	
		for (var i=0; i<this.remediation.always.length; i++)
			rc.messages.push(this.remediation.always[i]);
			
		rc.links = this.getFeedbackLinks(3);
		rc.auto = this.getAutomaticLink(false);
	}
}
BaseAssessmentContent.prototype.feedback = function(state,feedback) 
{
	var id = this.contentID;

	// the remediation configuration object
	var rc = 
	{
		"messages":[],
		"feedback":[],
		"links":[],
		"answerLinks":[]
	};

	rc.state = state;
    if ((this.tries != 0) && (this.attempts > this.tries))
    {
		rc.messages.push(ExceedTriesText);
    }
    else
	{
		rc.feedback = feedback;
		
		if (state || (this.tries > 0 && (this.attempts == this.tries)))
		{
			this.addRemediation(rc, state);
		}
		else
		{
			rc.messages.push(tryAgainText);
		}
    }
	
    this.showFeedback(rc);
}
BaseAssessmentContent.prototype.showFeedback = function(cfg) 
{
	var FeedbackTitle = cfg.feedbackTitle || window.FeedbackTitle || "Answer Feedback";
	// check to see if there is anything to show
	var validated = {};
	var properties = ["messages","feedback","links","answerLinks"];
	var cnt = 0;
	var name, list;
	for (var i=0; i<properties.length; i++)
	{
		name = properties[i];
		list = BaseAssessmentContent.getValidRemediation(cfg[name]);
		if (list.length > 0)
		{
			validated[name] = list;
			cnt += 1;
		}
	}
	
	validated.auto = cfg.auto;
	validated.answerAutoLinks = cfg.answerAutoLinks;
	validated.state = cfg.state;
	
	if (cnt > 0)
	{
		if (OSDeliveryEngine.events.feedback.fire(validated))
		{
			if (validated.answerAutoLinks) {
				eval("(function() { "+validated.answerAutoLinks.onclick+"})()");
			} else {
				if (validated.answerLinks) {
					this.showPanel(FeedbackTitle,BaseAssessmentContent.buildRemediationHTML(validated));
				} else {
					if (!validated.auto)
					{
						this.showPanel(FeedbackTitle,BaseAssessmentContent.buildRemediationHTML(validated));
					}
					else
					{
						var link = validated.auto.link;

						if (validated.auto.showFeedback)
						{
							var p = this.showPanel(FeedbackTitle,BaseAssessmentContent.buildRemediationHTML(validated));

							var fn = function()
							{
								if (link.onclick)
								{
									eval("(function() { "+link.onclick+"})()");
								}
								else
								{
									window.location.href = link.href;
								}
							}

							p.hideEvent.subscribe(fn);
						}
						else
						{
							eval("(function() { "+link.onclick+"})()");
						}
					}
				}
			}
		}
	}
}
BaseAssessmentContent.prototype.showHint = function() 
{
	this.hintIdx++;
	var text = this.hints[(this.hintIdx-1)] || NoHintsText;
	if (OSDeliveryEngine.events.hint.fire(text))
	{
		this.showPanel(sHint,text);
	}
}
BaseAssessmentContent.prototype.showPanel = function(hd,bd,raw)
{
	var yd = YAHOO.util.Dom;
	if (!yd.hasClass(document.body,"yui-skin-sam"))
	{
		yd.addClass(document.body,"yui-skin-sam");
	}
	
	if (!this.panel)
	{
		var data = OSDeliveryEngine.configuration.feedbackPanel;
		data['visible'] = false;
		this.panel = new YAHOO.widget.Panel("p"+this.contentID, data );
		this.panel.setHeader("<span class=\"remediation_title\">"+hd+"</span>");
		this.panel.setBody(bd);		
		// enter or esc should close the panel
		this.panel.cfg.queueProperty("keylisteners",new YAHOO.util.KeyListener(this.panel, { keys:[13,27]}, { fn:this.panel.hide, scope:this.panel, correctScope:true }));

		this.panel.render(document.body);
		
		//YAHOO.util.Event.removeListener(this.panel.close, "click"); 
		//YAHOO.util.Event.on(this.panel.close, "click", function(e){YAHOO.util.Event.stopEvent(e);this.panel.hide();document.getElementsByName("Check"+this.contentID)[0].focus();return false;}, this, true);
					
		yd.addClass(this.panel.element,"remediation");
	}
	else
	{
		this.panel.setHeader("<span class=\"remediation_title\">"+hd+"</span>");
		this.panel.setBody(bd);
	}
	
	this.panel.focusFirst();
	this.panel.show();
	
	return this.panel;
}
BaseAssessmentContent.prototype.getFeedbackLinks = function(display) 
{
	var links = [];
	if (this.links)
	{
		var l;
		for (var i=0; i<this.links.length; i++)
		{
			l = this.links[i];
			if ((l.display == 1) || (l.display == display))
			{
				if ((l.target != null) && (l.target != ""))
				{
					links.push(l.target);
				}
			}
		}
	}
	return links;
}
BaseAssessmentContent.prototype.getAnswerLinks = function(answerLinks) 
{
	var links = [];
	var l;
	if (answerLinks) {
		for (var i = 0; i < answerLinks.length; i++) {
			l = answerLinks[i];
			if ((l.target != null) && (l.target != "")) {
				links.push(l.target);
			}
		}
	}
	return links;
}
BaseAssessmentContent.prototype.getAutomaticLink = function(state)
{
	var auto = null;
	if (this.auto)
	{
		var name = (state) ? "correct" : "incorrect";
		if (this.auto[name])
		{
			auto = {};
			auto.showFeedback = this.auto.fbk;
			auto.link = this.auto[name];
		}
	}
	return auto;
}
BaseAssessmentContent.prototype.hasTriesRemaining = function() 
{
	return (this.tries == 0 || (this.attempts <= this.tries));
}
BaseAssessmentContent.prototype.updateTries = function()
{
	// update tries
	if (this.tries > 0)
	{
		YAHOO.util.Dom.get("div_Tries"+this.contentID).innerHTML = TriesText+(this.tries-this.attempts);
	}
}