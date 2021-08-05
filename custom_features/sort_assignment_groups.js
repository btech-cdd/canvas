(async function() {
  let groupsData = await canvasGet("/api/v1/courses/"+ENV.COURSE_ID+"/assignment_groups?include[]=assignments");
  let groups = {};
  for (let g in groupsData) {
      let group = groupsData[g];
      let groupId = group.id;
      let assignmentIds = {};
      for (let a in group.assignments) {
          let assignment = group.assignments[a];
          let id = assignment.id;
          if (assignment.quiz_id !== undefined) id = assignment.quiz_id;
          assignmentIds[id] = assignment.id;
      }
      groups[groupId] = assignmentIds;
  }

  let modules = await canvasGet("/api/v1/courses/"+ENV.COURSE_ID+"/modules?include[]=items&include[]=content_details");
  let moduleOrderAssignments = [];
  for (let m in modules) {
      let module = modules[m];
      for (let i in module.items) {
          let item = module.items[i];
          console.log(item);
          if (item.content_id !== undefined) {
              moduleOrderAssignments.push(item.content_id);
          }
      }
  }

  let groupContainers = $(".assignment_group");
  groupContainers.each(function() {
      let groupContainer = $(this);

      let menu = groupContainer.find("ul.al-options");
      let aTag = $(`<a class="reorder_group icon-collection ui-corner-all" aria-label="Sort Assignment Group" id="ui-id-7" tabindex="-1" role="menuitem">Sort Items</a>`);
      let menuItem = $(`<li class="ui-menu-item" role="presentation"></li>`);
      menuItem.append(aTag);

      let groupId = groupContainer.attr("data-id");
      let group = groups[groupId];
      let newOrder = "";
      for (let a in moduleOrderAssignments) {
          let assignmentId = moduleOrderAssignments[a];
          if (assignmentId in group) {
              if (a > 0) newOrder += ",";
              newOrder += group[assignmentId];
          }
      }
      aTag.click(function() {
          console.log("click");
          $.post("/courses/"+ENV.COURSE_ID+"/assignment_groups/" + groupId + "/reorder", {
              order: newOrder
          });
      });
      menu.append(menuItem);
  });
})();