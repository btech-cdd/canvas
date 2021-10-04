let iframes = $("iframe");
iframes.each(function () {
  let iframe = $(this);
  let src = iframe.attr("src");
  if (src.includes("kaltura")) {
    console.log("KALTURA!");
    let playerIdMatch = src.match(/playerSkin\/([0-9]+)/);
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
                <p><strong>Player ID:</strong> ${playerId}</p>
                <p><strong>Video ID: </strong> ${entryId}</p>
                </div>
                `);
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
      kalturaInfoEl.dialog("open");
    });
  }
});