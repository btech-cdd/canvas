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

      <!--MODULES-->
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
              "
              v-for="i in [1, 2, 3, 4]"
            >{{i}}</span>
          </div>
        </div>
      </div>
      
    </div>
  </div>
  `);
  new Vue({
    el: '#btech-course-evaluation-vue',
    mounted: async function () {
      let reviews = await bridgetoolsReq("https://reports.bridgetools.dev/api/reviews/scores/TEST%201010");
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
        if (!review.submitted && review.rater_id == ENV.current_user_id) {
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
        activeReview: {}
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
      }
    }
  });
})();