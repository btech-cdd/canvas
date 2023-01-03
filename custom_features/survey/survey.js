(async function () {
  //https://btech.instructure.com/courses/420675/assignments/4484718
  function hashId(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      let chr = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }

  function addHidden(questionId, value) {
    form.append(`<input type="hidden" id="` + questionId + `" value="` + value + `">`);
  }

  function addParagraphTextEntry(questionId, description) {
    form.append(`
<p style='font-weight: bold;'>` + description + `</p>
<textarea id="` + questionId + `" style="width:100%; box-sizing: border-box;"></textarea>
`)
  }

  function addTextEntry(questionId, description) {
    form.append(`
<p style='font-weight: bold;'>` + description + `</p>
<input type="text" id="` + questionId + `" value="">
`)
  }

  function addDropdown(questionId, description, list) {
    let input = $(`<p style='font-weight: bold;'>` + description + `</p>`);
    let bodyRows = "";
    let select = $(`
<select id='` + questionId + `'>
<option value="" disabled selected>Select your option</option>
</select>
`);
    for (var i = 0; i < list.length; i++) {
      select.append(`<option value="` + list[i] + `">` + list[i] + `</option>`);
    }
    input.append("<br><div style='width: 100%; border-bottom: 1px solid #000;'></div>");
    input.append(select);
    form.append(input);
  }

  function addButtons(questionId, description, list = [1, 2, 3, 4, "N/A"]) {
    let buttonWidth = (100 - 10) / list.length;
    let headingRows = "";
    let bodyRows = "";
    for (var i = 0; i < list.length; i++) {
      headingRows += `<td style="width:` + buttonWidth + `%;text-align:center;"><label>` + list[i] + `</label></td>`;
      bodyRows += `
<td style="width:` + buttonWidth + `%;text-align:center;color:#666;border-bottom:1px solid #d3d8d3;padding:0">
<label style="display:block">
<div style="padding:.5em .25em"><input type="radio" id="` + questionId + `" value="` + list[i] + `" role="radio" aria-label="` + list[i] + `"></div>
</label>
</td>`;
    }
    form.append(`
<p style='font-weight: bold;'>` + description + `</p>

<table width="100%" border="0" cellpadding="5" cellspacing="0" style='background-color:#f2f2f2;'>
<thead>
<tr>
<td>
</td>` +
      headingRows +
      `</tr>
</thead>
<tbody>
<tr role="radiogroup" aria-label="" aria-describedby="1978569583_errorMessage"
style="text-align:center;color:#666;border-bottom:1px solid #d3d8d3;padding:0;">
<td
style="text-align:left;color:#666;border-bottom:1px solid #d3d8d3;padding:0;min-width:100px;max-width:200px;padding-left:15px">
</td>
` + bodyRows + `
</tr>
</tbody>
</table>
<br>
`);
  }


  async function addSubmitButton(formId, formData) {
    let items = formData.items;
    let submit = $('<input style="float: right;" type="submit" id="submit" value="Submit">');
    submit.click(async function () {
      // $.post(); //send data to google to be processed
      for (let i = 0; i < items.length; i++) {
        let item = items[i];
        let itemEl = $("#" + item.id);
        let value = itemEl.val();
        formData.items[i].response = value;
      }
      var url = "https://script.google.com/a/btech.edu/macros/s/AKfycbwIgHHMYbih2XnJf7mjDw8g3grdeHhn9s6JIvH6Qg7mfZ0ElbWr/exec";
      await jQuery.ajax({
        crossDomain: true,
        url: url,
        data: {
          formData: formData,
          formId: formId
        },
        method: "POST",
        dataType: "jsonp"
      }).done(function (res) {
        console.log(res);
      });
      /*
      await $.post('/api/v1/courses/' + ENV.COURSE_ID + '/assignments/' + ENV.ASSIGNMENT_ID + '/submissions', {
        submission: {
          submission_type: 'online_text_entry',
          body: 'Survey Submitted'
        }
      });
      */
      // location.reload(true);
    })
    form.append('<br><br>');
    form.append(submit);
  }

  //Can probably get rid of the ids
  //get the container
  let container = $('.btech-survey');
  let form = $("<div id='google-form-container'></div>");
  if (container.length > 0) {

    container.removeClass('btech-hidden'); //make it not hidden
    let loading = $("<p>Loading Survey...</p>");
    container.empty();
    container.append(loading);
    container.append(form);
    form.hide();
    let classes = container.attr('class').split(/\s+/);

    //get the google form id
    let formId = "";
    for (var c = 0; c < classes.length; c++) {
      try {
        formId = classes[c].match(/^form\-(.*)/)[1];
      } catch (e) {}
    }

    //request the form data
    //script found here:
    //https://script.google.com/a/btech.edu/d/1rPsTLhKjtzcL9W1-hy3yuHglTAgiJPBovljYd52CGTa4X0N0uaLSfwrb/edit
    if (formId !== "") {
      //Check if already submitted
      let canvasSubmitButton = $('.submit_assignment_link');
      canvasSubmitButton.hide();
      if (canvasSubmitButton.text().trim().includes('Assignment') || true) {
        var url = "https://script.google.com/a/btech.edu/macros/s/AKfycbwIgHHMYbih2XnJf7mjDw8g3grdeHhn9s6JIvH6Qg7mfZ0ElbWr/exec?formId=" + formId;
        let formData = null;
        await jQuery.ajax({
          crossDomain: true,
          url: url,
          method: "GET",
          dataType: "jsonp"
        }).done(function (res) {
          formData = res;
        });
        let items = formData.items;
        //could grab any since they all have the responseId, but getting 0 for consistency sake
        //grab some default data
        let courseId = ENV.COURSE_ID;
        let courseName = "UNKNOWN";
        let courseCode = "UNKNOWN";
        await $.get("/api/v1/courses/" + courseId).done(function(data) {
          courseName = data.name;
          courseCode = data.course_code;
        });
        let userId = ENV.current_user.id;
        //get a list of instructors
        //MAKE THIS REQUEST CONDITIONAL ON WHETHER OR NOT IT IS EVEN NEEDED
        let instructors = [];
        await $.get("/api/v1/courses/" + courseId + "/enrollments?type[]=TeacherEnrollment&type[]=TaEnrollment").done(function (data) {
          for (let i = 0; i < data.length; i++) {
            let enrollment = data[i];
            instructors.push(enrollment.user.name);
          }
        });

        //done loading
        loading.remove();
        form.show();

        //Add in the survey data
        for (let i = 0; i < items.length; i++) {
          let item = items[i];
          //Set up prefilled hidden items
          if (item.title == "COURSE_CODE") addHidden(item.id, courseCode); //course
          else if (item.title == "COURSE_NAME") addHidden(item.id, courseName); //course
          else if (item.title == "COURSE_ID") addHidden(item.id, courseId); //course
          else if (item.title == "USER") addHidden(item.id, hashId(userId)); //course
          else if (item.title == "PROGRAM") addHidden(item.id, CURRENT_DEPARTMENT_ID); //course
          else if (item.title == "INSTRUCTOR") addDropdown(item.id, "Select the name of your instructor.", instructors);
          //add based on question type
          //MUST MANUALLY ADD IN EACH QUESTION TYPE HERE AND ALSO MAKE SURE IT IS SET UP IN THE GOOGLE SCRIPTS PAGE OR THE DATA WON'T GET SENT
          else {
            for (let e = 0; e < item.entries.length; e++) {
              let entry = item.entries[e];
              switch (item.type) {
                case "TEXT":
                  addTextEntry(item.id, item.title);
                  break;
                case "PARAGRAPH_TEXT":
                  addParagraphTextEntry(item.id, item.title);
                  break;
                case "GRID":
                  addButtons(item.id, item.title, item.answers);
                  break;
                case "MULTIPLE_CHOICE":
                  addButtons(item.id, item.title, item.answers);
                  break;
              }
            }
          }
        }
        addSubmitButton(formId, formData);
      } else {
        container.empty();
        container.append("<p>Survey already completed</p>");
      }
    }
  }
})();