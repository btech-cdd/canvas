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
      </div>
      <div>
        <i
          @click="addBannerModal"
          class="icon-text"
        ></i>
        <i
          @click="addHeaderBannerModal"
          class="icon-text"
        ></i>
        <i
          @click="addHeaderHexModal"
          class="icon-text"
        ></i>
        <i
          @click="addImageRightModal"
          class="icon-image"
        ></i>
      </div>

      <!--ELEMENTS-->
      <div>
        <i
          @click="addHexImage"
          class="icon-image"
        ></i>
        <i
          @click="addCallout"
          class="icon-note-light"
        ></i>
        <rce-sidebar-comment
          :color="elColor"
        ></rce-sidebar-comment>
      </div>

      <div>
      </div>
    </div>
  </div>
</template>