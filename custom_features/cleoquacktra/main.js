(function () {
  if ($("#cleoquacktra").length === 0) {
      let vueString = `
        <div id="cleoquacktra">
          <div 
            @mouseover="buttonX = 100;"
            @mouseleave="buttonX = 10;"
            @click="showHelp = !showHelp; console.log(showHelp);"
            style='
              width: 110px; 
              margin-right: -140px; 
              position:fixed; 
              bottom: 20px; 
              z-index:1000; 
              transition: 0.5s; 
              background-color: #A00012;
              border: 2px solid #D61310;
              padding: 10px 20px;
              color: #FFF;
              border-radius: 5px; 
              cursor: pointer;
              user-select: none;
            ' 
            :style="{'right': buttonX + 'px'}"
          >
            Ask CleoQuacktra 
          </div>
          <div v-if="showHelp">
            <div
              @click.self="showHelp = false;"
              style='
                position: fixed;
                z-index: 100000;
                padding-top: 10px;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                overflow: auto;
                background-color: #000;
                background-color: rgb(0, 0, 0, 0.4);
              ' 
            >
            <form class="msger-inputarea">
              <input type="text" class="msger-input" placeholder="Enter your message...">
              <button type="submit" class="msger-send-btn">Ask</button>
            </form>
            </div>
          </div>
        </div>
      `;
      $('body').append(vueString);
      class Resource {
        constructor(name, target, topic) {
          this.name = name;
          this.target = target;
          this.topic = topic;
          this.url = '';
          this.kalturaId = '';
          this.questions = [];
        }
        addQuestion(question) {
          this.questions.push(question);
        }
      }
      //IMPORTED_FEATURE._init();
      new Vue({
        el: "#cleoquacktra",
        mounted: async function() {
          this.resources = [];
        },
        computed: {
        },
        data: function() {
          return {
            buttonX: 10,
            showHelp: false,
            topics: {},
          }
        }
      });
      Vue.component('help-topic', {
        template: `
          <div>
            <h2 @click="show = !show" style="
              background-color: #A00012;
              border-radius: 4px;
              color: #FFF;
              cursor: pointer;
              user-select: none;
            ">
              <i v-if="show" class='icon-mini-arrow-down'></i>
              <i v-else class='icon-mini-arrow-right'></i>
              {{name}}
            </h2>
            <div v-show="show" style="padding: 10px;">
              <div v-for="(resource, index) in topic" style="border-bottom: 2px dotted #000">
                <p>
                  <div v-if="resource.url !== ''">
                    <a target="_blank" :href="resource.url">{{resource.name}}</a>
                  </div>
                  <div v-else>
                    {{resource.name}}
                  </div>
                </p>
                <div style="text-align: center;">
                  <iframe v-if="resource.kalturaId !== ''" :src="'https://cdnapisec.kaltura.com/p/1699651/sp/169965100/embedIframeJs/uiconf_id/22825111/partner_id/1699651?iframeembed=true&entry_id='+resource.kalturaId" width="400" height="333" allowfullscreen webkitallowfullscreen mozAllowFullScreen allow="autoplay *; fullscreen *; encrypted-media *" frameborder="0"></iframe>
                </div>
              </div>
            </div>
          </div>
        `,
        data: function() {
          return {
            show: false
          }
        },
        props: [
          'topic',
          'name'
        ]
      });
  }
})();
