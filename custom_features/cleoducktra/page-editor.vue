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
      >
        <div
          v-if="awaitingResponse"
        >
          Editing...
        </div>
        <div
          v-if="tooLong"
        >
          Content is too long. Cannot edit content longer than 1000 tokens. 
        </div>
        <div
          v-html="revision"
          v-if="show == 'revision'"
        ></div>
        <div
          v-html="diffs"
          v-if="show == 'diffs'"
        ></div>
      </div>
      <div
        style="margin: 0;"
        class="msger-inputarea">
        <button @click="show = 'diffs';" class="msger-btn blue">Show Changes</button>
        <button @click="show = 'revision';" class="msger-btn blue">Show With Edits</button>
        <button @click="restart();" class="msger-btn red">Restart</button>
        <button @click="applyEdits();" class="msger-btn">Apply Edits</button>
      </div>
    </div>
  </div>
</template>