<template>
  <div
    if="!awaitingResponse"
  >
    <div
      style="height: auto;"
      v-if="state=='prompt'"
    >
      <main class="msger-chat">
        <div>Create a quiz question about...</div>
      </main>
      <div
        style="margin: 0;"
        class="msger-inputarea">
        <input v-model="input" type="text" class="msger-input" placeholder="Enter your message...">
        <button @click="submitRequest();" class="msger-send-btn">Ask</button>
      </div>
    </div>
    <div
      style="height: auto;"
      v-if="state=='response'"
    >
      <main class="msger-chat">
        <div v-if="question.prompt !== ''">
          <p>{{question.prompt}}</p>
          <ol>
            <li v-for="answer in question.answers">{{answer}}</li>
          </ol>
          <p>Correct answer: {{question.correct + 1}}</p>
        </div>
      </main>
      <div
        style="margin: 0;"
        class="msger-inputarea">
        <button @click="createQuestion(); submitRequest();" class="msger-send-btn">Create</button>
        <button @click="submitRequest();" class="msger-send-btn blue">Next</button>
        <button @click="state = 'prompt'; input='';" class="msger-send-btn red">Restart</button>
      </div>
    </div>
  </div>
</template>