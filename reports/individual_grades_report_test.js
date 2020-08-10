let columns = {
	name: {
		average: false,
		list: [],
		average_element: null,
		median_element: null,
		sortable_type: '',
		description: "The course&#39;s name. Click on the name to go to the course page. Click on 'grades' to go to their grades page for that course.",
    hidden: null,
		percent: false
	},
	state: {
		average: false,
		list: [],
		average_element: null,
		median_element: null,
		sortable_type: '',
		description: "The student&#39;s activity state. Usually active, completed, or invited",
    hidden: null,
		percent: false
	},
	section: {
		average: false,
		list: [],
		average_element: null,
		median_element: null,
		sortable_type: '',
		description: "The student&#39;s section.",
    hidden: null,
		percent: false
	},
	grade: {
		average: true,
		list: [],
		average_element: null,
		median_element: null,
		sortable_type: 'sorttable_numeric',
		description: "This grade is calculated by canvas based on their currently submitted assignments.",
    hidden: false,
		percent: true
	},
	final_grade: {
		average: true,
		list: [],
		average_element: null,
		median_element: null,
		sortable_type: 'sorttable_numeric',
		description: "This grade is calculated based on all assignments and treats unsubmitted grades as 0.",
    hidden: false,
		percent: true
	},
	points: {
		average: true,
		list: [],
		average_element: null,
		median_element: null,
		sortable_type: 'sorttable_numeric',
		description: "This takes the point value of all submitted assignments (the possible points in the assignment, not the student&#39;s score) and divides it by the total possible points in the course to estimate the students progress in the course.",
    hidden: false,
		percent: true
	},
  submissions: {
    average: true,
    list: [],
    average_element: null,
    median_element: null,
    sortable_type: 'sorttable_numeric',
    description: "This shows the percent of assignments submitted out of the total assignments in the course.",
    hidden: false,
    percent: true
  },
  days_since_last_submission: {
    average: true,
    list: [],
    average_element: null,
    median_element: null,
    sortable_type: 'sorttable_numeric',
    description: "This shows the number of days which have past since the student last submitted an assignment on canvas. Other activities not recorded in canvas are not taken into account.",
    hidden: false,
    percent: false
  },
};

class Course {
	constructor(id, name, user_id) {
		this.id = id;
		this.user_id = user_id;
		this.name = name;
		this.assignments = [];
		this.state = "";
		this.grade = "N/A";
		this.points = "N/A";
		this.final_grade = "N/A";
		this.row = this.genRow();
		this.row.appendTo($('#btech-report-table-body'));
		this.updateCell('name', "<a target='_blank' href='https://btech.instructure.com/courses/"+id+"'>"+this.name+"</a>(<a target='_blank' href='https://btech.instructure.com/courses/"+id+"/grades/"+this.user_id+"'>grades</a>)");
	}
	genRow() {
		let row = $('<tr id="btech-modal-report-'+this.id+'"></tr>');
		for (let key in columns) {
      let align = 'left';
      if (columns[key].sortable_type === 'sorttable_numeric') align = 'center';
			row.append("<td class='"+getCellId(key, "class")+"' id='"+getCellId(key, this.id)+"' style='text-align:"+align+"; padding:10px;'>N/A</td>");
    }
    toggleColumnHidden();
		return row;
	}
	updateCell(key, value, color="#FFF") {
    let cellId = getCellId(key, this.id);
    let cell = $("#"+cellId);
    cell.css("background-color",color);
    
    if (columns[key].percent == true && !isNaN(parseInt(value))) value += "%";
    cell.html(value);
  }
  hideRow() {
    this.row.hide();
  }
}

function toggleColumnHidden() {
  for (let key in columns) {
    let checkBox = $('#'+getCellId(key, "check-box"));
    if (checkBox.prop("checked") === false) {
      columns[key].hidden = true;
      $('.'+getCellId(key, "class")).hide();
    } else {
      columns[key].hidden = false;
      $('.'+getCellId(key, "class")).show();
    }
  }
}

function createIndividualGradesReport() {
  //init report
  createReport();
  for (let key in columns) {
    if (columns[key].hidden !== null) {
      $('#btech-report-options').append('<input type="checkbox" id="'+getCellId(key, "check-box")+'" onclick="toggleColumnHidden()"><span>'+key+'</span>');
      let checkBox = $('#'+getCellId(key, "check-box"));
      if (columns[key].hidden === false) {
        checkBox.prop('checked', true);
      }
    }
  }
	let gen_report_button = $('<a class="btn button-sidebar-wide" id="btech-modal-report-gen">Report</a>');
  let menu_bar = $("#right-side div").first();
  gen_report_button.appendTo(menu_bar);

	gen_report_button.click(function() {
	    let modal = $('div#btech-modal');
	    modal.show();
	});
  for (let key in columns) {
      columns[key].average_element = $('<td class="'+getCellId(key, "class")+'" style="text-align:center;" id="btech-report-average'+keyToCSS(key)+'"></td>');
  }

  //init variables
  let report = $('#btech-report-table');
  let report_foot = $('#btech-report-table-foot');
  let m = (/\/users\/([0-9]+)/.exec(window.location.pathname));
  let user_id = m[1];
  let course_ul = $('#courses_list');
  let courses = {};

  //get course names and state
  course_ul.find('li').each(function() {
    let state = $(this).attr('class').replace(" clearfix", "").replace(" ", "");
    let href = $(this).find('a').attr('href');
    let course_id = href.replace('/courses/', '').replace('/users/'+user_id, '');
    let course_name = $(this).find('span.name').first().html().trim();
    courses[course_id] = new Course(parseInt(course_id), course_name, user_id);
    let course = courses[course_id];
    course.state = state;
    if (state !== "active" && state !== "completed" && state !== "invited") {
      course.hideRow();
    }
    course.updateCell('state', state);
  });

  //get sections
  for (var course_id in courses) {
    let course = courses[course_id];
    requestCourseSectionData(courses, course_id);
  }

  //get grades
  for (var course_id in courses) {
    let course = courses[course_id];
    requestCourseGradeData(courses, course_id, 'active');
  }

  //put together footer
  report_foot.append("<tr><td colspan=7 height=10></td></tr>");
  let average_row = $('<tr style="padding:10px;" id="btech-modal-average"></tr>').appendTo(report_foot);
  average_row.append("<td colspan=3>AVERAGE</td>");
  for (let key in columns) {
    if (columns[key].average == true) {
      average_row.append(columns[key].average_element);
    }
  }
  toggleColumnHidden();
}

function getAssignmentData(courses, course_id, enrollment) {
  let course = courses[course_id];
  let user_id = course.user_id;
  let url = "/api/v1/courses/"+course_id+"/analytics/users/"+user_id+"/assignments";
  $.get(url, function(data) {
    course.assignments = data;
    let assignments = data;
    let total_points_possible = 0;
    let current_points_possible = 0;
    let most_recent = {};
    let submitted = 0;
    let max_submissions = 0;
    let progress_per_day = 0;
    let start_date = Date.parse(enrollment.created_at);
    let now_date = Date.now();
    let diff_time = Math.abs(now_date - start_date);
    let diff_days = Math.ceil(diff_time / (1000 * 60 * 60 * 24));
    let most_recent_time = diff_time;
    for (let a = 0; a < assignments.length; a++) {
      let assignment = assignments[a];
      let points_possible = assignment.points_possible;
      let submitted_at = Date.parse(assignment.submission.submitted_at);
      total_points_possible += points_possible;
      if (assignment.points_possible > 0) {
        max_submissions += 1;
        if (assignment.submission.score !== null) {
          current_points_possible += points_possible;
          submitted += 1;
        }
      }
      if (Math.abs(now_date - submitted_at) < most_recent_time) {
        most_recent_time = Math.abs(now_date - submitted_at);
        most_recent = assignment;
      }
    }
    let perc_submitted = Math.round((submitted / max_submissions) * 100);
    if (isNaN(perc_submitted)) perc_submitted = 0;
    course.updateCell('submissions', perc_submitted);
    course.submissions = perc_submitted;
    updateAverage('submissions', courses);
    updateAverage('points', courses);

    //calculate color for last submission day
    let most_recent_days = Math.ceil(most_recent_time / (1000 * 60 * 60 * 24));
    let color = "#FFF";
    if (most_recent_days >= 7 && most_recent_days <= 21) {
      let g = 16 - Math.floor(((most_recent_days - 6) / 15) * 16);
      if (g < 6) g = 6;
      color = "#F"+g.toString(16)+"7";
    }
    if (most_recent_days > 21) color = "#F67";
    if (course.state === 'active') {
      course.updateCell('days_since_last_submission', most_recent_days, color);
      updateAverage('points', courses);
    } else if (course.state == 'completed') {
      course.updateCell('points', 100);
      updateAverage('points', courses);
      course.updateCell('days_since_last_submission', "COMPLETE");
    } else {
      course.updateCell('points', "N/A");
      course.updateCell('days_since_last_submission', "N/A");
    }
  }).fail(function() {
    course.updateCell('points', "N/A");
    course.updateCell('days_since_last_submission', "N/A", "#FAB");
  });
}

function requestCourseSectionData(courses, course_id, state) {
  let course = courses[course_id];
  let user_id = parseInt(course.user_id);
  let url = "/api/v1/courses/"+course_id+"/sections?per_page=100&include[]=students";
  $.get(url, function(data) {
    let sections = data;
    if (sections.length > 0) {
      for (let i = 0; i < sections.length; i++) {
        let section = sections[i];
        let students = section.students;
        if (students !== null) {
          if (students.length > 0) {
            for (let j = 0; j < students.length; j++) {
              let student = students[j];
              if (student.id === user_id) {
                course.updateCell('section', section.name);
                return;
              }
            }
          }
        }
      }
    }
  });
}

function requestCourseGradeData(courses, course_id, state) {
  let course = courses[course_id];
  let user_id = course.user_id;
  let url = "/api/v1/courses/"+course_id+"/search_users?user_ids[]="+user_id+"&enrollment_state[]="+state+"&include[]=enrollments";
  $.get(url, function(data) {
    if (data.length > 0) {
      let enrollment = data[0].enrollments[0];
      let grades = enrollment.grades;
      if (grades !== undefined) {
        let grade = grades.current_score;
        if (grade == null) {
          if (course.state == "active") grade = 0;
          else grade = "N/A";
        }
        course.grade = grade;
        course.updateCell('grade', grade);
        updateAverage('grade', courses);

        let final_grade = enrollment.grades.final_score;
        if (final_grade == null) final_grade = 0;
        if (grade == "N/A" && final_grade == 0) final_grade = "N/A";
        course.final_grade = final_grade;
        course.updateCell('final_grade', final_grade);
        updateAverage('final_grade', courses);

        if (!isNaN(parseInt(final_grade)) && !isNaN(parseInt(final_grade))) {
          let points = Math.round(final_grade / grade * 100);
		  if (isNaN(points)) points = 0;
          course.points = points;
          course.updateCell('points', points);
          getAssignmentData(courses, course_id, enrollment);
        }
      }
    } else if (state == "active") {
      requestCourseGradeData(courses, course_id, 'completed');
    }
  });
}

createIndividualGradesReport();
