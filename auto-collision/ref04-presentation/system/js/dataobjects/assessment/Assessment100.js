/*!
 * IBM Confidential
 * OCO Source Materials
 * 5725N95, 5725P55, 5725N96
 * (C) Copyright IBM Corp. 1999, 2014
 * The source code for this program is not published or otherwise
 * divested of its trade secrets, irrespective of what has been
 * deposited with the U.S. Copyright Office.
 */

 /* $Id: Assessment100.js,v 1.4.300.9.4.1.8.3.16.1 2014/01/07 09:52:35 phuocdang Exp $ */
 
function Assessment100()
{
	this.numAnswers = 0;
	this.shuffled = false;
	this.chosenAnswers = null;
	this.answers = null;
	this.type = 100;
	this.events=
	{
		"restore" : new YAHOO.util.CustomEvent("restore")
	};
	return this;
}

Assessment100.prototype = new BaseAssessmentContent();

Assessment100.RESPONSE_CODES = "abcdefghijklmnopqrstuvwxyz";

Assessment100.prototype.init = function()
{
	if (this.answers == null) this.answers = [];
	
	var form = document.forms[this.getFormName()];
	for (var i=0; i<this.answers.length; i++)
	{
		YAHOO.util.Event.addListener("Answer"+i+this.contentID,"click",this.touch,this,true);
	}
}

Assessment100.prototype.showAnswers = function()
{
	var form = document.forms[this.getFormName()];
	var shuffleArray = this.getShuffleOrder();
	var numAnswersInForm=this.getNumberAnswersInForm(form,this.contentID);
	for (var i=0; i<numAnswersInForm; i++)
	{
		form["Answer"+i+this.contentID].checked = this.answers[shuffleArray[i]-1].correct;
	}
	
}

Assessment100.prototype.getLearnerResponseString = function()
{
	var lr = "";
	if (this.contentTypeID == 100)
	{
		// for true/false questions the first answer is always the "true" option
		lr = (this.chosenAnswers[0] == "Y") ? "true" : "false";
	}
	else
	{
		if (this.chosenAnswers != null && this.chosenAnswers.length > 0 )
		{
			var c = [];
			for (var i=0; i<this.chosenAnswers.length; i++)
			{
				if (this.chosenAnswers[i] == "Y")
				{
					c.push(Assessment100.RESPONSE_CODES.charAt(i));
				}
			}
			lr = c.join(BaseAssessmentContent.DELIMETER);
		}
	}
	return lr;
}

Assessment100.prototype.getCorrectResponses = function()
{
	var cr = [];
	if (this.contentTypeID == 100)
	{
		// for true/false questions the first answer is always the "true" option
		cr.push((this.answers[0].correct) ? "true" : "false");
	}
	else
	{
		var c = [];
		for (var i=0; i<this.answers.length; i++)
		{
			if (this.answers[i].correct)
			{
				// the SCORM 1.2 spec says this can be only one character (0-9A-Z) with a max of 26
				if (i<26)
				{
					c.push(Assessment100.RESPONSE_CODES.charAt(i));
				}
			}
		}
		cr.push(c.join(BaseAssessmentContent.DELIMETER));
	}
	return cr;
}

// get answers from form and populate chosen answer array
Assessment100.prototype.collect = function( form )
{
	var ca = [];

	var i=0; answerIdx = 0;
	
	var elm;
	while ((elm = form["Answer"+i+this.contentID]) != null)
	{
		answerIdx = (this.getShuffled()) ? this.getShuffleOrder()[i]-1 : i;
		ca[answerIdx] = (elm.checked) ? "Y" : "N";
		i++;
	}
	
	this.chosenAnswers = ca;

	return true;
}

// compare chosen answers with correct answers and score (static assessments)
Assessment100.prototype.score = function()
{
	this.collect( document.forms[this.getFormName()]);
	return this.calculateScore();
}

Assessment100.prototype.calculateScore = function()
{
	var tca	= 0;
	var tia	= 0;
	var tqv = 0;

	var a;
	for (var i=0; i<this.answers.length; i++)
	{
		a = this.answers[i];

		if (this.chosenAnswers[i]=="Y")
		{
			if (a.correct) 	{ tca += a.weight; }  // correctly checked
			else 			{ tia += a.weight; }  // checked, but shouldn't have been
		}

		if ( a.correct )
		{
			tqv += a.weight;
		}
	}

	var score = new AssessmentScore( tca, tia, tqv );
	this.setResult( score.getScore() );

	this.scoreObj = score;
	
	this.fireScoredEvent();
	
	return this.getScore();
}

Assessment100.prototype.getShuffled = function()
{
	return this.shuffled;
}

Assessment100.prototype.setShuffled = function( val )
{
	this.shuffled = val;
}

Assessment100.prototype.restore = function()
{
	if (this.answerString != null)
	{
		var as = BaseAssessmentContent.parseSelectedAnswers(this.answerString);
		var answers = as.split("~");
		
		var form = document.forms[this.getFormName()];
		var shuffleArray = this.getShuffleOrder();

		var idx, i=0;
		var elm;
		while ((elm = form["Answer"+i+this.contentID]) != null)
		{
			idx = (this.getShuffled()) ? this.getShuffleOrder()[i]-1 : i;
			if (elm.length != null)
			{
				for(var j=0; j<elm.length; j++)
				{
					elm[j].checked = (answers[idx] == "Y");
				}
			}
			else
			{
				elm.checked = (answers[idx] == "Y");
			}
			i++;
		}
		this.events.restore.fire(this);
	}
}

Assessment100.prototype.isAnswered = function() 
{
	var form = document.forms[this.getFormName()];
	var c = false;
	var numAnswersInForm=this.getNumberAnswersInForm(form,this.contentID);
	for (var i=0; i<numAnswersInForm && !c; i++)
	{
		c = form["Answer"+i+this.contentID].checked;
	}
	return c;
}