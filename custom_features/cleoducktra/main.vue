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
          <div 
            v-for="menu in menus"
            class="menu-item" 
            @click="menuCurrent = menu;"
            :class="{
              'selected': menuCurrent == menu
            }"
          >{{menu}}</div>
        </div>
        <!--Ask Cleo-->
        <div
          v-if="menuCurrent == 'Ask Cleo'"
        >
          <div class="msger-chat">
            <cleoducktra-message
              v-for="message in  messages"
              :message="message"
            ></cleoducktra-message> 
          </div>
          <div
            style="margin: 0;"
            @submit.prevent="submitRequest" 
            class="msger-inputarea"
          >
            <input @keydown="cycleOldMessages" :disabled="awaitingResponse" v-model="input" type="text" class="msger-input" placeholder="Enter your message...">
            <button :disabled="awaitingResponse" type="submit" class="msger-send-btn">Ask</button>
          </div>
        </div>

        <!--Quiz Questions-->
        <cleoducktra-quiz-questions
          v-if="menuCurrent == 'Quiz Questions'"
          :key="key"
        ></cleoducktra-quiz-questions>

      </div>
    </div>
  </div>
</template>