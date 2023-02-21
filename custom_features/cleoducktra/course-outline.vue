<template>
  <div>
    <div
      style="height: auto;"
      v-if="state=='course'"
    >
      <div class="msger-chat">
        <div>Create modules for a course about...</div>
      </div>
      <div
        style="margin: 0;"
        class="msger-inputarea">
        <input @keyup.enter="getModules" v-model="course.name" type="text" class="msger-input" placeholder="course topic....">
        <button @click="getModules();" class="msger-btn">Create</button>
      </div>
    </div>
    <div
      v-if="state=='build'"
      class="cleoducktra-content"
    >
      <div>{{course.buildStep}}</div>
    </div>
    <div
      v-if="state=='modules'"
      class="cleoducktra-content"
    >
      <div
        class="msger-chat">
        <div
          class="modules-wrapper"
        >
          <div
            v-for="module, m in course.modules"
            style="margin-bottom: 0.5rem;"
          >
            <div
              class="module-wrapper"
            >
              <div>
                <input type="checkbox" v-model="module.include">
              </div>
              <div>
                <div><strong><span width="2rem">{{m + 1}}.</span> {{module.name}}: </strong>{{modules.description}}</div> 
              </div>
            </div>
            <div>
              <div
                v-for="topic in module.topics"
                style="margin-left: 2rem;"
              >
                <div
                  class="module-wrapper"
                >
                  <div>
                    <input type="checkbox" v-model="topic.include">
                  </div>
                  <div>
                    <span><strong>{{topic.name}}:</strong> {{topic.description}}</span>
                  </div>
                </div>
                <div
                  class="module-wrapper"
                  style="margin-left: 2rem;"
                >
                  <div>
                    <input type="checkbox" v-model="topic.includeQuiz">
                  </div>
                  <div>
                    <span>Create Quiz Questions</span>
                  </div>
                  <div>
                    <input type="checkbox" v-model="topic.includeVideo">
                  </div>
                  <div>
                    <span>Create Video Script</span>
                  </div>
                </div>
              </div>
            </div>
            <div
              v-if="module.loadingTopics"
            >
              Loading new topics...
            </div>
            <div>
              <button @click="module.getTopics()" class="msger-btn">+ Topics</button>
            </div>
          </div>
        </div>
        <div
          v-if="course.loadingModules"
        >
          Loading new modules...
        </div>
      </div>
      <div
        style="margin: 0; text-align: right;"
        class="msger-inputarea">
        <button @click="buildCourse();" class="msger-btn">Build</button>
        <button @click="state = 'course'; course.name=''; modules = [];" class="msger-btn red">Restart</button>
      </div>
    </div>
  </div>
</template>