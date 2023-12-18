/*
 * $Id: Practice100.js,v 1.2.228.1.14.7.4.2.12.1 2011/02/10 19:31:38 achase Exp $
 */
function Practice100()
{
	this.chosenAnswers = null;
	this.correctAnswers = new Array();
	
	this.questionType = BaseAssessmentContent.QUESTION_TYPE_PRACTICE;
	
	return this;
}

Practice100.prototype = new Assessment100();

// get answers from form and populate chosen answer array
Practice100.prototype.collect = function( form )
{
	var ca = [];
	
	var field, checked;
	for (var i=0; i<this.answers.length; i++)
	{
		field = form["Answer"+this.contentID];
		checked = (field.length > 1) ? field[i].checked : field.checked;
		ca[(this.shuffled)?(this.shuffleOrder[i]-1):i] = (checked)?"Y":"N";
	}
	
	this.chosenAnswers = ca;
	
	return true;
}

Practice100.prototype.check = function()
{	
	// increment attempts
	this.attempts++;
	
	var feedback = [];
	var state = false;
	
    if (this.hasTriesRemaining())
	{
		GroupEngine.events.childAssessmentUpdated.fire();
		
		var score = this.score();

		state = (score.getScore() == 1);
		
		var a, idx, field, checked, img, alt;
        for (var i=0; i<this.answers.length; i++)
		{
			a = this.answers[(this.shuffled)?(this.shuffleOrder[i]-1):i];

            // this will not be an array if there is only one answer
            field = document["Question"+this.contentID+"Form"]["Answer"+this.contentID];
            checked = (field.length > 1) ? field[i].checked : field.checked;
			
			img = document.images["Img"+(i+1)+this.contentID];
			
			src = window["Blank"+this.contentID].src;
			alt = img.alt;

            if (checked)
            {
				feedback.push(a.feedback);
                src = (a.correct) ? window["CkMark"+this.contentID].src : window["XMark"+this.contentID].src;
                alt = (a.correct) ? window["CkMark"+this.contentID].alt : window["XMark"+this.contentID].alt;
            }
            else
            {
                //  answer not checked
                if (!a.correct)
                {
                    src = window["Blank"+this.contentID].src;
					alt = "";
                }
            }
			
			img.src = src;
            img.alt = alt;
            img.title = alt;
        }
		
        // that was the last try
        if (this.tries > 0 && this.attempts == this.tries) 
		{
            if (score.getScore() < 1) 
			{
				this.showAnswers();
			}
		}
		
		this.updateTries();
    } 

	// display feedback
	this.feedback(state,feedback);

    return false;
}

Practice100.prototype.showAnswers = function()
{
	var a, field, checked, src, img, alt;
    for (var i=0; i<this.answers.length; i++)
    {
        a = this.answers[(this.shuffled)?(this.shuffleOrder[i]-1):i];
		field = document["Question"+this.contentID+"Form"]["Answer"+this.contentID];

        checked = false;
        src = window["Blank"+this.contentID].src;
        alt = "";

        // a correct answer
        // show checkmark and check ckbox
        if (a.correct)
        {
            src = window["CkMark"+this.contentID].src;
            alt = window["CkMark"+this.contentID].alt;
            checked = true;
        }

		img = document.images["Img"+(i+1)+this.contentID];
        img.src = src;
        img.alt = alt;

        if (field.length > 0)
		{
            field[i].checked = checked;
		}
        else
		{
            field.checked = true;
		}
    }
}