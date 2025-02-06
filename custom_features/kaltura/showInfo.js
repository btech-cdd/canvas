let iframes = $("iframe");
iframes.each(function () {
  let iframe = $(this);
  let src = iframe.attr("src");
  if (src === undefined) return
  if (src.includes("kaltura")) {
    let playerIdMatch = src.match(/[playerSkin\/|kaltura_player_]([0-9]+)/);
    let playerId = playerIdMatch[1];
    //get video id
    let entryIdMatch = src.match(/entry[_]{0,1}id[=|\/]([0-9]_[a-zA-Z0-9]+)/);
    let entryId = entryIdMatch[1];

    let wrapDiv = $(`<div style="position: relative; display: inline-block;"></div>`);
    iframe.before(wrapDiv);
    wrapDiv.append(iframe);
    let kalturaInfoIconEl = $(`
    <i 
      class="icon-info" 
      style="position: absolute; right: .5rem; top: .5rem; z-index=999999; font-size=2rem; background-color: #FFFFFF; padding: .25rem; padding-bottom: .125rem; margin: 0px; border-radius: 2rem;">
    </i>
    `);
    wrapDiv.append(kalturaInfoIconEl);
    let kalturaInfoEl = $(`
      <div>
      </div>
    `);
    kalturaInfoEl.append(`
      <p><strong>Player ID: </strong><span id="kalturaPlayerId_${entryId}">${playerId}</span></p>
      <p><strong>Video ID: </strong><span id="kalturaEntryId_${entryId}">${entryId}</span></p>
      <p><strong>Owner ID: </strong><span id="kalturaOwnerId_${entryId}"></span></p>
    `);
    let captions = $(`<div id="#kalturaCaptionsId_${entryId}></div>`);
    kalturaInfoEl.append(captions);

    if (IS_TEACHER) {
      let addToMyMediaButton = $(`<a class="btn">Add to Media Gallery</a>`)
      kalturaInfoEl.append(addToMyMediaButton);
      addToMyMediaButton.click(function() {
        $.post("https://kaltura.bridgetools.dev/api/mymedia/"+ENV.COURSE_ID+"/entry/" + entryId);
        alert("Media has been added to this course's Media Gallery. It may take a few minutes for the media to appear.")
      });
    }
    wrapDiv.append(kalturaInfoEl);
    kalturaInfoEl.dialog({
      autoOpen: false,
      resizable: false,
      draggable: false,
      modal: true,
      show: "blind",
      hide: "blind",
      title: "Kaltura Info"
    });
    kalturaInfoIconEl.click(function () {
      $.get(`https://kaltura.bridgetools.dev/api/mymedia/${entryId}`, function(data) {
        console.log(data);
    
        // Show user ID
        $(`#kalturaOwnerId_${entryId}`).html(`
          <a target="_blank" 
             href="https://btech.instructure.com/accounts/3/users?search_term=${data.userId}">
            ${data.userId}
          </a>
        `);
    
        // Prepare the container for captions
        let captions = $(`#kalturaCaptionsId_${entryId}`);
        captions.html('');  // Clear old content
    
        // For each caption track, create a clickable link to download
        for (let caption of data.captions) {
          let button = $(`<a style="margin-right: 10px; cursor: pointer;">
            Download ${caption.languageCode}
          </a>`);
    
          button.click(() => {
            // 1) Convert text into a blob
            let blob = new Blob([caption.text], { type: "text/plain" });
    
            // 2) Create a temporary URL for that blob
            let url = URL.createObjectURL(blob);
    
            // 3) Create a hidden <a> element to trigger the download
            let hiddenLink = document.createElement('a');
            hiddenLink.href = url;
            hiddenLink.download = `caption_${caption.languageCode}.txt`; 
            // e.g. "caption_en.txt" or "caption_es.txt"
    
            // 4) Programmatically click the <a> to start download
            hiddenLink.click();
    
            // 5) Release the URL object
            URL.revokeObjectURL(url);
          });
    
          captions.append(button);
        }
      });
    
      // Open the modal
      kalturaInfoEl.dialog("open");
    });
    
  }
});