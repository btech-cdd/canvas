(async function () {
  console.log(window.location);
  console.log(document.referrer);
  const urlParams = new URLSearchParams(window.location.hash);
  let conversationId = urlParams.get('conversation');
  console.log(conversationId);
  if (conversationId !== null) {
    let abort = false; //when flipped to true, will stop scrolling and return to top

    //Send an async request to check if this conversation even exists. 
    //Tool will be scrolling and looking for conversation meanwhile to reduce time user is waiting.
    $.get("/api/v1/conversations/" + conversationId).fail(function () {
      abort = true; //cancel scrolling
      $(".message-list-scroller").scrollTop(0); //scroll back to top
      alert("Conversation not found"); //warn user nothing was found
    });

    //begin scrolling and searching for conversation until found or abort gets flagged from async request
    while ($("#conversation-checkbox-" + conversationId).length == 0 && abort == false) {
      $(".message-list-scroller").scrollTop($(".message-list-scroller")[0].scrollHeight);
      await delay(500);
    }
    if (!abort) { //only run if scroll wasn't aborted
      let el = $("#conversation-checkbox-" + conversationId);
      $(".message-list-scroller").scrollTop($(".message-list-scroller").scrollTop() + el.position().top); //move the conversation element to the top of the scroll menu on the left hand side
      el.find("input").trigger("click"); //open it
    }
  }
})();