/*!
 * IBM Confidential
 * OCO Source Materials
 * 5725N95, 5725P55, 5725N96
 * (C) Copyright IBM Corp. 1999, 2014
 * The source code for this program is not published or otherwise
 * divested of its trade secrets, irrespective of what has been
 * deposited with the U.S. Copyright Office.
 */

 /* $Id: numberFormats.js,v 1.4.10.1.198.1 2014/01/08 02:58:49 phuocdang Exp $ */
 
function formatOneDecimal(num)
{
    var ret = "";
    ret += Math.floor(num);
    ret += ".";
    ret += Math.floor((num * 10) % 10);

    return ret;
}

function formatTwoDecimal(num)
{
    var ret = "";
    ret += Math.floor(num);
    ret += ".";
    ret += Math.floor((num * 100) % 100);

    return ret;
}

try {

	  /**
	  * Netscape 6 and higher throws an exception if we try to unescape certain odd
	  * characters. We probably shouldn't be unescaping characters that are not
	  * escaped, but this replaces the default unescape function so we don't have to
	  * worry about it.
	  **/
	  var _unescape = unescape;
	  
	  var unescapeNS = function(str)
	  {
	  	try {
	  		str = _unescape(str);
	  	} catch (ignore) {}
	  	return str;
	  };
	  
	var version = parseFloat(navigator.appVersion);
	var appName = navigator.appName.toLowerCase();
	var ua      = navigator.userAgent.toLowerCase();
    
	  if (appName.indexOf("netscape") > -1)
	  {
		  unescape = unescapeNS;
      }		  
}
catch (ignore) {}
