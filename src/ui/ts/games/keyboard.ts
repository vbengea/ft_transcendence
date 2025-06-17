export var THREEx = THREEx || {};

THREEx.KeyboardState	= function(domElement) {
	this.domElement= domElement	|| document;
	this.keyCodes = {};
	this.modifiers = {};

	var _this	= this;

	this._onKeyDown	= function(event){ _this._onKeyChange(event) }
	this._onKeyUp = function(event){ _this._onKeyChange(event) }

	this.domElement.addEventListener("keydown", this._onKeyDown, false);
	this.domElement.addEventListener("keyup", this._onKeyUp, false);

	this._onBlur = function(){
		for(var prop in _this.keyCodes)  _this.keyCodes[prop] = false;
		for(var prop in _this.modifiers)  _this.modifiers[prop] = false;
	}
	
	window.addEventListener("blur", this._onBlur, false);
}

THREEx.KeyboardState.prototype.destroy	= function() {
	this.domElement.removeEventListener("keydown", this._onKeyDown, false);
	this.domElement.removeEventListener("keyup", this._onKeyUp, false);
	window.removeEventListener("blur", this._onBlur, false);
}

THREEx.KeyboardState.MODIFIERS	= ['shift', 'ctrl', 'alt', 'meta'];
THREEx.KeyboardState.ALIAS	= {
	'left'		: 37,
	'up'		: 38,
	'right'		: 39,
	'down'		: 40,
	'space'		: 32,
	'pageup'	: 33,
	'pagedown'	: 34,
	'tab'		: 9,
	'escape'	: 27
};

THREEx.KeyboardState.prototype._onKeyChange	= function(event) {
	var keyCode	= event.keyCode
	var pressed	= event.type === 'keydown' ? true : false
	this.keyCodes[keyCode]	= pressed
	this.modifiers['shift']	= event.shiftKey
	this.modifiers['ctrl']	= event.ctrlKey
	this.modifiers['alt']	= event.altKey
	this.modifiers['meta']	= event.metaKey
}

THREEx.KeyboardState.prototype.pressed	= function(keyDesc) {
	var keys = keyDesc.split("+");
	for(var i = 0; i < keys.length; i++){
		var key	= keys[i]
		var pressed	= false
		if( THREEx.KeyboardState.MODIFIERS.indexOf( key ) !== -1 ){
			pressed	= this.modifiers[key];
		} else if( Object.keys(THREEx.KeyboardState.ALIAS).indexOf( key ) != -1 ){
			pressed	= this.keyCodes[ THREEx.KeyboardState.ALIAS[key] ];
		} else {
			pressed	= this.keyCodes[key.toUpperCase().charCodeAt(0)]
		}
		if( !pressed)	return false;
	};
	return true;
}

THREEx.KeyboardState.prototype.eventMatches = function(event, keyDesc) {
	var aliases	= THREEx.KeyboardState.ALIAS
	var aliasKeys = Object.keys(aliases)
	var keys = keyDesc.split("+")
	for(var i = 0; i < keys.length; i++){
		var key		= keys[i];
		var pressed	= false;
		if( key === 'shift' ){
			pressed	= (event.shiftKey	? true : false)
		} else if( key === 'ctrl' ){
			pressed	= (event.ctrlKey	? true : false)
		} else if( key === 'alt' ){
			pressed	= (event.altKey		? true : false)
		} else if( key === 'meta' ){
			pressed	= (event.metaKey	? true : false)
		} else if( aliasKeys.indexOf( key ) !== -1 ){
			pressed	= (event.keyCode === aliases[key] ? true : false);
		} else if( event.keyCode === key.toUpperCase().charCodeAt(0) ){
			pressed	= true;
		}
		if( !pressed )	return false;
	}
	return true;
}
