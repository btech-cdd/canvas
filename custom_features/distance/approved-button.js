(async function() {

  let approvals;
  await $.get("https://distance.bridgetools.dev/api/courses/" + ENV.COURSE_ID + "/approval", data => {approvals = data});

  let items = await canvasGet('/api/v1/courses/' + ENV.COURSE_ID + '/modules?include[]=items&include[]=content_details');
  let contentNotApprovedColor = "rgb(76, 88, 96)";
  let contentApprovedColor = "rgb(11, 178, 15)";

  $('.ig-distance-approved').each(function () {
    $(this).remove();
  })
  for (let m = 0; m < items.length; m++) {
      let module = items[m];
      for (let i = 0; i < module.items.length; i++) {
          let item = module.items[i];
          if (item.url !== undefined && item.content_id > 0) {
              let itemLiElId = "context_module_item_" + item.id;
              let titleEl = $("#" + itemLiElId + " div.module-item-title");
              let approved = false;
              for (let a = 0; a < approvals.length; a++) {
                  let approval = approvals[a];
                  if (approval.type == item.type && approval.content_id == item.content_id) {
                      approved = approval.approved;
                  }
              }
              let color = contentNotApprovedColor;
              let distanceApprovedButton = $(`<span class="ig-distance-approved" style="float: right; color: ` + color + `"><i class="fas fa-laptop-house" aria-hidden="true"></i></span>`);
              if (IS_CDD) {
                  if (approved) color = contentApprovedColor;
                  distanceApprovedButton.click(function() {
                      let currentColor = $(this).css("color");
                      console.log(currentColor);
                      let approved = (currentColor == contentApprovedColor);
                      approved = !approved;
                      if (approved) $(this).css("color", contentApprovedColor);
                      if (!approved) $(this).css("color", contentNotApprovedColor);
                                                  $.post("https://distance.bridgetools.dev/api/courses/" + ENV.COURSE_ID + "/approval", {
                          title: item.title,
                          type: item.type,
                          content_id: item.content_id,
                          approved: approved
                      });
                  });
              }
              if (approved || IS_CDD) {
                  titleEl.prepend(distanceApprovedButton);
              }
              let item_url = item.url.replace('/api/v1', '');
          }
      }
  }

})();