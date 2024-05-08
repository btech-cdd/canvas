<template>
  <div 
    id="btech-editor-vue"
    :style="{
      'width': width + 'px',
      'right': minimized ? '-' + width + 'px' : '0px'
    }"
    style="position: fixed; top: 0; height: 100%; background-color: #f1f1f1;"
  >
    <div
      v-if="minimized"
      @click="maximize"
      style="
        position: absolute;
        top: 2rem;
        background-color: #d22232;
        color: white;
        padding: 0.5rem;
        cursor: pointer;
      "
      :style="{
        'right': width + 'px'
      }"
    >
      <i class="icon-edit"></i>
    </div>
    <div
      v-else
    >
      <div 
        style="
          text-align: center;
          background-color: #d22232;
          color: white;
          cursor: pointer;
          user-select: none;
        "
        @click="minimize"
      >
        BTECH Editor
        <b>&#8250;</b>
      </div>

      <!--MODULES-->
      <div>
        <input type="color" id="btech-custom-editor-buttons-color" v-model="elColor" style="width: 48px; height: 28px; padding: 4px; padding-right: 0px;" list="default-colors"/>
        <datalist id="default-colors">
          <option>#d22232</option>
          <option>#2232d2</option>
          <option>#1f89e5</option>
          <option>#32A852</option>
          <option>#E2A208</option>
          <option>#000000</option>
          <option>#FFFFFF</option>
        </datalist>
        <!--Need to create a button that let's the user take a color on the page and recolor every element to the new color.-->
        <!-- Easiest way would be to create a datalist like above and then pull every color on the page and put it in the list.-->
        <!-- Then have a second data list for creating the new color. Hit recolor and it does a find replace-->
        <rce-recolor></rce-recolor>
      </div>
      <div>
        <rce-modal-header-banner
          :defaultimg="defaultimg"
          :color="elColor"
          :get-container="getContainer"
          :init-formatted-content="initFormattedContent"
        ></rce-modal-header-banner>
        <rce-modal-header-hex-hide
          :defaultimg="defaultimg"
          :color="elColor"
          :get-container="getContainer"
          :init-formatted-content="initFormattedContent"
        ></rce-modal-header-hex-hide>
        <rce-modal-banner-hide
          :defaultimg="defaultimg"
          :color="elColor"
          :get-container="getContainer"
          :init-formatted-content="initFormattedContent"
        ></rce-modal-banner-hide>
        <rce-modal-image-right
          :defaultimg="defaultimg"
          :get-container="getContainer"
          :init-formatted-content="initFormattedContent"
        ></rce-modal-image-right>
      </div>

      <!--ELEMENTS-->
      <div>
        <!--Hex image not working right now, so added hide to the component tag so nothing shows up-->
        <rce-hex-image-hide
          :defaultimg="defaultimg"
        ></rce-hex-image-hide>

        <rce-citation></rce-citation>

        <rce-information-box
          :color="elColor"
        ></rce-information-box>
        <rce-callout></rce-callout>
        <rce-sidebar-comment
          :color="elColor"
        ></rce-sidebar-comment>
      </div>

      <div>
      </div>
    </div>
  </div>
</template>