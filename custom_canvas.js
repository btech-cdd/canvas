//THIS MUST BE UPDATED IN THE THEMES SECTION OF CANVAS
//check for custom theme info, will probably only run on pages, quizzes, and assignments, but who knows
//Might be worth moving all of this into the custom-settings page instead of an individual div on each page, then wait to load any of the features involving this custom settings until after that page has loaded

//9/8/2021, seeing if disabling this breaks anything. Shouldn't...
/*
var themeParent = $('#btech-theme-parent');
if (themeParent.length === 1) {
  let header = themeParent.find('.btech-theme-header');
  if (header.length === 1) {
    document.documentElement.style.setProperty('--btech-theme-header-background-color', header.css('background-color'));
    document.documentElement.style.setProperty('--btech-theme-header-color', header.css('color'));
  }

  let headerHover = themeParent.find('.btech-theme-header-hover');
  if (headerHover.length === 1) {
    document.documentElement.style.setProperty('--btech-theme-header-hover-background-color', headerHover.css('background-color'));
    document.documentElement.style.setProperty('--btech-theme-header-hover-color', headerHover.css('color'));
  }
}
*/

var BETA = false;
if (window.location.href.includes("btech.beta.instructure.com")) {
  BETA = true;
} else {
  BETA = false;
}
var CDDIDS = [
  1893418, //Josh 
  2023384, //Dani
  1638854, //Mason
  1807337, //Jon
  1869288, //Alan
  2000557, //Charlotte
  2048150, //Tiffany
];

//No idea what this was going to be for, but it looks interesting, so I'm not deleting it yet.
//5/3/22
/*
if (/^\/courses\/[0-9]+$/.test(window.location.pathname)) {
  if (CDDIDS.includes(parseInt(ENV.current_user.id))) {
    function copyStringToClipboard(str) {
      // Create new element
      var el = document.createElement('textarea');
      // Set value (string to be copied)
      el.value = str;
      // Set non-editable to avoid focus and move outside of view
      el.setAttribute('readonly', '');
      el.style = {
        position: 'absolute',
        left: '-9999px'
      };
      document.body.appendChild(el);
      // Select text inside element
      el.select();
      // Copy text to clipboard
      navigator.clipboard.writeText(str);
      // Remove temporary element
      document.body.removeChild(el);
    }
    let btn = $(`<button class="btn">Copy Structure</button>`);
    $(".header-bar-right__buttons .add_module_link").before(btn);
    btn.click(function () {
      $.get("/api/v1/courses/" + ENV.COURSE_ID + "/modules?per_page=100&include[]=items", (data) => {
        output = "";
        for (let i in data) {
          let module = data[i];
          output += module.name + "\n";
          for (let j in module.items) {
            let item = module.items[j];
            output += item.title + "\t" + item.type + "\n";
          }
        }
        copyStringToClipboard(output);
      });
    });
  }
}
*/

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



if (window.self === window.top) { //Make sure this is only run on main page, and not every single iframe on the page. For example, Kaltura videos all load in a Canvas iframe
  let currentUser = parseInt(ENV.current_user.id);
  IS_ME = (currentUser === 1893418);
  IS_CDD = (CDDIDS.includes(currentUser))
  /*
  https://btech.instructure.com/accounts/3/theme_editor
  */


  //feature("login_page", {}, /^\/login/);

  $.getScript("https://bridgetools.dev/canvas/scripts.js").done(function() {

    //FEATURES THAT DON'T NEED ALL THE EXTRA STUFF LIKE HOURS AND DEPT DATA AND VUE
    feature('conversations/open_conversation', {}, /^\/conversations/);
    if (rCheckInCourse.test(window.location.pathname)) {
      feature('modules/course_features');
      feature("external_assignments_fullscreen", {}, /^\/courses\/[0-9]+\/(assignments)/);
      if (IS_TEACHER) {
        feature('quizzes/show_analytics', {}, /^\/courses\/[0-9]+\/quizzes\/[0-9]+/);
        feature("modules/show_undelete", {}, /^\/courses\/[0-9]+(\/modules){0,1}$/);
        feature("kaltura/showInfo", {}, /^\/courses\/[0-9]+\/(pages|assignments|quizzes|discussion_topics)/);
      }
    }

    //TOOLBAR FEATURES
    $.getScript("https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js").done(function () {
      $.getScript(SOURCE_URL + "/custom_features/editor_toolbar/toolbar.js").done(() => {
        feature("editor_toolbar/basics", {}, /^\/courses\/[0-9]+\/(pages|assignments|quizzes|discussion_topics)\/(.+?)\/edit/);
        feature("editor_toolbar/syllabi", {}, /^\/courses\/[0-9]+\/(pages|assignments|quizzes|discussion_topics)/);
        feature('page_formatting/dropdown_from_table', {}, /^\/courses\/[0-9]+\/(pages|assignments|quizzes|discussion_topics)/);
        feature('page_formatting/tabs_from_table', {}, /^\/courses\/[0-9]+\/(pages|assignments|quizzes|discussion_topics)/);
        feature('page_formatting/expandable_from_table', {}, /^\/courses\/[0-9]+\/(pages|assignments|quizzes|discussion_topics)/);
        feature('page_formatting/google_sheets_table', {}, /^\/courses\/[0-9]+\/(pages|assignments|quizzes|discussion_topics)/);
        feature('page_formatting/table_from_page', {}, /^\/courses\/[0-9]+\/(pages|assignments|quizzes|discussion_topics)/);
        feature("page_formatting/tinymce_font_size", {}, /^\/courses\/[0-9]+\/(pages|assignments|quizzes|discussion_topics)\/(.+?)\/edit/);
        feature("page_formatting/image_map", {}, /^\/courses\/[0-9]+\/(pages|assignments|quizzes|discussion_topics)/);
        feature("page_formatting/image_formatting", {}, /^\/courses\/[0-9]+\/(pages|assignments|quizzes|discussion_topics)/);
        feature("editor_toolbar/images", {}, /^\/courses\/[0-9]+\/(pages|assignments|quizzes|discussion_topics)/);
        feature("editor_toolbar/tables", {}, /^\/courses\/[0-9]+\/(pages|assignments|quizzes|discussion_topics)/);
        feature("editor_toolbar/headers", {}, /^\/courses\/[0-9]+\/(pages|assignments|quizzes|discussion_topics)/);
        feature("page_formatting/print_rubric", {}, /^\/courses\/[0-9]+\/(assignments)/);
      });
    });

    //OTHER FEATURES
    $.getScript("https://cdn.jsdelivr.net/npm/vue@2.6.12").done(function () {
      $.getScript(SOURCE_URL + "/course_data/course_hours.js").done(() => {
        //GENERAL FEATURES
        // feature("reports/dashboard/banner-report", {}, /^\/$/);
        if (!IS_TEACHER) {
          feature("reports/individual_page/report", {}, [/^\/$/]);
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
        if (IS_CDD) {
          feature("password_reset", {}, [
            /^\/courses\/[0-9]+\/users\/[0-9]+$/,
            /^\/accounts\/[0-9]+\/users\/[0-9]+$/,
            /^\/users\/[0-9]+$/,
            /^\/courses\/[0-9]+\/grades\/[0-9]+/
          ]);
        }
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
            feature("quizzes/duplicate_bank_item", {}, /\/courses\/([0-9]+)\/question_banks\/([0-9]+)/);
            feature('speed_grader/next_submitted_assignment', {}, /^\/courses\/([0-9]+)\/gradebook\/speed_grader/);
            feature('speed_grader/answer_key', {}, /^\/courses\/([0-9]+)\/gradebook\/speed_grader/);
            feature('speed_grader/assignment_page_link', {}, /^\/courses\/[0-9]+\/assignments\/[0-9]+\/submissions\/[0-9]+/)
            feature("rubrics/sortable", {}, [/\/rubrics/, /\/assignments\//]);
            feature("calendar/signup", {}, /^\/courses\/[0-9]+\/(pages|assignments|quizzes|discussion_topics)/);
            if (IS_BLUEPRINT) feature('blueprint_association_links');
            feature('modules/convert_to_page');
            // feature('instructional/glossary');
            //COURSE SPECIFIC FEATURES
            featurePilot("rubrics/gen_comment", CURRENT_COURSE_ID, [489089]); //Micro Controllers I
            //DEPARTMENT SPECIFIC IMPORTS

            if (CURRENT_DEPARTMENT_ID == 4218) { // DATA ANALYTICS
              externalFeature("https://cdn.datacamp.com/datacamp-light-latest.min.js", /^\/courses\/([0-9]+)\/(pages|assignments|quizzes|discussion_topics)\/[0-9]+(\?|$)/); //really just available to data analytics
              feature("people_page/sync_start_dates_with_section", {}, /^\/courses\/[0-9]+\/users/);
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
              feature("rubrics/self_graded", {}, [/^\/courses\/[0-9]+\/gradebook\/speed_grader/, /courses\/([0-9]+)\/assignments\/([0-9]+)/]);
            }
            if (CURRENT_DEPARTMENT_ID === 3840 || CURRENT_DEPARTMENT_ID === 3839) { //media design & drafting
            }
            if (CURRENT_DEPARTMENT_ID === 3841 || CURRENT_DEPARTMENT_ID === 3947) { //cosmetology && master esthetics
              feature("department_specific/esthetics_cosmetology_services");
            }
            if (CURRENT_DEPARTMENT_ID === 3848) { //Interior Design
              feature("grades_page/default_include_ungraded_assignments", {}, /^\/courses\/[0-9]+\/grades/);
            }
            if (CURRENT_DEPARTMENT_ID === 3820) { //Web & Mobile
              externalFeature("https://bridgerland-web-dev.github.io/html_practice/html_practice.js", /^\/courses\/[0-9]+\/(pages|assignments|quizzes|discussion_topics)/)
            }
            if (CURRENT_DEPARTMENT_ID === 3883) { //Diesel
              feature("department_specific/diesel-page-turner", {}, /^\/courses\/[0-9]+\/(pages|assignments|quizzes|discussion_topics)/);
            }

          });
        }

        if (ENV.current_user_roles.includes('root_admin')) {
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
        if (IS_ME) {
          feature('reports/accreditation', {}, /^\/courses\/([0-9]+)\/external_tools\/([0-9]+)/);
        } else {
          feature('reports/accreditation', {}, /^\/courses\/([0-9]+)\/external_tools\/([0-9]+)/);
        }

        // if (IS_ME) $.getScript("https://bridgetools.dev/collaborator/import.js");
        //featureCDD("transfer_sections", {}, /^\/courses\/[0-9]+\/users/);
        feature("welcome_banner", {}, /^\/$/);
      });
    });
  });
}


//FROM https://github.com/jeresig/jquery.hotkeys
/*jslint browser: true*/
/*jslint jquery: true*/

/*
 * jQuery Hotkeys Plugin
 * Copyright 2010, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Based upon the plugin by Tzury Bar Yochay:
 * https://github.com/tzuryby/jquery.hotkeys
 *
 * Original idea by:
 * Binny V A, http://www.openjs.com/scripts/events/keyboard_shortcuts/
 */

/*
 * One small change is: now keys are passed by object { keys: '...' }
 * Might be useful, when you want to pass some other data to your handler
 */


/*
 * CURRENTLY IN USE
 * ctrl+shift+f : opens the create new flag modal in the flags feature
 * 
 */

(function (jQuery) {

  jQuery.hotkeys = {
    version: "0.2.0",

    specialKeys: {
      8: "backspace",
      9: "tab",
      10: "return",
      13: "return",
      16: "shift",
      17: "ctrl",
      18: "alt",
      19: "pause",
      20: "capslock",
      27: "esc",
      32: "space",
      33: "pageup",
      34: "pagedown",
      35: "end",
      36: "home",
      37: "left",
      38: "up",
      39: "right",
      40: "down",
      45: "insert",
      46: "del",
      59: ";",
      61: "=",
      96: "0",
      97: "1",
      98: "2",
      99: "3",
      100: "4",
      101: "5",
      102: "6",
      103: "7",
      104: "8",
      105: "9",
      106: "*",
      107: "+",
      109: "-",
      110: ".",
      111: "/",
      112: "f1",
      113: "f2",
      114: "f3",
      115: "f4",
      116: "f5",
      117: "f6",
      118: "f7",
      119: "f8",
      120: "f9",
      121: "f10",
      122: "f11",
      123: "f12",
      144: "numlock",
      145: "scroll",
      173: "-",
      186: ";",
      187: "=",
      188: ",",
      189: "-",
      190: ".",
      191: "/",
      192: "`",
      219: "[",
      220: "\\",
      221: "]",
      222: "'"
    },

    shiftNums: {
      "`": "~",
      "1": "!",
      "2": "@",
      "3": "#",
      "4": "$",
      "5": "%",
      "6": "^",
      "7": "&",
      "8": "*",
      "9": "(",
      "0": ")",
      "-": "_",
      "=": "+",
      ";": ": ",
      "'": "\"",
      ",": "<",
      ".": ">",
      "/": "?",
      "\\": "|"
    },

    // excludes: button, checkbox, file, hidden, image, password, radio, reset, search, submit, url
    textAcceptingInputTypes: [
      "text", "password", "number", "email", "url", "range", "date", "month", "week", "time", "datetime",
      "datetime-local", "search", "color", "tel"
    ],

    // default input types not to bind to unless bound directly
    textInputTypes: /textarea|input|select/i,

    options: {
      filterInputAcceptingElements: true,
      filterTextInputs: true,
      filterContentEditable: true
    }
  };

  function keyHandler(handleObj) {
    if (typeof handleObj.data === "string") {
      handleObj.data = {
        keys: handleObj.data
      };
    }

    // Only care when a possible input has been specified
    if (!handleObj.data || !handleObj.data.keys || typeof handleObj.data.keys !== "string") {
      return;
    }

    var origHandler = handleObj.handler,
      keys = handleObj.data.keys.toLowerCase().split(" ");

    handleObj.handler = function (event) {
      //      Don't fire in text-accepting inputs that we didn't directly bind to
      if (this !== event.target &&
        (jQuery.hotkeys.options.filterInputAcceptingElements &&
          jQuery.hotkeys.textInputTypes.test(event.target.nodeName) ||
          (jQuery.hotkeys.options.filterContentEditable && jQuery(event.target).attr('contenteditable')) ||
          (jQuery.hotkeys.options.filterTextInputs &&
            jQuery.inArray(event.target.type, jQuery.hotkeys.textAcceptingInputTypes) > -1))) {
        return;
      }

      var special = event.type !== "keypress" && jQuery.hotkeys.specialKeys[event.which],
        character = String.fromCharCode(event.which).toLowerCase(),
        modif = "",
        possible = {};

      jQuery.each(["alt", "ctrl", "shift"], function (index, specialKey) {

        if (event[specialKey + 'Key'] && special !== specialKey) {
          modif += specialKey + '+';
        }
      });

      // metaKey is triggered off ctrlKey erronously
      if (event.metaKey && !event.ctrlKey && special !== "meta") {
        modif += "meta+";
      }

      if (event.metaKey && special !== "meta" && modif.indexOf("alt+ctrl+shift+") > -1) {
        modif = modif.replace("alt+ctrl+shift+", "hyper+");
      }

      if (special) {
        possible[modif + special] = true;
      } else {
        possible[modif + character] = true;
        possible[modif + jQuery.hotkeys.shiftNums[character]] = true;

        // "$" can be triggered as "Shift+4" or "Shift+$" or just "$"
        if (modif === "shift+") {
          possible[jQuery.hotkeys.shiftNums[character]] = true;
        }
      }

      for (var i = 0, l = keys.length; i < l; i++) {
        if (possible[keys[i]]) {
          return origHandler.apply(this, arguments);
        }
      }
    };
  }

  jQuery.each(["keydown", "keyup", "keypress"], function () {
    jQuery.event.special[this] = {
      add: keyHandler
    };
  });

})(jQuery || this.jQuery || window.jQuery);