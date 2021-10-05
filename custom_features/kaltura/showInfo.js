let iframes = $("iframe");
iframes.each(function () {
  let iframe = $(this);
  let src = iframe.attr("src");
  if (src.includes("kaltura")) {
    console.log("KALTURA!");
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
    `)
    let addToMyMediaButton = $(`<a class="btn">Add to Media Gallery</a>`)
    kalturaInfoEl.append(addToMyMediaButton);
    addToMyMediaButton.click(function() {
      $.post("https://kaltura.bridgetools.dev/api/mymedia/"+ENV.COURSE_ID+"/entry/" + entryId);
      alert("Media has been added to this course's Media Gallery. It may take a few minutes for the media to appear.")
    });
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
        $(`#kalturaOwnerId_${entryId}`).html(data.user_id);
      });
      kalturaInfoEl.dialog("open");
    });
  }
});