Vue.component('cleoducktra-message', {
  template: `
    <div 
      class="msg"
      :class="{
        'right-msg': message.align == 'right',
        'left-msg': message.align == 'left',
      }"
      >
      <div
        class="msg-img"
        :style="{
          'background-image': 'url(&quot;' + message.img + '&quot;)' 
        }"
      ></div>

      <div class="msg-bubble">
        <div class="msg-info">
          <div class="msg-info-name">{{message.name}}</div>
          <div class="msg-info-time">{{message.time}}</div>
        </div>

        <div class="msg-text">
          {{message.text}}
        </div>
      </div>
    </div>
  `,
  mounted: function() {
    console.log(this.message.img);
  },
  data: function() {
    return {
    }
  },
  props: [
    'message'
  ]
});