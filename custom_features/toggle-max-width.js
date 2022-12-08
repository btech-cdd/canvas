let expandButton = $(`<div title="Toggle between page content taking up the full width or having a restricted width. Restricted width has been shown to improve readability." style="display: inline-flex; align-items: center;">
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve" width="2rem" height="2rem">
<g>
	<g>
		<path d="M0,0v512h512V0H0z M477.867,477.867H34.133V34.133h443.733V477.867z"></path>
	</g>
</g>
<g>
	<g>
		<polygon points="126.533,102.4 199.111,102.4 199.111,68.267 68.267,68.267 68.267,199.111 102.4,199.111 102.4,126.538     198.422,222.558 222.556,198.423   "></polygon>
	</g>
</g>
<g>
	<g>
		<polygon points="222.557,313.581 198.422,289.445 102.4,385.467 102.4,312.889 68.267,312.889 68.267,443.733 199.111,443.733     199.111,409.6 126.538,409.6   "></polygon>
	</g>
</g>
<g>
	<g>
		<polygon points="409.6,312.889 409.6,385.467 313.578,289.444 289.444,313.578 385.462,409.6 312.889,409.6 312.889,443.733     443.733,443.733 443.733,312.889   "></polygon>
	</g>
</g>
<g>
	<g>
		<polygon points="312.889,68.267 312.889,102.4 385.467,102.4 289.444,198.423 313.578,222.558 409.6,126.538 409.6,199.111     443.733,199.111 443.733,68.267   "></polygon>
	</g>
</g>

</svg>
</div>`)

expandButton.click(function() {
  let maxWidth = getCSSVar("--btech-max-width");
  console.log(maxWidth);
  if (maxWidth == "auto") {
    $.put(`/api/v1/users/self/custom_data?ns=com.btech&data[page_width]=default`,  function(data) {
      updateMaxWidth();
    });
  } else {
    $.put(`/api/v1/users/self/custom_data?ns=com.btech&data[page_width]=auto`,  function(data) {
      updateMaxWidth();
    });
  }
})

$("div.right-of-crumbs").append(expandButton);