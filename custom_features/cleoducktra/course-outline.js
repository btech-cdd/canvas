class CleoDucktraCourse {
  constructor(name) {
    this.name = name;
    this.courseId = ENV.COURSE_ID;
    this.modules = [];
    this.loadingModules = false;
    this.buildStep = "";
    this.buildProgress = "";
  }

  async getModules() {
    this.loadingModules = true;
    let response = await CLEODUCKTRA.get(`Create ten modules for a course about ${this.name}. Use the format 1) skill: description`);
    let lines = response.split("\n");
    for (let l in  lines) {
      let line = lines[l];
      let mModule = line.match(/[0-9]+\) (.*): (.*)/);
      if (mModule) {
        let name = mModule[1];
        let module = mModule[2];
        this.modules.push(new CleoDucktraModule(this, name, module));
      }
    }
    this.loadingModules = false;
  }

  async createPage(title, body) {
    let page = await $.post(`/api/v1/courses/${this.courseId}/pages`, {
      wiki_page: {
        title: title,
        body: body
      }
    });
    return page;
  }

  async addPageToModule(module, page) {
    await $.post(`/api/v1/courses/${this.courseId}/modules/${module.id}/items`, {
      module_item: {
        type: 'Page',
        page_url: page.url
      }
    })
  }

  async createModule(module) {
    let module = await $.post(`/api/v1/courses/${this.courseId}/modules`, {
      module: {
        name: module.name
      }
    }); 
    this.buildStep = `Building module intro page for: ${objective.name}`
    let introPage = await this.createPage(
      "Intro to " + module.name,
      `<p>Module Outcomes</p><p>${module.description}</p>`
    );
    await this.addPageToModule(module, introPage);
    for (let t in module.topics) {
      let topic = module.topics[t];
      if (topic.include) {
        this.buildStep = `Building content for topic: ${topic.name}`
        await topic.genContent();
        let topicBody= topic.createPageBody();
        let page = await this.createPage(topic.name, topicBody);
        await this.addPageToModule(module, page);
      }
    }
    return module;
  }

  async build() {
    for (let m in this.modules) {
      let module = this.modules[m];
      if (module.include) {
        this.buildStep = `Building modules: ${module.name}`
        await this.createModule(module);
      }
    }
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
      getModules: async function() {
        this.awaitingResponse = true;
        this.course.getModules();
        this.awaitingResponse = false;
        this.state = "modules";
      },
      buildCourse: async function() {
        this.state = "build";
        await this.course.build();
        this.state = "modules";
      }
    }
  });
})();