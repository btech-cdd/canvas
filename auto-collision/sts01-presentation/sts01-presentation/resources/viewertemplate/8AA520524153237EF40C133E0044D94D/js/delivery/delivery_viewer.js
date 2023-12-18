ViewerController =
{
	root : null,
	urlMap : {},
	current : null,
	events :
	{
		navigate : new YAHOO.util.CustomEvent("navigate"),
		load : new YAHOO.util.CustomEvent("load"),
		score : new YAHOO.util.CustomEvent("score"),
		media_loaded : new YAHOO.util.CustomEvent("media_loaded")
	},   
	init : function()
	{
		var de = OSDeliveryEngine;
		de.events.load.subscribe(this.handleContentLoaded,this,true);
		de.events.score.subscribe(this.handleContentScored,this,true);
		de.events.media_loaded.subscribe(this.handleMediaLoaded,this,true);
		de.events.nav_request.subscribe(this.handleNavRequest,this,true);
		
		this.gotoBookmark();
		
		try
		{
			if (opener)
			{
				if (typeof(opener.ViewerController) != "undefined")
				{
					opener.ViewerController.registerViewer(this);
				}
			}
		}
		catch (e) {}
	},
	finalize : function()
	{
		OSDeliveryEngine.finalize();
	},
	setRoot : function(rootId)
	{
		var r = OSDeliveryEngine.getObjectByUniqueId(rootId);
		if (r != null)
		{
			this.root = r;
		}
	},
	getObjectsByType : function(t)
	{
		var types = (YAHOO.lang.isArray(t)) ? t : [t];
		return OSDeliveryEngine.find(this.root, function(o) { return (jQuery.inArray(o.type,types) != -1) });
	},
	getPosition : function(types)
	{
		var typeList = types || [11,6,7,13];

		var objList = OSDeliveryEngine.find(this.root,function(o) { return (!this.isRemoved(o) && jQuery.inArray(o.type,typeList) != -1) }, this);
		
		var pos = -1;
		var c = this.current;
		while (pos == -1 && c != null)
		{
			pos = jQuery.inArray(c,objList);
			c = c.parent;
		}
		
		return { "position": pos, "total": objList.length };
	},
	getAccessedCount : function(types)
	{
		var typeList = types || [11,6,7,13];

		return OSDeliveryEngine.find(this.root,function(o) { return (!this.isRemoved(o) && jQuery.inArray(o.type,typeList) != -1) && o.lastAccess }, this).length;
	},
	isLeaf : function(o)
	{
		return (!this.isRemoved(o) && jQuery.inArray(o.type,[11,6,7,13]) != -1);
	},
	next : function(tentative)
	{
		var r = false;
		
		var objList = OSDeliveryEngine.find(this.root, this.isLeaf, this);
		var idx = jQuery.inArray(this.current,objList);
		idx++
		if (idx < objList.length)
		{
			var obj = objList[idx];
			obj._id = "next";
			r = this.navigateTo(obj,tentative);
		}

		return r;
	},
	nextLO : function(tentative)
	{
		var r = false;
		
		var typeList = [3,6,7,13];
		var c = this.current;
		while (c != null && ((jQuery.inArray(c.type,typeList)) == -1))
		{
			c = c.parent;
		}
		var objList = this.getObjectsByType(typeList);
		var idx = jQuery.inArray(c,objList);
		for (var i=idx+1; i<objList.length; i++)
		{
			p = objList[i].parent;
			if (p && (jQuery.inArray(p.type,[4,5])) != -1)
			{
				r = this.navigateTo(objList[i],tentative);
				break;
			}
		}
		
		if (!r && vc.nextLOUrl)
		{
			var enabled = true;
			if (OSDeliveryEngine.linear)
			{
				var objList = OSDeliveryEngine.flatten(this.root);
				for (var i=0; i<objList.length && enabled; i++)
				{
					enabled = (objList[i].lastAccess != null);
				}
			}
			
			if (enabled)
			{
				if (!tentative)
				{
					document.location.href = vc.nextLOUrl;
				}
				r = true;
			}
		}
		
		return r;
	},
	previous : function(tentative)
	{
		var r = false;
		
		var objList = OSDeliveryEngine.find(this.root, this.isLeaf, this);
		var idx = jQuery.inArray(this.current,objList);
		if (idx > 0)
		{
			idx--;
			r = this.navigateTo(objList[idx],tentative);
		}
		
		return r;
	},
	previousLO : function(tentative)
	{
		var r = false;

		var typeList = [3,6,7,13];
		var c = this.current;
		while (c != null && ((jQuery.inArray(c.type,typeList)) == -1))
		{
			c = c.parent;
		}
		var objList = this.getObjectsByType(typeList);
		var idx = jQuery.inArray(c,objList);
		for (var i=idx-1; i>=0; i--)
		{
			p = objList[i].parent;
			if (p && (jQuery.inArray(p.type,[4,5])) != -1)
			{
				r = this.navigateTo(objList[i],tentative);
				break;
			}
		}
		
		if (!r && vc.prevLOUrl)
		{
			if (!tentative)
			{
				document.location.href = vc.prevLOUrl;
			}
			r = true;
		}
		
		return r;
	},
	handleContentLoaded : function(type, args)
	{
		this.events.load.fire(args[0]);
	},
	handleContentScored : function(type, args)
	{
		this.events.score.fire(args[0]);
	},
	handleMediaLoaded : function(type, args)
	{
		this.events[type].fire(args[0]);		
	},
	handleNavRequest : function(type, args)
	{
		var r = false;
		
		var id = args[0][0];
		var type = args[0][1];
		
		// handle inline navigation links
		if (type == "0")
		{
			var obj = OSDeliveryEngine.getObject(id);
			if (obj != null)
			{
				// navigate to the first instance that is not a reference
				for (var i=0; i<obj.length; i++)
				{
					if (!obj[i].referencedBy)
					{
						r = this.navigateTo(obj[i]);
						break;
					}
				}
			}
		}

		return r;
	},	
	isAccessed : function(o)
	{
		return (o.lastAccess != null);
	},
	isIdentified : function(o)
	{
		var r = false;
		if (OSDeliveryEngine.satisfaction && ((OSDeliveryEngine.satisfaction.type == 1) || (OSDeliveryEngine.satisfaction.type == 4)))
		{
			r = o.satisfaction.satisfied;
		}
		return r;
	},
	isEnabled : function(o)
	{
		var enable = false;
		if (o._id) {
			 enable = "next" == o._id ? true : false;
		}
		return (((!OSDeliveryEngine.linear || o.linear.enabled || enable)) && (!OSDeliveryEngine.satisfaction || !((OSDeliveryEngine.satisfaction.type == 2) && (o.satisfaction.satisfied))));
	},
	isRemoved : function(o)
	{
		return (OSDeliveryEngine.satisfaction && ((OSDeliveryEngine.satisfaction.type == 3) && (o.satisfaction.satisfied)));
	},
	navigateTo : function(o,tentative)
	{
		var r = false;

		var obj = o;
		if (YAHOO.lang.isString(o))
		{
			obj = OSDeliveryEngine.getObjectByUniqueId(o);
		}
		else 
		{
			// use the local ref when available
			var local = OSDeliveryEngine.getObjectByUniqueId(obj.uniqueId);
			if (local)
			{
				obj = local;
			}
		}
		
		if (obj && this.isEnabled(obj))
		{
			if (this.current == obj)
			{
				r = true;
			}
			else
			{
				var url = this.urlMap[obj.uniqueId];
				if (url)
				{
					if (!tentative)
					{
						this.current = obj;
						this.events.navigate.fire(obj,url);
					}
					r = true;
				}
				else
				{
					// try to find first launchable child object
					var objList = OSDeliveryEngine.find(obj, this.isLeaf, this);
					if (objList.length > 0 && (objList[0] != obj))
					{
						r = this.navigateTo(objList[0],tentative);
					}
					else if (obj.parent)
					{
						var p = obj;
						while ((p = p.parent) && !r)
						{
							if (this.isLeaf(p))
							{
								r = this.navigateTo(p,tentative);
							}
						}
					}
				}
			}
			
			// fire load event for External Content since it may go directly to an external URL
			if (r && !tentative && obj.type == 7)
			{
				OSDeliveryEngine.events.load.fire(obj)
			}
		}
		
		return r;
	},
	gotoBookmark : function()
	{
		var current = OSDeliveryEngine.getCurrent();
		
		if (this.config.bookmarkEnabled)
		{
			// find the most recently access leaf node
			var finder = 
			{ 
				last: null,
				validate: function(o) 
				{
					if ((jQuery.inArray(o.type,[11,6,7,13]) != -1) && o.lastAccess && (this.last == null || this.last.lastAccess < o.lastAccess) && (OSDeliveryEngine.isDescendant(current,o)))
					{
						this.last = o;
					}
				}
			};
			
			OSDeliveryEngine.each(this.root,finder.validate,finder);

			if (finder.last)
			{
				current = finder.last;
			}
		}
		
		// nagivate to the current object
		this.navigateTo(current);
	}
};

// scorm binding
if (typeof(OSSCOAdapter) == "undefined")
{
	YAHOO.util.Event.addListener(window,"load",ViewerController.init,ViewerController,true);
}
else
{
	ViewerController.gotoBookmark = function()
	{
		// go to bookmark if found
		var bmk = OSDeliveryEngine.getObjectByUniqueId(OSSCOAdapter.scoDriver.getLessonLocation());
		if (bmk)
		{
			this.navigateTo(bmk);
		}
		else
		{
			this.navigateTo(OSDeliveryEngine.getCurrent());
		}
	}

	ViewerController.finish = function()
	{
		OSSCOAdapter.scoDriver.setLessonLocation(this.current.uniqueId);
	}

	OSSCOAdapter.events.load.subscribe(ViewerController.init,ViewerController,true);
	OSSCOAdapter.events.before_unload.subscribe(ViewerController.finish,ViewerController,true);
}