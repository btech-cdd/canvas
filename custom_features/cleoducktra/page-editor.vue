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
        v-if="show == 'revision'"
      >
      </div>
      <div
        class="msger-chat"
        v-html="diffs"
        v-if="show == 'diffs'"
      >
      </div>
      <div
        style="margin: 0;"
        class="msger-inputarea">
        <button @click="show = 'diffs';" class="msger-btn blue">Show Changes</button>
        <button @click="show = 'revision';" class="msger-btn blue">Show With Edits</button>
        <button @click="applyEdits();" class="msger-btn">Apply Edits</button>
      </div>
    </div>
  </div>
</template>