/*!
  * Licensed Materials - Property of IBM
  * 5725N95, 5725P55, 5725N96
  * (C) Copyright IBM Corp. 1999, 2014.
  * US Government Users Restricted Rights- Use, duplication or disclosure
  * restricted by GSA ADP Schedule Contract with IBM Corp.
 */

 /* $Id: FIBAnswerContainer.js,v 1.3.478.1 2014/01/07 03:34:43 quynhnguyen Exp $ */
 
/*
 * Copyright (c) 2000, 2001 OutStart, Inc. All rights reserved.
 *
 * $Id: FIBAnswerContainer.js,v 1.3.478.1 2014/01/07 03:34:43 quynhnguyen Exp $
 */
 
function FIBAnswerContainer()
{
		
}

FIBAnswerContainer.prototype = new BaseContainer();

FIBAnswerContainer.prototype.createNew = function( index )
{
	return new FIBAnswer( "", "", 1, false, (index+1), 1, "20", false );
}