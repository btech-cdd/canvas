$(".header-bar").append("<div id='btech-countdown'></div>");
$(".header-bar-right").css("width", "100%");
var Countdown = {
  
  // Backbone-like structure
  $el: $("#btech-countdown"),
  
  // Params
  countdown_interval: null,
  total_seconds     : 0,
  hours: null,
  minutes: null,
  seconds: null,
  els: {},
  
  // Initialize the countdown  
  init: function() {
    // Initialize total seconds
    let groups = [
      'DAYS',
      'HOURS',
      'MINUTES',
      'SECONDS'
    ];

    groups.forEach((capName) => {
      let name = capName.toLowerCase();
      let el = $(`
        <div class="bloc-time">
          <span class="count-title">${capName}</span>
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
        </div>
      `);
      this.els[name] = el;
      $("#btech-countdown").append(el);
    })
    // Animate countdown to the end 
    this.count();    
  },
  
  count: function() {
    
    this.countdown_interval = setInterval(async () => {
      let data = (await $.get(`/api/v1/courses/${ENV.COURSE_ID}/enrollments?user_id=self`))[0];
      if (data.start_at == undefined || data.end_at == undefined) return;
      let endAt = Date.parse(data.end_at);
      // Get today's date and time
      var now = new Date().getTime();
      
      // Find the distance between now and the count down date
      var distance = endAt - now;
      // If the count down is finished, write some text
      if (distance < 0) {
        clearInterval(x);
        document.getElementById("btech-countdown").innerHTML = "EXPIRED";
        return
      }
      // Time calculations for days, hours, minutes and seconds
      let vals = {
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      }
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
    let fig_1_value = $el_1.find('.top').html();
    let fig_2_value = $el_2.find('.top').html();
    value = ('0'+value).slice(-2) 

    // Animate only if the figure has changed
    if(fig_1_value !== value.charAt(0)) this.animateFigure($el_1, value.charAt(0));
    if(fig_2_value !== value.charAt(1)) this.animateFigure($el_2, value.charAt(1));
  }
};
Countdown.init();