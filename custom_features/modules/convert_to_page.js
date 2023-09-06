(async function () {
  async function convertAssignmentToPage(courseId, moduleId, item) {
    // event.preventDefault();
    let itemId = item.find("div.ig-admin span").attr("data-content-id");
    let moduleItemId = item.find("div.ig-admin span").attr("data-module-item-id");
    let oldModuleItemData = await $.get("/api/v1/courses/" + courseId + "/modules/" + moduleId + "/items/" + moduleItemId);
    let assignment = await $.get("/api/v1/courses/" + courseId + "/assignments/" + itemId);
    let page = await $.post("/api/v1/courses/" + courseId + "/pages", {
      wiki_page: {
        title: assignment.name,
        body: assignment.description,
        published: oldModuleItemData.published
      }
    });
    await $.post("/api/v1/courses/" + courseId + "/modules/" + moduleId + "/items", {
      module_item: {
        title: page.title,
        type: 'Page',
        position: oldModuleItemData.position,
        indent: oldModuleItemData.indent,
        page_url: page.url
      }
    });
    await $.delete("/api/v1/courses/" + courseId + "/modules/" + moduleId + "/items/" + moduleItemId);
    await $.delete("/api/v1/courses/" + courseId + "/assignments/" + oldModuleItemData.content_id);
    location.reload(true);
  }
  async function convertQuizToPage(courseId, moduleId, item) {
    // event.preventDefault();
    let itemId = item.find("div.ig-admin span").attr("data-content-id");
    let moduleItemId = item.find("div.ig-admin span").attr("data-module-item-id");
    let oldModuleItemData = await $.get("/api/v1/courses/" + courseId + "/modules/" + moduleId + "/items/" + moduleItemId);
    console.log(oldModuleItemData);
    return
    let quiz = await $.get("/api/v1/courses/" + courseId + "/quizzes/" + itemId);
    console.log(quiz);
    let page = await $.post("/api/v1/courses/" + courseId + "/pages", {
      wiki_page: {
        title: assignment.name,
        body: assignment.description,
        published: oldModuleItemData.published
      }
    });
    await $.post("/api/v1/courses/" + courseId + "/modules/" + moduleId + "/items", {
      module_item: {
        title: page.title,
        type: 'Page',
        position: oldModuleItemData.position,
        indent: oldModuleItemData.indent,
        page_url: page.url
      }
    });
    await $.delete("/api/v1/courses/" + courseId + "/modules/" + moduleId + "/items/" + moduleItemId);
    await $.delete("/api/v1/courses/" + courseId + "/assignments/" + oldModuleItemData.content_id);
    location.reload(true);
  }
  addToModuleItemMenu("Convert To Page", "Remove this item from the module", convertAssignmentToPage, "Assignment");
  addToModuleItemMenu("Convert To Page", "Remove this item from the module", convertQuizToPage, "Quiz");
})();