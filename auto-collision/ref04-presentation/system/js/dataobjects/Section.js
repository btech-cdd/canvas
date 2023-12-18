/*!
 * IBM Confidential
 * OCO Source Materials
 * 5725N95, 5725P55, 5725N96
 * (C) Copyright IBM Corp. 1999, 2014
 * The source code for this program is not published or otherwise
 * divested of its trade secrets, irrespective of what has been
 * deposited with the U.S. Copyright Office.
 */

 /* $Id: Section.js,v 1.7.172.2.60.3.54.1 2014/01/08 02:59:06 phuocdang Exp $ */
 
function Section()
{
	this.children = new Array();
}

Section.prototype = new BaseAssessmentComponent();

Section.OBJECT_TYPE_ID = 10;

Section.prototype.getObjectTypeID = function()
{
	return Section.OBJECT_TYPE_ID;
}

/**
 * dumps members of object into a string, use for debug
 */
Section.prototype.toString = function() 
{
    var str = "id = " + this.id + "\n" +
              "label = " + this.label + "\n" +
              "description = " + this.description + "\n" +
              "shuffle = " + this.shuffle + "\n" +
              "numItems = " + this.numItems + "\n" +
              "weight = " + this.weight + "\n";

    for(var quest in this.questions)
    {
        str += quest.toString();
    }

    return str;
}

Section.prototype.addQuestion = function(question)
{
    var newQuest = this.getQuestion(question.getContentID(), 105);
    newQuest.cloneFrom(question);

    // find index incase question alread exists
    var index = this.questions.length;
    for(var i=0; i<this.questions.length; i++)
    {
    	var quest = this.formQuestions[i];
    	if(quest.getContentID() == question.getContentID())
    	{
    	    index = i;
    	    break;
    	}
    }

    this.questions[newQuest.getContentID()] = newQuest;
    this.questions[index] = newQuest;

    this.formQuestions[question.getContentID()] = question;
    this.formQuestions[index] = question;
}

Section.prototype.cloneFrom = function(src) 
{
	this.id = src.id;
	this.label = src.label;
	this.description = src.description;
	this.shuffle = src.shuffle;
	this.numItems = src.numItems;
	this.weight = src.weight;

    this.score = src.score;
}

Section.prototype.copy = function(src) 
{
	this.cloneFrom(src);
	for (var i=0;i<this.children.length;i++)
	{
		this.children[i].cloneFrom(src.children[i]);
	}
}