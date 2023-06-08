var BETA = false;
if (window.location.href.includes("btech.beta.instructure.com")) {
  BETA = true;
} else {
  BETA = false;
}
BETA = false;
var CDDIDS = [
  1893418, //Josh 
  2023384, //Dani
  1638854, //Mason
  1807337, //Jon
  2064104, //Jonny
  2101656, //Sydney
  2075766, //Kristyn
  1869288, //Alan
  2000557, //Charlotte
  2048150, //Tiffany
  2074560, //Ryan

];

function getCSSVar(cssvar) {
    var r = document.querySelector(':root');
    var rs = getComputedStyle(r);
    let val = rs.getPropertyValue(cssvar)
    return val;
}

// Create a function for setting a variable value
function setCSSVar(cssvar, val) {
    var r = document.querySelector(':root');
    r.style.setProperty(cssvar, val);
    getCSSVar(cssvar);
}

const DEFAULT_MAX_WIDTH = "50rem";
function updateMaxWidth() {
  try {
      $.get(`/api/v1/users/self/custom_data/page_width?ns=com.btech`, function(data) {
        if (data.data == "readable") {
          setCSSVar("--btech-max-width", DEFAULT_MAX_WIDTH);
        } else if (data.data == "auto") {
          setCSSVar("--btech-max-width", "auto")
        } else { //some kind of error?
          setCSSVar("--btech-max-width", DEFAULT_MAX_WIDTH);
          $.put(`/api/v1/users/self/custom_data?ns=com.btech&data[page_width]=auto`);
        }
      });
  } catch(err) {
      setCSSVar("--btech-max-width", DEFAULT_MAX_WIDTH);
      $.put(`/api/v1/users/self/custom_data?ns=com.btech&data[page_width]=auto`);
  }
}
updateMaxWidth();


let CURRENT_COURSE_ID = null;
var rCheckInCourse = /^\/courses\/([0-9]+)/;
if (rCheckInCourse.test(window.location.pathname)) {
  CURRENT_COURSE_ID = parseInt(window.location.pathname.match(rCheckInCourse)[1]);
}
var CURRENT_DEPARTMENT_ID = null;
var IS_BLUEPRINT = null;
var IS_TEACHER = null;
var IS_ME = false;
var IS_CDD = false;
var COURSE_HOURS, COURSE_LIST;
//Now, if testing in beta, will pull from beta instance of all these tools
//Should start experimenting with branching in github
var SOURCE_URL = 'https://bridgetools.dev/canvas'
if (BETA) {
  SOURCE_URL = 'https://bridgetools.dev/canvas-beta'
}
if (ENV.current_user_roles !== null) {
  IS_TEACHER = (ENV.current_user_roles.includes("teacher") || ENV.current_user_roles.includes("admin"));
}

var FEATURES = {};
var IMPORTED_FEATURE = {};

var MONTH_NAMES_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
(async function() {




  if (window.self === window.top) { //Make sure this is only run on main page, and not every single iframe on the page. For example, Kaltura videos all load in a Canvas iframe
    let currentUser = parseInt(ENV.current_user.id);
    IS_ME = (currentUser === 1893418);
    IS_CDD = (CDDIDS.includes(currentUser))
    // https://btech.instructure.com/accounts/3/theme_editor

    await $.getScript("https://bridgetools.dev/canvas/scripts.js");
    feature("login_page", {}, /^\/login/);
    feature("editor_toolbar/manage-settings", {}, /^\/btech-toolbar/);
    if (IS_ME) feature("editor_toolbar/main", {}, /^\/courses\/[0-9]+\/(pages|assignments|quizzes|discussion_topics)\/(.+?)\/edit/);
    feature("img-zoom", {}, /users/);
    feature("side-menu", {}, "");

    //FEATURES THAT DON'T NEED ALL THE EXTRA STUFF LIKE HOURS AND DEPT DATA AND VUE
    feature('conversations/open_conversation', {}, /^\/conversations/);
    featureCDD('copy_to_next_year', {}, /^\/accounts\/[0-9]+$/);
    if (rCheckInCourse.test(window.location.pathname)) {
      feature('modules/course_features');
      //I'm putting concluding students in here as well vvv
      feature('modules/enrollment_dates_teacher', {}, /^\/courses\/[0-9]+\/users\/[0-9]+$/);
      feature("external_assignments_fullscreen", {}, /^\/courses\/[0-9]+\/(assignments)/);
      if (IS_TEACHER) {
        feature('quizzes/show_analytics', {}, /^\/courses\/[0-9]+\/quizzes\/[0-9]+/);
        feature("modules/show_undelete", {}, /^\/courses\/[0-9]+(\/modules){0,1}$/);
        feature("kaltura/showInfo", {}, /^\/courses\/[0-9]+\/(pages|assignments|quizzes|discussion_topics)/);
      } else {
        feature("check_linked_item_completed", {}, /^\/courses\/[0-9]+\/(pages|assignments|quizzes|discussion_topics)/);
      }
    }

    //TOOLBAR FEATURES
    await $.getScript("https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js");
    await feature("page_formatting/tinymce_font_size", {}, /^\/courses\/[0-9]+\/(pages|assignments|quizzes|discussion_topics)\/(.+?)\/edit/);
    await feature("editor_toolbar/toolbar", {}, /^\/courses\/[0-9]+\/(pages|assignments|quizzes|discussion_topics)/);
    feature("editor_toolbar/basics", {}, /^\/courses\/[0-9]+\/(pages|assignments|quizzes|discussion_topics)\/(.+?)\/edit/);
    feature("editor_toolbar/syllabi", {}, /^\/courses\/[0-9]+\/(pages|assignments|quizzes|discussion_topics)/);
    feature('page_formatting/dropdown_from_table', {}, /^\/courses\/[0-9]+\/(pages|assignments|quizzes|discussion_topics)/);
    feature('page_formatting/tabs_from_table', {}, /^\/courses\/[0-9]+\/(pages|assignments|quizzes|discussion_topics)/);
    feature('page_formatting/expandable_from_table', {}, /^\/courses\/[0-9]+\/(pages|assignments|quizzes|discussion_topics)/);
    feature('page_formatting/google_sheets_table', {}, /^\/courses\/[0-9]+\/(pages|assignments|quizzes|discussion_topics)/);
    feature('page_formatting/table_from_page', {}, /^\/courses\/[0-9]+\/(pages|assignments|quizzes|discussion_topics)/);
    feature("page_formatting/image_map", {}, /^\/courses\/[0-9]+\/(pages|assignments|quizzes|discussion_topics)/);
    feature("page_formatting/image_formatting", {}, /^\/courses\/[0-9]+\/(pages|assignments|quizzes|discussion_topics)/);
    feature("editor_toolbar/images", {}, /^\/courses\/[0-9]+\/(pages|assignments|quizzes|discussion_topics)/);
    feature("editor_toolbar/tables", {}, /^\/courses\/[0-9]+\/(pages|assignments|quizzes|discussion_topics)/);
    feature("editor_toolbar/headers", {}, /^\/courses\/[0-9]+\/(pages|assignments|quizzes|discussion_topics)/);
    feature("page_formatting/print_rubric", {}, /^\/courses\/[0-9]+\/(assignments)/);

    //OTHER FEATURES
    $.getScript("https://cdn.jsdelivr.net/npm/vue@2.6.12").done(function () {
      $.getScript(SOURCE_URL + "/course_data/course_hours.js").done(() => {
        //GENERAL FEATURES
        //feature("reports/dashboard/banner-report", {}, /^\/$/);
        if (!IS_TEACHER) {
          feature("reports/individual_page/report", {}, [
            /^\/$/,
            /^\/courses\/[0-9]+\/grades$/
          ]);
        }
        if (IS_TEACHER) {
          feature("reports/grades_page/report", {}, /^\/courses\/[0-9]+\/gradebook$/);
          feature("hs/enroll", {}, /^\/accounts\/[0-9]+\/enrollhs$/);
          feature("reports/individual_page/report", {}, [
            /^\/courses\/[0-9]+\/users\/[0-9]+$/,
            /^\/accounts\/[0-9]+\/users\/[0-9]+$/,
            /^\/users\/[0-9]+$/,
            /^\/courses\/[0-9]+\/grades\/[0-9]+/
          ]);
        }
        feature("password_reset", {}, [
          /^\/courses\/[0-9]+\/users\/[0-9]+$/,
          /^\/accounts\/[0-9]+\/users\/[0-9]+$/,
          /^\/users\/[0-9]+$/,
          /^\/courses\/[0-9]+\/grades\/[0-9]+/
        ]);
        let rCheckInDepartment = /^\/accounts\/([0-9]+)/;
        if (rCheckInDepartment.test(window.location.pathname)) {
          CURRENT_DEPARTMENT_ID = parseInt(window.location.pathname.match(rCheckInDepartment)[1]);
        }
        if (rCheckInCourse.test(window.location.pathname)) {
          feature("distance/approved-button", {}, /^\/courses\/[0-9]+(\/modules){0,1}$/);
          IS_BLUEPRINT = !(ENV.BLUEPRINT_COURSES_DATA === undefined)
          $.get('/api/v1/courses/' + CURRENT_COURSE_ID, function (courseData) {
            CURRENT_DEPARTMENT_ID = courseData.account_id;
            //AVAILABLE TO EVERYONE
            $.getScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/latest/TweenMax.min.js", function() {
              feature('modules/enrollment_dates_student', {}, /^\/courses\/[0-9]+(\/modules){0,1}$/);
            });
            feature("quizzes/upload_questions", {}, /\/courses\/([0-9]+)\/question_banks$/);
            feature("quizzes/duplicate_bank_item", {}, /\/courses\/([0-9]+)\/question_banks\/([0-9]+)/);
            feature('speed_grader/next_submitted_assignment', {}, /^\/courses\/([0-9]+)\/gradebook\/speed_grader/);
            feature('speed_grader/answer_key', {}, /^\/courses\/([0-9]+)\/gradebook\/speed_grader/);
            feature('speed_grader/assignment_page_link', {}, /^\/courses\/[0-9]+\/assignments\/[0-9]+\/submissions\/[0-9]+/)
            feature("rubrics/sortable", {}, [/\/rubrics/, /\/assignments\//]);
            feature("calendar/signup", {}, /^\/courses\/[0-9]+\/(pages|assignments|quizzes|discussion_topics)/);
            feature("toggle-max-width", {}, /^\/courses\/[0-9]+\/(pages|assignments|quizzes|discussion_topics)/);
            if (IS_BLUEPRINT) feature('blueprint_association_links');
            feature('modules/convert_to_page');
            // feature('instructional/glossary');
            //COURSE SPECIFIC FEATURES
            //DEPARTMENT SPECIFIC IMPORTS

            if (CURRENT_DEPARTMENT_ID == 4218) { // DATA ANALYTICS
              externalFeature("https://cdn.datacamp.com/datacamp-light-latest.min.js", /^\/courses\/([0-9]+)\/(pages|assignments|quizzes|discussion_topics)\/[0-9]+(\?|$)/); //really just available to data analytics
              feature("people_page/sync_start_dates_with_section", {}, /^\/courses\/[0-9]+\/course_pacing/);
              feature("department_specific/data_analytics_feedback_report", {}, /^\/courses\/[0-9]+(\/modules){0,1}$/);
            }
            if (CURRENT_DEPARTMENT_ID === 3824) { // DENTAL
              feature("grades_page/highlighted_grades_page_items_dental", {}, /^\/courses\/[0-9]+\/grades\/[0-9]+/);
              feature("grades_page/attempts", {}, /^\/courses\/[0-9]+\/grades\/[0-9]+/);
              feature("rubrics/attempts_data", {}, [/^\/courses\/[0-9]+\/assignments\/[0-9]+\/submissions\/[0-9]+/, /^\/courses\/[0-9]+\/gradebook\/speed_grader/]);
              feature("rubrics/gen_comment", {}, [/^\/courses\/[0-9]+\/assignments\/[0-9]+\/submissions\/[0-9]+/, /^\/courses\/[0-9]+\/gradebook\/speed_grader/]);
              feature("highlight_comments_same_date", {}, [/^\/courses\/[0-9]+\/assignments\/[0-9]+\/submissions\/[0-9]+/, /^\/courses\/[0-9]+\/gradebook\/speed_grader/]);
              //This is currently disabled because it was decided it might be more confusing for students to see a grade that was only part of their final grade.
              // feature("previous-enrollment-data/previous_enrollment_period_grades", {}, /^\/courses\/[0-9]+\/grades/);
              if (IS_TEACHER) {
                feature("speed_grader/split_screen", {}, /^\/courses\/[0-9]+\/gradebook\/speed_grader/);
              }
            }
            if (CURRENT_DEPARTMENT_ID === 3833) { //business
              feature("department_specific/business_hs");
              feature("previous-enrollment-data/previous_enrollment_period_grades");
            }
            if (CURRENT_DEPARTMENT_ID === 3819 || CURRENT_DEPARTMENT_ID === 3832) { // AMAR && ELEC
              feature("modules/points_to_hours_header");
              feature("speed_grader/resize_submitted_video", {}, /^\/courses\/[0-9]+\/gradebook\/speed_grader/);
              // feature("department_specific/amar_elec_add_module_items"); //don't think this is used anymore
            }
            if (CURRENT_DEPARTMENT_ID === 3847) { //meats
              feature("grades_page/highlighted_grades_page_items", {}, /^\/courses\/[0-9]+\/grades\/[0-9]+/);
              feature("speed_grader/split_screen", {}, /^\/courses\/[0-9]+\/gradebook\/speed_grader/);
            }
            if (CURRENT_DEPARTMENT_ID === 3837) { //auto collision
              feature("speed_grader/split_screen", {}, /^\/courses\/[0-9]+\/gradebook\/speed_grader/);
            }
            if (CURRENT_DEPARTMENT_ID === 3840 || CURRENT_DEPARTMENT_ID === 3839) { //media design & drafting
            }
            if (CURRENT_DEPARTMENT_ID === 3841 || CURRENT_DEPARTMENT_ID === 3947) { //cosmetology && master esthetics
              // feature("department_specific/esthetics_cosmetology_services");
            }
            if (CURRENT_DEPARTMENT_ID === 3848) { //Interior Design
              feature("grades_page/default_include_ungraded_assignments", {}, /^\/courses\/[0-9]+\/grades/);
            }
            if (CURRENT_DEPARTMENT_ID === 3820) { //Web & Mobile
              // externalFeature("https://bridgerland-web-dev.github.io/html_practice/html_practice.js", /^\/courses\/[0-9]+\/(pages|assignments|quizzes|discussion_topics)/)
              externalFeature("https://static.codepen.io/assets/embed/ei.js", /^\/courses\/[0-9]+\/(pages|assignments|quizzes|discussion_topics)/);
            }
            if (CURRENT_DEPARTMENT_ID === 3883) { //Diesel
              feature("department_specific/diesel-page-turner", {}, /^\/courses\/[0-9]+\/(pages|assignments|quizzes|discussion_topics)/);
            }

          });
        }

        if (ENV?.current_user_roles?.includes('root_admin')) {
          feature("remove_former_employees", {}, /^\/accounts\/3\/users\/[0-9]+/)
        }

        feature("quizzes/question_bank_sorter", {}, /^\/courses\/[0-9]+\/quizzes\/[0-9]+\/edit/);
        feature("sort_assignment_groups", {}, /assignments$/)
        feature("rubrics/add_criteria_from_csv", {}, new RegExp('/(rubrics|assignments\/)'));
        feature("rubrics/create_rubric_from_csv", {}, new RegExp('^/(course|account)s/([0-9]+)/rubrics$'));
        //CDD ONLY
        featureCDD("modules/show_hours", {}, /^\/courses\/[0-9]+(\/modules){0,1}$/);
        featureCDD("modules/delete_module_items", {}, /^\/courses\/[0-9]+(\/modules){0,1}$/);

        //Don't turn on flags unless figure out a way to not display the flag tool by default.
        ////Ran into issue where Vue wasn't loading properly so nobody could do anything.
        //if (IS_CDD) externalFeature('https://flags.bridgetools.dev/main.js');
        feature('reports/accreditation', {}, /^\/courses\/([0-9]+)\/external_tools\/([0-9]+)/);

        // if (IS_ME) $.getScript("https://bridgetools.dev/collaborator/import.js");
        featureCDD("cleoducktra/main", {}, /^/);
        if (IS_ME) featureCDD("cleoducktra/quiz-questions", {}, /^\/courses\/[0-9]+\/quizzes\/[0-9]+\/edit/);
        //featureCDD("transfer_sections", {}, /^\/courses\/[0-9]+\/users/);
        feature("welcome_banner", {}, /^\/$/);
      });
    });
  }
})();