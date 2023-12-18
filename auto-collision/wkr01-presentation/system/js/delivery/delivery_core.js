/*!
 * IBM Confidential
 * OCO Source Materials
 * 5725N95, 5725P55, 5725N96
 * (C) Copyright IBM Corp. 1999, 2014
 * The source code for this program is not published or otherwise
 * divested of its trade secrets, irrespective of what has been
 * deposited with the U.S. Copyright Office.
 */

 /* $Id: delivery_core.js,v 1.1.2.21.4.3.2.64.2.29 2016/12/01 21:28:59 dvardhan Exp $ */
 
OSDeliveryEngine = 
{
	_index : {},
	_uniqueIdIndex : {},
	contextMap : {},
	urlMap : [],
	hierarchy : [5,4,3,2,11,1,6,7,13],
	tracking : [],
	isSCO : false,
	current : null,
	window : window,
	hasParent : false,
	configuration :
	{
		inlineLinks: false,
		feedbackPanel : 
		{ 
			width:"320px", 
			close:true, 
			modal:true, 
			fixedcenter:true, 
			visible:true, 
			zIndex:2000, 
			iframe:true 
		}
	},
	init : function()
	{
		for (var i=0; i<this.LAUNCH_FUNCTIONS.length; i++)
		{    
			this.createLaunchFunction(OSDeliveryEngine.LAUNCH_FUNCTIONS[i]);
		}
		
		this.events.engine_loaded.fire(this);
	},
	finalize : function(e) 
	{
		this.events.engine_unloaded.fire(this);

		if (!(e && e.type == "unload"))
		{
			if (window == top)
			{
				this.events.window_unloaded.fire(this);
				window.close();
			}
		}
		else if (e && e.type == "unload")
		{
			this.events.window_unloaded.fire(this);
		}
	},
	closeWindow : function()
	{
		var de = this;
		var w = window;
		while (w.parent != w)
		{
			try
			{
				if (typeof w.OSDeliveryEngine != "undefined")
				{
					de = w.OSDeliveryEngine;
				}
			}
			catch (e) {}

			w = w.parent;
		}
		
		de.finalize();

		try { top.close(); } catch (e) {}
	},
	getURL : function(id)
	{
		var url = null;
		var lst = this._index[id];
		if (lst != null)
		{
			// look until we find a URL
			for (var i=0; (i<lst.length) && (url == null); i++)
			{
				url = lst[i].url;
			}
		}
		return url;
	},
	getRoot : function()
	{
		var r = null;
		for (var i=0; i<this.hierarchy.length && (r == null); i++)
		{
			var id = OSDeliveryEngine.uniqueIdContextMap[this.hierarchy[i]];
			if (id != null)
			{
				r = this._uniqueIdIndex[id];
			}
		}
		return r;
	},
	getCurrent : function()
	{	
		if (this.current == null)
		{
			// find the current context and load it
			var c = null;
			for (var i=OSDeliveryEngine.hierarchy.length-1; i>=0 && c==null; i--)
			{
				var id = OSDeliveryEngine.uniqueIdContextMap[this.hierarchy[i]];
				if (id != null)
				{
					c = this._uniqueIdIndex[id];
				}
			}
			this.current = c;
		}
		return this.current;
	},
	addObject : function(obj,parent)
	{
		var lst = this._index[obj.id] || [];
			lst.push(obj);
			
		this._index[obj.id] = lst;
		
		// always replace references with the real instance
		var entry = this._uniqueIdIndex[obj.uniqueId];
		
		if (!obj.referencedBy)
		{
			this._uniqueIdIndex[obj.uniqueId] = obj;
			
			if (parent)
			{
				obj.parent = parent;
			}
			else if (obj.parentId)
			{
				if (this._index[obj.parentId])
				{
					var p = obj.parent = this._index[obj.parentId][0];
					if (!p.children)
					{
						p.children = [];
					}
					p.children.push(obj);
				}
			}

			if (obj.children)
			{
				for (var i=0; i<obj.children.length; i++)
				{
					this.addObject(obj.children[i],obj);
				}
			}

			if (obj.references)
			{
				for (var i=0; i<obj.references.length; i++)
				{
					obj.references[i].referencedBy = obj;

					this.addObject(obj.references[i]);
				}
			}
		}
	},
	getObject : function(id)
	{
		return this._index[id];
	},
	getMediaURL : function(objId, mediaID, viewPort)
	{
		var mediaURL = "";
		var objArray = this.getObject(objId);
		var found = false;
		
		if ( typeof objArray != "undefined" )
		{
			// Use the first object
			var obj = objArray[0];
			var references = obj.references;
			for (var i = 0; i < references.length; i++ )
			{
				if ( references[i].id == mediaID )
				{
					var mediaReferences = references[i].media_references.types;
					for ( var j = 0; j < mediaReferences.length; j++ )
					{
						var mediaType = mediaReferences[j];
						if (mediaType.viewPort.toLowerCase() == viewPort.toLowerCase())
						{
							mediaURL = mediaType.url;
							found = true;
							break;
						}
					}
					if ( found ) break;
				}
			}
		}
		
		return mediaURL;
	},
	getMediaURLByType : function(objId, mediaID, viewPort, type)
	{
		var mediaURL = "";
		var objArray = this.getObject(objId);
		var found = false;
		
		if ( typeof objArray != "undefined" )
		{
			// Use the first object
			var obj = objArray[0];
			var references = obj.references;
			for (var i = 0; i < references.length; i++ )
			{
				if ( references[i].id == mediaID )
				{
					var mediaReferences = references[i].media_references.types;
					for ( var j = 0; j < mediaReferences.length; j++ )
					{
						var mediaType = mediaReferences[j];
						if (mediaType.mediaTypeId  == type)
						{
							mediaURL = mediaType.url;
							found = true;
							break;
						}
					}
					if ( found ) break;
				}
			}
		}
		
		return mediaURL;
	},
	getObjectByUniqueId : function(id)
	{
		return this._uniqueIdIndex[id];
	},
	flatten : function(obj,a1)
	{
		var a = a1 || [];

		a.push(obj);

		var c = obj.children;
		if (c)
		{
			for (var i=0; i<c.length; i++)
			{
				this.flatten(c[i],a);
			}
		}
		
		return a;
	},
	find : function(obj,validate,scope)
	{
		var found = [];
		var objList = this.flatten(obj);

		var c, fn;
		for (var i=0; i<objList.length; i++)
		{
			c = objList[i];
			if (validate)
			{
				if (scope)
				{
					scope.fn = validate;
					if (scope.fn(c))
					{
						found.push(c);
					}
				}
				else if (validate(c))
				{
					found.push(c);
				}
			}
			else
			{
				found.push(c);
			}
		}
		
		return found;
	},
	each : function(obj,callback, scope)
	{
		var objList = (!jQuery.isArray(obj)) ? this.flatten(obj) : obj;
		for (var i=0; i<objList.length; i++)
		{
			if (scope)
			{
				scope.fn = callback;
				scope.fn(objList[i]);
			}
			else
			{
				callback(objList[i]);
			}
		}
	},
	isDescendant : function(parent,child)
	{
		var r = false;
		if (parent != null && child != null)
		{
			var p = child;
			while (!r && (p = p.parent) != null)
			{
				r = (p == parent);
			}
		}
		return r;
	},
	events : 
	{
		preload : new YAHOO.util.CustomEvent("preload"),
		load : new YAHOO.util.CustomEvent("load"),
		touch : new YAHOO.util.CustomEvent("touch"),
		score : new YAHOO.util.CustomEvent("score"),
		engine_loaded : new YAHOO.util.CustomEvent("engine_loaded"),
		engine_unloaded : new YAHOO.util.CustomEvent("engine_unloaded"),
		window_unloaded : new YAHOO.util.CustomEvent("window_unloaded"),
		feedback : new YAHOO.util.CustomEvent("feedback"),
		hint : new YAHOO.util.CustomEvent("hint"),
		media_loaded : new YAHOO.util.CustomEvent("media_loaded"),
		nav_request : new YAHOO.util.CustomEvent("nav_request")
	},
	eventHandler : function(type, args) 
	{
		var obj = args[0];

		switch (type)
		{
			case ("preload"):
				this.handleContentLoaded(obj);
				break;
			case ("load"):
				this.handleContentLoaded(obj);
				break;
			case ("score"):
				this.handleContentScore(obj);
				break;
		}
		
		// bubble to parent instances
		var w = (window.parent != window) ? window.parent : window.opener;
		if (w && this.hasParent)
		{
			if (!obj._handledBy)
			{
				obj._handledBy = {};
			}
			if (!obj._handledBy[type])
			{
				obj._handledBy[type] = [];
			}
			obj._handledBy[type].push(this);
			
			var p = ObjectFinder.search(w,"OSDeliveryEngine");
			if (p && !this._isHandledBy(obj._handledBy[type],p))
			{
				p.events[type].fire(obj);
				obj.handled=true;//aponnada:RTC#89397
			}
		}
	},
	_isHandledBy : function(handledBy, parent)
	{
		var h = false;
		for (var i=0; i<handledBy.length && !h; i++)
		{
			h = (handledBy[i] == parent)
		}
		return h
	},
	cloneEventObject : function(obj)
	{
		var n = null;
		if (jQuery.isArray(obj))
		{
			n = [];
			for (var p in obj)
			{
				n.push(OSDeliveryEngine.cloneEventObject(obj[p]));
			}
		}
		else if (obj && (typeof obj == 'object'))
		{
			n = {};
			for (var p in obj)
			{
				if (!( obj[p] && (typeof obj[p] == 'function') ) )
				{
					if (!(p.indexOf("_") == 0))
					{
						n[p] = OSDeliveryEngine.cloneEventObject(obj[p]);
					}
					else
					{
						n[p] = obj[p];
					}
				}
			}
		}
		else
		{
			n = obj;
		}

		return n;
	},
	queueLoad : function(id)
	{
		var obj = OSDeliveryEngine.getObjectByUniqueId(id);
		if (obj != null)
		{
			OSDeliveryEngine.events.preload.fire(obj);
			YAHOO.util.Event.onContentReady("C"+obj.id, function() { OSDeliveryEngine.events.load.fire(obj) });
		}
	},
	handleContentLoaded : function(obj)
	{
		var de = OSDeliveryEngine;
		if ((obj && typeof obj == 'object' ))
		{
			var local = de.getObjectByUniqueId(obj.uniqueId);
			if (local != null)
			{
				var now = new Date().getTime();
				
				local.lastAccess = now;
				
				// update all parents too
				var p = local;
				while ((p = p.parent) != null)
				{
					p.lastAccess = now;
				}
				
				if (local.type != 6)
				{	
					de.updateLinearNavigation();
					de.rollupSatisfaction(de.getRoot());
				}
			}
			else if (obj.parent)
			{
				// look at parents if the object cannot be found
				de.handleContentLoaded(obj.parent);
			}
		}
		else if ((obj && typeof obj == "string" ))
		{
			//debugger;
		}
	},
	handleContentScore : function(obj)
	{
		this.tracking.push({"type":"score","src":OSDeliveryEngine.cloneEventObject(obj),"time":new Date()});
		
		if (obj.type == 6)
		{
			this.updateLinearNavigation();
			
			this.updateAssessmentSatisfaction(obj);
			this.rollupSatisfaction(this.getRoot());
		}
	},
	updateLinearNavigation : function()
	{
		// update linear navigation flag
		if (OSDeliveryEngine.linear)
		{
			var enabled = true;
			var objList = OSDeliveryEngine.flatten(OSDeliveryEngine.getRoot());
			var p;
			for (var i=0; i<objList.length; i++)
			{
				p = objList[i].parent;
				if (p)
				{
					// parent is accessed or enabled
					enabled = ((p.lastAccess != null) || p.linear.enabled);
					if (enabled)
					{
						// enabled if this is the first child of an enabled parent or the previous sibling is accessed
						if ((i > 0) && (objList[i-1] != p))
						{
							enabled = (objList[i-1].lastAccess != null);
						}
					}
				}
				objList[i].linear.enabled = enabled;
			}
		}
	},
	updateAssessmentSatisfaction : function(assessment)
	{
		if (this.satisfaction)
		{
			if (jQuery.inArray(this.satisfaction.type,[1,2,3]) > -1)
			{
				var satisfiedMap = {};
				var assList = OSDeliveryEngine.flatten(assessment);
				for (var i=0; i<assList.length; i++)
				{
					satisfiedMap[assList[i].id] = (assList[i].score == 1);
				}
				
				var obj, satisfiedFlag, contentMap;
				var objList = OSDeliveryEngine.flatten(OSDeliveryEngine.getRoot());

				for (var i=0; i<objList.length; i++)
				{
					obj = objList[i];
					if (obj.type == 6)
					{
						if (obj.id == assessment.id)
						{
							obj.satisfaction.satisfied = (assessment.score >= obj.passingScore);
						}
					}
					else if (obj.type == 11)
					{
						contentMap = obj.satisfaction.children;
						if (contentMap)
						{
							for (var childId in contentMap)
							{
								if (contentMap[childId].ids && (jQuery.inArray(contentMap[childId].ids,assessment.id)))
								{
									// if the question was not in the assessment instance it is satisfied by equivalency
									contentMap[childId].satisfied = (satisfiedMap[childId] != null) ? satisfiedMap[childId] : true;
								}
							}
						}
					}
				}
			}
			else if (this.satisfaction.type == 4)
			{
				var objList = OSDeliveryEngine.getObject(assessment.id);
				if (objList != null)
				{
					for (var i=0; i<objList.length; i++)
					{
						objList[i].satisfaction.satisfied = (assessment.score >= objList[i].passingScore);
					}
				}
			}
		}
	},
	rollupSatisfaction : function(obj)
	{
		if (this.satisfaction)
		{
			if (jQuery.inArray(this.satisfaction.type,[1,2,3]) > -1)
			{
				this.rollupAssessmentSatisfaction(obj);
			}
			else if (this.satisfaction.type == 4)
			{
				this.rollupNavigationSatisfaction(obj);
			}
		}
	},
	rollupAssessmentSatisfaction : function(obj)
	{
		var satisfied = null;
		switch (obj.type)
		{
			case (6):
			
				satisfied = obj.satisfaction.satisfied;
				break;
			
			case (11):
				
				var c = obj.satisfaction.children;
				if (c)
				{
					var p = 0;
					var f = 0;

					for (var id in c)
					{
						if (c[id].satisfied)
						{
							p++;
						}
						else
						{
							f++;
						}
					}
					
					var t = p+f;
					if (t > 0)
					{
						satisfied = obj.satisfaction.satisfied = ((p/t) > (OSDeliveryEngine.satisfaction.threshold/100));
					}
				}
				
				break;

			default:

				if (obj.children)
				{
					var p = 0;
					var f = 0;
					var c, cs;

					for (var i=0; i<obj.children.length; i++)
					{
						c = obj.children[i];
						cs = OSDeliveryEngine.rollupAssessmentSatisfaction(c);
						if (cs != null)
						{
							if (cs)
							{
								p++;
							}
							else
							{
								f++;
							}
						}
					}
					
					var t = p+f;
					if (t > 0)
					{
						satisfied = obj.satisfaction.satisfied = ((p/t) > (OSDeliveryEngine.satisfaction.threshold/100));
					}
				}
		}
		return satisfied;
	},
	rollupNavigationSatisfaction : function(obj)
	{
		var satisfied = true;
		switch (obj.type)
		{
			case (6):
			
				satisfied = obj.satisfaction.satisfied;
				break;
				
			case (11):
				
				satisfied = obj.satisfaction.satisfied = (obj.lastAccess != null);
				break;

			default:

				var f = 0;
				if (obj.children)
				{
					for (var i=0; i<obj.children.length; i++)
					{
						if (!OSDeliveryEngine.rollupNavigationSatisfaction(obj.children[i]))
						{
							f++;
						}
					}
				}
				satisfied = obj.satisfaction.satisfied = (f==0);
		}
		return satisfied;
	},
	ShowThumbnail : function(src,w,h)
	{
		var win;
		win = window.open("","ThumbnailPage","left=1,top=1,resizable=yes,width=" + w + ",height=" + h + ",scrollbars=no");
		win.document.open();
		win.document.write("<html><style>body { margin:0px; }</style><script language=\"javascript\">" + "OSDeliveryEngine = window.opener.OSDeliveryEngine;</script>" 
				+ "<body >"  +src+ "</body></html>");
		win.document.body.focus();
		win.document.close();
		win.focus();
	},
	createControl : function(id,src,w)
	{
		w.document.getElementById(id).innerHTML = src;
	},
	LAUNCH_FUNCTIONS : 
	[
		"NewLO",
		"NewPage",
		"NewGrouping",
		"NewContent",
		"NewAssessment",
		"NewSurvey",
		"NewExternalContent",
		"NewExternalContainer",
		"NewMedia",
		"NewSimContent",
		"NewLink",
		"AnyObjectLaunch"
	],
	LAUNCH_FUNCTION_MAPPING :
	{
		"NewSimContent" : "launchSimulation"
	},
	createLaunchFunction : function(fn)
	{ 
		var w = window;
		var orig = w[fn];
		
		window[fn] = function() 
		{
			if (OSDeliveryEngine.events.nav_request.fire(arguments))
			{
				if (typeof(orig) == "undefined")
				{
					// use the default implementation
					OSDeliveryEngine.launchObject(fn,arguments);
				}
				else
				{
					if (arguments[1] && arguments[1] == "0") {
						OSDeliveryEngine.launchURL(OSDeliveryEngine.getURL(arguments[0]), arguments);
					} else {
						orig.apply(w,arguments);
					}
				}
				
				// always cancel the event
				if (w.event)
				{
					YAHOO.util.Event.stopEvent(w.event);
				}
			}
		}
	},
	getViewerController: function()
	{
		//aponnada:RTC#153602:To handle chrome for StaticHTML
		try{
		if (typeof(ViewerController) != "undefined") return ViewerController;
		else if ( typeof (parent.ViewerController) != "undefined") return parent.ViewerController;
			}catch(e){}
		return null;
	},
	launchURL : function(url, args)
	{
		var parentId = typeof(args[3]) != "undefined" ? args[3] : args[2];
		var obj = this._index[parentId];
		var inContext = false;
		
		if (typeof(obj) != "undefined") {
			inContext = true;
			obj = this._index[args[0]];
		}
		else {
			// ParentId is not passed
			obj = this._index[args[0]];
			if ( typeof(obj) != "undefined" )
			{
				// Check if this object or the url is in the url map
				var checkId = url;
				if (url.indexOf("ContentViewer") > -1 || url.indexOf("BuildAssessment") > -1 ){
					checkId = obj[0].id;
				}
				for (var i = 0; i < this.urlMap.length; i++) {
					if (this.urlMap[i].indexOf(checkId) != -1) {								
						url = this.urlMap[i];
						inContext = true;
						break;
					}
				}
				// Media Object and External Container should always be opened in a new window.
				if (obj[0].type == 8 || obj[0].type == 12 ) inContext = false;
			}
			
		}
		
		
		if (inContext == true) {
			// When inContext
			if (url.indexOf("ContentViewer") > -1 || url.indexOf("BuildAssessment") > -1 ){
				// When online mode
				var vc = this.getViewerController();
				if ( vc != null && typeof (vc) != "undefined" )
				{
					if ( typeof (vc.engine) != "undefined" )
						obj = vc.engine.getObject(args[0]);
					else
						obj = OSDeliveryEngine.getObject(args[0]);
					//ViewerController.navigateTo(obj[0]);
					vc.navigateTo(obj[0]);
					window.parent.location.href = url; 
				}
				else
				{
					//console.log("location href1");
					window.location.href = url;
				}
			}
			else
			{
				// case export to Static HTML
				//aponnada:RTC#89397
				if(args.handled){
					return;
				}
				//aponnada:RTC#89397
				if (obj[0].type == 3 || obj[0].type == 2) {
					//console.log("location href2");
					window.parent.location.href = url;
				} else {
					//console.log("location href3");
					window.location.href = url;
				}				
			} 
		}
		else {
			// Out of Context
			obj = this._index[args[0]];
			//aponnada:RTC#153602:To handle chrome for StaticHTML
			var isPreview = false;
			try{
				if( window.parent != null && window.parent.parent!=null && 
								window.parent.parent.name!= null &&	window.parent.parent.name.indexOf("objectdetails")==0 ){
									isPreview=true;							
				}
			}catch(e){				
				if(ObjectFinder && ObjectFinder.search(window,'objectdetails')!=null)
					isPreview=true;
			}
			if(isPreview){
				window.location.href = url;	
			}
			//aponnada:RTC#153602:To handle chrome for StaticHTML
			else if (typeof(obj) != "undefined") {
				//1=Course,2=Module,3=LO,4=Topic,11=Group,6=Assessment
				if(parentId==OSDeliveryEngine.getRoot().id)
					window.parent.location.href = url;//aponnada:RTC#89397
				else
				{
				if ( obj[0].type == 6 || obj[0].type == 11 ||  obj[0].type == 12 ) // suneel:RTC#109383 added obj[0].type == 12 in condition
					{
						this.loadContent(obj[0], url);
					}
					else
					{
						OSDeliveryEngine.launchWindow(url);							
					}
				}
			} 
			else {
				window.location.href = url;
			}
		}
	},
	
	loadContent: function(obj, url)
	{
		var vc = this.getViewerController();
		if ( vc != null && typeof (vc) != "undefined" )
		{
			if ( typeof( vc.events.load_content_frame) != "undefined" &&  vc.events.load_content_frame.subscribers.length > 0 )
				vc.events.load_content_frame.fire(obj,url);
			else
			{
				//console.log("location href5");
				window.location.href = url;
			}
		}
		else
		{
			//console.log("location href6");
			window.location.href = url;
		}
	},
	
	oldlaunchURL : function(url, args)
	{
		var parentId = typeof(args[3]) != "undefined" ? args[3] : args[2];
		var obj = this._index[parentId];
		
		// check same content or not
		if (typeof(obj) != "undefined") {
			obj = this._index[args[0]];
			for (var i = 0; i < this.urlMap.length; i++) {
				if (this.urlMap[i].indexOf(obj[0].id) != -1) {								
					url = this.urlMap[i];
					break;
				}
			}
			
			// case midnight-table viewer
			if (url.indexOf("viewerID=midnight-tablet") > -1) {
				obj = ViewerController.engine.getObject(args[0]);
				ViewerController.navigateTo(obj[0]);
			} else if (url.indexOf(".html") > -1){
				// case export to Static HTML
				if (obj[0].type == 3 || obj[0].type == 2) {
					window.parent.location.href = url;
				} else {
					window.location.href = url;
				}				
			} else {
				window.location.href = url;
			}
			
		} else {
			obj = this._index[args[0]];
			if (typeof(obj) != "undefined") {
				//1=Course,2=Module,3=LO,4=Topic,11=Group,6=Assessment
				if (obj[0].type == 2 || obj[0].type == 3) {
					if (obj[0].type == 2) {
						if (url.indexOf("viewerID=CbtView") > -1 || url.indexOf("viewerID=Classic-LO") > -1) {
							window.location.href = url;
						} else {
							if( window.parent != null && window.parent.parent!=null && 
									window.parent.parent.name!= null &&	window.parent.parent.name.indexOf("objectdetails")==0 ){
								//57121 For Authoring
								window.location.href = url;
							}else {
								window.parent.location.href = url;
							}
						}	
					} else {
						if( window.parent != null && window.parent.parent!=null && 
								window.parent.parent.name!= null &&	window.parent.parent.name.indexOf("objectdetails")==0 ){
							//57121 For Authoring
							window.location.href = url;
						}else {
							window.parent.location.href = url;
						}
					}
				} else if (obj[0].type == 6 || obj[0].type == 11){
					// case midnight-table viewer
					if (typeof (ViewerController) != "undefined") {
						obj = ViewerController.engine.getObject(args[0]);
						if (typeof (obj) != "undefined") {
							ViewerController.navigateTo(obj[0]);
						} else {
							var divContent = jQuery("#content");
							divContent[0].document.location.href = url;
						}
						
					} else {
						window.location.href = url;
					}
				} else {
					window.location.href = url;
				}
			} else {
				window.location.href = url;
			}
		}
		
	},
	launchObject : function(fn,args)
	{  
		//To fix defect 61033: Media is loading on child window.
		OSDeliveryEngine.events.load.unsubscribeAll();
		OSDeliveryEngine.events.engine_loaded.unsubscribeAll();
		
		var typeId = 0;
		var url = null;
		var isGUIID = /^[A-Z0-9]{32}$/.test(args[0]);
		if(isGUIID) 
		{
			url = OSDeliveryEngine.getURL(args[0]);
		} 
		else 
		{
			url = args[0];
		}
		if (url != null)
		{
			var fnMap = OSDeliveryEngine.LAUNCH_FUNCTION_MAPPING[fn];
			if (!fnMap)
			{
				if (args[1] && args[1] == "0")
				{
					// Branching: change inline behave
					OSDeliveryEngine.launchURL(url, args);
				}
				else if (args[1] && args[1] == "1")
				{   // RTC 91867
					if(typeof(args[2])  == "object")
					{
						OSDeliveryEngine.launchWindow(url, null, args[2]);
				    }
				    else
				    {				    
						OSDeliveryEngine.launchWindow(url, null, OSDeliveryEngine.DEFAULT_POPUP_ATTRIBUTES);
					}
				}
				else if (args[1] && args[1] == "2")
				{
					OSDeliveryEngine.launchDialog(url, args[2]);
				}
				else if (args[1] && args[1].location)
				{
					args[1].location.href = url;
				}
				else if (OSDeliveryEngine.configuration.inlineLinks)
				{
					window.location.href = url;
				} 
				else
				{
					OSDeliveryEngine.launchWindow(url);
				}
			}
			else
			{
				OSDeliveryEngine[fnMap](url,args);
			}
		}
		else
		{
			alert("Error: Unable to launch\nOSDeliveryEngine.launchObject:\n\tid:"+args[0]+"\n\tfn:"+fn);
		}
	},
	/*
	 * Validate GUID Format. This routine will return true if the passed in argument is in a valid GUID format. False, otherwise.
	 * This preliminary test pre-validates the GUID before using up server and database resources to lookup the GUID
	 */
	isValidGuidFormat : function(id)
	{
		var GUID_LENGTH = 32;

		//Check for valid length.
		if (id == null) { return false; }
		if (id.length != GUID_LENGTH) { return false; }

		// Check for valid characters.
		for ( i = 0; i < GUID_LENGTH; i++) {
			var c = id.charAt(i);
			if (c != '0' && c != '1' && c != '2' && c != '3' && c != '4' &&
				c != '5' && c != '6' && c != '7' && c != '8' && c != '9' &&
				c != 'a' && c != 'b' && c != 'c' && c != 'd' && c != 'e' && c != 'f' &&
				c != 'A' && c != 'B' && c != 'C' && c != 'D' && c != 'E' && c != 'F') {
				alert( "Invalid GUID format." );
				return false;
			}
		}
		return true;
	},
	launchWindow : function(url,name,features)
	{
		// generate a random window name if one is not passed
		if (name == null) 
		{
			name = "w"+Math.random().toString().replace(".", "");
		}
		var options =  ( typeof(OSDeliveryEngine.hasParent) == "undefined" || OSDeliveryEngine.hasParent == null ) ? OSDeliveryEngine.DEFAULT_POPUP_ATTRIBUTES : OSDeliveryEngine.hasParent.DEFAULT_POPUP_ATTRIBUTES ;
		if (features != null)
		{
			// map JSON options to the string argument if necessary
			if (typeof(features) == "object") 
			{
				var a = [];
				for (var property in features) 
				{
					var value = features[property];
					
					// convert boolean values to yes/no
					if (typeof(value) == "boolean")
					{
						a.push(property+"="+((value)?"yes":"no"));
					}
					else
					{
						a.push(property+"="+value);
					}
				}
				options = a.join(",");
			}
			// if a string was passed in, then use it unchanged (unless it is a guid)
			else if (typeof(features) == "string" && !OSDeliveryEngine.isValidGuidFormat(features) ) 
			{
				options = features;
			}
		}
		window.open(url, name, options);
	},
	MANDATORY_DIALOG_CONFIGS:
	{
		draggable: true,
		close: true,
		iframe: true,
		zIndex: 2000,
		visible: false
	},
	DEFAULT_DIALOG_CONFIGS: 
	{
        width: "800px",
        height: "600px",
		modal: false,
		fixedcenter: false,
		top: 0,
		left: 0		
	},
	launchDialog : function(url, options){
		var yd = YAHOO.util.Dom;
		if (!yd.hasClass(document.body,"yui-skin-sam")){
			yd.addClass(document.body,"yui-skin-sam");
		}
		var cfg = (options || OSDeliveryEngine.DEFAULT_DIALOG_CONFIGS);
		var mdc = OSDeliveryEngine.MANDATORY_DIALOG_CONFIGS;
		for(var p in mdc){
			cfg[p] = mdc[p]; 
		}
		
		var d = new YAHOO.widget.Panel("dialogId"+Math.random(), cfg);
		if(cfg['title']){
			d.setHeader(cfg['title']);
		}
		d.setBody("<iframe src='"+url+"' width='100%' height='100%'/>");
		d.render(document.body);
		
		d.bringToTop();
		d.body.style.padding="0";
		d.show();
		
		d.subscribe( "beforeHide", function(){ 
			d.setBody("");
			d.render(document.body);			
		});
	},
	launchSimulation : function(url,args)
	{
		//objectID, contentID, instanceID, openSettings, playMode
		var data = 
		{
			"objectTypeID":109,
			"containerID":args[0],
			"parentID":args[1],
			"instanceID":args[2],
			"playMode":args[4]
		};
		
		 OSDeliveryEngine.launchWindow(OSDeliveryEngine.appendToURL(url,data),args[0],args[3]);
	},
	appendToURL : function(url,argMap)
	{
		var n = [url];
		n.push((url.indexOf("?")>-1)?"&":"?");
		
		var a = [];
		for (key in argMap)
		{
			a.push(key+"="+argMap[key]);
		}
		n.push(a.join("&"));
		
		return n.join("");
	},
	scrollFrame : function(frame, wrapper)
	{
	   	if(!navigator.userAgent.match(/iPad|iPhone/i)) return false; 
	    
	    var mouseY = 0;
	    var mouseX = 0;	  
	    jQuery(frame).load(function(){     	
	    	        
	    	jQuery(frame).contents().find("body").bind('touchstart', function(event){	    		
	    		var e = event.originalEvent;	         
	            mouseY = e.touches[0].pageY;
	            mouseX = e.touches[0].pageX;
	        });
	        
	        jQuery(frame).contents().find("body").bind('touchmove', function(event){
	        
	        	var e = event.originalEvent;	   
	            e.preventDefault(); 	            
	            var $wrapper = jQuery(wrapper);	          
	            $wrapper.scrollLeft($wrapper.scrollLeft() + mouseX- e.touches[0].pageX);
	            $wrapper.scrollTop( $wrapper.scrollTop() + mouseY- e.touches[0].pageY);	            
	        });
	    });
	    
	    return true;
	},
	scrollFrameInFrameset : function(sframe, wrapper)
	{
		
	   	if(!navigator.userAgent.match(/iPad|iPhone/i)) return false; 
	   	var mouseY = 0;
	    var mouseX = 0;
	    var $frame = jQuery("frame[name='"+sframe+"']");
	    $frame[0].contentDocument.body.addEventListener('touchstart', function(event){	
	    		var e = event;	         
	            mouseY = e.touches[0].pageY;
	            mouseX = e.touches[0].pageX;
	        });
	        
	    $frame[0].contentDocument.body.addEventListener('touchmove', function(event){
	        	var e = event;	
	            e.preventDefault(); 	     
	            var $wrapper = jQuery(wrapper,top.document);	
	            $wrapper.scrollLeft($wrapper.scrollLeft() + mouseX- e.touches[0].pageX);
	            $wrapper.scrollTop($wrapper.scrollTop() + mouseY- e.touches[0].pageY);	            
	        });
	    
	    return true;
	},
	DEFAULT_POPUP_NAME : "OSDeliveryPopup",
	DEFAULT_POPUP_ATTRIBUTES : "top=0,left=0,resizable=yes,scrollbars=yes,width=400,height=300",
	SVG : function(elm, x, y, w, h) {
		var _svg = new Raphael(elm, x, y, w, h);		
		
		_svg.line = function (x1, y1, x2, y2, settings){			
			var _settings = settings || {};
			var path = _svg.path("M" + x1 + " " + y1 + " L" + x2 + " " + y2);			
			for (var name in _settings) {
				var value = _settings[name];
				if (value != null && value != null && 
						(typeof value != 'string' || value != '')) {
					path.attr(name, value);
				}
			}			
		};		
		return _svg;
	}	
	, Animation : 
	{
		ACTION_DEFAULT : 0,
		ACTION_ENTRANCE : 1,
		ACTION_EXIT : 2,		
		OPTS : 
		{
			"scale":
			{
				"percent":10
			},
			"size":
			{
				"from" : 
				{
					"width" : 20,
					"height" : 20
				}
			},
			"size2":
			{
				"to" : 
				{
					"width" : 20,
					"height" : 20
				}
			}
		},
		METHODS:
		{
			0: "show",
			1: "show",
			2: "hide"
		},	
		SPECIFIC_METHODS:
		{
			fade0: "fadeIn",
			fade1: "fadeIn",
			fade2: "fadeOut"
		}	
	},
	Anim : function($target, effect, action, delay , speed, options) {		
		var a = de.Animation;
		
		this.START_TYPE = {
			WITH_PREV : 1,
			AFTER_PREV : 2,
			ON_CLICK : 3,
			AFTER_PREV_START : 4
		};
		
		var id = $target.attr("id"); 
		if(typeof(id) != "undefined") {
		var underscore = id.lastIndexOf('_');
		var spanIndex =id.substring(underscore+1);
		}
		//add span with space when the animation element has first text/image has onclick event
		
		if(spanIndex == 1 && isNaN(delay) && delay.type == this.START_TYPE.ON_CLICK){	
			var addSpan= '<span tabIndex="0">&nbsp;</span>';
			$target.before(addSpan);
		}
		$target.attr("tabIndex",0);
		
		var _isAnimated = false,		
		_isStarted = false,					
		_playSound = false,
		_audioObjId = null,
		_onComplete = this.onComplete = new YAHOO.util.CustomEvent("complete",this),
		_onStart = this.onStart = new YAHOO.util.CustomEvent("start",this),		
		_id = "anim"+ Math.random(),
		_startAction = 1,
		_action = action;
		
		this.onBeforeStart = new YAHOO.util.CustomEvent("beforeStart",this);
		this.handler = null;
		this.prevAnim = null;	
		this.effect = effect;
		
		var _delay = 0;
		
		if(!isNaN(delay)){
			_delay = delay;
		}else{
			_delay = delay.num || 0;
		}		
		
		var _delayType = delay.type || this.START_TYPE.AFTER_PREV;
		
		var _fixEffects = function() {
			
			//Remove filter property. Only this way makes FF, IE work.
			var style = $target.attr("style");
			if(style) {
				var newStyle = style.replace(/\s*filter\s*:\s*[^;]*[;]?/gi, "");
				$target.attr("style", newStyle);
			}
			
			if((effect === 'puff' || effect === 'drop')&& action == a.ACTION_EXIT ) {	
				$target.css('opacity',1);				
			}else if(effect === 'size' && action == a.ACTION_EXIT){
				if(!isNaN($target.parent().width()) && !isNaN($target.parent().height())){
					$target.width($target.parent().width());
					$target.height($target.parent().height());
				}				
			}	
		};			
		var _onCompleteHandler = function(){			
			_fixEffects();
			 if(action == a.ACTION_EXIT) $target.hide(); else $target.show();		  		  
		    _isAnimated = false;_onComplete.fire(this);
		};		
		var _animate = function () {
			if(delay && delay.sound) {//For Animation element.				
				//de.playSound(delay.sound);
				de.PlayerManager.play(delay.sound);
				_playSound = false; //any unintended try of setting this property to true will be reset here.
			}
			if(_playSound) { //For the other elements.				
				setTimeout(function (){de.PlayerManager.play(_audioObjId);}, _delay);
			}		
			
			var _cb = _onCompleteHandler;
			var m = a.METHODS[effect + action];		
			_isAnimated = true;
			_isStarted = true;
			_onStart.fire(this);
			
		   	if(m) {
		   		$target.stop(false,true)[m](); _cb(); return;
			}	
				
			m = a.SPECIFIC_METHODS[effect + action];
			
			if(m) {
				$target.stop(false,true)[m](speed, _cb); return;
			}	
				
			m = a.METHODS[action];	
				
			var opts = options || a.OPTS[effect + action];			
			opts = opts || a.OPTS[effect];
			$target.stop(false,true)[m](effect, opts, speed, _cb);				
		};			
		this.animate = function() {	
			_isStarted = false;				
			var _me = this;			
		    if(delay && _delayType === this.START_TYPE.ON_CLICK) {
		    	var _triggerF = function() {
			    	var $trigger = jQuery("#" + delay.trigger);			    	
			    	$trigger.css('cursor', 'hand').css('cursor', 'pointer');			    					
			    	$trigger.bind('click.' + _me.getId(), function(e) {			    		
			    		_me.handler = setTimeout(_animate, _delay);	
			    		setTimeout(function(){_me.onBeforeStart.fire(_me)},0);
			    		e.stopPropagation();			    		
			    		jQuery(this).unbind('click.' + _me.getId()).css('cursor', 'wait');
						jQuery(this).bind('click.' + _me.getId(), function(e) {e.stopPropagation()});											
			    	});
			    	
			    	$trigger.bind('keypress.' + _me.getId(), function(e) {			    		
			    		_me.handler = setTimeout(_animate, _delay);	
			    		setTimeout(function(){_me.onBeforeStart.fire(_me)},0);
			    		e.stopPropagation();			    		
			    		jQuery(this).unbind('keypress.' + _me.getId()).css('cursor', 'wait');
						jQuery(this).bind('keypress.' + _me.getId(), function(e) {e.stopPropagation()});											
			    	});
			    	
		    	};	
		    	
		    	if(delay.prevAnim) {
		    		delay.prevAnim.onComplete.subscribe(_triggerF, this);		    		
		    	}else {		
		    		_triggerF();
		    	}	
		    	
		    }else if ( delay.prevAnim &&  _delayType === this.START_TYPE.WITH_PREV) {	
		    	delay.prevAnim.onBeforeStart.unsubscribeAll();
		    	delay.prevAnim.onBeforeStart.subscribe(function() {_me.handler = setTimeout(_animate, _delay); setTimeout(function(){_me.onBeforeStart.fire(_me)},0);}, this);		    	
		    }else if ( delay.prevAnim &&  _delayType === this.START_TYPE.AFTER_PREV_START) {
		    	delay.prevAnim.onStart.unsubscribeAll();
		    	delay.prevAnim.onStart.subscribe(function() { _me.handler = setTimeout(_animate, _delay);setTimeout(function(){_me.onBeforeStart.fire(_me)},0);}, this);
		    }else if(delay.prevAnim) {
		    	delay.prevAnim.onComplete.unsubscribeAll();
		    	delay.prevAnim.onComplete.subscribe(function () {_me.handler = setTimeout(_animate, _delay); setTimeout(function(){_me.onBeforeStart.fire(_me)},0);}, this);
		    }else {			    		
		    	_me.handler = setTimeout(_animate, _delay);		
		    	 setTimeout(function(){_me.onBeforeStart.fire(_me)},0);
		    }			    
		   
	    };
	    this.isStarted = function() {	    	
	    	 return _isStarted;
	    };		    
	    this.isAnimated = function() {	    	
	    	 return _isAnimated;
	    };	    
	    this.stop = function(clearQueue, jumpToEnd) {
	    	 var _clearQueue = clearQueue || false;
	    	 var _jumpToEnd = jumpToEnd || false;
	    	 if(_isAnimated) {
	    		 $target.stop(_clearQueue, _jumpToEnd);	    		 
	    		_isAnimated = false; 	    		
	    	 }	 
	    	 
	    	 if(delay && delay.sound !== '') {
	    		 de.PlayerManager.stop(delay.sound); 
	    	 }	 
	    };	   
	    this.hide = function() {	    	
	    	$target.hide();
	    };	 
	    this.show = function() {	    	
	    	$target.show();
	    };	 
	    this.getElm = function() {	    	
	    	return $target[0];
	    };
	    this.getTarget = function() {
	    	return $target;
	    }
	    this.getId = function() {
	    	return _id;
	    };	
	    this.getStartAction = function () {
	    	return _startAction;
	    }
	    this.setStartAction = function (action) {
	    	_startAction = action;
	    };
	    this.setAudioObjId = function(objectId) {	    	
	    	_playSound = true;
	    	_audioObjId = objectId;
	    };
	    this.getAction = function () {
	    	return _action;
	    }
	},
	AnimManager :
	{
		_instances : [] ,		
		create : function (contentId, forceNew) {	
			if(!forceNew && this._instances[contentId]) return this._instances[contentId];	
			
			var F = function () { 
				this.timeline = []; 
				this.altTimeline = { 
					timelines: [] ,
					onCompletes : []
				};
			};
	        F.prototype = this;
	        var ins = new F();	
	        ins.onComplete = new YAHOO.util.CustomEvent("complete", ins);	       
	        this._instances[contentId] = ins;
	        return ins;
		},
		add : function(contentId, anim)
		{
			var ins = this._instances[contentId];			
			if(ins && !ins.timeline[anim.getId()]) {				
				ins.timeline[anim.getId()] = anim;
			}				
		},
		addToTimeline : function(contentId, tlNo , anim)
		{
			var ins = this._instances[contentId];
			
			if(ins && !ins.altTimeline.onCompletes[tlNo]) {
				ins.altTimeline.onCompletes[tlNo] = new YAHOO.util.CustomEvent("complete", ins);
			}	
			
			if(ins && !ins.altTimeline.timelines[tlNo]) {				
				ins.altTimeline.timelines[tlNo] = [];
			}	
			
			var timeline = ins.altTimeline.timelines[tlNo];
			
			if(!timeline[anim.getId()]) {
				timeline[anim.getId()] = anim;
			}	
		},
		startMainTimeline : function(contentId) 
		{
			var ins = this._instances[contentId];		
			if(ins) {				
				for(var i in ins.timeline) {
					var anim = ins.timeline[i];
					anim.animate();						
					anim.onComplete.subscribe(this.updateAnimQueue, {_ins : ins, num : -1 });					
				}	
			}						
		},
		startAlternateTimeline : function(contentId, tlNo) 
		{
			var ins = this._instances[contentId];
			if(ins) {		
				var timeline = ins.altTimeline.timelines[tlNo];				
				for(var i in timeline) {
					var anim = timeline[i];
					anim.animate();				
					anim.onComplete.subscribe(this.updateAnimQueue, {_ins : ins, num : tlNo} );
				}	
			}						
		},
		startAlternateTimelineNoUpdate: function(contentId, tlNo) 
		{
			var ins = this._instances[contentId];
			if(ins) {		
				var timeline = ins.altTimeline.timelines[tlNo];				
				for(var i in timeline) {
					var anim = timeline[i];
					anim.animate();				
					//anim.onComplete.subscribe(this.updateAnimQueue, {_ins : ins, num : tlNo} );
				}	
			}						
		},
		updateAnimQueue : function(type, args, me) 
		{
			var animQueue = [];	
			var timeline = null; 
			var onComplete = null;
			
			if(me.num === -1) {
				timeline = me._ins.timeline;
				onComplete = me._ins.onComplete;
			}else {
				timeline = me._ins.altTimeline.timelines[me.num];
				onComplete = me._ins.altTimeline.onCompletes[me.num];
			}	
			
			for (var i in timeline)
			{
				if (!timeline[i].isStarted() || timeline[i].isAnimated())
					animQueue.push(timeline[i]);
			}
			
			if(animQueue.length == 0) {
				onComplete.fire(this);
			}	
		},
		resetTimeline : function(timeline) {
			for (var a in timeline) {
				var anim = timeline[a];
				
				if(anim.handler != null && !anim.isStarted()) {
					clearTimeout(anim.handler);
				}else {
					anim.stop(true, true);
				}
				
				anim.onBeforeStart.unsubscribeAll();
				anim.onStart.unsubscribeAll();
				anim.onComplete.unsubscribeAll();
			}	
		},
		resetAllTimelines : function(contentId) {
			var ins = this._instances[contentId];
			
			if(ins) {		
				this.resetTimeline(ins.timeline);					
								
				for (var tlNo in ins.altTimeline.timelines) {
					var timeline = ins.altTimeline.timelines[tlNo];				
					this.resetTimeline(timeline);
				}
			}			
		}		
	},
	PlayerManager : {
		initialized : false,
		instances: [],
		$playBtn : null,
		$playing : null,
		defaultConfig: { 
            width: '148px',
            height: '128px',
            '-webkit-border-radius': '14px', 
            '-moz-border-radius': '14px'
        },
		isMobile: (navigator.userAgent.match(/iPad|iPhone|Android|Blackberry/i) != null),
		init: function ()  {
			if(!this.initialized && this.isMobile) {
				var $playBtn = jQuery("<div id='audioPlayerButton' class='player_button' style='display:none'></div>");
				$playBtn.click(function () { de.PlayerManager.$playing.audioplayer('play');jQuery.unblockUI(); });
				$playBtn.appendTo(document.body);
				this.initialized = true;
				this.$playBtn = $playBtn;
			}
		},
		create: function(objectId, options) {
			de.PlayerManager.init();
			var $player = jQuery("#" +objectId);
			$player.audioplayer(options);
			de.PlayerManager.instances[objectId] = $player;
			return $player;
		},
		play: function(objectId) {
			this.stopAll();
			var $player = this.instances[objectId];
			this.$playing = $player;
			//#50919 Fix Slideshow: getting javascript error when click next
			if(this.isMobile) {
				// For Ipad				
				if (this.$playBtn != null && typeof($player) != "undefined") {
					jQuery.blockUI({ message : this.$playBtn, css:  this.defaultConfig });
				}				
			} else {				
				if (typeof($player) != "undefined") {
					$player.audioplayer('play');
				}
				
			}
		},
		stop: function(objectId) {
			this.instances[objectId].audioplayer('stop');
		},
		stopAll: function() {
			for(var i in  this.instances) {
				this.stop(i);
			}
		}
	},
	LayoutAnimManager: function(layoutContainerId) {
		this.layoutContainerId = layoutContainerId;
		this.layoutElemTrans = [];
		this.layoutTran = null;
		//those object are in layout elements have trasitions applied. Therefore, they will animate when layout elements
		//complete their transitions.
		this.childObjects = []; // a 2-dimension array
		//array of objects' ids need to be notified when the layout transition completes.
		//those objects are contained in layout elements that have no transitions applied. They will animate when the base transition completes.
		this.notifiedObjectIds = [];
		this.startLayoutTransition = function() {
			this.layoutTran.animate();
		};
		this.init = function() {
			for(var i in this.layoutElemTrans) {
				var layoutElmAnim = this.layoutElemTrans[i];
				var prevElmAnim = layoutElmAnim.prevAnim;
				if(layoutElmAnim.getStartAction() == 1) { //with previous
					prevElmAnim.onBeforeStart.subscribe(this.scheduleAnim, layoutElmAnim);
				} else if(layoutElmAnim.getStartAction() == 2) { //after previous
					prevElmAnim.onComplete.subscribe(this.scheduleAnim, layoutElmAnim);
				}
				//subscribe content element's javascript object to layout element which is its parent.
				var contentElmIds = this.childObjects[i];
				var contentElmObj = null;
				for(var k in contentElmIds) {
					contentElmObj = de.animObjMap[contentElmIds[k]];
					if(contentElmObj) {
						if(layoutElmAnim.getAction() == 1) {
							layoutElmAnim.onBeforeStart.subscribe(contentElmObj['resetAnim'], contentElmObj);
							layoutElmAnim.onComplete.subscribe(contentElmObj['invokeAnimation'], contentElmObj);
						}
					}
				}
			}
			
			for (var i in this.notifiedObjectIds) {
				var notifiedObj = de.animObjMap[this.notifiedObjectIds[i]];
				if(notifiedObj) {
					this.layoutTran.onComplete.subscribe(notifiedObj['invokeAnimation'], notifiedObj);
				}
			}
		};
		this.scheduleAnim = function (type, args, me) {
			me.hide();
			var $me = jQuery(me.getElm());
			$me.css({'visibility':'visible'});
			//When the animation completes, remove the wrapper created on HTML code generation.
			//Bug 44363	Layouts: Animation: Position of the objects changes if objects not placed sequentially
			me.onComplete.subscribe(function(type, args, me){
						var $p = me.parent();
						var style = $p.attr("style");
						style = style.replace(/\s*width\s*:\s*[^;]*[;]?/gi, "");
						style = style.replace(/\s*height\s*:\s*[^;]*[;]?/gi, "");
						$p.attr("style", style);
					}, $me);
			me.animate();
		};
		this.onLoad = function() {
			this.hideLayoutElements();
			this.init();
			this.startLayoutTransition();
		};
		this.hideLayoutElements = function () {
			var $elm = null, $parent = null;
			for(var i in this.layoutElemTrans) {
				$elm = this.layoutElemTrans[i].getTarget(); 
				if($elm.length == 1) {//wrapper elements (with ids having format  dle_GUI_x_w' ) may be missing
					$parent = $elm.parent();
					//In FF, jQuery provides wrong outerWidth() & outerHeight() values
					$parent.css({'width': $elm[0].offsetWidth, 'height': $elm[0].offsetHeight});
					$elm.css({'visibility': "hidden"});				
				}
			}
			jQuery("#G"+this.layoutContainerId).css({'visibility':'visible'});
		}
	},
	queueAnimation: function(obj, objId, invokedMethod) {
		var hasEffect = jQuery("#hasAppliedEffect"); 
		if(hasEffect.length == 0 || hasEffect.val() == "false") {			
			jQuery(window).ready(function(){obj[invokedMethod]();});
		} else {
			de.animObjMap[objId] = obj;
		}
	},
	animObjMap : []
};

var w = (window.parent != window) ? window.parent : window.opener;
OSDeliveryEngine.hasParent = ObjectFinder.search(w, "OSDeliveryEngine");

for (var e in OSDeliveryEngine.events)
{
	OSDeliveryEngine.events[e].subscribe(OSDeliveryEngine.eventHandler,OSDeliveryEngine,true);
}

YAHOO.util.Event.addListener(window,"load",OSDeliveryEngine.init,OSDeliveryEngine,true);
YAHOO.util.Event.addListener(window,"unload",OSDeliveryEngine.finalize,OSDeliveryEngine,true);