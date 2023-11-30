/*!
 * IBM Confidential
 * OCO Source Materials
 * 5725N95, 5725P55, 5725N96
 * (C) Copyright IBM Corp. 1999, 2014
 * The source code for this program is not published or otherwise
 * divested of its trade secrets, irrespective of what has been
 * deposited with the U.S. Copyright Office.
 */

 /* $Id: Practice38.js,v 1.1.4.2.2.3 2016/08/18 05:04:19 srmithra Exp $ */
 
Practice38 = function()
{	
	this.defs;
	this.borderColor;
	this.borderWidth;
	this.areaBorder;
}

Practice38.prototype.init = function()
{	
	var yd = YAHOO.util.Dom;
	var base = yd.get(this.contentID + "_media");
	var bc = yd.getXY(base);
	if (this.areaBorder == 1) {
		for (var i=0; i<this.defs.length; i++)
		{
			a = this.defs[i];
			this.drawShapes(bc,a, i);
		}
	}
}

Practice38.prototype.drawShapes = function(bc, area, index) {
	
	var cordinate = 1;
	if (this.borderWidth > 2) {
		cordinate = this.borderWidth - cordinate;
	}	
	
	var c = document.getElementById("mc" + this.contentID);
	var paper = Raphael(c, area[2] + this.borderWidth + 2, area[3] + this.borderWidth + 2);
	jQuery(paper.canvas).css({position: 'absolute', left: area[0], top: area[1]});
	jQuery(paper.canvas).attr("pointer-events", "none");
	
	var obj;
	switch (area[8]) {
		case 1:
			obj = Shape.drawCircle(paper, area[6] + cordinate, area[6] + cordinate, area[6]);
			break;
		case 2:
			// get array point of polygon
			var poly = area[7].split(',');	
			
			// move to first point(area[0],area[1])
			var path = "M" + (parseFloat(poly[0]) - area[0] + cordinate) + " " + (parseFloat(poly[1]) - area[1] + cordinate);
			for (var l = 2; l < poly.length - 1; l = l + 2) {
				// line to next point
				path += "L" + (parseFloat(poly[l]) - area[0] + cordinate) + " " + (parseFloat(poly[l+1]) - area[1] + cordinate);
			}
			
			// line to first point(area[0],area[1]);
			path+= "L" + (parseFloat(poly[0]) - area[0] + cordinate) + " " + ( parseFloat(poly[1]) - area[1] + cordinate);
			
			// draw a polygon
			obj = Shape.drawPolygon(paper, path);
			break;
		default:
			obj = Shape.drawRectangle(paper, cordinate, cordinate, area[2], area[3]);
	}
	obj.attr({"stroke-width": this.borderWidth, "stroke": this.borderColor});
}