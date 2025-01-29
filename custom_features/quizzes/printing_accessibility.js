// Add CSS to hide .answer_input on print
$('<style>@media print { .answer_input { display: none !important; } div.answer_label::before { content: "⚪ "; } }</style>').appendTo('head');
