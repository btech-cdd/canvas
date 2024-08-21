function calcCourseAssignmentCounts(assignmentReviews) {
  let counts = {
    includes_outcomes: 0,
    chunked_content: 0,
    career_relevance: 0,
    provides_feedback: 0,
    modeling: 0,
    clarity: 0,
    num_reviews: assignmentReviews.length,
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

function calcCourseAssignmentScore(counts) {
  let total = counts.clarity 
    + counts.chunked_content 
    + counts.includes_outcomes 
    + counts.career_relevance 
    + counts.provides_feedback 
    + counts.modeling;
  total /= (7 * counts.num_reviews);
  return total;
}

function calcCoursePageCounts(pageReviews) {
  let counts = {
    includes_outcomes: 0,
    chunked_content: 0,
    career_relevance: 0,
    supporting_media: 0,
    clarity: pageReviews.length
  }
  for (let o in pageReviews) {
    let page = pageReviews[o];
    // other scores
    if (page.includes_outcomes !== undefined) counts.includes_outcomes += page.includes_outcomes ? 1 : 0;
    if (page.chunked_content !== undefined) counts.chunked_content += page.chunked_content ? 1 : 0;
    if (page.career_relevance !== undefined) counts.career_relevance += page.career_relevance? 1 : 0;
    if (page.supporting_media!== undefined) counts.supporting_media += page.supporting_media? 1 : 0;
    if (page.clarity !== undefined) counts.clarity += page.clarity;
  }
  return counts;
}

function calcCoursePageScore(counts) {
  let total = counts.clarity 
    + counts.chunked_content 
    + counts.includes_outcomes 
    + counts.career_relevance 
    + counts.supporting_media
  total /= (6 * counts.num_reviews);
  return total;
}

function calcCourseQuizCounts(quizReviews) {
  counts = {
    clarity: 0,
    includes_outcomes: 0,
    chunked_content: 0,
    career_relevance: 0,
    provides_feedback: 0,
    instructions: 0,
    preparation: 0,
    num_reviews: quizReviews.length,
  };
  for (let q in quizReviews) {
    let quiz = quizReviews[q];


    // // other scores
    if (quiz.includes_outcomes !== undefined) counts.includes_outcomes += quiz.includes_outcomes ? 1 : 0;
    if (quiz.chunked_content !== undefined) counts.chunked_content += quiz.chunked_content ? 1 : 0;
    if (quiz.career_relevance !== undefined) counts.career_relevance += quiz.career_relevance ? 1 : 0;
    if (quiz.provides_feedback !== undefined) counts.provides_feedback += quiz.provides_feedback ? 1 : 0;
    if (quiz.instructions !== undefined) counts.instructions += quiz.instructions ? 1 : 0;
    if (quiz.preparation !== undefined) counts.preparation += quiz.preparation ? 1 : 0;
    if (quiz.clarity !== undefined) counts.clarity += quiz.clarity;
  }
  return counts;
}

function calcCourseQuizScore(counts) {
  let total = counts.clarity 
    + counts.chunked_content 
    + counts.includes_outcomes 
    + counts.career_relevance 
    + counts.provides_feedback 
    + counts.instructions 
    + counts.preparation;
  total /= (8 * counts.num_reviews);
  return total;
}



function calcCourseScore(pageCounts, quizCounts, assignmentCounts) {
  let score = 0;
  console.log(pageCounts);
  console.log(quizCounts);
  console.log(assignmentCounts);
  let pageScore = pageCounts.num_reviews > 0 ? (calcCoursePageScore(pageCounts) * pageCounts.num_reviews) : 0;
  console.log(pageScore);
  let quizScore = quizCounts.num_reviews > 0 ? (calcCourseQuizScore(quizCounts) * quizCounts.num_reviews) : 0;
  console.log(quizScore);
  let assignmentScore = assignmentCounts.num_reviews > 0 ? (calcCourseAssignmentScore(assignmentCounts) * assignmentCounts.num_reviews) : 0;
  console.log(assignmentScore);
  let totalItems = quizCounts.num_reviews + assignmentCounts.num_reviews + pageCounts.num_reviews;
  score = totalItems > 0 ? (quizScore + assignmentScore + pageScore) / totalItems : 0;
  return score; 
}