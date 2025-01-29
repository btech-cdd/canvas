/*
  FORMATTING

  Convert quiz questions to match the sample format. Mark the correct answer with an *.
  SAMPLE
  Q1. question
  A. answer
  *B. correct answer
  C. answer
  D. answer 
  QUIZ QUESTIONS

*/
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
          <span>{{file.name}}</span><span>{{Math.round(uploadProgress[file.name] * 100)}}%</span>
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
          console.log(lines);
          let name = undefined; 
          lines.push(''); // kept having an issue where the last question wasn't being loaded if there's no empty line at the end, so just adding a blank line
          let quiz = [];
          let prompt = '';
          let answers = [];
          let correct = '';
          let comment = '';
          let numCorrect = 0;
          for (l in lines) {
            let line = lines[l].trim();
            let nextLine = (lines?.[l + 1] ?? '').trim();
            console.log(l + ' - ' + line);
            console.log((praseInt(l) + 1) + ' - ' + lines[parseInt(l) + 1]);
            console.log('');

            let mName = line.match(/^Title\:(.*)/);
            if (mName) name = mName[1];

            let mPrompt = line.match(/^Q?[0-9]+\.(.*)/);
            if (mPrompt) {
                prompt = mPrompt[1];
                continue;
            }
            let mAnswer = line.match(/^\*{0,1}[A-Za-z](\.|\))(.*)/);
            if (mAnswer) {
              let mAnswerComment = nextLine.match(/^\?\?\.(.*)/);
              let answerComment = '';
              if (mAnswerComment) answerComment = mAnswerComment[1];
              answers.push({
                  option: mAnswer[2],
                  correct: line.charAt(0) == '*',
                  comments_html: answerComment
              });
              if (line.charAt(0) == '*') numCorrect += 1;
            }

            let mComment = line.match(/^\?\.(.*)/);
            if (mComment) {
                comment = mComment[1];
            }

            if (answers.length > 1 && line == '') {
                let question = {
                  name: name,
                  prompt: prompt,
                  answers: answers,
                  comment: comment,
                  num_correct: numCorrect
                }
                quiz.push(question);
                prompt = "";
                answers = [];
                correct = "";
                numCorrect = 0;
                comment = "";
            }

          }

          let bank = await this.createBank(file.name.replace(".txt", ""));
          for (let q in quiz) {
            let question = quiz[q];
            console.log(question);
            let answers = [];
            for (let a in question.answers) {
              let answer = question.answers[a];
              answers.push({
                answer_weight: answer.correct ? (100 / question.num_correct) : 0,
                numerical_answer_type: "exact_answer",
                answer_text: answer.option,
                comments_html: answer.comments_html
              })
            }
            let questionType = 'multiple_choice_question';
            if (numCorrect > 0 || question.prompt.includes("all that apply")) questionType = 'multiple_answers_question';
            await $.post(`/courses/${CURRENT_COURSE_ID}/question_banks/${bank.assessment_question_bank.id}/assessment_questions`, {
              question: {
                question_name: question.name ?? "MC Question " + pad(+q + 1, 3),
                question_type: questionType,
                points_possible: 1,
                question_text: `<p>${question.prompt}</p>`,
                answers: answers,
                // correct_comments: question.comment,
                // incorrect_comments: question.comment,
                neutral_comments: question.comment,
                neutral_comments_html: question.comment
              }
            }); 
            this.uploadProgress[file.name] = (+q + 1) / quiz.length;
            //trick vue into showing the change
            this.uploadProgress = JSON.parse(JSON.stringify(this.uploadProgress));
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

