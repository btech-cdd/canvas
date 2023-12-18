GroupEngine = {
	remaining : 0,
	threads : {}, 
	counter : 0, 
	data_exchange : null, 
	events : {
		"timerUpdated" : new YAHOO.util.CustomEvent("timerUpdated"),
		"childAssessmentUpdated" : new YAHOO.util.CustomEvent("childAssessmentUpdated")
	},
	vc : null, 
	init : function()
	{
		this.vc = ObjectFinder.search(window, "ViewerController");
		//vc.events.navigate.subscribe(this.checkTimeLeft,this,true);
		
/*		if(!this.vc.events.timeout)
			this.vc.events.timeout = new YAHOO.util.CustomEvent("timeout");*/

		if (this.remaining == -1)
		{
			this.remaining = (this.assessment.duration * 60)+1;
		}
		
		this.threads.timer = YAHOO.lang.later(1000, GroupEngine, GroupEngine._timerUpdate, null, true);
		this.events.childAssessmentUpdated.subscribe(this.updateChildAssessment,this,true);
	}, 
	
	updateChildAssessment : function()
	{
		GroupEngine.numChildAssessments --;
		if (GroupEngine.numChildAssessments < 1) {
			this.vc.events.timeout.fire(this.numChildAssessments);
		}
	},
	
	_timerUpdate : function() {
		this.counter++;		
		if (this.remaining == 0) {
			//this.threads.timer.cancel();
			//trigger event
			this.remaining = -1;
			if(this.vc.events.timeout && this.numChildAssessments == 0)
				this.vc.events.timeout.fire(this.remaining);
			
			return;
		}
		else if(this.remaining == -1){
			return;
		}
		else{
			this.remaining--;
			this.events.timerUpdated.fire(this.remaining);
		}
		
	}
	
	
}

YAHOO.util.Event.addListener(window,"load",GroupEngine.init, GroupEngine,true);