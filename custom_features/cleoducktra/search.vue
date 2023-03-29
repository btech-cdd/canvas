<!--Ask Cleo-->
<template>
  <div
    class="cleoducktra-content"
  >
    <div class="msger-chat">
      <cleoducktra-message
        v-for="message in  messages"
        :message="message"
      ></cleoducktra-message> 
    </div>
    <div
      style="margin: 0;"
      class="msger-inputarea"
    >
      <textarea 
        @keyup.enter="submitRequest" 
        @keydown="cycleOldMessages"
        @input="autoResizeInput"
        :disabled="awaitingResponse"
        v-model="input"
        type="text"
        style="resize: none;"
        class="msger-input"
        placeholder="Enter your message..."
      ></textarea>
      <button @click="submitRequest();" :disabled="awaitingResponse" class="msger-btn">Ask</button>
    </div>
  </div>
</template>