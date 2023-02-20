class CleoDucktraCourse {
  constructor(name) {
    this.name = name;
    this.courseId = ENV.COURSE_ID;
    this.objectives = [];
    this.loadingObjectives = false;
  }

  async getObjectives() {
    this.loadingObjectives = true;
    let response = await CLEODUCKTRA.get(`Create ten objectives for a course about ${this.name}. Use the format 1) skill: description`);
    let lines = response.split("\n");
    for (let l in  lines) {
      let line = lines[l];
      let mObjective = line.match(/[0-9]+\) (.*): (.*)/);
      if (mObjective) {
        let name = mObjective[1];
        let description = mObjective[2];
        this.objectives.push(new CleoDucktraObjective(this, name, description));
      }
    }
    this.loadingObjectives = false;
  }

  async createPage(title, body) {
    console.log("CREATE PAGE: " + title);
    let page = await $.post(`/api/v1/courses/${this.courseId}/pages`, {
      wiki_page: {
        title: title,
        body: body
      }
    });
    return page;
  }

  async addPageToModule(module, page) {
    console.log("ADD PAGE");
    await $.post(`/api/v1/courses/${this.courseId}/modules/${module.id}/items`, {
      module_item: {
        type: 'Page',
        page_url: page.url
      }
    })
  }

  async createModule(objective) {
    console.log("CREATE MODULE: " + objective.name);
    let module = await $.post(`/api/v1/courses/${this.courseId}/modules`, {
      module: {
        name: objective.name
      }
    }); 
    let introPage = await this.createPage(
      "Intro to " + objective.name,
      `<p>Module Outcomes</p><p>${objective.description}</p>`
    );
    await this.addPageToModule(module, introPage);
    for (let t in objective.topics) {
      let topic = objective.topics[t];
      if (topic.include) {
        console.log("GEN CONTENT FOR " + topic.description);
        await topic.genContent();
        console.log("GEN PAGE CONTENT");
        let topicBody= topic.createPageBody();
        console.log(topicBody);
        let page = await this.createPage(topic.name, topicBody);
        await this.addPageToModule(module, page);
      }
    }
    return module;
  }

  async build() {
    for (let o in this.objectives) {
      let objective = this.objectives[o];
      if (objective.include) {
        await this.createModule(objective);
      }
    }
  }
}

class CleoDucktraObjective {
  constructor(course, name, description) {
    this.course = course;
    this.name = name;
    this.description = description;
    this.topics = [];
    this.include = false;
    this.loadingTopics = false;
  }

  async getTopics() {
    this.loadingTopics = true;
    let response = await CLEODUCKTRA.get(`Create a course module outline with five topics that teaches ${this.description} in ${this.course.name}. Use the format 1) topic: description`);
    let lines = response.split("\n");
    for (let l in  lines) {
      let line = lines[l];
      let mObjective = line.match(/[0-9]+\) (.*): (.*)/);
      if (mObjective) {
        let name = mObjective[1];
        let description = mObjective[2];
        this.topics.push(new CleoDucktraTopic(this, name, description));
      }
    }
    this.loadingTopics = false;
  }
}

class CleoDucktraTopic {
  constructor(objective, name, description) {
    this.objective = objective;
    this.name = name;
    this.description = description;
    this.content = "";
    this.include = false;
    this.keywords = [];
    this.outcomes = [];
  }

  async createPageBody() {
    let keywords = `<ul>`;
    for (let k in this.keywords) {
      let keyword = this.keywords[k];
      keywords += `<li><strong>${keyword.keyword}:</strong> ${keyword.definition}</li>`
    }
    keywords += `</ul>`;
    let outcomes = `<ol>`;
    for (let o in this.outcomes) {
      let outcome = this.outcomes[o];
      outcomes += `<li>${outcome}</li>`
    }
    keywords += "</ol>";
    let content = `
      <div class="btech-callout-box">${outcomes}</div>
      <p>&nbsp;</p>
      ${this.content}
      <p>&nbsp;</p>
      <div class="btech-callout-box">${keywords}</div>
      <p>&nbsp;</p>
    `
    console.log(content);
    console.log(this);
    return content;
  }

  async genKeywords() {
    let keywords = await CLEODUCKTRA.get(`Use the format 1) keyword: definition. What are the keywords in this text and their definitions: ${this.content}.`);
    let lines = keywords.split("\n");
    for (let l in  lines) {
      let line = lines[l];
      let mKeyword= line.match(/[0-9]+\) (.*): (.*)/);
      if (mKeyword) {
        let keyword = mKeyword[1];
        let definition = mKeyword[2];
        console.log(`${keyword}: ${definition}`);
        this.keywords.push({
          keyword: keyword,
          definition: definition
        })
      }
    }
  }

  async genOutcomes() {
    let outcomes = await CLEODUCKTRA.get(`Use the format 1) ... 2) .... What are the learning outcomes in this text: ${content}.`);
    let lines = outcomes.split("\n");
    for (let l in  lines) {
      let line = lines[l];
      let mOutcome = line.match(/[0-9]+\) (.*)/);
      if (mOutcome) {
        let outcome = mOutcome[1];
        this.outcomes.push(outcome)
      }
    }
  }

  async genContent() {
    let content = await CLEODUCKTRA.get(`Teach me about ${this.description} for a course on ${this.objective.description} in ${this.objective.course.name}. format in html. include headers and examples.`);
    this.content = content;
    await this.genKeywords();
    await this.genOutcomes();
    let outcomes = await CLEODUCKTRA.get(`Use the format 1) ... 2) .... What are the learning outcomes in this text: ${content}.`);
    console.log(outcomes);
  }
}

(async function () {
  let vueString = '';
  //load the resources
  await $.get(SOURCE_URL + '/custom_features/cleoducktra/course-outline.vue', null, function (html) {
    vueString = html.replace("<template>", "").replace("</template>", "");
  }, 'text');
  Vue.component('cleoducktra-course-outline', {
    template: vueString,
    mounted: function() {
    },
    data: function() {
      return {
        awaitingResponse: false,
        state: "course",
        course: new CleoDucktraCourse("") 
      }
    },
    methods: {
      // createQuestion: async function(question) {
      //   let answers = [];
      //   for (let a in question.answers) {
      //     let answer = question.answers[a];
      //     answers.push({
      //       answer_weight: a == question.correct ? 100 : 0,
      //       numerical_answer_type: "exact_answer",
      //       answer_text: answer
      //     })
      //   }
      //   await $.post(`/api/v1/courses/${ENV.COURSE_ID}/quizzes/${ENV.QUIZ.id}/questions`, {
      //     question: {
      //       question_name: this.input,
      //       question_type: "multiple_choice_question",
      //       points_possible: 1,
      //       question_text: `<p>${question.prompt}</p>`,
      //       answers: answers
      //     }
      //   }); 
      //   question.created = true;
      // },
      getObjectives: async function() {
        this.awaitingResponse = true;
        this.course.getObjectives();
        this.awaitingResponse = false;
        this.state = "objectives";
      },
      getTopics: async function() {

      },
    }
  });
})();