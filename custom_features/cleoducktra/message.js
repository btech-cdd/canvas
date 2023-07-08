class CleoDucktraMessage {
  constructor(text, name="CleoDucktra", img="") {
    this.name = name;
    this.align = "right";
    this.img = img;
    if (name == "CleoDucktra") {
      this.align = "left";
      this.img = "https://bridgetools.dev/canvas/media/cleoducktra-idle.gif"
    }
    this.text = text;
    this.timestamp = new Date();
    this.time = this.timestamp.getHours() + ":" + this.timestamp.getMinutes();
  }
}
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
          'background-image': 'url(&quot;' + message.img + '&quot;), url(&quot;https://bridgetools.dev/canvas/media/bg.png&quot;)' 
        }"
      ></div>

      <div class="msg-bubble">
        <div class="msg-info">
          <div class="msg-info-name">{{message.name}}</div>
          <div class="msg-info-time">{{message.time}}</div>
        </div>

        <div class="msg-text" v-html="message.text">
        </div>
      </div>
    </div>
  `,
  mounted: function() {
  },
  data: function() {
    return {
    }
  },
  props: [
    'message'
  ]
});