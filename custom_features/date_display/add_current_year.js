IMPORTED_FEATURE = {};
IMPORTED_FEATURE = {
  initiated: false,
  async _init() {
    let feature = this;
    feature.setAssignmentSubmittedDateHeader("span.submission-details-header__time");
    //this has been commented out because it's breaking the grade updater. Will have to readdress this if we need to add it back in.
    // feature.setAssignmentSubmittedDateHeader("div.quiz-submission.headless", "#preview_frame");
    let preEl = await getElement("div.quiz-submission.headless .quiz_score", "#preview_frame");
    let header = preEl.next();
    feature.setAssignmentSubmittedDateHeaderElement(header);
    feature.setAssignmentSubmittedDateHeader("div.comment_list span.posted_at");
  },

  async setAssignmentSubmittedDateHeader(selectorText, iframe = "") {
    let feature = this;
    let elements = await getElement(selectorText, iframe);
    elements.each(function () {
      let element = $(this);
      //This should be updated to not replace the whole html, but to just find the element that holds it and only replace that element
      feature.setAssignmentSubmittedDateHeaderElement(element);
    });
  },

  setAssignmentSubmittedDateHeaderElement(element) {
    element.html(element.html().replace(/([A-Z][a-z]+) ([0-9]+) at/g, "$1 $2, " + (new Date()).getFullYear() + " at"));
  }
}