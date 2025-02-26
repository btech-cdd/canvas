// Add CSS to hide .answer_input on print
$(`<style>
  @media print { 
      .answer_input { display: none !important; } 
      div.answer_label::before { content: "⚪ "; } 
      div.move { display: none !important; }
      .display_question { page-break-inside: avoid; }
    }

  </style>`).appendTo('head');
$(document).ready(function () {
  function getComputedStyles(selector) {
    let styles = "";
    $(selector).each(function () {
      let computed = window.getComputedStyle(this);
      let cssText = "";
      
      for (let i = 0; i < computed.length; i++) {
        let prop = computed[i];
        cssText += `${prop}: ${computed.getPropertyValue(prop)}; `;
      }

      styles += `${selector} { ${cssText} } `;
    });
    return styles;
  }

  let questionStyles = getComputedStyles(".question");
  let headerStyles = getComputedStyles(".header");

  let printStyles = `
    <style>
      @media print {
        ${questionStyles}
        ${headerStyles}
      }
    </style>
  `;

  $("head").append(printStyles);
});
