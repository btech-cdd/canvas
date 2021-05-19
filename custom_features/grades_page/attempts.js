if (/^\/courses\/[0-9]+\/grades\/[0-9]+$/.test(window.location.pathname)) {
  let submissions = await canvasGet("/api/v1/courses/" + CURRENT_COURSE_ID + "/students/submissions", {
      'student_ids': [ENV.student_id]
  });
  let head = $("thead tr");
  if (head.find('th.attempts').length === 0) head.find('th.possible').after('<th class="possible attempts">Attempts</th>');
  for (let s = 0; s < submissions.length; s++) {
      let sub = submissions[s];
      let row = $("#submission_" + sub.assignment_id);
      let attemptsEl = row.find('td.attempts');
      if (attemptsEl.length === 0) {
          let attempts = '';
          if (typeof sub.attempt === 'number') attempts = sub.attempt;
          let pointsPossibleEl = row.find('td.points_possible');
          pointsPossibleEl.after('<td class="possible attempts">' + attempts + '</td>');
      }
  }
}