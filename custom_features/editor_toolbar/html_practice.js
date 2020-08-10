(async function () {
  //Load the vs code editor
  $.getScript("https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.20.0/min/vs/loader.min.js").done(function () {
    var s = document.createElement("link");
    s.setAttribute('rel', 'stylesheet');
    s.setAttribute('data-name', 'vs/editor/editor.main');
    //what to do after vs code css has been loaded
    s.onload = function () {

      //all part of importing vs code
      require.config({
        paths: {
          'vs': 'https://unpkg.com/monaco-editor@latest/min/vs'
        }
      });
      window.MonacoEnvironment = {
        getWorkerUrl: () => proxy
      };

      let proxy = URL.createObjectURL(new Blob([`
          self.MonacoEnvironment = {
            baseUrl: 'https://unpkg.com/monaco-editor@latest/min/'
          };
          importScripts('https://unpkg.com/monaco-editor@latest/min/vs/base/worker/workerMain.js');
        `], {
        type: 'text/javascript'
      }));

      require(["vs/editor/editor.main"], function () {
        //once the editor is loaded...
        //find the class used to indicate it's for html practice
        let elements = $(".btech-html-practice");
        //cycle
        elements.each(function () {
          //create all of the elements to add to the page
          let el = this;
          let html = $(el).text();
          let button = $("<button>Run</button>");
          //opted for an iframe so they're not running code on the page itself
          let display = $("<div style='outline: 1px solid #000; padding: 5px; margin-bottom: 10px;'><iframe width='100%' height='100%'></iframe></div>");
          //make some changes to the original element so it displas right
          $(el).after(display);
          $(el).after(button);
          $(el).empty();
          $(el).removeClass('btech-hidden');
          $(el).css({
            width: '100%',
            height: '256px'
          });
          //set up the editor
          let editor = monaco.editor.create(el, {
            value: html,
            language: 'html',
            theme: 'vs-dark'
          });
          //set up the button to run the code
          button.click(function () {
            parseVSCode(editor, el, display);
          });
        })
      });
    }

    //simple function to grab the code in vscode and run it in the iframe
    function parseVSCode(editor, el, display) {
      let html = editor.getValue();
      let context = display.find('iframe')[0].contentWindow.document;
      var $body = $('html', context);
      $body.html(html);
    }

    //for some reason this piece for importing the css has to be here
    s.setAttribute('href', 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.20.0/min/vs/editor/editor.main.min.css');
    document.getElementsByTagName('head')[0].appendChild(s);
  });
})();