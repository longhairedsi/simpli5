/**
 * 
 * @param implementation
 * @param [constructor] private
 */
function Class(implementation, constructor) {
	// create the constructor, init will be the effective constructor
	constructor = constructor || function() {
		if (this.init) return this.init.apply(this, arguments);
	};
	
	if (implementation) {
		
		if (implementation.extend) {
			Class.subclass.prototype = implementation.extend.prototype;
			constructor.prototype = new Class.subclass();
			delete implementation.extend;
		}
		
		if (implementation.implement) {
			var impl = implementation.implement instanceof Array ? implementation.implement : [implementation.implement];
			for (var i = 0, l = impl.length; i < l; i++) {
				Class.implement(constructor, impl[i]);
			}
			delete implementation.implement;
		}
		// Copy the properties over onto the new prototype
		Class.mixin(constructor, implementation);
	}
	constructor.prototype.constructor = constructor;
	constructor.prototype.callSuper = Class.callSuper;
	return constructor;
}

simpli5.extend(Class, {
	subclass: function() {},
	callSuper: function(funcName) {
		var curProto = this.__curProto__ || (this.__proto__[funcName] == this[funcName] ? this.__proto__ : this);
		var proto = curProto.__proto__;
		while (proto && !proto.hasOwnProperty(funcName)) {
			proto = proto.__proto__;
		}
		if (!proto) {
			throw 'There is no super method "' + funcName + '" for ' + this;
		}
		this.__curProto__ = proto;
		var args = simpli5.toArray(arguments).slice(1);
		var func = proto.__lookupSetter__(funcName) || proto[funcName];
		var result = func.apply(this, args);
		this.__curProto__ = curProto;
		return result;
	},
	implement: function(classObj, implClassObj) {
		Class.mixin(classObj, implClassObj.prototype, true);
	},
	mixin: function(classObj, methods, includeInherited) {
		for (var i in methods) {
			if (!includeInherited && !methods.hasOwnProperty(i)) continue;
			
			// handle getters/setters correctly
			var getter = methods.__lookupGetter__(i), setter = methods.__lookupSetter__(i);
			
			if (getter || setter) {
				if (getter) classObj.prototype.__defineGetter__(i, getter);
				if (setter) classObj.prototype.__defineSetter__(i, setter);
			} else {
				classObj.prototype[i] = methods[i];
			}
		}
	},
	make: function(instance, classType, skipInit) {
		instance.__proto__ = classType.prototype;
		var args = simpli5.toArray(arguments);
		args.splice(0, 3);
		if (!skipInit && 'init' in instance) instance.init.apply(instance, args);
	},
	insert: function(instance, classType) {
		var proto = {};
		for (var i in classType.prototype) {
			if (classType.prototype.hasOwnProperty(i)) {
				proto[i] = classType.prototype[i];
			}
		}
		proto.__proto__ = instance.__proto__;
		instance.__proto__ = proto;
	}
});