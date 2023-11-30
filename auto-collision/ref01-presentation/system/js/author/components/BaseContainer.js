/*!
  * Licensed Materials - Property of IBM
  * 5725N95, 5725P55, 5725N96
  * (C) Copyright IBM Corp. 1999, 2014.
  * US Government Users Restricted Rights- Use, duplication or disclosure
  * restricted by GSA ADP Schedule Contract with IBM Corp.
 */

 /* $Id: BaseContainer.js,v 1.9.294.1 2014/01/07 03:08:05 quynhnguyen Exp $ */
 
/*
 * Copyright (c) 2000, 2001 OutStart, Inc. All rights reserved.
 *
 * $Id: BaseContainer.js,v 1.9.294.1 2014/01/07 03:08:05 quynhnguyen Exp $
 */
 
function BaseContainer()
{
	this.itemArray = new Array();
	this.itemArrayIndex = 0;
	return this;	
}

BaseContainer.prototype.toString = function()
{
	this.itemArray.sort( orderContent );
	
	var retVal = "";
	for (var i=0; i<this.itemArray.length; i++)
	{
		retVal += this.itemArray[i].toString( i );
	}

	return retVal;
}

BaseContainer.prototype.getItem = function()
{
	var obj 	= null;
	var index = this.itemArrayIndex;
	
	if (this.itemArray.length<1) { this.insertNew(); }
	
	return this.itemArray[ index ];	 
}

BaseContainer.prototype.setItem = function( newObj )
{
	var obj 	= null;
	var index 	= this.itemArrayIndex;
	
	if (this.itemArray.length<1) { this.insertNew(); }
	
	this.itemArray[ index ] = newObj;
}

BaseContainer.prototype.getNextItem = function()
{
	var obj 	= null;
	var index = this.itemArrayIndex;
	index++;
	if (index>=this.itemArray.length) { index = 0; }
	this.itemArrayIndex = index;
	obj = this.itemArray[ index ];
	return obj;
}

BaseContainer.prototype.getPreviousItem = function()
{
	var obj 	= null;
	var index = this.itemArrayIndex;
	index--;
	if (index<0)	{ index = this.itemArray.length-1 }
	this.itemArrayIndex = index;
	obj = this.itemArray[ index ];
	return obj; 
}

BaseContainer.prototype.insertNew = function(resetIndex)
{
	if (resetIndex==null) 	{ resetIndex=true; }
	
	var index = this.itemArray.length;
	var obj = this.createNew( index );
	this.add( obj );
	if (resetIndex) { this.itemArrayIndex=index; }
	return obj;
}

BaseContainer.prototype.insertNewByIndex = function(index)
{
	var obj = this.createNew( index );
	
	this.itemArrayIndex=index;
	
	var newArray = this.itemArray.slice(0);
	//alert("new array len = " + newArray.length);
	
	var firstHalf 	= newArray.splice(0,index);
	var secondHalf 	= newArray.splice(0,newArray.length);
	
	
	this.itemArray = null;
	
	//alert("1st length = " + firstHalf.length + " - " + firstHalf);
	//alert("2nd length = " + secondHalf.length + " - " + secondHalf);
	
	this.itemArray = firstHalf.concat(obj);
	this.itemArray = this.itemArray.concat(secondHalf);
	
	//alert(this.itemArray);
	
	// reorder
	for (var i=0; i<this.itemArray.length; i++)
		this.itemArray[i].order = (i+1)*10;
	
	return obj;
}

BaseContainer.prototype.reorder = function( )
{
	for (var i=0; i<this.itemArray.length; i++)
		this.itemArray[i].order = (i+1)*10;
}

BaseContainer.prototype.add = function( obj )
{
	var index 		= this.itemArray.length;
	if (index>0) 	{ this.itemArray.push( obj ); }
	else 			{ this.itemArray[0] = obj; }	
}

BaseContainer.prototype.deleteItem = function(index)
{
	if (index==null) { index = this.itemArrayIndex; }
	// delete then return
	var obj = null;
	if (this.itemArray.length>0)
	{
		
		//var index 			= this.itemArrayIndex;
		
		this.itemArray 		= deleteArrayItem( this.itemArray, index );
		// If this was the last item that was inserted, then insert a new item so that an empty object is displayed.
		if ( this.itemArray.length < 1 ) this.insertNew();
		if (index>=this.itemArray.length) { index--; }
		if ( this.itemArray.length<=0 ) 	{ index=0; }
		obj = this.itemArray[ index ];
		this.itemArrayIndex = index;
		
		// reorder
		for (var i=0; i<this.itemArray.length; i++)
			this.itemArray[i].order = (i+1)*10;
			 	
	}
	return obj;
}

BaseContainer.prototype.deleteAllItems = function()
{
	for (var i=0; i<this.itemArray.length; i++)
		this.itemArray[i] = null;
	
	this.itemArray.length = 0;
	
	this.itemArrayIndex = 0;
}

BaseContainer.prototype.deleteArrayItem = function(currentArray,index)
{
	var returnArray = new Array();
	var cnt=0;
	for (var i=0; i<currentArray.length; i++)
	{
		if (index!=i)
		{
			// if not index then add to tempArray
			returnArray[cnt] = currentArray[i];
			cnt++;
		}
	}
	return returnArray;
}
  
BaseContainer.prototype.getNumItems = function()
{
	return this.itemArray.length;
}

BaseContainer.prototype.getIndex = function()
{
	return this.itemArrayIndex;
}

BaseContainer.prototype.moveIndex = function( index )
{
	this.itemArrayIndex = index;
	return this.getItem();
}

BaseContainer.prototype.getItemByIndex = function(index)
{
	return this.itemArray[index];
}
