<template>
  <div
    v-if="awaitingResponse"
    class="cleoducktra-content"
  >
    Creating Objectives...
  </div>
  <div
    v-else
  >
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
          v-for="objective, o in objectives"
          class="objectives-wrapper"
          style="margin-bottom: 0.5rem;"
        >
          <div><strong><span width="2rem">{{o + 1}}.</span> {{objective.name}}</strong></div> 
          <div>{{objective.description}}</div>
        </div>
      </main>
      <div
        style="margin: 0;"
        class="msger-inputarea">
        <button @click="getObjectives();" class="msger-btn blue">Add More</button>
        <button @click="state = 'course'; course.name=''; objectives = [];" class="msger-btn red">Restart</button>
      </div>
    </div>
  </div>
</template>