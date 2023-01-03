/** 
 * This JavaScript file contains js to create a rh menu in Instructure Canvas
 * 
 * @projectname OU Canvas Menu
 * @version 0.1
 * @author Damion Young
 * 
 */

/* Global variables */
var courseId = getCourseId(); //which course are we in
var moduleItemId = getParameterByName('module_item_id');  //used to id active page where data aren't in ENV

var divPageTitle = document.querySelectorAll('.page-title')[0];

/* list of pages to exclude from menu-showing */
/*Note that Conferences, Collaborations, Chat and Attendance pages don't expose ENV.COURSE_ID (although does have ENV.course_id) so menu won't be shown anyway...so no need to exclude */
var dontShowMenuOnTheseElementIds=new Array(
    'course_home_content', //Home page
    'context_modules', //Modules page
    'course_details_tabs' //Settings page
    );
var dontShowMenuOnTheseElementClasses=new Array(
    'discussion-collections', //Discussions page
    'announcements-v2__wrapper', //Announcements page
    'ef-main', //Files page
    'edit-content'  //editing a wiki page
    );

/* list of pages where we want menu in right-side-wrapper */
var putMenuInRightSideOnTheseElementIds=new Array(
    'discussion_container', //showing a discussion
    'quiz_show', //showing a quiz
    'assignment_show' //showing an asignment
    );

var divContent = document.getElementById('content');

/* Trying plain JS so that it works in the app as well */
function domReady () {
	if(divContent && courseId && elementsWithTheseIdsDontExist(dontShowMenuOnTheseElementIds) && elementsWithTheseClassesDontExist(dontShowMenuOnTheseElementClasses)){
		getSelfThenModulesForPage();
	} 
}

/**
 * Get self id
 */
function getSelfThenModulesForPage() {
	var csrfToken = getCsrfToken();
	fetch('/api/v1/users/self',{
			method: 'GET',
			credentials: 'include',
			headers: {
				"Accept": "application/json",
				"X-CSRF-Token": csrfToken
			}
		})
		.then(status)
		.then(json)
		.then(function(data) {
			getModulesForPage(courseId, data.id);
		})
		.catch(function(error) {
			console.log('getSelfId Request failed', error);
		}
	);
}

/*
 * Do any elements with these ids exist in the document
 * @param {string} ids[] - ids to look for
 * @returns {boolean}
 */
function elementsWithTheseIdsDontExist(ids) {
    for(var i = 0; i < ids.length; i++) {
        if(document.getElementById(ids[i])!==null){
            return false; //it does exist
        }
    }
    return true;
}

/*
 * Do any elements with these classes exist in the document
 * @param {string} classes[] - classes to look for
 * @returns {boolean}
 */
function elementsWithTheseClassesDontExist(classes) {
   for(var i = 0; i < classes.length; i++) {
       if(document.querySelectorAll('.'+classes[i]).length!==0){
            return false; //it does exist
        }
    }
    return true;
}

/*
 * Get modules and items for courseId
 * @param {number} courseId - ID of course
 * @param {number} userId - ID of user - used to return progress info.
 * TODO make userId optional
 */
function getModulesForPage(courseId, userId) {
	var csrfToken = getCsrfToken();
	fetch('/api/v1/courses/' + courseId + '/modules?include=items&student_id=' + userId,{
			method: 'GET',
			credentials: 'include',
			headers: {
				"Accept": "application/json",
				"X-CSRF-Token": csrfToken
			}
		})
		.then(status)
		.then(json)
		.then(function(data) {
			if(elementsWithTheseIdsDontExist(putMenuInRightSideOnTheseElementIds)) {
                /* In most cases, create a new column for the menu: creating a content-wrapper and moving divContent into it*/
                var divContentWrapper = document.createElement('div');
                divContentWrapper.className = "ou-content-wrapper grid-row";

                divContent.classList.add("col-xs-12");
                divContent.classList.add("col-sm-9");
                divContent.classList.add("col-lg-10");
                divContent.classList.add("col-xl-11");
                wrap(divContent, divContentWrapper);

                //now add divMenuWrapper
                var divMenuWrapper = document.createElement('div');
                divMenuWrapper.classList.add("ou-menu-wrapper");
                divMenuWrapper.classList.add("col-xs-12");
                divMenuWrapper.classList.add("col-sm-3");
                divMenuWrapper.classList.add("col-lg-2");
                divMenuWrapper.classList.add("col-xl-1");
                divContentWrapper.appendChild(divMenuWrapper); //add module to content
            } else {
                /* Where page contains div with id in putMenuInRightSideOnTheseElementIds, append the menu to div#right-side-wrapper */
                //TODO use a combination of ENV variables OR div ids and classes to reduce breakages on interface change
                var divRightSideWrapper = document.getElementById('right-side-wrapper');
                //now add divMenuWrapper
                var divMenuWrapper = document.createElement('div');
                divMenuWrapper.classList.add("ou-menu-wrapper-in-right-side");
                divRightSideWrapper.appendChild(divMenuWrapper); //add module to content
            }
			
			//adding click event listener to divMenuWrapper to ensure it is there 
			//menu items themselves won't exist yet
			divMenuWrapper.addEventListener('click',function(e){
				if(e.target && (e.target.className.match(/\bou-menu-module-title\b/) || e.target.className.match(/\bou-menu-module-arrow\b/))){
					//click on either div with class=ou-module-title or <i> class=ou-module-arrow 
					var moduleId = e.target.getAttribute('data-module-id');
					var targetItemsId = 'ouModuleItemsWrappper_' + moduleId;
					var targetItemsElement = document.getElementById(targetItemsId);
					targetItemsElement.classList.toggle('is-visible');
					var targetArrowId = 'ouModuleTitleArrow_' + moduleId;
					var targetArrowElement = document.getElementById(targetArrowId);
					if(targetArrowElement.classList.contains('icon-mini-arrow-right')) {
						targetArrowElement.classList.remove('icon-mini-arrow-right')
						targetArrowElement.classList.add('icon-mini-arrow-down');
					} else {
						targetArrowElement.classList.remove('icon-mini-arrow-down')
						targetArrowElement.classList.add('icon-mini-arrow-right');
					}
				}
			})
			
			//run through each module
			data.forEach(function(module, index){
				//work out some properties
				var moduleName = module.name;
				var moduleId = module.id;
								
				//create module div
				var newModule = document.createElement('div');
				newModule.className = 'ou-module-wrapper';
				//div for module name and arrow
				var newModuleName = document.createElement('div');
				newModuleName.className = 'ou-menu-module-title';
				newModuleName.setAttribute('title', moduleName);
				newModuleName.setAttribute('data-module-id', moduleId);
				//i for arrow
				var newModuleArrow = document.createElement('i');
				newModuleArrow.classList.add('icon-mini-arrow-right');
				newModuleArrow.classList.add('ou-menu-module-arrow');
				newModuleArrow.setAttribute('id', 'ouModuleTitleArrow_' + moduleId);
				newModuleArrow.setAttribute('data-module-id', moduleId);
				newModuleName.appendChild(newModuleArrow);
				newModuleName.appendChild(document.createTextNode(moduleName));
				newModule.appendChild(newModuleName); //add module name to module wrapper
				//newModule.innerHTML = '<div class="ou-menu-module-title" title="' + moduleName + '" data-module-id="' + moduleId + '"><i id="ouModuleTitleArrow_' + moduleId + '" class="icon-mini-arrow-right ou-menu-module-arrow" data-module-id="' + moduleId + '"></i> ' + moduleName + '</div>';
				var moduleItemsWrapper = document.createElement('div');
				moduleItemsWrapper.className = 'toggle-content';
				moduleItemsWrapper.id = 'ouModuleItemsWrappper_'+moduleId;
				newModule.appendChild(moduleItemsWrapper); //add module to content
				
				module.items.forEach(function(item, index){
					var itemTitle = item.title;
					var moduleId = item.module_id;
					var itemId = item.id;
					var itemType = item.type;
					var iconType;
					switch(itemType) {
						case "Page":
							iconType = "icon-document";
							break;
						case "File":
							iconType = "icon-paperclip";
							break;
						case "Discussion":
							iconType = "icon-discussion";
							break;
						case "Quiz":
							iconType = "icon-quiz";
							break;
						case "Assignment":
							iconType = "icon-assignment";
							break;
						default:
							iconType = "icon-document";
					}
					var newItem = document.createElement('div');
					newItem.className = 'ou-menu-item-wrapper';
					var itemLink = 'https://yourinstitution.instructure.com/courses/' + courseId + '/modules/items/' + itemId;  //construct hopefully app-compatible URL
					newItem.innerHTML = '<a class="'+iconType+'" title="'+itemTitle+'" href="'+itemLink+'">'+itemTitle+'</a>';
					moduleItemsWrapper.appendChild(newItem); //add item to module
					
				    	/* Check if this is the live item and leave menu open if it is */
                    			var activateIt = false;
					if(ENV.WIKI_PAGE){
						//we're in a wiki page
						if(item.page_url){
							//we're processing a wiki page
							if(ENV.WIKI_PAGE.url==item.page_url) {
								activateIt = true;
							}
						}
					} else if (ENV.DISCUSSION && ENV.DISCUSSION.TOPIC) {
						//we're in a discussion
						if(item.content_id){
							//we're processing a discussion page
							if(ENV.DISCUSSION.TOPIC.ID==item.content_id) {
								activateIt = true;
							}
						}
					} else if (ENV.QUIZ) {
						//we're in a quiz/survey
						if(item.content_id){
							//we're processing a quiz/survey page
							if(ENV.QUIZ.id==item.content_id) {
								activateIt = true;
							}
						}
                    			} else if (ENV.ASSIGNMENT_ID) {
                        			//we're in an assignment
                        			if(item.content_id){
							//we're processing an assignment
							if(ENV.ASSIGNMENT_ID==item.content_id) {
								activateIt = true;
							}
						}
                    			} else if (moduleItemId && parseInt(moduleItemId)===parseInt(item.id)) {
                        			//we're in something else but inside a module
                        			activateIt = true;
					}
                    			if(activateIt){
                        			/* open relevenat module and highlight active item */
                        			moduleItemsWrapper.classList.add('is-visible');
				        	newItem.classList.add('ou-menu-item-active'); 
                        			/* change module arrow from right to down */ 
                        			newModuleArrow.classList.remove('icon-mini-arrow-right')
				        	newModuleArrow.classList.add('icon-mini-arrow-down');
                    			}
				});
				divMenuWrapper.appendChild(newModule); //add module to menu
			});
		})
		.catch(function(error) {
			console.log('getModules request failed', error);
		}
	);
}

/* Utility functions */

//Function to work out when the DOM is ready: https://stackoverflow.com/questions/1795089/how-can-i-detect-dom-ready-and-add-a-class-without-jquery/1795167#1795167
// Mozilla, Opera, Webkit 
if ( document.addEventListener ) {
	document.addEventListener( "DOMContentLoaded", function(){
		document.removeEventListener( "DOMContentLoaded", arguments.callee, false);
		domReady();
	}, false );
// If IE event model is used
} else if ( document.attachEvent ) {
	// ensure firing before onload
	document.attachEvent("onreadystatechange", function(){
		if ( document.readyState === "complete" ) {
			document.detachEvent( "onreadystatechange", arguments.callee );
			domReady();
		}
	});
}

/*
 * Function which returns a promise (and error if rejected) if response status is OK
 */
function status(response) {
	if (response.status >= 200 && response.status < 300) {
		return Promise.resolve(response)
	} else {
		return Promise.reject(new Error(response.statusText))
	}
}
/*
 * Function which returns json from response
 */
function json(response) {
	return response.json()
}
/*
 * Function which returns csrf_token from cookie see: https://community.canvaslms.com/thread/22500-mobile-javascript-development
 */
function getCsrfToken() {
	var csrfRegex = new RegExp('^_csrf_token=(.*)$');
	var csrf;
	var cookies = document.cookie.split(';');
	for (var i = 0; i < cookies.length; i++) {
		var cookie = cookies[i].trim();
		var match = csrfRegex.exec(cookie);
		if (match) {
			csrf = decodeURIComponent(match[1]);
			break;
		}
	}
	return csrf;
}

/**
 * Function which wraps one element in another div - see: https://stackoverflow.com/questions/6838104/pure-javascript-method-to-wrap-content-in-a-di
 * @param {element} toWrap - element to be wrapped
 * @param {element} [wrapper] - element to wrap it in - new div if not provided
 */
var wrap = function (toWrap, wrapper) {
	wrapper = wrapper || document.createElement('div');
	toWrap.parentNode.appendChild(wrapper);
	return wrapper.appendChild(toWrap);
};

/**
 * Function which gets query string parameters by name - see: https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
 * @param {string} name - name of query parameter
 * @param {string} [url=window.location.href] - url 
 */
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

/**
 * Function which gets the course id either from the ENV or from the URL
 * @returns {string} courseId or null
 */
function getCourseId() {
    var courseId = ENV.COURSE_ID || ENV.course_id;
    if(!courseId){
        var urlPartIncludingCourseId = window.location.href.split("courses/")[1]; 
        if(urlPartIncludingCourseId) {
            courseId = urlPartIncludingCourseId.split("/")[0];    
        }
    }
    return courseId;
}
