/*!
 * IBM Confidential
 * OCO Source Materials
 * 5725N95, 5725P55, 5725N96
 * (C) Copyright IBM Corp. 1999, 2014
 * The source code for this program is not published or otherwise
 * divested of its trade secrets, irrespective of what has been
 * deposited with the U.S. Copyright Office.
 */

 /* $Id: BaseAssessmentComponent.js,v 1.1.4.9.4.1.10.1.16.1 2014/01/07 10:00:34 phuocdang Exp $ */
 
BaseAssessmentComponent = function()
{
	this.children = new Array();
	this.childMap = new Array();
	
	this.score = 0;
	this.hasScore = false;
	
	this.id = 0;
	this.label = "";
	this.description = "";
	this.shuffle = false;
	this.numItems = 1;
	this.weight = 1;
}

BaseAssessmentComponent.CONTENT_CLASS_MAP=
{
	"101":"100",
	"102":"100"
};

BaseAssessmentComponent.getContentClass = function(typeId)
{
	var classId = BaseAssessmentComponent.CONTENT_CLASS_MAP[typeId.toString()] || typeId;
	return "Assessment"+classId;
}

BaseAssessmentComponent.prototype.getChildren = function() 
{
    return this.children;
}

BaseAssessmentComponent.prototype.addChild = function(id,child) 
{
    this.childMap[id] = this.children[this.children.length] = child;
}

/**
 * call this to calculate score of this object
 * it will call score on all child objects
 */
BaseAssessmentComponent.prototype.calculateScore = function() 
{
    var count = 0;
    var total = 0;
    
    for (var i=0; i<this.children.length; i++)
    {
    	var c = this.children[i];
		var w = c.getWeight();

		count +=  w;
		
		switch (c.getObjectTypeID())
		{
			case 10:

				total += c.calculateScore() * w;
				break;
				
			default:
			
				var questScore = c.score();
				total += questScore.getScore() * w;;
		}
	}

    this.score = count == 0 ? 0 : total/count;
	
	if (this.getObjectTypeID() == 6)
	{
		var obj = 
		{
			"id":this.id,
			"score":this.score,
			"type":this.getObjectTypeID(),
			"weight":this.getWeight(),
			"_orig":this
		}
		
		BaseAssessmentComponent.addChildrenJSON(this,obj);
		OSDeliveryEngine.events.score.fire(obj);
	}
	
    return this.score;
}
BaseAssessmentComponent.prototype.getQuestions = function()
{
	var q = [];
	var c;
    for (var i=0; i<this.children.length; i++)
    {
    	c = this.children[i];
		if (c.getObjectTypeID() == 10)
		{
			for (var j=0; j<c.children.length; j++)
			{
				q.push(c.children[j]);
			}
		}
		else
		{
			q.push(c);
		}
	}
	return q;
}

BaseAssessmentComponent.addChildrenJSON = function(parent,jso)
{
	jso.children = [];
	for (var i=0; i<parent.children.length; i++)
	{
		var c = parent.children[i];

		var childJso = 
		{
			"weight":c.getWeight(),
			"_orig":this
		};

		switch (c.getObjectTypeID())
		{
			case 10:
				childJso.id = c.id;
				childJso.type = c.getObjectTypeID();
				childJso.score = c.calculateScore();
				BaseAssessmentComponent.addChildrenJSON(c,childJso)
				
				break;
				
			default:
			
				childJso.id = c.contentID;
				childJso.type = 1;
				childJso.contentType = c.contentTypeID;
				childJso.score = c.score().getScore();
				childJso.description = c.description;
				childJso.timestamp = c.timestamp;
				childJso.latency = ((c.timestamp > 0) ? (c.timestamp-c.start) : 0);
				childJso.learnerResponse = c.getLearnerResponseString();
				childJso.correctResponses = c.getCorrectResponses();

				break;
		}
		
		jso.children.push(childJso);
	}
}

// will not recalculate the score
BaseAssessmentComponent.prototype.getScore = function() 
{
	return this.score;
}

BaseAssessmentComponent.prototype.setScore = function(score) 
{
	this.hasScore = true;
	this.score = score;
}

// this method will get a reference to an existing child - or create a new one
BaseAssessmentComponent.prototype.getChild = function(id, objTypeId, contentTypeId) 
{
    var c = this.childMap[id];

    if (c == null && objTypeId != 10)
    {
    	// recurse through children if not found
    	for (var i=0; i<this.children.length && c == null; i++)
    	{
    		if (this.children[i].getObjectTypeID()==10)
    		{
    			c = this.children[i].getChild(id,objTypeId,contentTypeId);
    		}
    	}
    }

    return c;
}

BaseAssessmentComponent.prototype.copy = function(src) 
{
	this.cloneFrom(src);

	var srcChildren = src.getChildren();
	for (var i=0;i<srcChildren.length;i++)
	{
		this.children[i].copy(srcChildren[i]);
	}
}

BaseAssessmentComponent.prototype.getID = function() {
	return this.id;
}

BaseAssessmentComponent.prototype.setID = function(id) 
{
	this.id = id;
}

BaseAssessmentComponent.prototype.getLabel = function() 
{
	return this.label;
}

BaseAssessmentComponent.prototype.setLabel = function(value) 
{
	this.label = value;
}

BaseAssessmentComponent.prototype.getDescription = function() 
{
	return this.description;
}

BaseAssessmentComponent.prototype.setDescription = function(value) 
{
	this.description = value;
}

BaseAssessmentComponent.prototype.getShuffle = function() 
{
	return this.shuffle;
}

BaseAssessmentComponent.prototype.setShuffle = function(value) 
{
	this.shuffle = value;
}

BaseAssessmentComponent.prototype.getWeight = function() 
{
	return this.weight;
}

BaseAssessmentComponent.prototype.setWeight = function(value) 
{
	this.weight = Math.max(0, value);
}

BaseAssessmentComponent.prototype.getNumberOfItems = function() 
{
	return this.numItems;
}

BaseAssessmentComponent.prototype.setNumberOfItems = function(value) 
{
	this.numItems = value;
}