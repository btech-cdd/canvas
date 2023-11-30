/*!
 * IBM Confidential
 * OCO Source Materials
 * 5725N95, 5725P55, 5725N96
 * (C) Copyright IBM Corp. 1999, 2014
 * The source code for this program is not published or otherwise
 * divested of its trade secrets, irrespective of what has been
 * deposited with the U.S. Copyright Office.
 */

 /* $Id: Assessment103.js,v 1.9.26.1.12.10.4.2.8.7.2.1 2014/01/07 09:52:35 phuocdang Exp $ */
 
function Assessment103()
{
	this.ordered 	= false;

	this.chosenAnswers 	= null;
	this.answers = [];

	this.type = 103;
	//Default value, will be replace by theme setting
	this.digitGroupingSymbol=",";
	this.extractSymbol=".";

	return this;
}

Assessment103.prototype = new BaseAssessmentContent();

Assessment103.LTrim = function(a) 
{
    var b=" "+a;
    while(b.charAt(0)==' ') 
	{
        b=b.substring(1,b.length);
    }
    return b;
}

Assessment103.RTrim = function(a) 
{
    var b = a+" ";
    while(b.charAt(b.length-1)==' ') 
	{
        b=b.substring(0,b.length-1);
    }
    return b;
}

Assessment103.prototype.init = function()
{
	var form = document.forms[this.getFormName()];
	
	for (var i=0; i<this.answers.length; i++)
	{
		YAHOO.util.Event.addListener("Answer"+i+this.contentID,"keydown",this.touch,this,true);
	}
}

Assessment103.prototype.getLearnerResponseString = function()
{
	var lr = "";
	if (this.chosenAnswers != null && this.chosenAnswers.length > 0 )
	{
		var c = [];
		for (var i=0; i<this.chosenAnswers.length; i++)
		{
			c.push(this.chosenAnswers[i]);
		}
		lr = c.join(BaseAssessmentContent.DELIMETER);
	}
	return lr;
}

Assessment103.prototype.getCorrectResponses = function()
{
	var cr = [];
	var a, ar;
	for (var i=0; i<this.answers.length; i++)
	{
		ar = [];
		a = this.answers[i];
		if (a.type == FIBAnswerType.TEXTUAL)
		{
			ar.push(a.text);
			
			// alternates
			for (var j=0; j<a.answerList.length; j++)
			{
				ar.push(a.answerList[j]);
			}
		}
		else
		{
			if (a.format == FIBNumericAnswerFormat.EXACT)
			{
				ar.push(a.answer);
			}
			else
			{
				ar.push(a.range.min);
				ar.push(a.range.max);
			}
		}

		cr.push(ar.join(BaseAssessmentContent.DELIMETER));
	}
	return cr;
}

// get answers from form and populate chosen answer array
Assessment103.prototype.collect = function( form )
{
	this.chosenAnswers = new Array();

	var ansValue = "";
	
	var numAnswersInForm=this.getNumberAnswersInForm(form,this.contentID);
	
	for (var i=0; i<numAnswersInForm; i++)
	{
		ansValue = form["Answer"+i+this.contentID].value;
	    if ( Assessment103.RTrim(ansValue) == "" )  
		{
			ansValue = " ";
	    }
		else  
		{
			ansValue=Assessment103.RTrim(ansValue);
			ansValue=Assessment103.LTrim(ansValue);
		}
	    var ansType;
	    if (this.answers[i]) ansType=this.answers[i].type;
	    else ansType=this.answerTypes[i];
		this.chosenAnswers[i] = this.formatNumericValue(ansValue,ansType);
	}
    return true;
}

Assessment103.prototype.collectPractice = function( form )
{	
	//Duplicate code with collect method, re-use it
    return this.collect(form);
}

// compare chosen answers with correct answers and score
Assessment103.prototype.score = function()
{
	this.collect( document.forms[this.getFormName()] );
	
	return this.calculateScore();
}

Assessment103.prototype.formatNumericValue = function(value,type){
	if (type==1) return value;
	else if (!this.isValidNumeric(value)){
		//Add prefix '-I' to make sure it's always fail
		return "I-"+value;
	}
	//Remove digit grouping symbol and always return standard format 
	var reg= new RegExp('\\'+this.digitGroupingSymbol,'g');
	var result=value.replace(reg,'');
	
	result=result.replace(this.extractSymbol,'.');
	return result;
}

Assessment103.prototype.isValidNumeric = function(value){
	
	var exp="^[-]?([1-9]\\d{0,2}(\\"+this.digitGroupingSymbol+"\\d{3})*|([1-9]\\d*))(\\"+this.extractSymbol+"\\d+)?$";
	var reg=new RegExp(exp,'gi')
	var result = value.match(reg);
	return result==value;
}

Assessment103.prototype.calculateScore = function()
{
	var tcaScore	= 0;
	var tiaScore	= 0;
	var tqv			= 0;
	
	// reset questions & calculate total question value
	for (var i=0; i<this.answers.length; i++)
	{
	    this.answers[i].scored = false;
	    this.answers[i].correct = false;
	}

	if (this.getOrdered())
	{
		for (var i=0; i<this.answers.length; i++)
		{
			var ansObj 		= this.answers[i];
			var userValue	= this.chosenAnswers[i];
			ansObj.evaluate(userValue);
			ansObj.scored = true;
		}
	}
	else
	{
		for (var i=0; i<this.chosenAnswers.length; i++)
		{
			var userValue = this.chosenAnswers[i];
			for (var j=0; j<this.answers.length; j++)
			{
				var ansObj = this.answers[j];
				if (!ansObj.scored){
					if (ansObj.evaluate(userValue))
					{
						ansObj.scored = true;
						break;
					}
				}
			}
		}
	}
	
	for (var i=0; i<this.answers.length; i++)
	{
		tqv += ansObj.weight;

		if (this.answers[i].correct)
			tcaScore++;
		else
			tiaScore++;
	}
	
	var score = new AssessmentScore( tcaScore, tiaScore, tqv );
	this.setResult( score.getScore() );

	this.scoreObj = score;
	
	this.fireScoredEvent();

	return this.getScore();
}
Assessment103.prototype.getOrdered = function()
{
	return this.ordered;
}
Assessment103.prototype.setOrdered = function( val )
{
	this.ordered = val;
}
Assessment103.prototype.showAnswers = function()
{
	var form = document.forms[this.getFormName()];

	for (var i=0; i<this.answers.length; i++)
	{
		var ans = this.answers[i];
		var ansVal = "";

		if (ans.type == FIBAnswerType.TEXTUAL)
			ansVal = ans.text;
		else
		{
			if (ans.format == FIBNumericAnswerFormat.EXACT)
				ansVal = ans.answer;
			else
				ansVal = ans.range.max - ((ans.range.max-ans.range.min)/2);
		}
		
		form["Answer"+i+this.contentID].value = (""+ansVal).replace(".",this.extractSymbol);
	}
}

Assessment103.prototype.contains = function( userVal, containsText )
{
	return (userVal.indexOf(containsText)>=0);
}

Assessment103.prototype.getNumAnswers = function()
{
	return this.numAnswers;
}

Assessment103.prototype.setNumAnswers = function( val )
{
	this.numAnswers = val;
}

Assessment103.prototype.getOrdered = function()
{
	return this.ordered;
}

Assessment103.prototype.setOrdered = function( val )
{
	this.ordered = val;
}

Assessment103.prototype.restore = function()
{
	if (this.answerString != null)
	{
		var as = BaseAssessmentContent.parseSelectedAnswers(this.answerString);
		var answers = as.split("~");
		
		var form = document.forms[this.getFormName()];
		var idx, i=0;
		var elm;
		while ((elm = form["Answer"+i+this.contentID]) != null)
		{
			idx = (this.getShuffled()) ? this.getShuffleOrder()[i]-1 : i;
			elm.value = answers[idx];
			i++;
		}
	}
}
Assessment103.prototype.isAnswered = function() 
{
	var form = document.forms[this.getFormName()];
	var c = true;
	var numAnswersInForm=this.getNumberAnswersInForm(form,this.contentID);
	for (var i=0; i<numAnswersInForm; i++)
	{
		c = c && (form["Answer"+i+this.contentID].value != "");
	}
	return c;
}