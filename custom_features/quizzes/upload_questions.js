let upload = $(`
<button class="upload_bank_link btn button-sidebar-wide"><i class="icon-upload"></i> Upload Question Bank</button>
`);
async function createBank(title) {
    $.ajaxSetup({
        headers:{
            'Accept': 'application/json'
        }
    });
    let bank = await $.post(`https://btech.instructure.com/courses/${ENV.COURSE_ID}}/question_banks`, {
      assessment_question_bank: {title: title}
    });
    delete $.ajaxSettings.headers['Accept'];
    this.banks.push(bank);
    return bank;
  }


function closeUploadQuizBank() {
    console.log("CLOSE");
    $("#uploadQuizBankModal").remove();
}
function processUploadedQuizBank() {
  const fileInput = document.getElementById('fileInput');
	
	const file = fileInput.files[0];
	const reader = new FileReader();
	reader.readAsText(file);
	reader.onload = function() {
    let lines = reader.result.split("\n");
    let quiz = [];
    let prompt = "";
    let answers = [];
    let correct = "";
    for (l in lines) {
      let line = lines[l];
      let mPrompt = line.match(/^[0-9]+\.(.*)/);
      if (mPrompt) {
          prompt = mPrompt[1];
          continue;
      }
      let mAnswer = line.match(/^\*{0,1}[A-Za-z]\.(.*)/);
      if (mAnswer) {
          answers.push({
              option: mAnswer[1],
              correct: line.charAt(0) == '*'
          });
      }
      if (answers.length > 1 && line == '') {
          let question = {
            prompt: prompt,
            answers: answers
          }
          quiz.push(question);
          prompt = "";
          answers = [];
          correct = "";
      }
    }
    console.log(quiz);
	};
}
upload.click(() => {
    $("body").append(`
    <div id='uploadQuizBankModal' class='btech-modal' style='display: inline-block;'>
    <div class='btech-modal-content'>
    <button style='float: right;' onclick='closeUploadQuizBank()'>X</button>
    <div class='btech-modal-content-inner'>
    <input type="file" id="fileInput" multiple>
    <button onclick="processUploadedQuizBank()">Upload</button>
    </div>
    </div>
    </div>
    `)
});
$(".see_bookmarked_banks").after(upload);

