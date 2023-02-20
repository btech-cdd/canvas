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
            class="objective-wrapper"
            style="margin-bottom: 0.5rem;"
          >
            <div>
              <input type="checkbox" v-model="objective.include">
            </div>
            <div>
              <div><strong><span width="2rem">{{o + 1}}.</span> {{objective.name}}</strong></div> 
              <div>{{objective.description}}</div>
            </div>
          </div>
        </div>
      </main>
      <div
        style="margin: 0; text-align: right;"
        class="msger-inputarea">
        <button @click="state = 'course'; course.name=''; objectives = [];" class="msger-btn red">Restart</button>
      </div>
    </div>
  </div>
</template>