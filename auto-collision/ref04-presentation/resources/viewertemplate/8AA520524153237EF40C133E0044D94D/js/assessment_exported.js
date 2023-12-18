/*
 * Copyright (c) 2000, 2001 OutStart, Inc. All rights reserved.
 *
 * $Id: assessment_exported.js,v 1.1.2.2.4.2 2012/02/02 18:56:03 achase Exp $
 */
function formatScore(score)
{
    return formatTwoDecimal(score);
}

/**
 * Generates the score of the specified assessment and displays it's
 * summary in an HTML page
 */
AssessmentUI.showReport = function(type, args, me)
{
	var assessment = AssessmentEngine.assessment;

    var s = "<div id=\"overallscore\">Score: " + (assessment.getScore() * 100) + " %</div>"+
			"<div id=\"passingscore\">Passing Score: "+(assessment.passingScore * 100)+" %</div>";
	
	if (!assessment.ignoreSections)
	{
	    // iterate thru all sections in the assessment
	    var sectionList = assessment.children;
	    var count = 0;

	    for (var j=0; j<sectionList.length; j++)
	    {
	        var section = sectionList[j];
			
			if (sectionList.length > 1)
			{
				s += "<div class=\"sectionlbl\">Section: " + section.getLabel() + "</div>";
			}

			s += 	"<table class=\"detailtable\">\n"+
					"<tr><th id='stemheading' scope='col'>Question</th><th id='scoreheading' scope='col'>Score</th></tr>\n"+
					addQuestionsToSummary(section.children,count)+
					"</table>";
	    }
	}
	else
	{
		s += 	"<table class=\"detailtable\">\n"+
				"<tr><th id='stemheading' scope='col'>Question</th><th id='scoreheading' scope='col'>Score</th></tr>\n"+
				addQuestionsToSummary(assessment.children,count)+
				"</table>";
	}

	s += "</div>";
	
	jQuery("#content").hide();
	jQuery("#footer").hide();
	jQuery("#tmr").hide();
	
	var elm = jQuery("#scoresummary");
	if (elm.length == 0)
	{
		elm = jQuery("<div id=\"scoresummary\"></div>");
		elm.insertAfter("#content");
	}

	elm.show();
	//elm.html(s); not working in IE9?
	elm[0].innerHTML = s;
	
	// bump the window so the screen reader updates
	window.focus();
}

AssessmentEngine.events.scoreComplete.subscribe(AssessmentUI.showReport);

function addQuestionsToSummary(questions,count)
{
	var r = "";
	var q, s;

	for(var i=0; i<questions.length; i++)
	{
		count++;
		
		q = questions[i];
		s = q.getScore();

		r += 	"<tr>"+
				"  <td class='qstem'>"+q.description+"</td>"+
				"  <td class='qscore'>"+(s.getScore()*100)+" %</td>"+
				"</tr>\n";
	}
	
	return r;
}