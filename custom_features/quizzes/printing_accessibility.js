// Add CSS to hide .answer_input on print
$(`<style>
  @media print { 
      .answer_input { display: none !important; } 
      div.answer_label::before { content: "⚪ "; } 
      .move { display: none !imporatnt; }
      .display_question { page-break-inside: avoid; }
    }

  </style>`).appendTo('head');
