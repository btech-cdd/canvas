// Add CSS to hide .answer_input on print
$(document).ready(function () {
  $(`<style>
    @media print { 
        .answer_input { display: none !important; } 
        div.answer_label::before { content: "⚪ "; } 
        div.move { display: none !important; }
        .display_question { page-break-inside: avoid; }
        .question .header {
          background-color: #AAA !important;
        }
      }

    </style>`).appendTo('head');

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

  let headerStyles = getComputedStyles(".question .header");

  let printStyles = `
    <style>
      @media print {
        ${headerStyles}
      }
    </style>
  `;
    console.log(printStyles);

  $("head").append(printStyles);
});
