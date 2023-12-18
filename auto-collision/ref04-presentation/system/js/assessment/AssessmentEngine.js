/*!
  * Licensed Materials - Property of IBM
  * 5725N95, 5725P55, 5725N96
  * (C) Copyright IBM Corp. 1999, 2014.
  * US Government Users Restricted Rights- Use, duplication or disclosure
  * restricted by GSA ADP Schedule Contract with IBM Corp.
 */

 /* $Id: AssessmentEngine.js,v 1.1.4.18.4.1.10.5.2.5 2016/12/21 15:44:03 skalwako Exp $ */
 
AssessmentEngine =
{
	assessment : null,
	instanceId : null,
	allowSkip : false,
	saveEnabled : false,
	remMap : [],
	remTypes : [1],
	remState : [],
	MSG_NO_REMEDIATION_AVAILABLE : "Not available",
	autoSaveInterval : 10000,
	savedMap : {},
	state : 0,
	STATE_RUNNING : 0,
	STATE_SCORED : 1,
	STATE_ERROR : 2,
	STATE_SCORE_ERROR : 3,
	remaining : -1,
	threads : {},
	closeMsg : "",
	currentPage : 1,
	msgElm : null,
	showPrint : true,
	showClose : true,
	autoScore : true,
	events :
	{
		"loaded" : new YAHOO.util.CustomEvent("loaded"),
		"timerUpdated" : new YAHOO.util.CustomEvent("timerUpdated"),
		"beforeScore" : new YAHOO.util.CustomEvent("beforeScore"),
		"scoreComplete" : new YAHOO.util.CustomEvent("scoreComplete"),
		"beforeSave" : new YAHOO.util.CustomEvent("beforeSave"),
		"message" : new YAHOO.util.CustomEvent("message")
	},
	init : function()
	{
		// autosave immediately and start the autosave thread
		AssessmentEngine.autoSave();
		
		var tdfds = jQuery.Deferred();
			tdfds.progress(AssessmentEngine.autoSave);
			var interval = setInterval(function() {
			    tdfds.notifyWith(AssessmentEngine );
			  },this.autoSaveInterval);
			tdfds.done(function(){clearInterval(interval)});
			this.threads.save = tdfds; 
		
		//this.threads.save = YAHOO.lang.later(this.autoSaveInterval, AssessmentEngine, AssessmentEngine.autoSave, null, true);
		
		if (this.assessment.duration > 0)
		{
			if (this.remaining == -1)
			{
				this.remaining = (this.assessment.duration * 60)+1;
			}
			var tdfd = jQuery.Deferred();
			tdfd.progress(AssessmentEngine._timerUpdate);
			var interval = setInterval(function() {
			    tdfd.notifyWith(AssessmentEngine );
			  },1000);
			tdfd.done(function(){clearInterval(interval)});
			this.threads.timer = tdfd; 
			//this.threads.timer = YAHOO.lang.later(1000, AssessmentEngine, AssessmentEngine._timerUpdate, null, true);
		}
		
		var questions = this.assessment.getQuestions();
		for (var i=0; i<questions.length; i++)
		{
			if (questions[i].answerString != null)
			{
				questions[i].restore();
			}
		}
		
		if (typeof(DeliveryReview) != "undefined")
		{
			// do not allow the page to be reloaded when a review comment is added
			DeliveryReview.events.comment_added.subscribe(function(){return false;});
		}
		
		this.events.loaded.fire(this);
		
		var delObj = OSDeliveryEngine.getObjectByUniqueId(this.uniqueId);
		OSDeliveryEngine.events.load.fire(delObj);
	},
	finalize : function(e)
	{
		if (this.state == AssessmentEngine.STATE_RUNNING)
		{
			if (this.saveEnabled)
			{
				if (confirm(this.closeMsg))
				{
					this.score(e);
				}
				else
				{
					this.save();
				}
			}
			else
			{
				this.score(e);
			}
		}
	},
	_timerUpdate : function()
	{
		this.remaining--;
		this.events.timerUpdated.fire(this.remaining);

		if (this.remaining == 0)
		{
			this.threads.timer.resolve();
			//this.threads.timer.cancel();
			this.score();
		}
	},
	_appendQuestionData : function(data)
	{
		var cnt = 0;
		var children = this.assessment.getChildren();
		var questions, q, id, answers;

		questions = this.assessment.getQuestions();
		for (var j=0; j<questions.length; j++)
		{
			q = questions[j];
			q.collect(document.forms[q.getFormName()]);

			answers = q.toAnswerString();

			id = q.sectionID+q.contentID;

			if ((this.savedMap[id] == null) || (!this.compareQuestionState(this.savedMap[id],q)))
			{
				this.savedMap[id] = {};

				//data[id] = this.savedMap[id].answers = answers;
				data[id] = answers;

				if (q.getShuffled())
				{
					data[id+"ShuffleOrder"] = q.getShuffleOrder().join(",");
				}
				
				if (q.hasTrackingData())
				{
					//data[id+"TrackingData"] = this.savedMap[id].tracking = q.getTrackingData();
					data[id+"TrackingData"] = q.getTrackingData();
				}

				cnt++;
			}
		}

		return cnt;
	},
	_saveQuestionDataFromData : function(data)
	{
		var cnt = 0;
		var children = this.assessment.getChildren();
		var questions, q, id, answers;

		questions = this.assessment.getQuestions();
		for (var j=0; j<questions.length; j++)
		{
			q = questions[j];
			q.collect(document.forms[q.getFormName()]);

			id = q.sectionID+q.contentID;
			if (data[id]!=null)
			{
				answers = data[id];

				if (this.savedMap[id] == null)
					this.savedMap[id] = {};

				this.savedMap[id].answers = answers;
			}
		};
	},
	compareQuestionState : function(saved,current)
	{
		var c = this.compareAnswers(saved.answers,current.toAnswerString());
		if (c && current.hasTrackingData())
		{
			c = (current.getTrackingData() == saved.tracking);
		}
		return c;
	},
	compareAnswers : function(a,b)
	{
		var c = false;
		if (a != b)
		{
			if ((jQuery.isArray(a)) && jQuery.isArray(b))
			{
				if (a.length == b.length)
				{
					c = true
					for (var i=0; i<a.length && c; i++)
					{
						c = (a[i] == b[i]);
					}
				}
			}
		}
		else
		{
			c = true;
		}
		return c;
	},
	getQuestionsByPage : function(page)
	{
		var qList = [];

		var questions = this.assessment.getQuestions();

		var start = ((page-1)*this.questionsPerPage);

		var end = ((start+this.questionsPerPage)-1);
		if (end > (questions.length - 1))
		{
			end = (questions.length -1);
		}
		
		for (var i=start; i<=end; i++)
		{
			qList.push(questions[i]);
		}
		
		return qList;
	},
	isCompleted : function()
	{
		var c = true;
		var q = this.assessment.getQuestions();
		for (var i=0; i<q.length && c; i++)
		{
			c = q[i].isAnswered();
		}
		return c;
	},
	isPageCompleted : function(page)
	{
		var c = true;
		var q = this.getQuestionsByPage(page);
		for (var i=0; i<q.length && c; i++)
		{
			c = q[i].isAnswered();
		}
		return c;
	},
	showMessage : function(msg,allowClose,callback)
	{
		if (this.events.message.fire(msg))
		{
			var dlgMsg = msg;
			if (allowClose)
			{
				dlgMsg += "<p class=\"dlgClose\"><a href=\"#\" onclick=\"AssessmentEngine.hideMessage(); return false;\">"+this.closeDialogMessage+"</p>";
			}

			if (this.msgElm == null)
			{
				var yd = YAHOO.util.Dom;

				if (!yd.hasClass(document.body,"yui-skin-sam"))
				{
					yd.addClass(document.body,"yui-skin-sam");
				}

				var p = this.msgElm = new YAHOO.widget.Panel("comm-msg", { width:"400px", fixedcenter:true, constraintoviewport:true, modal:true, close:false } );
				p.setBody(dlgMsg);
				p.render(document.body);
			}
			else
			{
				this.msgElm.setBody(dlgMsg);
				this.msgElm.show();
			}
			
			if (callback != null)
			{
				this.msgElm.hideEvent.subscribe(callback);
			}
		}
	},
	hideMessage : function()
	{
		if (this.msgElm != null)
		{
			this.msgElm.hide();
		}
	},
	windowClose : function(e)
	{
		if ((this.state == AssessmentEngine.STATE_RUNNING) && this.showWindowCloseWarning)
		{
			e.returnValue = AssessmentEngine.closeMsg;
			return AssessmentEngine.closeMsg;
		}
	},
	pauseOnError : function()
	{
		this.state = AssessmentEngine.STATE_ERROR;

		this.threads.timer.resolve();
		//this.threads.timer.cancel();
		
	},
	resumeAfterError : function()
	{
		if (this.state == AssessmentEngine.STATE_ERROR)
		{
			this.state = AssessmentEngine.STATE_RUNNING;
			//this.threads.timer.cancel();
			this.threads.timer.resolve();
			var tdfd = jQuery.Deferred();
			tdfd.progress(AssessmentEngine._timerUpdate);
			var interval = setInterval(function() {
			    tdfd.notifyWith(AssessmentEngine );
			  },1000);
			tdfd.done(function(){clearInterval(interval)});
			this.threads.timer = tdfd; 
			//this.threads.timer = YAHOO.lang.later(1000, AssessmentEngine, AssessmentEngine._timerUpdate, null, true);
			
			this.hideMessage();
		}
	}
}
YAHOO.util.Event.addListener(window,"load",AssessmentEngine.init, AssessmentEngine,true);
YAHOO.util.Event.addListener(window,"unload",AssessmentEngine.finalize, AssessmentEngine,true);
YAHOO.util.Event.addListener(window,"beforeunload",AssessmentEngine.windowClose, AssessmentEngine,true);