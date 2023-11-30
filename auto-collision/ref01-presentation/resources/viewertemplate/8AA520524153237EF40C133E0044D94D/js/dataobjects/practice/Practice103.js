/*
 * $Id: Practice103.js,v 1.3.222.3.12.7.4.1.10.4 2012/09/07 06:36:40 tamle Exp $
 */
function Practice103()
{
	this.chosenAnswers 	= null;
	this.correctAnswers = new Array();
	
	this.questionType = BaseAssessmentContent.QUESTION_TYPE_PRACTICE;
	
	this.answers = [];

	return this;
}

Practice103.prototype = new Assessment103();

Practice103.prototype.check = function() 
{
	this.attempts++;
	
	var feedback = [];
	var state = false;

    if (this.hasTriesRemaining())
	{
		GroupEngine.events.childAssessmentUpdated.fire();
		var score = this.score();
		
		state = (score.getScore() == 1);

		// assemble feedback for correct answers
		var a;
		for (var i=0; i<this.answers.length; i++)
		{
			a = this.answers[i];
			if (a.correct)
			{
				feedback.push(a.feedback);
			}
		}
		
        // update tries
		if (this.tries > 0)
		{
		    if (this.attempts >= this.tries) 
			{
				// disable fields
				var f = document["Question"+this.contentID+"Form"];
				// Duc Issue #29431 - get Question by ID				
				var question = window["question"+this.contentID];
	            for (var i=0; i<question.numAnswers; i++)
	            {
	            	f["Answer"+i+""+this.contentID].readOnly = true;
	            }
				
				this.showAnswers();
			}
			
			this.updateTries();
		}
	}
	
	this.feedback(state,feedback);
}