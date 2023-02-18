<template>
  <div
    v-if="awaitingResponse"
    class="cleoducktra-content"
  >
    Createing questions...
  </div>
  <div
    v-else
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
      v-if="state=='response'"
    >
      <main 
        class="cleoducktra-content"
        class="msger-chat">
        <div
          v-for="question in questions"
        >
          <p>{{question.prompt}}</p>
          <ol>
            <li v-for="answer in question.answers">{{answer}}</li>
          </ol>
          <p>Correct answer: {{question.correct + 1}}</p>
          <button @click="createQuestion(question);" class="msger-send-btn">Create</button>
        </div>
      </main>
      <div
        style="margin: 0;"
        class="msger-inputarea">
        <button @click="submitRequest();" class="msger-send-btn blue">Next</button>
        <button @click="state = 'prompt'; input='';" class="msger-send-btn red">Restart</button>
      </div>
    </div>
  </div>
</template>