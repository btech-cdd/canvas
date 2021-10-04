if (ENV.current_user_roles.includes("teacher")) {
  let iframes = $("iframe");
  iframes.each(function () {
    let iframe = $(this);
    let id = iframe.attr("id");
    if (id != undefined) {
      console.log(id);
      let playerIdMatch = id.match(/kaltura_player_([0-9]+)/);
      if (playerIdMatch) {
        let playerId = playerIdMatch[1];
        //get video id
        let entryIdMatch = iframe.attr("src").match(/entry_id=([0-9]_[a-zA-Z0-9]+)/);
        let entryId = entryIdMatch[1];

        let wrapDiv = $(`<div style="position: relative; display: inline-block;"></div>`);
        iframe.before(wrapDiv);
        wrapDiv.append(iframe);
        let kalturaInfoIconEl = $(`<i class="icon-info" style="position: absolute; right: .5rem; top: .5rem; z-index=999999; font-size=2rem;"></i>`);
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
    }
  });
}