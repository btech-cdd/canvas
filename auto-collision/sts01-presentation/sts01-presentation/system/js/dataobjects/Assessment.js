/*!
 * IBM Confidential
 * OCO Source Materials
 * 5725N95, 5725P55, 5725N96
 * (C) Copyright IBM Corp. 1999, 2014
 * The source code for this program is not published or otherwise
 * divested of its trade secrets, irrespective of what has been
 * deposited with the U.S. Copyright Office.
 */

 /* $Id: Assessment.js,v 1.3.226.1.60.4.50.1 2014/01/07 09:52:34 phuocdang Exp $ */
 
Assessment = function()
{
	this.duration = 0;
	this.passingScore = 0;
	this.numTries = 1;

    this.children = new Array();
	
	this.completedStatus = false;
	
	this.ignoreSections = false;
	
	return this;
}

Assessment.prototype = new BaseAssessmentComponent();

Assessment.OBJECT_TYPE_ID = 6;

Assessment.prototype.getObjectTypeID = function()
{
	return Assessment.OBJECT_TYPE_ID;
}

/**
 * dumps members of object into a string, use for debug
 */
Assessment.prototype.toString = function() 
{
    var str = "id = " + this.id + "\n" +
              "label = " + this.label + "\n" +
              "description = " + this.description + "\n" +
              "duration = " + this.duration + "\n" +
              "shuffle = " + this.shuffle + "\n" +
              "passingScore = " + this.passingScore + "\n" +
              "weight = " + this.weight + "\n" +
              "numTries = " + this.numTries + "\n" +
              "score = " + this.score + "\n";

    for(var c in this.children)
    {
        str += c.toString();
    }

    return str;
}

Assessment.prototype.getDuration = function() {
	return this.duration;
}

Assessment.prototype.setDuration = function(value) {
    if(value != null)
	    this.duration = value;
}

Assessment.prototype.getShuffle = function() {
	return this.shuffle;
}

Assessment.prototype.setShuffle = function(value) {
    if(value != null)
    	this.shuffle = value;
}

Assessment.prototype.getPassingScore = function() {
	return this.passingScore;
}

Assessment.prototype.setPassingScore = function(value) {
    if(value != null)
    	this.passingScore = value;
}

Assessment.prototype.getWeight = function() {
	return this.weight;
}

Assessment.prototype.setWeight = function(value) {
    if(value != null)
    	this.weight = value;
}

Assessment.prototype.getNumberOfTries = function() {
	return this.numTries;
}

Assessment.prototype.setNumberOfTries = function(value) 
{
    if(value != null)
    	this.numTries = value;
}

Assessment.prototype.cloneFrom = function(src) 
{
	this.id = src.id;
	this.label = src.label;
	this.description = src.description;
	this.duration = src.duration;
	this.shuffle = src.shuffle;
	this.passingScore = src.passingScore;
	this.weight = src.weight;
	this.numTries = src.numTries;
    this.score = src.score;
	this.completedStatus = src.completedStatus;
}

Assessment.prototype.copy = function(src) 
{
	this.cloneFrom(src);
	for (var i=0;i<this.children.length;i++)
	{
		this.children[i].copy(src.children[i]);
	}
}

Assessment.prototype.getCompletedStatus = function() {
	return this.completedStatus;
}

Assessment.prototype.setCompletedStatus = function(value) 
{
    if(value != null)
    	this.completedStatus = value;
}