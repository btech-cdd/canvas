(async function() {
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
  if (accountId != 3 && enrollmentTermId) {
    let createCourseButton = $($("#content").find("[aria-label='Create new course']")[0]).parent();
    let sectionAdderSpan = $('<span></span>');
    let sectionAdderButton = $(createCourseButton.html().replace('Course', 'HS Sections').replace('Create new course', 'Add HS sections'));
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
      "InTech HS AM"
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
      // let modalContent = $('body .btech-modal-content-inner');
      $("body").append(modal);
      return modal;
    }

    sectionAdderButton.click(async function() {
      let modal = createModal();
      let content = $(modal.find('.btech-modal-content-inner')[0]);
      content.append(`
        <div id="btech-hs-sections-adder-vue">
          <div>Select Course to which you want to add Sections</div>
          <div>
            <div 
              v-for="(course, c) in courses" :key="c"
              >
              <div
                :style={
                  'background-color': c % 2 == 0 ? 'white' : '#EEE'
                }
              >{{ c }} - {{ course.name }}</div>
            </div>
          </div>
        </div>
      `);

      let app = new Vue({
        el: '#btech-hs-sections-adder-vue',
        mounted: async function () {
          let courses = await canvasGet(`/api/v1/accounts/${accountId}/courses?enrollment_term_id=${enrollmentTermId}`);
          this.courses = courses.filter(course => {
            return course.sis_course_id != undefined;
          });
        },
        data: function () {
          return {
            courses: []
          };
        }
      });
      modal.on("click", function(event) {
        if ($(event.target).is(modal)) {
          app.$destroy();
          modal.remove();
        }
      });
    })

  }
})();