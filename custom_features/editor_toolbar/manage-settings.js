console.log("TOOLBAR");
(async function() {
  console.log("TOOLBAR");
  expandButton.click(function() {
    let maxWidth = getCSSVar("--btech-max-width");
    if (maxWidth == "auto") {
      $(expandButton.find("svg")).attr("fill", "#AAA");
      $.put(`/api/v1/users/self/custom_data?ns=com.btech&data[page_width]=default`);
      setCSSVar("--btech-max-width", DEFAULT_MAX_WIDTH);
    } else {
      $(expandButton.find("svg")).attr("fill", "#000000");
      $.put(`/api/v1/users/self/custom_data?ns=com.btech&data[page_width]=auto`);
      setCSSVar("--btech-max-width", "auto");
    }
  })
})();