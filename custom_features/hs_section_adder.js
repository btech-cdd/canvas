(async function() {
  let createCourseButton = $($("#content").find("[aria-label='Create new course']")[0]).parent();
  let sectionAdderSpan = $('<span></span>');
  let sectionAdderButton = $(createCourseButton.html().replace('Course', 'Section').replace('Create new course', 'Add HS sections'));
  sectionAdderSpan.append(sectionAdderButton);
  createCourseButton.after(sectionAdderSpan);

  const BTECH_HS_LIST = [
    "Bear River HS AM",
    "Box Elder HS AM",
    "Green Canyon HS AM",
    "Logan HS AM",
    "Mt Crest HS AM",
    "Rich HS AM",
    "Ridgeline HS AM",
    "Sky View HS AM",
    "Teacher Training",
    "Inteach HS AM"
  ]
  function createModal() {
    let modal = $(`
      <div class='btech-modal' style='display: inline-block;'>
          <!-- ERASE THE DISPLAY PIECE BEFORE GOING LIVE -->
          <div class='btech-modal-content' style='max-width: 500px;'>
              <div class='btech-modal-content-inner'>
              </div>
          </div>
      </div>
    `);
    $("body").append(modal);
    return modal;
  }

  sectionAdderButton.click(async function() {
    $('body').append(``);
    // Get the full URL of the current page
    const fullUrl = window.location.href;
    const url = new URL(fullUrl);
    // Define the regex pattern to match 'accounts/<account_id>'
    const regex = /accounts\/(\d+)/;
    // Execute the regex on the URL
    const match = fullUrl.match(regex);
    // Extract the account_id if the regex matched
    const accountId = match ? match[1] : null;
    // Extract the enrollment_term_id from the search parameters
    const enrollmentTermId = url.searchParams.get('enrollment_term_id'); // "1110"
    let modal = createModal();
    let content = $(modal.find('.btech-modal-content-inner')[0]);
    content.append("<span>COURSE</span>");

    let courses = await canvasGet(`/api/v1/accoutns/${accountId}/courses?enrollment_term_id=${enrollmentTermId}`);
    console.log(courses);
  })

})();