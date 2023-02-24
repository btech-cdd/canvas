<template>
  <div
    v-if="awaitingResponse"
    class="cleoducktra-content"
  >
    Creating questions...
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
          class="question-wrapper"
        >
          <p>{{question.prompt}}</p>
          <ol>
            <li v-for="answer in question.answers">{{answer}}</li>
          </ol>
          <p>Correct answer: {{question.correct + 1}}</p>
          <div
            style="text-align: right;"
          >
            <button v-if="qestion.created" @click="createQuestion(question);" class="msger-btn">Create</button>
            <button v-else @click="" class="msger-btn red">Created</button>
          </div>
        </div>
      </main>
      <div
        style="margin: 0;"
        class="msger-inputarea">
        <button @click="submitRequest();" class="msger-btn blue">Next</button>
        <button @click="state = 'prompt'; input=''; questions = [];" class="msger-btn red">Restart</button>
      </div>
    </div>
  </div>
</template>