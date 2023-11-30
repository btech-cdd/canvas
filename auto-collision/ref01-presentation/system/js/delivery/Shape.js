/*!
 * IBM Confidential
 * OCO Source Materials
 * 5725N95, 5725P55, 5725N96
 * (C) Copyright IBM Corp. 1999, 2014
 * The source code for this program is not published or otherwise
 * divested of its trade secrets, irrespective of what has been
 * deposited with the U.S. Copyright Office.
 */

 /* $Id: Shape.js,v 1.1.4.1.2.1 2014/01/08 02:58:44 phuocdang Exp $ */
 
function Shape() {
}
Shape.drawRectangle = function(paper, areaX, areaY, areaWidth, areaHeight) {
	return paper.rect(areaX, areaY, areaWidth, areaHeight);
}

Shape.isWithinRectangle = function(x, y, areaX, areaY, areaWidth, areaHeight) {
	return ((x >= areaX) && (x <= (areaX + areaWidth)) && (y >= areaY) && (y <= (areaY + areaHeight)));
}

Shape.drawCircle = function(paper, areaCX, areaCY, areaR) {
	return paper.circle(areaCX, areaCY, areaR);
}

Shape.isWithinCircle = function(x, y, areaCX, areaCY, areaR) {
	return ((x - areaCX)*(x - areaCX)) + ((y - areaCY)*(y - areaCY)) <= areaR*areaR;
}

Shape.drawPolygon = function(paper, areaPOLY) {
	return paper.path(areaPOLY);
}

Shape.isWithinPolygon = function(x, y, numPoint, arrX, arrY) {
	var match = false;
	for (var q = 0, p = numPoint - 1; q < numPoint; p=q++) {
		if (((arrY[q] > y) != (arrY[p] > y)) && (x < Math.round((((arrX[p] - arrX[q]) * (y - arrY[q]))/ (arrY[p] - arrY[q]))) + arrX[q])) {
			match = !match;
		}
	}
	return match;
}