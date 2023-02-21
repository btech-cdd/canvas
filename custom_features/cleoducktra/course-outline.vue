<template>
  <div>
    <div
      style="height: auto;"
      v-if="state=='course'"
    >
      <main class="msger-chat">
        <div>Create objectives for a course about...</div>
      </main>
      <div
        style="margin: 0;"
        class="msger-inputarea">
        <input @keyup.enter="getObjectives" v-model="course.name" type="text" class="msger-input" placeholder="course topic....">
        <button @click="getObjectives();" class="msger-btn">Create</button>
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
      <main 
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
      </main>
      <div
        style="margin: 0; text-align: right;"
        class="msger-inputarea">
        <button @click="buildCourse();" class="msger-btn">Build</button>
        <button @click="state = 'course'; course.name=''; objectives = [];" class="msger-btn red">Restart</button>
      </div>
    </div>
  </div>
</template>