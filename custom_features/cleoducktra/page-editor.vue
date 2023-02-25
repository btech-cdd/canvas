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
        <button v-for="option in editOptions" @click="editType = option; state = 'compare'; editPage();" class="msger-btn">{{option}}</button>
      </div>
    </div>
    <div
      style="height: auto;"
      v-if="state=='compare'"
    >
      <div
        class="msger-chat"
        v-html="revision"
      >
      </div>
    </div>
  </div>
</template>