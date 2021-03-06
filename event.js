var CustomEvent = new Class({
	extend: Event,
	init: function(type, bubbles, cancelable) {
		var evt = document.createEvent('Events');
		evt.initEvent(type, bubbles || false, cancelable || false);
		Class.make(evt, this.constructor, true);
		return evt;
	}
});

//initMouseEvent( 'type', bubbles, cancelable, windowObject, detail, screenX, screenY, clientX, clientY, ctrlKey, altKey, shiftKey, metaKey, button, relatedTarget )
var CustomMouseEvent = new Class({
	extend: MouseEvent,
	init: function(type, bubbles, cancelable, view, detail, screenX, screenY, clientX, clientY, ctrlKey, altKey, shiftKey, metaKey, button, relatedTarget) {
		var evt = document.createEvent('MouseEvents');
		evt.initEvent(type, bubbles || false, cancelable || false, view, detail, screenX, screenY, clientX, clientY, ctrlKey, altKey, shiftKey, metaKey, button, relatedTarget);
		Class.make(evt, this.constructor, true);
		return evt;
	}
});


var DataEvent = new Class({
	extend: Event,
	init: function(type, data) {
		var evt = document.createEvent('Events');
		evt.initEvent(type, false, false);
		Class.make(evt, this.constructor, true);
		evt.data = data;
		return evt;
	}
});

var ArrayChangeEvent = new Class({
	extend: Event,
	init: function(action, startIndex, endIndex, items) {
		var evt = document.createEvent('Events');
		evt.initEvent('change', false, false);
		Class.make(evt, this.constructor, true);
		evt.action = action;
		evt.startIndex = startIndex;
		evt.endIndex = endIndex;
		evt.items = items;
		return evt;
	}
});

var EventDispatcher = new Class({
	createClosures: function(listeners) {
		if ( !(listeners instanceof Array)) {
			if (arguments.length == 1 && typeof listeners == 'string' && listeners.indexOf(',') != -1) {
				listeners = listeners.split(/\s*,\s*/);
			} else {
				listeners = simpli5.toArray(arguments);
			}
		} 
		for (var i = 0, l = listeners.length; i < l; i++) {
			var methodName = listeners[i];
			if (methodName in this) this[methodName] = this[methodName].bind(this);
		}
	},
	addEventListener: function(type, listener) {
		if (typeof listener != 'function') throw 'Listener must be a function';
		if (!this.events) {
			this.events = {};
		}
		var events = this.events[type];
		if (!events) {
			this.events[type] = events = [];
		} else if (events.indexOf(listener) != -1) {
			return; // already added
		}
		events.push(listener);
	},
	removeEventListener: function(type, listener) {
		if (!this.events) return;
		var events = this.events[type];
		if (!events) return;
		var index = events.indexOf(listener);
		if (index != -1) {
			events.splice(index, 1);
		}
	},
	dispatchEvent: function(event) {
		if (!this.events) return;
		var events = this.events[event.type];
		if (!events) return;
		for (var i = 0, l = events.length; i < l; i++) {
			events[i].call(this, event);
		}
	}
});

simpli5.extend(EventDispatcher.prototype, {
	on: function(type, listener, capture) {
		var types = type.split(/\s*,\s*/);
		//console.log(listener, typeof listener, listener instanceof NodeList);
		if (listener instanceof NodeList) {
			console.log(listener, listener.bind);
		}
		listener.bound = listener.bind(this);
		listener = listener.bound;
		for (var i = 0, l = types.length; i < l; i++) {
			this.addEventListener(types[i], listener, capture);
		};
		return this;
	},
	un: function(type, listener, capture) {
		var types = type.split(/\s*,\s*/);
		listener = listener.bound || listener;
		for (var i = 0, l = types.length; i < l; i++) {
			this.removeEventListener(types[i], listener, capture);
		};
		return this;
	}
});

simpli5.node.extend({
	on: EventDispatcher.prototype.on,
	un: EventDispatcher.prototype.un,
	createClosures: EventDispatcher.prototype.createClosures
});
simpli5.extend(window, {
	on: EventDispatcher.prototype.on,
	un: EventDispatcher.prototype.un
});

simpli5.map({
	on: 'forEach',
	un: 'forEach'
});
