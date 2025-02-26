// Add CSS to hide .answer_input on print
$(document).ready(function () {
  $(`<style>
    @media print { 
        .answer_input { display: none !important; } 
        div.answer_label::before { content: "⚪ "; } 
        div.move { display: none !important; }
        .display_question { page-break-inside: avoid; }
      }

    </style>`).appendTo('head');
  });