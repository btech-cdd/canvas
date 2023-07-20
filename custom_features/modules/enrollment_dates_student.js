$(".header-bar").append("<div id='btech-countdown'></div>");
$(".header-bar").append("<div id='btech-student-progress-bar'></div>");
$(".header-bar-right").css("width", "100%");
var Countdown = {
  // Params
  enrollment: {},
  countdown_interval: null,
  total_seconds     : 0,
  els: {},
  disabledDepartments: [
  ],

  init: async function() {
    if (!ENV.current_user_is_student) return;
    let section, course, term;
    this.enrollment = (await $.get(`/api/v1/courses/${ENV.COURSE_ID}/enrollments?user_id=self&type[]=StudentEnrollment`))[0];
    this.enrollment.conditionalDisplay = false;
    if (this.enrollment.start_at == undefined) this.enrollment.start_at = this.enrollment.created_at;
    //Try and find an end_at date if one hasn't been set
    if (!this.enrollment.end_at) {
      let sectionURL = `/api/v1/courses/${ENV.COURSE_ID}/sections/${this.enrollment.course_section_id}`;
      section = (await $.get(sectionURL))
      this.enrollment.end_at = section.end_at;
    }
    if (!this.enrollment.end_at) {
      this.enrollment.conditionalDisplay = true;
      let courseURL = `/api/v1/courses/${ENV.COURSE_ID}`;
      course = (await $.get(courseURL));
      this.enrollment.end_at = course.end_at;
    }
    if (!this.enrollment.end_at) {
      console.log("TERM")
      let termURL = `/api/v1/accounts/3/terms/${course.enrollment_term_id}`;
      term = (await $.get(termURL));
      this.enrollment.end_at = term.end_at;
    }
    //check if department has opted out
    console.log(CURRENT_DEPARTMENT_ID);
    let checkDepartment = !this.disabledDepartments.includes(CURRENT_DEPARTMENT_ID);
    let checkValidDates = (this.enrollment.start_at != undefined && this.enrollment.end_at != undefined);
    //if this is a conditional display, don't show it if the deadline's more than 30 days away
    let checkNumDays = (!this.enrollment.conditionalDisplay || (this.calcTimeVals()).days < 30);

    if (!checkValidDates && !checkDepartment) return;
    this.initProgress();
    if (!checkValidDates || !checkNumDays) return;
    this.initCountdown();
    // Animate countdown to the end 
    this.count();    
  },
  
  // Initialize the countdown  
  calcProgress: function() {
    let grades = this.enrollment.grades;
    let progress = (grades.current_score ? (grades.final_score / grades.current_score) : 0);
    return progress;
  },

  initProgress: function() {
    let progress = Math.round(this.calcProgress() * 100);
    let recommendedProgress = Math.round(this.calcRecommendedProgress() * 100);
    let el = $(`
      <div class="background">
        <div class="fill" style="width: 100%; background-color: #f1f1f1;">0</div>
        <div class="fill" title="Recommended percentage of course completed (${recommendedProgress}%) based on enrollment dates." style="width: ${recommendedProgress}%; background-color: #721222;">${recommendedProgress}%</div>
        <div class="fill" title="Percentage of course completed (${progress}%)" style="width: ${progress}%; background-color: #d22232;">${progress}%</div>
      </div> 
    `);
    $("#btech-student-progress-bar").append(el);
  },

  initCountdown: function() {
    let groups = [
      'DAYS',
      'HOURS',
      'MINUTES',
      'SECONDS'
    ];

    groups.forEach((capName) => {
      let name = capName.toLowerCase();
      let el = $(`
        <div id="countdown-block-${name}" class="bloc-time">
          <div class="figure part1">
            <span class="top"></span>
            <span class="top-back"><span></span></span>
            <span class="bottom"></span>
            <span class="bottom-back"><span></span></span>
          </div>
          <div class="figure part2">
            <span class="top"></span>
            <span class="top-back"><span></span></span>
            <span class="bottom"></span>
            <span class="bottom-back"><span></span></span>
          </div>
          <div class="figure part3">
            <span class="top"></span>
            <span class="top-back"><span></span></span>
            <span class="bottom"></span>
            <span class="bottom-back"><span></span></span>
          </div>
          <span class="count-title">${capName}</span>
        </div>
      `);
      el.find(".part3").hide();
      this.els[name] = el;
      $("#btech-countdown").append(el);
    })
    let vals = this.calcTimeVals();
    if (vals.days > 9) {
      $("#countdown-block-days span.count-title").html("DAYS REMAINING");
      $("#countdown-block-hours").hide();
      $("#countdown-block-minutes").hide();
      $("#countdown-block-seconds").hide();
    } else {
      $("#countdown-block-hours").show();
      $("#countdown-block-minutes").show();
      $("#countdown-block-seconds").show();
    }
  },


  calcRecommendedProgress: function() {
    let recommendedProgress = 0;
    try {
      let endAt = Date.parse(this.enrollment.end_at);
      let startAt = Date.parse(this.enrollment.start_at);
      var now = new Date().getTime();
      let totalTime = endAt - startAt;
      let currentTime = now - startAt;
      if (totalTime == 0) return 0;
      recommendedProgress = currentTime / totalTime;
    } catch (err) {

    }
    return recommendedProgress;
  },

  calcTimeRemaining: function () {
    let data = this.enrollment; 
    let endAt = Date.parse(data.end_at);
    // Get today's date and time
    var now = new Date().getTime();
    
    // Find the distance between now and the count down date
    var days = endAt - now;
    return days;
  },

  calcTimeVals: function() {
    let time = this.calcTimeRemaining();
    // If the count down is finished, write some text
    if (time < 0) {
      clearInterval(x);
      document.getElementById("btech-countdown").innerHTML = "EXPIRED";
      return
    }
    // Time calculations for days, hours, minutes and seconds
    return {
      days: Math.floor(time / (1000 * 60 * 60 * 24)),
      hours: Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((time % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((time % (1000 * 60)) / 1000)
    }
  },
  
  count: function() {
    this.countdown_interval = setInterval(async () => {
      let vals = this.calcTimeVals();
      for (let time in this.els) {
        this.checkCards(
          vals[time],
          this.els[time]
        )
      }
      
    }, 1000);    
  },
  
  animateFigure: function($el, value) {
		let $top         = $el.find('.top');
    let $bottom      = $el.find('.bottom');
    let $back_top    = $el.find('.top-back');
    let $back_bottom = $el.find('.bottom-back');

    // Before we begin, change the back value
    $back_top.find('span').html(value);

    // Also change the back bottom value
    $back_bottom.find('span').html(value);

    // Then animate
    TweenMax.to($top, 0.8, {
        rotationX           : '-180deg',
        transformPerspective: 300,
	      ease                : Quart.easeOut,
        onComplete          : function() {

            $top.html(value);

            $bottom.html(value);

            TweenMax.set($top, { rotationX: 0 });
        }
    });

    TweenMax.to($back_top, 0.8, { 
        rotationX           : 0,
        transformPerspective: 300,
	      ease                : Quart.easeOut, 
        clearProps          : 'all' 
    });    
  },
  
  checkCards: function(value, $els) {
    let $el_1 = $els.find(".part1");
    let $el_2 = $els.find(".part2");
    let $el_3 = $els.find(".part3");
    let fig_1_value = $el_1.find('.top').html();
    let fig_2_value = $el_2.find('.top').html();
    let fig_3_value = $el_3.find('.top').html();
    if (value > 99) {
      value = '' + value;
      $el_3.show();
    } else {
      value = ('0' + value).slice(-2);
      $el_3.hide();
    }


    // Animate only if the figure has changed
    if(fig_1_value !== value.charAt(0)) this.animateFigure($el_1, value.charAt(0));
    if(fig_2_value !== value.charAt(1)) this.animateFigure($el_2, value.charAt(1));
    if(fig_3_value !== value.charAt(2)) this.animateFigure($el_3, value.charAt(2));
  }
};
Countdown.init();