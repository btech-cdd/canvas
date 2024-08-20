function calcCourseAssignmentCounts(assignmentReviews) {
  let counts = {
    includes_outcomes: 0,
    chunked_content: 0,
    career_relevance: 0,
    provides_feedback: 0,
    modeling: 0,
    clarity: 0
  };
  for (let a in assignmentReviews) {
    let assignment = assignmentReviews[a];

    // other scores
    if (assignment.includes_outcomes !== undefined) counts.includes_outcomes += assignment.includes_outcomes ? 1 : 0;
    if (assignment.chunked_content !== undefined) counts.chunked_content += assignment.chunked_content ? 1 : 0;
    if (assignment.career_relevance !== undefined) counts.career_relevance += assignment.career_relevance? 1 : 0;
    if (assignment.provides_feedback !== undefined) counts.provides_feedback += assignment.provides_feedback? 1 : 0;
    if (assignment.modeling !== undefined) counts.modeling += assignment.modeling ? 1 : 0;
    if (assignment.clarity !== undefined) counts.clarity += assignment.clarity;
  }
  return counts;
}

function calcCourseAssignmentScore(counts, numReviews) {
  let total = counts.clarity 
    + counts.chunked_content 
    + counts.includes_outcomes 
    + counts.career_relevance 
    + counts.provides_feedback 
    + counts.modeling;
  total /= (numReviews * 7);
  return total;
}

function calcCoursePageScore(counts, numReviews) {
  let total = counts.clarity 
    + counts.chunked_content 
    + counts.includes_outcomes 
    + counts.career_relevance 
    + counts.supporting_media
  total /= (numReviews * 6);
  return total;
}

function calcCourseQuizScore(counts, numReviews) {
  let total = counts.clarity 
    + counts.chunked_content 
    + counts.includes_outcomes 
    + counts.career_relevance 
    + counts.provides_feedback 
    + counts.instructions 
    + counts.preparation;
  total /= (numReviews * 8);
  return total;
}



function calcCourseScore() {
  let score = 0;
  let pageScore = calcCoursePageScore(pageCounts, 1);
  let quizScore = calcCourseQuizScore(quizCounts, 1);
  let assignmentScore = calcCourseAssignmentScore(assignmentCounts, 1);
  let totalItems = quizReviewsData.length + assignmentReviewsData.length + pageReviewsData.length;
  score = (quizScore + assignmentScore + pageScore) / totalItems;
  return score; 
}