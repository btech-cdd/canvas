// auto pull every x seconds so if you've got multiple tabs opened, the scores will update (just needs to replace the structure part, not the whole object)
// track which pages were reviewed, or have an option to tag the current page as needing review
//// maybe a little flag icon next to each topic that you can flag that page as an example. When you click flag, pop up to leave a comment why flagging.
//// option to delete flags
// need to add comments


(function() {
  const WIDTH = 200;
  $('body').append(`
  <div _
    id="btech-course-evaluation-vue"
    :style="{
      'width': width + 'px',
      'right': minimized ? '-' + width + 'px' : '0px'
    }"
    style="
      position: fixed; 
      top: 0;
      overflow: scroll;
      height: 100vh;
      background-color: #f1f1f1;
    "
  >
    <div
      v-if="minimized"
      @click="maximize"
      style="
        position: fixed;
        top: 2rem;
        right: 0px;
        background-color: #d22232;
        color: white;
        padding: 0.5rem;
        cursor: pointer;
      "
    >
      <i class="icon-rubric"></i>
    </div>
    <div
      v-else
    >
      <div 
        style="
          text-align: center;
          background-color: #d22232;
          color: white;
          cursor: pointer;
          user-select: none;
        "
        @click="minimize"
      >
        Course Review 
        <b>&#8250;</b>
      </div>

      <!--Active Review-->
      <div
        v-if="Object.keys(activeReview).length > 0"
      >
        <div
          v-for="topic, name in activeReview.summary"
          style="
            padding: 0.5rem;
            margin: 0.5rem;
            background-color: #FFFFFF;
          "
        >
          <h3><strong>{{name}}</strong></h3>
          <div
            v-for="question, text in topic.questions"
            style="
              margin-bottom: 0.5rem;
            "
          >
            <div><strong>{{text}}</strong></div>
            <div
              style="
                display: flex;
                justify-content: space-around;
                user-select: none;
              "
            >
              <span 
                style="
                  border: 1px solid #303030;
                  border-radius: 1rem;
                  width: 2rem;
                  height: 2rem;
                  font-size: 1.5rem;
                  text-align: center;
                  cursor: pointer;
                "
                v-for="i in [1, 2, 3, 4]"
                :style="{
                  'background-color': question.rating == i ? '#d22232' : '#FFFFFF',
                  'color' : question.rating == i ? '#FFFFFF' : '#000000'
                }"
                @click="setRating(question.id, i); question.rating = i;"
              ><b>{{i}}</b></span>
            </div>
          </div>
        </div>
        <!--BUTTONS-->
        <div
          style="
            display:flex;
            justify-content: space-around;
          "
        >
          <span
            style="
              background-color: #FFFFFF;
              color: #000000;
              padding: 0.25rem;
              cursor: pointer;
            "
          >Discard</span>
          <span
            style="
              background-color: #d22232;
              color: #FFFFFF;
              padding: 0.25rem;
              cursor: pointer;
            "
            @click="submitReview()"
          >Submit</span>
        </div>
      </div>

      <!--SUMMARY-->
      <div
        v-else
        style="margin-top: 2rem;"
      >
        <!--BUTTON-->
        <div
          style="
            display:flex;
            justify-content: space-around;
          "
        >
          <span
            style="
              background-color: #d22232;
              color: #FFFFFF;
              padding: 0.25rem;
              cursor: pointer;
            "
            @click="newReview()"
          >New Review</span>
        </div>

        <!--PAST REVIEWS-->
        <div>
          <div
            v-for="review in pastReviews"
            style="
              padding: 0.5rem;
              margin: 0.5rem;
              background-color: #FFFFFF;
            "
          >
            <div>
              {{review.date}}
            </div>
            <div
              style="
                display:flex;
                justify-content: space-around;
              "
            >
              <span
                v-for="topic, name in review.summary"
                style="
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  text-align: center;
                  height: 2rem;
                  width: 2rem;
                  border-radius: 1rem;
                "
                :style="{
                  'background-color': averageColor(topic.average)
                }"
              >
                <i 
                  style="
                    color: #FFFFFF;
                  "
                  :class="
                    icons[name]
                  "
                  :title="name + ': ' + topic.average"
                ></i>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `);
  new Vue({
    el: '#btech-course-evaluation-vue',
    mounted: async function () {
      // init context data
      let courseData = await $.get("/api/v1/courses/" + CURRENT_COURSE_ID);
      // do a check if there's a valid course code. If not, no need to rate :)
      // may be more accurate to pull based on sis course id 
      let sisCourseId = courseData.sis_course_id;
      if (sisCourseId == undefined) return; //don't do anything, no need to rate?

      //if can't set the required data, can't do a review
      try {
        const yearPattern = /(\d{4})[A-Z]{2}$/;
        const courseCodePattern = /[A-Z]{4} \d{4}/;

        const year = sisCourseId.match(yearPattern)[1];
        console.log(year);
        const courseCode = sisCourseId.match(courseCodePattern)[0];
        console.log(courseCode);

        this.courseCode = courseCode;
        this.courseId = courseData.id;
        this.raterId = ENV.current_user_id;
        this.year = year;
      } catch (err) {
        console.log(err);
        return;
      }

      let reviews = await bridgetoolsReq("https://reports.bridgetools.dev/api/reviews/scores/" + this.courseCode.replace(" ", "%20"));
      let pastReviews = [];
      for (let r in reviews) {
        let review = reviews[r];
        this.initReview(review);

        if (review.submitted) pastReviews.push(review);
        if (!review.submitted && review.rater_id == this.raterId) {
          this.activeReview = review;
          this.maximize();
        }
      }
      this.pastReviews = pastReviews;
      console.log(pastReviews);
    },
    data: function () {
      return {
        minimized: true,
        width: 500,
        defaultImg: 'https://bridgetools.dev/canvas/media/image-placeholder.png',
        bridgetools: bridgetools,
        colors: {
          primary: "#D22232",
          secondary: "#B11121",
          callout: "#F1F1F1",
          font: "#FFFFFF",
          bodyfont: "#000000",
          bg: "#FFFFFF"
        },
        pastReviews: [],
        activeReview: {},
        courseCode: "",
        courseId: "",
        icons: {
          'Assessments': 'icon-rubric',
          'Relevance': 'icon-group',
          'Structure': 'icon-copy-course',
          'Clarity': 'icon-edit'
        },
        raterId: ENV.current_user_id
      }
    },
    methods: {
      initReview: function (review) {
        let summary = {};
        for (let s in review.scores) {
          let score = review.scores[s];
          let question = score.question;
          let topic = question.topic;
          summary[topic.name] = summary?.[topic.name] ?? {
            questions: {},
            average: 0
          };
          summary[topic.name].questions[question.text] = summary[topic.name].questions?.[question.text] ?? {
            rating: score.rating,
            id: score._id
          };
        }
        review.summary = summary;

        for (let name in summary) {
          let topic = summary[name];
          count = 0;
          total = 0;
          for (let text in topic.questions) {
            let question = topic.questions[text];
            let rating = question.rating;
            count += 1;
            total += rating;
          }
          let average = total / count;

          topic.average = average;
        }
      },
      maximize: function () {
        $('#wrapper').css('margin-right', this.width + 'px');
        this.minimized = false;
      },
      minimize: function () {
        $('#wrapper').css('margin-right', '0px');
        this.minimized = true;
      },
      setRating: async function (scoreId, rating) {
        await bridgetoolsReq(`https://reports.bridgetools.dev/api/reviews/scores/${scoreId}`, {
          rating: rating
        }, "PUT");
      },
      submitReview: async function () {
        let review = this.activeReview;
        await bridgetoolsReq(`https://reports.bridgetools.dev/api/reviews/review/${review._id}`, {
          submitted: true 
        }, "PUT");
        this.activeReview.submitted = true;
        this.pastReviews.push(review);
        this.activeReview = {};
      },
      newReview: async function () {
        let review = await bridgetoolsReq(`https://reports.bridgetools.dev/api/reviews/scores/${this.courseCode.replace(" ", "%20")}/new`, {
          year: this.year,
          course_id: this.courseId,
          user_id: this.raterId,
        }, "POST");
        console.log(review);
        this.initReview(review);
        console.log(review);
        this.activeReview = review;
        console.log('new');
      },
      averageColor: function (average) {
        let colors = this.bridgetools.colors;
        return (
          average < 2 ? 
            colors.red : 
            average < 3 ? 
              colors.orange : 
              average < 4 ?
              colors.yellow :
              colors.green 
        )
      }
    }
  });
})();