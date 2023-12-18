/*!
  * Licensed Materials - Property of IBM
  * 5725N95, 5725P55, 5725N96
  * (C) Copyright IBM Corp. 1999, 2014.
  * US Government Users Restricted Rights- Use, duplication or disclosure
  * restricted by GSA ADP Schedule Contract with IBM Corp.
 */

 /* $Id: AssessmentEngine_exported.js,v 1.1.2.4.4.1.10.1.2.2 2016/12/21 15:44:42 skalwako Exp $ */
 
AssessmentEngine.score = function(e)
{
	if (this.state == AssessmentEngine.STATE_RUNNING)
	{
		// determine if we can score
		var scoreAllowed = false;
		if (e && e.type == "unload")
		{
			scoreAllowed = true;
		}
		else if (this.remaining == 0)
		{
			// time exceeded
			scoreAllowed = true;
		}
		else if (!this.isCompleted())
		{
			if (!this.assessment.allowSkipQuestions)
			{
				alert(this.skippedNotAllowedMsg);
			}
			else
			{
				scoreAllowed = (!this.warnOnSkipped || confirm(this.skippedWarningMsg));
			}
		}
		else
		{
			scoreAllowed = true;
		}
		
		if (scoreAllowed)
		{
			this.events.beforeScore.fire(this);
			
			this.state = AssessmentEngine.STATE_SCORED;
			
			for (var t in this.threads)
			{
				//this.threads[t].cancel();
				this.threads[t].resolve();
			}

			this.assessment.calculateScore();

			this.events.scoreComplete.fire(this.assessment);
		}
	}
	else if (this.state == AssessmentEngine.STATE_SCORED)
	{
		alert("Please wait, the assessment is being scored");
	}
}
AssessmentEngine.autoSave = function(data) {}
AssessmentEngine.save = function(data) {}