<template>
  <div id="cleoducktra" class="cleoducktra-input">
    <div
      v-show="show"
      class="btech-modal"
      style="display: inline-block;"
    >
      <div
        class="cleoducktra-wrapper btech-modal-content"
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
          <span class="menu-item" style="float: right; color: #FFF; cursor: pointer;" @click="show = false;">X</span>
        </div>
        <!--Ask Cleo-->
        <div
          v-if="menuCurrent == 'Ask Cleo'"
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

        <!--Quiz Questions-->
        <div
          v-show="menuCurrent == 'Search'"
        >
          <cleoducktra-search
          ></cleoducktra-search>
        </div>

        <!--Quiz Questions-->
        <div
          v-show="menuCurrent == 'Quiz Questions'"
        >
          <cleoducktra-quiz-questions
          ></cleoducktra-quiz-questions>
        </div>

        <!--Course Outline-->
        <div
          v-show="menuCurrent == 'Content Outline'"
        >
          <cleoducktra-content-outline
          ></cleoducktra-content-outline>
        </div>

        <!--Page Editor-->
        <div
          v-show="menuCurrent == 'Page Editor'"
        >
          <cleoducktra-page-editor
          ></cleoducktra-page-editor>
        </div>
      </div>
    </div>
  </div>
</template>