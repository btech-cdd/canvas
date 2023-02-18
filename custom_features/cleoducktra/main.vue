<template>
  <div id="cleoducktra" class="cleoducktra-input">
    <div
      v-show="show"
      class="btech-modal"
      style="display: inline-block;"
      @click.self="show = false;"
    >
      <div
        class="msger btech-modal-content"
      >
        <div 
          class="menu"
        >
          <div class="menu-item">Ask Cleo</div>
          <div class="menu-item">Course Outline</div>
          <div class="menu-item">Assignments</div>
          <div class="menu-item">Quiz Questions</div>
        </div>
        <main class="msger-chat">
          <cleoducktra-message
            v-for="message in  messages"
            :message="message"
          ></cleoducktra-message> 
        </main>
        <form 
          style="margin: 0;"
          @submit.prevent="submitRequest" 
          class="msger-inputarea">
          <input @keydown="cycleOldMessages" :disabled="awaitingResponse" v-model="input" type="text" class="msger-input" placeholder="Enter your message...">
          <button :disabled="awaitingResponse" type="submit" class="msger-send-btn">Ask</button>
        </form>
      </div>
    </div>
  </div>
</template>