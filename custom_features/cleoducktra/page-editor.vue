<template>
  <div>
    <div
      style="height: auto;"
      v-if="state=='select type'"
    >
      <div class="msger-chat">
        <div>Will you be creating a full course, or a single module?</div>
      </div>
      <div
        style="margin: 0;"
        class="msger-inputarea">
        <button v-for="option in editOptions" @click="contentType = option; state = 'compare';" class="msger-btn">{{option}}</button>
      </div>
    </div>
    <div
      style="height: auto;"
      v-if="state=='compare'"
    >
    </div>
  </div>
</template>