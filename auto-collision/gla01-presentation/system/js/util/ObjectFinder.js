/*!
 * IBM Confidential
 * OCO Source Materials
 * 5725N95, 5725P55, 5725N96
 * (C) Copyright IBM Corp. 1999, 2014
 * The source code for this program is not published or otherwise
 * divested of its trade secrets, irrespective of what has been
 * deposited with the U.S. Copyright Office.
 */

 /* $Id: ObjectFinder.js,v 1.1.2.3.24.4.2.7 2016/05/17 11:21:18 rakollep Exp $ */
 
ObjectFinder = 
{
	count : 0,
	search : function(win,name,checked)
	{
		var obj = null;
		
		
		if (win != null)
		{
			var methods = 
			[
				"_searchWindow",
				"_searchFrames",
				"_searchParents",
				"_searchOpener",
				"_searchDialogOpener"
				
			];
			
			// maintain a list of what has already been checked
			var checked = {};
			
			for (var i=0; i<methods.length && obj == null; i++)
			{
				try { obj = ObjectFinder[methods[i]](win,name,checked); } catch (e) {}
			}
		}

		return obj;
	},
	_searchWindow : function(win,name,checked)
	{
		this._setWindowId(win);
		return win[name];
	},
	_searchFrames : function(win,name,checked)
	{
		var obj = null;
		
		this._setWindowId(win);
		
		if ((win.length > 0) && (!checked[win._ofId]))
		{
			for (var i=0; i<win.length && obj == null; i++)
			{
				try { obj = (win.frames[i][name]); } catch (e) {}
			}
			
			// search nested frames
			if (obj == null)
			{
				for (var i=0; i<win.length && obj == null; i++)
				{
					try { obj = this._searchFrames(win.frames[i],name,checked); } catch (e) {}
				}
			}
		}
		
		// add to checked
		checked[win._ofId] = 1;
		
		return obj;
	},
	_searchParents : function(win,name,checked)
	{
		var obj = null;
		
		var p = win.parent;
		
		if (win != p)
		{
			while (p != null && obj == null)
			{
				try { obj = this._searchWindow(p,name,checked); } catch (e) {}

				if ((obj == null) && (p != win))
				{	
					try { obj = this._searchFrames(p,name,checked); } catch (e) {}
				}
				p = (p.parent != p) ? p.parent : null;
			}
		}

		return obj;
	},
	_searchOpener : function(win,name)
	{
		var obj = null;
		
		if (win.top.opener && this._isIE() == true && (typeof win.top.opener.id!="unknown") )
		{
			try { obj = ObjectFinder.search(win.top.opener,name); } catch (e) {}
		}
		else if (win.top.opener && this._isIE() == false && (typeof win.top.opener.id!="undefined") )
		{
			try { obj = ObjectFinder.search(win.top.opener,name); } catch (e) {}
		}else if(win.top.opener && this._isIE() == false){
			try { obj = ObjectFinder.search(win.top.opener,name); } catch (e) {}
		}
		
		return obj;
	},
	_setWindowId : function(win)
	{
		try
		{
			if (!win._ofId)
			{
				this.count++;
				win._ofId = this.count;
			}
		}
		catch (e) {}
	},
	_searchDialogOpener:function(win,name,checked){
		try { 
			var wind;
			var obj = null;
			if(obj==null){
				if(window.dialogArguments){
					wind = window.dialogArguments['window'];
				}else if(window.parent.dialogArguments){
					wind = window.parent.dialogArguments['window'];
				}else if(window.parent.parent&&window.parent.parent.dialogArguments){
					wind = window.parent.parent.dialogArguments['window'];
				}
				if(wind && this._isIE() == false){
					obj = ObjectFinder.search(wind,name);
				}
			}
		} catch (e) {}
		return obj;
	},
	_isIE : function()
	{	
		var browser =navigator.appName.toLowerCase();
		
		if ((browser.indexOf("microsoft")>-1)  )
		{
			return true;
		}
		return false;	
	}
}