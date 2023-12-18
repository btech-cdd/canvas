/*!
 * IBM Confidential
 * OCO Source Materials
 * 5725N95, 5725P55, 5725N96
 * (C) Copyright IBM Corp. 1999, 2014
 * The source code for this program is not published or otherwise
 * divested of its trade secrets, irrespective of what has been
 * deposited with the U.S. Copyright Office.
 */

 /* $Id: AssessmentScore.js,v 1.4.360.1.54.1 2014/01/07 09:52:36 phuocdang Exp $ */

function AssessmentScore( tcaScore, tiaScore, tqv )
{
	this.totalCorrect 	= tcaScore;
	this.totalIncorrect	= tiaScore;
	this.questionValue	= tqv;
	return this;
}

AssessmentScore.prototype.getTotalCorrect = function()
{
	return this.totalCorrect;
}

AssessmentScore.prototype.setTotalCorrect = function( val )
{
	this.totalCorrect = val;
}

AssessmentScore.prototype.getTotalIncorrect = function()
{
	return this.totalIncorrect;
}

AssessmentScore.prototype.setTotalIncorrect = function( val )
{
	this.totalIncorrect = val;
}

AssessmentScore.prototype.getQuestionValue = function()
{
	return this.questionValue;
}

AssessmentScore.prototype.setQuestionValue = function( val )
{
	this.questionValue = val;
}

AssessmentScore.prototype.toString = function()
{
	return "TCA:" + this.totalCorrect + "; TIA:" + this.totalIncorrect + "; TQV:" + this.questionValue;
}

AssessmentScore.prototype.getScore = function()
{
	var retVal = 0;

	if((this.totalCorrect - this.totalIncorrect) >= 0 && this.questionValue > 0)
		retVal = (this.totalCorrect - this.totalIncorrect) / this.questionValue;

	return retVal;
}

AssessmentScore.prototype.cloneFrom = function(src)
{
    if(src != null)
    {
	    this.totalCorrect 	= src.totalCorrect;
	    this.totalIncorrect	= src.totalIncorrect;
	    this.questionValue	= src.questionValue;
	}
}

AssessmentScore.prototype.setValues = function(tc, ti, qv)
{
    this.totalCorrect 	= tc;
    this.totalIncorrect	= ti;
    this.questionValue	= qv;
}

