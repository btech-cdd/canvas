let upload = $(`
  <button class="upload_bank_link btn button-sidebar-wide"><i class="icon-upload"></i> Upload Question Bank</button>
`);
$("body").append(`
  <div 
    v-if="show"
    class='btech-modal'
    style="display: inline-block;"
    id='canvas-question-bank-uploader-vue'
  >
    <div class='btech-modal-content'>
      <div 
        v-if="state='upload'"
        class='btech-modal-content-inner'
      >
        <button style='float: right;' @click='show=false;'>X</button>
        <div class='btech-modal-content-inner'>
        <input type="file" id="fileInput" multiple>
        <button @click="processUploadedQuizBank()">Upload</button>
      </div>
      <div 
        v-if="state='uploading'"
        class='btech-modal-content-inner'
      >
        <div v-for="file in files">
          <span>{{file.name}}</span><span>{{uploadProgress[file.name]}}%</span>
        </div>
      </div>
    </div>
  </div>
`);
let VUE_APP = new Vue({
  el: '#canvas-question-bank-uploader-vue',
  mounted: async function () {

  },
  data: function () {
    return {
      show: false,
      state: 'upload',
      files: [],
      uploadProgress: {}
    }
  },
  methods: {
    processUploadedQuizBank: function () {
      const fileInput = document.getElementById('fileInput');
      this.files = fileInput.files;
      this.state = 'uploading';
      
      let filesProcessed = 0;
      for (let i = 0; i < this.files.length; i++) {
        let file = this.files[i];
        this.uploadProgress[file.name] = 0;
        let reader = new FileReader();
        reader.readAsText(file);
        reader.onload = async () => {
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

          let bank = await this.createBank(file.name);
          for (let q in quiz) {
            let question = quiz[q];
            let answers = [];
            for (let a in question.answers) {
              let answer = question.answers[a];
              answers.push({
                answer_weight: answer.correct ? 100 : 0,
                numerical_answer_type: "exact_answer",
                answer_text: answer.option
              })
            }
            await $.post(`/courses/${CURRENT_COURSE_ID}/question_banks/${bank.assessment_question_bank.id}/assessment_questions`, {
              question: {
                question_name: "MC Question " + pad(+q + 1, 3),
                question_type: "multiple_choice_question",
                points_possible: 1,
                question_text: `<p>${question.prompt}</p>`,
                answers: answers
              }
            }); 
            this.uploadProgress[file.name] = +q / quiz.length;
            console.log(this.uploadProgress);
          }
          filesProcessed += 1;
          if (filesProcessed == this.files.length) {
            this.show = false;;
          }
        };
      }
    },
    createBank: async function(title) {
      $.ajaxSetup({
          headers:{
              'Accept': 'application/json'
          }
      });
      let bank = await $.post(`https://btech.instructure.com/courses/${CURRENT_COURSE_ID}/question_banks`, {
        assessment_question_bank: {title: title}
      });
      delete $.ajaxSettings.headers['Accept'];
      return bank;
    }
  }
});
function pad(num, size) {
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
}


//handling multiple isn't currently working, but add multiple after input 
upload.click(() => {
  VUE_APP.show = true;
  VUE_APP.state = 'upload';
});
$(".see_bookmarked_banks").after(upload);

