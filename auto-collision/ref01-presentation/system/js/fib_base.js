/*!
  * Licensed Materials - Property of IBM
  * 5725N95, 5725P55, 5725N96
  * (C) Copyright IBM Corp. 1999, 2014.
  * US Government Users Restricted Rights- Use, duplication or disclosure
  * restricted by GSA ADP Schedule Contract with IBM Corp.
 */

 /* $Id: fib_base.js,v 1.1.6.2.24.2.2.1 2014/01/08 06:52:15 quynhnguyen Exp $ */
RegExp.escape = function(text) {
  if (!arguments.callee.sRE) {
    var specials = ['$', '^', ':', '!',
      '/', '.', '*', '+', '?', '|',
      '(', ')', '[', ']', '{', '}', '\\'
    ];
    arguments.callee.sRE = new RegExp(
      '(\\' + specials.join('|\\') + ')', 'g'
    );
  }
  return text.replace(arguments.callee.sRE, '\\$1');
}

FIBAnswerType = 
{
	"TEXTUAL" : 1,
	"NUMERIC" : 2
};
FIBAnswerType.LABELS = new Array();
FIBAnswerType.LABELS[FIBAnswerType.TEXTUAL] = "Text";
FIBAnswerType.LABELS[FIBAnswerType.NUMERIC] = "Number";
FIBTextualAnswerFormat =
{
	"EXACTLY"		: 0,
	"BEGINS_WIDTH" 	: 1,
	"ENDS_WIDTH" 	: 2,
	"CONTAINS"		: 3
};
FIBTextualAnswerFormat.LABELS = new Array();
FIBTextualAnswerFormat.LABELS[FIBTextualAnswerFormat.EXACTLY] = "Exactly";
FIBTextualAnswerFormat.LABELS[FIBTextualAnswerFormat.BEGINS_WIDTH] = "Begins With";
FIBTextualAnswerFormat.LABELS[FIBTextualAnswerFormat.ENDS_WIDTH] = "Ends With";
FIBTextualAnswerFormat.LABELS[FIBTextualAnswerFormat.CONTAINS] = "Contains";
FIBNumericAnswerFormat =
{
	"EXACT" : 1,
	"RANGE" : 2
};
FIBRoundingType = 
{
	"DEFAULT":0,
	"UP":1,
	"DOWN":2
};
FIBRoundingFunctions = new Array(3);
FIBRoundingFunctions[FIBRoundingType.DEFAULT] = "round";
FIBRoundingFunctions[FIBRoundingType.UP] = "ceil";
FIBRoundingFunctions[FIBRoundingType.DOWN] = "floor";
FIBRoundingFormat =
{
	"DEFAULT":
	{
		"NONE":0
	},
	"BELOW":
	{
		".0":1,
		".00":2,
		".000":3,
		".0000":4,
		".00000":5,
		".000000":6,
		".0000000":7,
		".00000000":8,
		".000000000":9,
		".0000000000":10
	},
	"ABOVE":
	{
		"1":11,
		"10":12,
		"100":13,
		"1,000":14,
		"10,000":15,
		"100,000":16,
		"1,000,000":17,
		"10,000,000":18,
		"100,000,000":19,
		"1,000,000,000":20
	}
};
FIBAnswerFactory = function(){}
FIBAnswerFactory.create = function(type)
{
	var i = null;
	switch (type)
	{
		case (FIBAnswerType.TEXTUAL):
			i = new FIBTextualAnswer();
			break;
		case (FIBAnswerType.NUMERIC):
			i = new FIBNumericAnswer();
			break;			
	}
	return i;
}
FIBBaseAnswer = function()
{
	// Duc Issue #29431 - Initial ID for each answer
	this.answerID = "";
	this.type = -1;
	this.answerLength = 20;
	this.order = 10;
	this.feedback = "";
	this.weight = 1;
	this.scored = false;
	this.correct = false;
}
FIBTextualAnswer = function()
{
	this.type = FIBAnswerType.TEXTUAL;
	this.text = null;
	this.caseSensitive = false;
	this.format = FIBTextualAnswerFormat.EXACTLY;
	this.answerList = new Array();
}
FIBTextualAnswer.prototype = new FIBBaseAnswer;
FIBTextualAnswer.prototype.addAnswer = function(text)
{
	this.answerList[this.answerList.length] = text;
}
FIBTextualAnswer._evaluate = function(ansObj,userValue)
{
	var p = FIBTextualAnswer._evaluateAnswer(ansObj,ansObj.text,userValue);
	if (!p)
	{
		for (var i=0; i<ansObj.answerList.length; i++)
		{
			p = FIBTextualAnswer._evaluateAnswer(ansObj,ansObj.answerList[i],userValue);
			if (p) break;
		}
	}
	return p;
}
FIBTextualAnswer._evaluateAnswer = function(ansObj,ansText,userValue)
{
	var p = null;

	var attr = (!ansObj.caseSensitive)?"i":"";
	
	var aText = RegExp.escape(ansText);
		
	switch (ansObj.format)
	{
		case (FIBTextualAnswerFormat.BEGINS_WIDTH):
			p = new RegExp("^"+aText,attr);
			break;
		case (FIBTextualAnswerFormat.ENDS_WIDTH):
			p = new RegExp(aText+"$",attr);
			break;
		case (FIBTextualAnswerFormat.CONTAINS):
			p = new RegExp(aText,attr);
			break;
		default:
			p = new RegExp("^"+aText+"$",attr);
	}

	return (p.test(userValue));
}
FIBTextualAnswer.prototype.evaluate = function(userVal)
{
	this.correct = FIBTextualAnswer._evaluate(this,userVal);
	return this.correct;
}
FIBNumericAnswer = function()
{
	this.type = FIBAnswerType.NUMERIC;
	this.rounding = FIBRoundingFormat.NONE;
	this.roundingType = FIBRoundingType.DEFAULT;
	this.format = FIBNumericAnswerFormat.EXACT;
	this.answer = null;
	this.range = new FIBNumericAnswerRange();
}
FIBNumericAnswer.prototype = new FIBBaseAnswer;
FIBNumericAnswer._evaluate = function(ansObj,userValue)
{
	var c = false;
	
	var userAns = parseFloat(userValue);
	if (!isNaN(userAns))
	{
		userAns = FIBNumericAnswer.round(userAns,ansObj.rounding,ansObj.roundingType);

		var sysAns = parseFloat(ansObj.answer);
			sysAns = FIBNumericAnswer.round(sysAns,ansObj.rounding,ansObj.roundingType);
			
		if (ansObj.format == FIBNumericAnswerFormat.RANGE)
			c = ansObj.range.evaluate(userAns);
		else
			c = (sysAns == userAns);
	}

	return c;
}
FIBNumericAnswer.prototype.evaluate = function(userVal)
{
	this.correct = FIBNumericAnswer._evaluate(this,userVal);
	return this.correct;
}
FIBNumericAnswer.round = function(num,rounding,type)
{
	var r = num;
	if (rounding != FIBRoundingFormat.DEFAULT.NONE)
	{
		var rndFnc = FIBRoundingFunctions[type];
		if (rounding > 10)
		{
			var f = Math.pow(10,(rounding-11));
			r = Math[rndFnc](num/f)*f;
		}
		else
		{
			var f = Math.pow(10,rounding);
			r = Math[rndFnc](num*f)/f;
		}
	}
	return r;
}
FIBNumericAnswerRange = function(min,max,minIncl,maxIncl)
{
	this.min = (min!=null)?min:0;
	this.max = (max!=null)?max:0;
	this.minIncl = (minIncl!=null)?minIncl:true;
	this.maxIncl = (maxIncl!=null)?maxIncl:true;
}
FIBNumericAnswerRange.prototype.evaluate = function(val)
{
	return 	((this.minIncl)?(val >= this.min):(val > this.min)) &&
			((this.maxIncl)?(val <= this.max):(val < this.max))
}
FIBTextualAnswer.prototype.setValue = function(field,value)
{
	this[field] = value;
}
FIBNumericAnswer.prototype.setValue = function(field,value)
{
	this[field] = value;
}