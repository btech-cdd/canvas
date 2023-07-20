(function() {
  const WIDTH = 200;
  $('body').append(`
  <div _
    id="btech-course-evaluation-vue"
    :style="{
      'width': width + 'px',
      'right': minimized ? '-' + width + 'px' : '0px'
    }"
    style="position: fixed; top: 0; height: 100%; background-color: #f1f1f1;"
  >
    <div
      v-if="minimized"
      @click="maximize"
      style="
        position: absolute;
        top: 2rem;
        background-color: #d22232;
        color: white;
        padding: 0.5rem;
        cursor: pointer;
      "
      :style="{
        'right': width + 'px'
      }"
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
              >{{i}}</span>
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
            @click="submitReview(activeReview._id)"
          >Submit</span>
        </div>
      </div>

      <!--SUMMARY-->
      <div
        v-else
        style="
          padding: 0.5rem;
        "
      >
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
      </div>
    </div>
  </div>
  `);
  new Vue({
    el: '#btech-course-evaluation-vue',
    mounted: async function () {
      let reviews = await bridgetoolsReq("https://reports.bridgetools.dev/api/reviews/scores/TEST%201010");
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
      let pastReviews = [];
      for (let r in reviews) {
        let review = reviews[r];
        let summary = {};
        console.log(review);
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

        if (review.submitted) pastReviews.push(review);
        if (!review.submitted && review.rater_id == this.raterId) {
          this.activeReview = review;
        }
      }
      this.pastReviews = pastReviews;
      console.log(reviews);
    },
    data: function () {
      return {
        minimized: true,
        width: 400,
        defaultImg: 'https://bridgetools.dev/canvas/media/image-placeholder.png',
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
        raterId: ENV.current_user_id
      }
    },
    methods: {
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
      submitReview: async function (reviewId) {
        bridgetoolsReq(`https://reports.bridgetools.dev/api/reviews/review/${reviewId}`, {
          submitted: true 
        }, "PUT");
        this.activeReview.submitted = true;
        this.pastReviews.push(activeReview);
        this.activeReview = {};
      },
      newReview: async function () {
        let review = bridgetoolsReq(`https://reports.bridgetools.dev/api/reviews/review/${reviewId}`, {
        });
        console.log('new');
      }
    }
  });
})();