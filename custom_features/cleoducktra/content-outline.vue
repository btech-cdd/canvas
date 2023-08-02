<template>
  <div>
    <div>STATE{{ state }}</div>
    <div
      style="height: auto;"
      v-if="state=='select type'"
    >
      <div class="msger-chat">
        <div>Will you be creating a full course, or a single module?</div>
        <div
          style="margin: 0;"
          class="msger-inputarea">
          <button @click="state = 'course';" class="msger-btn">Course</button>
          <button @click="state = 'module';" class="msger-btn">Module</button>
          <button @click="state = 'page';" class="msger-btn">Page</button>
        </div>
      </div>
    </div>
    <div
      style="height: auto;"
      v-if="state=='course'"
    >
      <div class="msger-chat">
        <div>Create content for a course about <span v-if="contentType=='Module'">(provides context for your module)</span>...</div>
      </div>
      <div
        style="margin: 0;"
        class="msger-inputarea">
        <input @keyup.enter="createCourse" v-model="course.name" type="text" class="msger-input" placeholder="course topic....">
        <button @click="createCourse();" class="msger-btn">Next</button>
      </div>
    </div>
    <div
      style="height: auto;"
      v-if="state=='module'"
    >
      <div class="msger-chat">
        <div>What is the learning outcome for your module?</div>
      </div>
      <div
        style="margin: 0;"
        class="msger-inputarea">
        <input @keyup.enter="createModule" v-model="singleModule" type="text" class="msger-input" placeholder="module topic....">
        <button @click="createModule();" class="msger-btn">Next</button>
      </div>
    </div>
    <div
      style="height: auto;"
      v-if="state=='page'"
    >
      <div class="msger-chat">
        <div>What is the learning outcome for your page?</div>
      </div>
      <div
        style="margin: 0;"
        class="msger-inputarea">
        <input @keyup.enter="createPage" v-model="singleTopic" type="text" class="msger-input" placeholder="module topic....">
        <button @click="createPage();" class="msger-btn">Next</button>
      </div>
    </div>
    <div
      v-if="state=='build'"
      class="cleoducktra-content"
    >
      <div>{{course.buildStep}}</div>
    </div>
    <div
      v-if="state=='objectives'"
      class="cleoducktra-content"
    >
      <div
        class="msger-chat">
        <div
          class="objectives-wrapper"
        >
          <div
            v-for="objective, o in course.objectives"
            style="margin-bottom: 0.5rem;"
          >
            <div
              class="objective-wrapper"
            >
              <div>
                <input type="checkbox" v-model="objective.include">
              </div>
              <div>
                <div><strong><span width="2rem">{{o + 1}}.</span> {{objective.name}}: </strong>{{objective.description}}</div> 
              </div>
            </div>
            <div>
              <div
                v-for="topic in objective.topics"
                style="margin-left: 2rem;"
              >
                <div
                  class="objective-wrapper"
                >
                  <div>
                    <input type="checkbox" v-model="topic.include">
                  </div>
                  <div>
                    <span><strong>{{topic.name}}:</strong> {{topic.description}}</span>
                  </div>
                </div>
                <div
                  class="objective-wrapper"
                  style="margin-left: 2rem;"
                >
                  <div>
                    <input type="checkbox" v-model="topic.includeQuiz">
                  </div>
                  <div>
                    <span>Create Quiz Questions</span>
                  </div>
                  <!--No video for right now...-->
                </div>
              </div>
            </div>
            <div
              v-if="objective.loadingTopics"
            >
              Loading new topics...
            </div>
            <div>
              <button @click="objective.getTopics()" class="msger-btn">+ Topics</button>
            </div>
          </div>
        </div>
        <div
          v-if="course.loadingObjectives"
        >
          Loading new objectives...
        </div>
      </div>
      <div
        style="margin: 0; text-align: right;"
        class="msger-inputarea">
        <button @click="buildCourse();" class="msger-btn">Build</button>
        <button @click="state = 'select type'; course.name=ENV.COURSE.long_name; singleModule = ''; course.objectives = [];" class="msger-btn red">Restart</button>
      </div>
    </div>
  </div>
</template>