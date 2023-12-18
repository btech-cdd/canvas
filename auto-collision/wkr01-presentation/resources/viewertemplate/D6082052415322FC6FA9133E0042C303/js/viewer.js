TreeController =
{
	state : false,
	enabled : true,
	leafTypes : [11,6,7,13],
	autoHideOnNavigation : true,
	autoHideOnNavigationDelay : 500,
	autoHideOnMouseOut : true,
	autoHideTimeout : null,
	autoHideDelay : 500,
	animation :
	{
		speed : .5,
		expand : YAHOO.util.Easing.easeIn,
		collapse : YAHOO.util.Easing.easeOut
	},
	init : function()
	{
		var vc = ViewerController;
		vc.events.navigate.subscribe(this.handleNavigation,this,true);
		vc.events.load.subscribe(function(type, args, tree) { if (args[0].type == 6) { tree.enabled = false; }}, this, true);
		vc.events.score.subscribe(function(type, args, tree) { if (args[0].type == 6) { tree.enabled = true; }}, this, true);

		var root = vc.root;

		var t = this.tree = new YAHOO.widget.TreeView("tree_container");

		var leaf = this.isLeaf(root);
		if (leaf)
		{
			this.addTreeNode(root,t.getRoot(),!leaf);
		}
		else
		{
			this.addTreeNodeChildren(root,t.getRoot(),true);
		}

		t.subscribe("clickEvent",TreeController.nodeClicked,TreeController,true);
		t.render();

		YAHOO.util.Event.addListener("tree_handle","click",TreeController.toggle,TreeController,true);

		if (vc.current != null)
		{
			this.handleNavigation("navigation",[vc.current]);
		}
	},
	isLeaf : function(obj)
	{
		return (jQuery.inArray(obj.type,this.leafTypes) != -1);
	},
	addTreeNode : function(obj, parentNode, addChildren)
	{
		var n = new YAHOO.widget.TextNode({ label: obj.label, obj: obj, expanded:false, hasIcon:true }, parentNode);
		if (addChildren && !this.isLeaf(obj))
		{
			this.addTreeNodeChildren(obj,n,true);
		}
	},
	addTreeNodeChildren : function(obj, parentNode, addChildren)
	{
		if (obj.children)
		{
			var c;
			for (var i=0; i<obj.children.length; i++)
			{
				c = obj.children[i];
				if (!ViewerController.isRemoved(c))
				{
					this.addTreeNode(obj.children[i], parentNode, true);
				}
			}
		}
	},
	handleNavigation : function(type, args)
	{
		var yd = YAHOO.util.Dom;
		var obj = args[0];

		if (this.current != null)
		{
			var last = this.tree.getNodeByProperty("obj",this.current);
			if (last != null)
			{
				yd.removeClass(last.getEl(),"activeNode");
			}
		}

		var found = false;
		var p = obj;
		do
		{
			if (this.showNode(p))
			{
				found = true;
				this.current = p;
				break;
			}
		}
		while ((p = p.parent) != null);

		if (!found) this.tree.collapseAll();

		// hide the tree
		if (this.autoHideOnNavigation) setTimeout("TreeController.hide();",this.autoHideOnNavigationDelay);
	},
	showNode : function(obj)
	{
		var s = false;
		var node = this.tree.getNodeByProperty("obj",obj);
		if (node != null)
		{
			s = true;

			var p = node;
			while ((p = p.parent) != null)
			{
				p.expand();
			}

			YAHOO.util.Dom.addClass(node.getEl(),"activeNode");
		}
		return s;
	},
	nodeClicked : function(e)
	{
		var linear = OSDeliveryEngine.linear;
		var obj = e.node.data.obj;
		if (this.enabled && (!linear || (linear && obj.lastAccess)))
		{
			if (linear && obj.type == 6 && obj.score < obj.passingScore && (obj.attemptLimit == 0 || obj.attempts < obj.attemptLimit)) {
				ViewerController.events.changeFwd.fire(0);
			} else {
				ViewerController.events.timeout.fire(0);
			}
			ViewerController.navigateTo(e.node.data.obj);
		}
		return false;
	},
	toggle : function()
	{
		if (this.state)
		{
			this.hide()
		}
		else
		{
			this.show();
		}
	},
	show : function()
	{
		if (!this.state)
		{
			this.state = true;

			var ta = new YAHOO.util.Anim("tree",{left:{to:-5}},this.animation.speed,this.animation.expand);
			ta.onComplete.subscribe(function() {YAHOO.util.Dom.replaceClass("tree_handle_ind","tree_expand","tree_collapse"); });
			ta.animate();

			var ta2 = new YAHOO.util.Anim("treeshim",{left:{to:-5}},this.animation.speed,this.animation.expand);
			ta2.animate();

			if (this.autoHideOnMouseOut)
			{
				YAHOO.util.Event.addListener(document.body,"mouseover",TreeController.autoHide);
			}
		}
	},
	hide : function()
	{
		if (this.state)
		{
			this.state = false;

			var ta = new YAHOO.util.Anim("tree",{left:{to:-512}},this.animation.speed,this.animation.collapse);
			ta.onComplete.subscribe(function() {YAHOO.util.Dom.replaceClass("tree_handle_ind","tree_collapse","tree_expand"); });
			ta.animate();

			var ta2 = new YAHOO.util.Anim("treeshim",{left:{to:-512}},this.animation.speed,this.animation.collapse);
			ta2.animate();
		}
	},
	delayedHide : function()
	{
		TreeController.hide();
		YAHOO.util.Event.removeListener(document.body,"mouseover",TreeController.autoHide);
	},
	autoHide : function(e)
	{
		var elm = YAHOO.util.Event.getTarget(e);
		if (!YAHOO.util.Dom.isAncestor("tree",elm))
		{
			TreeController.autoHideTimeout = setTimeout("TreeController.delayedHide()",TreeController.autoHideDelay);
		}
		else
		{
			clearTimeout(TreeController.autoHideTimeout);
			TreeController.show();
		}
	}
}

ProgressController =
{
	current : -1,
	init : function()
	{
		$(".progressbar").progression({
				aBackground:"#8292ac",
				Current:0,
				Maximum: 100,
				Background: '#e5edfa',
				TextColor: '#000000',
				aTextColor: '#e5edfa',
				BorderColor: '#000000',
				Animate: true,
				AnimateTimeOut: 3000,
				Easing: 'linear' });

		var vc = ViewerController;
		vc.events.navigate.subscribe(this.update,this,true);
		vc.events.load.subscribe(this.update,this,true);
		vc.events.score.subscribe(this.update,this,true);

		if (vc.current != null)
		{
			this.update();
		}
	},
	update : function()
	{
		var p = ViewerController.getPosition();
		if (this.current != p.position)
		{
			document.getElementById("page-counter").innerHTML = (p.position+1)+" of "+p.total;

			var c = Math.ceil((p.total > 0) ? ((ViewerController.getAccessedCount()/p.total)*100) : 0);

			$(".progressbar").progression({ Current:c });
		}
	}
}

ButtonController =
{
	buttons : {},
	init : function()
	{
		//this.createButton("prev_lo", function() { ButtonController.resetFootController(); ViewerController.previousLO() }, function() { return !ViewerController.previousLO(true); });
		this.createButton("prev_group", function() { ButtonController.resetFootController(); ViewerController.previous() }, function() { return !ViewerController.previous(true); });
		this.createButton("next_group", function() { ButtonController.resetFootController(); ViewerController.next(); ButtonController.disableNextButtonForAsseseement(); }, function() { return !ViewerController.next(true); });
		//this.createButton("next_lo", function() { ButtonController.resetFootController(); ViewerController.nextLO() }, function() { return !ViewerController.nextLO(true); });

		var vc = ViewerController;
		vc.events.navigate.subscribe(this.update,this,true);
		
		vc.events.timeout = new YAHOO.util.CustomEvent("timeout");
		vc.events.timeout.subscribe(this.updateDisableFwd,this,true);

		vc.events.changeFwd = new YAHOO.util.CustomEvent("changeFwd");
		vc.events.changeFwd.subscribe(this.disableFwdButton,this,true);
		
		if (vc.current != null)
		{
			this.update();
		}

		vc.events.load.subscribe(function(type, args, obj) { if (args[0].type == 6) { obj.disableAll(); } }, this, true);
		vc.events.score.subscribe(function(type, args, obj) { if (args[0].type == 6) obj.update(); }, this, true);
	},
	disableFwdButton : function(){
		this.disableFwd = true;
		this.update();
	},
	resetFootController : function(){
		this.disableFwd = false;
	},
	updateDisableFwd : function(){
		this.disableFwd = false;
		var vc = ViewerController;
		this.update();
		//this.updateButton("next_lo",false);
	},
	update : function()
	{
		for (var id in this.buttons)
		{
			var cfg = this.buttons[id];
			cfg.btn.set("disabled", cfg.update());
			if(this.disableFwd && (id =='next_group' || id == 'next_lo')){
				cfg.btn.set("disabled", true);
			}
		}
	},
	disableAll : function()
	{
		for (var id in this.buttons)
		{
			var cfg = this.buttons[id];
			cfg.btn.set("disabled", true);
		}
	},
	createButton : function(id, fnClick, fnUpdate)
	{
		if (YAHOO.util.Dom.get("btn_"+id) != null)
		{
			var btn = new YAHOO.widget.Button("btn_"+id, { name:"id", onclick:{ fn: fnClick } });
			this.buttons[id] = { "btn": btn, "update": fnUpdate };
		}
	},
	disableNextButtonForAsseseement : function()
	{
		if (OSDeliveryEngine.linear && ((vc.current.type != 6)||(vc.current.type == 6 && vc.current.score < vc.current.passingScore && (vc.current.attemptLimit == 0 || vc.current.attempts < vc.current.attemptLimit)))) {
			vc.events.changeFwd.fire();
		}
	}
}

RichMediaController =
{
		currentPlayers : null,
		init : function()
		{
			this.playMediaButton = new YAHOO.widget.Button("btn_play", { name:"playMedia", onclick:{ fn:function() { RichMediaController.playMedia() } } });
			this.pauseMediaButton = new YAHOO.widget.Button("btn_pause", { name:"pauseMedia", onclick:{ fn:function() { RichMediaController.pauseMedia() } } });
			this.rewindMediaButton = new YAHOO.widget.Button("btn_rewind", { name:"rewindMedia", onclick:{ fn:function() { RichMediaController.rewindMedia() } } });
			this.forwardMediaButton = new YAHOO.widget.Button("btn_forward", { name:"forwardMedia", onclick:{ fn:function() { RichMediaController.forwardMedia() } } });
			this.unmuteMediaButton = new YAHOO.widget.Button("btn_unmute", { name:"unmuteMedia", onclick:{ fn:function() { RichMediaController.muteMedia() } } });
			this.muteMediaButton = new YAHOO.widget.Button("btn_mute", { name:"muteMedia", onclick:{ fn:function() { RichMediaController.unmuteMedia() } } });
			this.closeCaptionMediaButton = new YAHOO.widget.Button("btn_cc", { name:"closeCaptionMedia", onclick:{ fn:function() { RichMediaController.closeCaptionMedia() } } });
			this.showCaptionMediaButton = new YAHOO.widget.Button("btn_sc", { name:"showCaptionMedia", onclick:{ fn:function() { RichMediaController.showCaptionMedia() } } });
			$("#slider-volume").slider({
				orientation: "horizontal",
				min: 0,
				max: 100,
				value: 50,
				slide: function(event, ui) {
					RichMediaController.volumeMedia(ui.value);
				}
			});

			var vc = ViewerController;
			vc.events.media_loaded.subscribe(this.update,this,true);
			this.updateButton(null);
		},
		rewindMedia:function()
		{
			var obj = this.currentPlayers;
			if ((obj != null) && (obj.length>0))
			{
				obj[0].rewind();
				this.showPlayButton(true);

			}
		},
		forwardMedia:function()
		{
			var obj = this.currentPlayers;
			if ((obj != null) && (obj.length>0))
			{
				obj[0].forward();
			}
		},
		pauseMedia: function()
		{
			var obj = this.currentPlayers;
			if ((obj != null) && (obj.length>0))
			{
				obj[0].pause();
				this.showPlayButton(true);
			}
		},
		playMedia: function()
		{
			var obj = this.currentPlayers;
			if ((obj != null) && (obj.length>0))
			{
				obj[0].play();
				this.showPlayButton(false);
			}
		},
		muteMedia: function()
		{
			var obj = this.currentPlayers;
			if ((obj != null) && (obj.length>0))
			{
				obj[0].mute();
				this.showUnMuteButton(false);
			}
		},
		unmuteMedia: function()
		{
			var obj = this.currentPlayers;
			if ((obj != null) && (obj.length>0))
			{
				obj[0].unmute();
				this.showUnMuteButton(true);
			}
		},
		volumeMedia: function(value)
		{
			var obj = this.currentPlayers;
			if ((obj != null) && (obj.length>0))
			{
				obj[0].volume(value);
			}

		},
		closeCaptionMedia: function()
		{
			var obj = this.currentPlayers;
			if ((obj != null) && (obj.length>0))
			{
				obj[0].hideCaptions();
				this.showCloseCaptionButton(false);
			}
		},
		showCaptionMedia: function(value)
		{
			var obj = this.currentPlayers;
			if ((obj != null) && (obj.length>0))
			{
				obj[0].showCaptions(value);
				this.showCloseCaptionButton(true);
			}

		},
		showPlayButton: function(b)
		{
			var yd = YAHOO.util.Dom;
			var playElm = yd.get("btn_play");
			var pauseElm = yd.get("btn_pause");
			var er = yd.getRegion(pauseElm);
			yd.setXY(playElm,[er.left,er.top]);
			if (b) 		{

				yd.get("btn_play").style.visibility='visible';
				yd.get("btn_pause").style.visibility='hidden';
			}
			else
			{
				yd.get("btn_pause").style.visibility='visible';
				yd.get("btn_play").style.visibility='hidden';
			}
		},
		showUnMuteButton: function(b)
		{
			var yd = YAHOO.util.Dom;
			var unmuteElm = yd.get("btn_unmute");
			var muteElm = yd.get("btn_mute");
			var er = yd.getRegion(muteElm);
			yd.setXY(unmuteElm,[er.left,er.top]);
			if (b) 		{

				yd.get("btn_unmute").style.visibility='visible';
				yd.get("btn_mute").style.visibility='hidden';
			}
			else
			{
				yd.get("btn_mute").style.visibility='visible';
				yd.get("btn_unmute").style.visibility='hidden';
			}
		},
		showCloseCaptionButton: function(b)
		{
			var yd = YAHOO.util.Dom;
			var closeCaptionElm = yd.get("btn_cc");
			var showCaptionElm = yd.get("btn_sc");
			var er = yd.getRegion(showCaptionElm);
			yd.setXY(closeCaptionElm,[er.left,er.top]);
			if (b) 		{

				yd.get("btn_cc").style.visibility='visible';
				yd.get("btn_sc").style.visibility='hidden';
			}
			else
			{
				yd.get("btn_sc").style.visibility='visible';
				yd.get("btn_cc").style.visibility='hidden';
			}
		},
		update:function(type, args)
		{
			var obj = args[0];
			this.currentPlayers = obj;
			this.updateButton(obj);
		},
		updateButton:function(obj)
		{
			this.showUnMuteButton(true);
			this.showCloseCaptionButton(true);

			if ((obj != null) && (obj.length>0))
			{
				this.showPlayButton(!obj[0].autoplay);
				this.showCloseCaptionButton(!obj[0].isClosedCaption);
				this.enableButton(obj[0], false);
			}
			else
			{
				this.showPlayButton(true);
				this.enableButton(obj, true);
			}
		},
		enableButton:function(obj, enabled){
			this.playMediaButton.set("disabled",enabled || !obj.settings.play);
			this.pauseMediaButton.set("disabled",enabled || !obj.settings.pause);
			this.rewindMediaButton.set("disabled",enabled || !obj.settings.rewind);
			this.forwardMediaButton.set("disabled",enabled || !obj.settings.forward);
			this.closeCaptionMediaButton.set("disabled",enabled || !obj.settings.hideCaptions);
			this.showCaptionMediaButton.set("disabled",enabled || !obj.settings.showCaptions);
			this.unmuteMediaButton.set("disabled",enabled || !obj.settings.unmute);
			this.muteMediaButton.set("disabled",enabled || !obj.settings.mute);
			$("#slider-volume").slider( "option", "disabled", enabled || !obj.settings.volume );
			$("#slider-volume").filter('[aria-disabled="true"]').removeClass("ui-state-disabled").addClass("mui-state-disabled");
			$("#slider-volume").filter('[aria-disabled="false"]').removeClass("mui-state-disabled");
		}
}

BreadCrumbController =
{
	init : function()
	{
		var vc = ViewerController;
		vc.events.navigate.subscribe(this.update,this,true);

		if (vc.current != null)
		{
			this.update("navigation",[vc.current]);
		}
	},
	update : function(type,args)
	{
		var yd = YAHOO.util.Dom;
		var obj = args[0];

{ // Carl's <span lcmsLabel="lo"> customization
  var cuLab, moLab, loLab, tpLab, gpLab, elLab;
  var o = obj;
  while (true) {
    //alert(o.type);
    switch(o.type){
      case 1:  elLab=o.label; break;
      case 11: gpLab=o.label; break;
      case 2:  tpLab=o.label; break;
      case 3:  loLab=o.label; break;
      case 4:  moLab=o.label; break;
      case 5:  cuLab=o.label; break;
    }
    if ( o.parent && o.parent!=o ) {
      o = o.parent;
    } else {
      break;
    }
  }
  jQuery('*[lcmsLabel=element]').text(elLab);
  jQuery('*[lcmsLabel=group]').text(gpLab);
  jQuery('*[lcmsLabel=topic]').text(tpLab);
  jQuery('*[lcmsLabel=lo]').text(loLab);
  jQuery('*[lcmsLabel=module]').text(moLab);
  jQuery('*[lcmsLabel=curriculum]').text(cuLab);
}

		var cfg = ["root_label","lo_label","group_label"];
		for (var i=0; i<cfg.length; i++)
		{
			yd.get(cfg[i]).innerHTML = "";
		}

		var pMap = {};
		var p = obj;
		while ((p = p.parent) != null)
		{
			pMap[p.type] = p;
		}

		if (!obj.parent)
		{
			yd.get("root_label").innerHTML = obj.label;
		}
		else if (obj.parent.type == 5)
		{
			yd.get("root_label").innerHTML = obj.parent.label;
			yd.get("lo_label").innerHTML = obj.label;
		}
		else if (obj.parent.type == 4)
		{
			if (pMap[5])
			{
				yd.get("root_label").innerHTML = pMap[5].label;
				yd.get("lo_label").innerHTML = obj.parent.label;
				yd.get("group_label").innerHTML = obj.label;
			}
			else
			{
				yd.get("root_label").innerHTML = obj.parent.label;
				yd.get("group_label").innerHTML = obj.label;
			}
		}
		else if (obj.parent.type == 3)
		{
			if (pMap[5])
			{
				yd.get("root_label").innerHTML = pMap[5].label;
				yd.get("lo_label").innerHTML = obj.parent.label;
				yd.get("group_label").innerHTML = obj.label;
			}
			else if (pMap[4])
			{
				yd.get("root_label").innerHTML = pMap[4].label;
				yd.get("lo_label").innerHTML = obj.parent.label;
				yd.get("group_label").innerHTML = obj.label;
			}
			else
			{
				yd.get("root_label").innerHTML = obj.parent.label;
				yd.get("group_label").innerHTML = obj.label;
			}
		}
		else if (obj.parent.type == 2)
		{
			if (pMap[5])
			{
				yd.get("root_label").innerHTML = pMap[5].label;
				yd.get("lo_label").innerHTML = pMap[3].label;
				yd.get("group_label").innerHTML = obj.label;
			}
			else if (pMap[4])
			{
				yd.get("root_label").innerHTML = pMap[4].label;
				yd.get("lo_label").innerHTML = pMap[3].label;
				yd.get("group_label").innerHTML = obj.label;
			}
			else if (pMap[3])
			{
				yd.get("root_label").innerHTML = pMap[3].label;
				yd.get("group_label").innerHTML = obj.label;
			}
			else
			{
				yd.get("root_label").innerHTML = obj.parent.label;
				yd.get("group_label").innerHTML = obj.label;
			}
		}
	}
}

BackgroundController =
{
	updateBackground : function(url)
	{
		if (url != null)
		{
			jQuery("#content").css("background-image","url("+url+")");
		}
		else
		{
			jQuery("#content").css("background-image","");
		}
	}
}

ViewerController.events.navigate.subscribe(function(type,args) { $("#groupFrame")[0].src = args[1]; });

jQuery(document).ready(function()
{
	TreeController.init();
	ProgressController.init();
	ButtonController.init();
	RichMediaController.init();
	BreadCrumbController.init();

	var layout = new YAHOO.widget.Layout({
		units: [
			{ position: 'top', height: 81, body: 'header' },
			{ position: 'bottom', height: 61, body: 'footer' },
			{ position: 'center', body: 'content' }
		]
	});
	layout.render();
	layout.refresh();

	// support iframe scrolling on the ios platform
	OSDeliveryEngine.scrollFrame("#groupFrame" , "#scrollWrapper");
	$("#btn_mute").mouseover(function(){
		console.log("hover");
	});
});