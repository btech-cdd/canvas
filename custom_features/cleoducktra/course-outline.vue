<template>
  <div
    v-if="awaitingResponse"
    class="cleoducktra-content"
  >
    Creating outline...
  </div>
  <div
    v-else
  >
    <div
      style="height: auto;"
      v-if="state=='prompt'"
    >
      <main class="msger-chat">
        <div>Create a course outline about...</div>
      </main>
      <div
        style="margin: 0;"
        class="msger-inputarea">
        <input @keyup.enter="submitRequest" v-model="input" type="text" class="msger-input" placeholder="Enter your message...">
        <button @click="submitRequest();" class="msger-btn">Ask</button>
      </div>
    </div>
    <div
      v-if="state=='response'"
      class="cleoducktra-content"
    >
      <main 
        class="msger-chat">
        <div
          v-for="question in questions"
          class="objectives-wrapper"
        >
        </div>
      </main>
      <div
        style="margin: 0;"
        class="msger-inputarea">
        <button @click="submitRequest();" class="msger-btn blue">Add More</button>
        <button @click="state = 'prompt'; input='';" class="msger-btn red">Restart</button>
      </div>
    </div>
  </div>
</template>