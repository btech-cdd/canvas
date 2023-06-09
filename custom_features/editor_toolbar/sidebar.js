$("#wrapper").css("margin-right", "150px");
$("body").append(`
<div 
id="btech-editor-vue"
style="position: fixed; top: 0; right: 0; width: 150px; height: 100%; background-color: #f1f1f1;">
  <div style="background-color: #d22232; color: white;">BTECH Editor</div>
</div>
`);
new Vue({
  el: "#btech-editor-vue",
  mounted: async function () {
  },
  data: function () {
    return {
    }
  },
  methods: {
  }
});