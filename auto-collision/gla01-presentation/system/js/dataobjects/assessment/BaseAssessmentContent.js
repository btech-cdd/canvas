/*!
 * IBM Confidential
 * OCO Source Materials
 * 5725N95, 5725P55, 5725N96
 * (C) Copyright IBM Corp. 1999, 2014
 * The source code for this program is not published or otherwise
 * divested of its trade secrets, irrespective of what has been
 * deposited with the U.S. Copyright Office.
 */

 /* $Id: BaseAssessmentContent.js,v 1.7.222.3.12.16.24.3.16.1 2014/01/07 10:00:34 phuocdang Exp $ */

// this is the base file for all assessment objects
function BaseAssessmentContent()
{
    this.stem           = "";
	this.questionNumber = 0;
	// these need to be declared in the descendant, otherwise descendant's share same object

	this.contentID		= null;
	this.contentTypeID	= -1;
	this.objectTypeID   = 1;
	this.parentID		= null;

	this.selectedAnswers = [];
	this.answers = null;
	
	this.weight 		= 1;
	this.scoreObj       = null;
	this.result			= 0;
	this.type 			= null;
	
	this.shuffled 		= false;	
	this.shuffleOrder	= [];

	this.docbase		= null;
	this.scoreable		= true;
	
	this.numAnswers		= 0;
	this.formRef	 	= null;
	
	this.questionType 	= 0;
	
	this.start 			= new Date().getTime();
	this.timestamp		= 0;
	
	this.formName 		= null;
	this.answerString 	= null;
	
	this.tries = 0;
	this.attempts = 0;
	
	this.hintIdx = 0;
	this.hints = [];

	return this;
}

BaseAssessmentContent.DELIMETER =  "[,]";
BaseAssessmentContent.STEP_DELIMETER = "[.]";

BaseAssessmentContent.prototype.init = function() {}

BaseAssessmentContent.prototype.touch = function()
{
	if (this.timestamp == 0)
	{
		this.timestamp = new Date().getTime();
	}
}

BaseAssessmentContent.prototype.fireScoredEvent = function()
{
	// fire the score  event
	var obj = 
	{
		"id":this.contentID,
		"type":1,
		"contentType":this.contentTypeID,
		"label":this.label,
		"description":this.description,
		"parentId":this.parentID,
		"score":+this.scoreObj.getScore(),
		"timestamp":+this.timestamp,
		"latency":((this.timestamp > 0) ? (this.timestamp-this.start) : 0),
		"learnerResponse":this.getLearnerResponseString(),
		"correctResponses":this.getCorrectResponses(),
		"_orig":this
	};
	if ((OSDeliveryEngine != null) && (OSDeliveryEngine.events != null)) 
		OSDeliveryEngine.events.score.fire(obj);
}

BaseAssessmentContent.prototype.getObjectTypeID = function()
{
	return 1;
}

// add answers to correct answer array
BaseAssessmentContent.prototype.addAnswer = function( obj )
{
	this.numAnswers++;
	if (this.answers == null) this.answers = [];
	this.answers.push(obj);
	return true;
}

BaseAssessmentContent.prototype.getContentID = function()
{
	return this.contentID;
}

BaseAssessmentContent.prototype.setContentID = function( val )
{
	this.contentID = val;
}

BaseAssessmentContent.prototype.getWeight = function()
{
	return this.weight;
}

BaseAssessmentContent.prototype.setWeight = function( val )
{
	this.weight = val;
}

BaseAssessmentContent.prototype.getType = function()
{
	return this.type;
}

BaseAssessmentContent.prototype.setType = function( type )
{
	this.type = type;
}

BaseAssessmentContent.prototype.getStem = function()
{
    return this.description;
}

BaseAssessmentContent.prototype.setStem = function(newStem)
{
    this.description = newStem;
}

BaseAssessmentContent.prototype.getFormName = function()
{
    return this.formName;
}

BaseAssessmentContent.prototype.setFormName = function(formName)
{
    this.formName = formName;
}

BaseAssessmentContent.prototype.isScoreable = function()
{
	return this.scoreable;
}

BaseAssessmentContent.prototype.setScoreable = function( flag )
{
	this.scoreable = flag;
}

BaseAssessmentContent.prototype.getScore = function()
{
	return this.scoreObj || new AssessmentScore(0,0,0);
}

BaseAssessmentContent.prototype.calculateScore = function(obj)
{
    return this.score();
}

// this method must be overriden by subclasses
BaseAssessmentContent.prototype.score = function(obj)
{
    // create dummy score
    return new AssessmentScore(0, 0, 0);
}

BaseAssessmentContent.prototype.getResult = function()
{
	return this.result;
}

BaseAssessmentContent.prototype.setResult = function(val)
{
    this.result = val;
}

BaseAssessmentContent.prototype.getDocBase = function()
{
	return this.docbase;
}

BaseAssessmentContent.prototype.setDocBase = function(obj)
{
    this.docbase = obj;
}

BaseAssessmentContent.prototype.getObject = function(obj)
{
	var ret = null;
	if (this.docbase == null || typeof(this.docbase) == 'undefined' || this.docbase == '')
	{
		ret = window[obj];
	}
	else
	{
		ret = eval(this.docbase+'.'+obj);
	}
	return ret;
}

BaseAssessmentContent.prototype.setObject = function(obj,val)
{
	if (this.docbase == null || typeof(this.docbase) == 'undefined' || this.docbase == '')
	{
		eval(obj + ' = ' + val);
	}
	else
	{
		eval(this.docbase+'.' + obj + ' = ' + val);
	}
}

BaseAssessmentContent.prototype.callFunction = function(func, params)
{
	if (this.docbase == null || typeof(this.docbase) == 'undefined' || this.docbase == '')
	{
		eval(func+'('+params+')');
	}
	else
	{
		eval(this.docbase+'.'+func+'('+params+')');
	}
}

BaseAssessmentContent.prototype.getNumAnswers = function()
{
	return this.numAnswers;
}

BaseAssessmentContent.prototype.setNumAnswers = function( val )
{
	this.numAnswers = val;
}

BaseAssessmentContent.prototype.copy = function(src)
{
	this.cloneFrom(src);
}

BaseAssessmentContent.prototype.showAnswers = function()
{
	alert("Not available");
}

BaseAssessmentContent.prototype.getShuffled = function()
{
	return this.shuffled;
}

BaseAssessmentContent.prototype.setShuffled = function( val )
{
	this.shuffled = val;
}

BaseAssessmentContent.prototype.getShuffleOrder = function()
{
	return this.shuffleOrder;
}

BaseAssessmentContent.prototype.setShuffleOrder = function( val )
{
	this.shuffleOrder = val;
}

BaseAssessmentContent.prototype.getAnswerString = function()
{
	return this.answerString;
}

BaseAssessmentContent.prototype.setAnswerString = function( val )
{
	this.answerString = val;
}

BaseAssessmentContent.prototype.toAnswerString = function()
{
	return this.chosenAnswers.join("~");
}

BaseAssessmentContent.prototype.getLearnerResponseString = function()
{
	return null;
}

BaseAssessmentContent.prototype.getCorrectResponses = function()
{
	return [];
}

BaseAssessmentContent.prototype.restore = function() {}

BaseAssessmentContent.parseSelectedAnswers = function(as)
{
	var selectedToken = "SelectedAnswers:";
	var begin = as.indexOf(selectedToken)+selectedToken.length;
	var end = as.length;

	var sp = as.indexOf("^Shuffled:");
	if (sp > -1)
	{
		end = sp;
	}

	return as.substring(begin,end);
}

// this method must be overriden by subclasses
BaseAssessmentContent.prototype.cloneFrom = function(src) {
//    alert("BaseAssessmentContent.prototype.cloneFrom hit");
    this.stem           = src.stem;
	this.description    = src.description;
	this.questionNumber = src.questionNumber;
	this.contentID		= src.contentID;
	this.weight 		= src.weight;
	this.result 		= src.result;
	this.type			= src.type;
	this.numAnswers		= src.numAnswers;

	var scoreObj = new AssessmentScore(0, 0, 0);
	scoreObj.cloneFrom(src.scoreObj);
	this.scoreObj = scoreObj;

//	alert("new cloned object = " + this.toString());
}

BaseAssessmentContent.prototype.toString = function() 
{
	return "AssessmentContent: \n"+
		   "	contentID = "+this.contentID+" \n"+
		   "	type	  = "+this.type+" \n"+
		   "	result	  = "+this.result+" \n"+
		   "	weight	  = "+this.weight;
}

BaseAssessmentContent.prototype.isAnswered = function() { return true; }
BaseAssessmentContent.prototype.hasTrackingData = function() { return false; }
BaseAssessmentContent.prototype.getTrackingData = function() { return null; }

BaseAssessmentContent.prototype.getNumberAnswersInForm = function(form, contentID)
{
	var cnt = 0;
	while (form["Answer"+cnt+contentID])
	{
		cnt++;
	}
	return cnt;
}