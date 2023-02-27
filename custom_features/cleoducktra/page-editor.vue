<template>
  <div>
    <div
      style="height: auto;"
      v-if="state=='select type'"
    >
      <div class="msger-chat">
        <div>What kind of edits would you like?</div>
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
      class="cleoducktra-content"
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
          Content is too long. Your content shouldn't be more than approximately 500 words. However, exact word count will vary depedning on the ammount of images, videos, and page stylings you use. Try highlighting a section of the text to edit just that piece or split the page into multiple pages.
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