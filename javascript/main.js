/*
Coding Exercise: multiplayer online Scrabble(tm) clone written in modern HTML, CSS, and JavaScript

IMPORTANT COPYRIGHT NOTICE:

SCRABBLE® is a registered trademark. All intellectual property rights in and to the game are owned in the U.S.A and Canada by Hasbro Inc., and throughout the rest of the world by J.W. Spear & Sons Limited of Maidenhead, Berkshire, England, a subsidiary of Mattel Inc.

This experimental project is not associated with any of the owners of the Scrabble brand.
*/

/*
Useful references:

http://en.wikipedia.org/wiki/Scrabble_letter_distributions

http://en.wikipedia.org/wiki/Scrabble
http://fr.wikipedia.org/wiki/Scrabble

http://ngrams.googlelabs.com/datasets
*/

/*
Similar HTML/Javascript projects:

http://www.themaninblue.com/writing/perspective/2004/01/27/

http://code.google.com/p/scrabbly/source/browse/trunk/scrabble.js
*/

// BEGIN script-scope ------------------
(function(){

var _OBJECT_ROOT_ = window;

function type_of(obj)
{
	if (typeof(obj) == 'object')
		if (typeof obj.length == "undefined" || !obj.length)
			return 'object';
		else
			return 'array';
	else
		return typeof(obj);
}

//=================================================
// BEGIN Namespace util ------------------
//var HTMLScrabble = (typeof HTMLScrabble == "undefined" || !HTMLScrabble ) ? {} : HTMLScrabble;
//var HTMLScrabble.UI = (typeof HTMLScrabble.UI == "undefined" || !(HTMLScrabble.UI) ) ? {} : HTMLScrabble.UI;
/*
console.log("Checking namespace: " + "HTMLScrabble.UI");
EnsureNamespace("HTMLScrabble.UI");

console.log("Checking namespace: " + "HTMLScrabble.Core");
EnsureNamespace("HTMLScrabble.Core");
*/
function EnsureNamespace(nsString)
//_OBJECT_ROOT_.EnsureNamespace = function(nsString)
{
	var nsStrings = nsString.split(".");
	var root = _OBJECT_ROOT_;
	for (var i = 0; i < nsStrings.length; i++)
	{
		var nsName = nsStrings[i];
		var val = root[nsName];
		if (typeof val == "undefined" || !val)
		{
			console.log("Creating namespace object: " + nsName);
			root[nsName] = new Object(); // {} ?
		}
		else
		{
			console.log("Namespace object already exists: " + nsName);
		}
		root = root[nsName];
	}
}
// END Namespace util ------------------
//=================================================

//=================================================
// BEGIN EventsManager ------------------
//Events.AddEventListener('provide', function() {});
//Events.Dispatch('provide', { 'identifier': identifier });
if (typeof _OBJECT_ROOT_.EventsManager == "undefined" || !_OBJECT_ROOT_["EventsManager"])
_OBJECT_ROOT_.EventsManager = (function(){
var _EventsManager = {}; // 'this' object (to be returned at the bottom of the containing auto-evaluated "EventsManager" function)

var _EventListeners = {}; // private associative array (event name -> array of callback functions)

// eventName ==> string
// eventPayload ==> can be anything, but usually a simple associative array such as:
// { 'key1': "value1", 'key2': "value2" }
_EventsManager.DispatchEvent = function(eventName, eventPayload)
{
	var callbacks = _EventListeners[eventName]; // simple indexed array of callback functions
	if (typeof callbacks == "undefined" || !callbacks)
	{
		console.log("Event.Dispatch - no registered listeners for eventName: " + eventName);
		return;
	}
	
	if (callbacks.length == 0) // early check (fail-fast)
	{
		console.log("Event.Dispatch - empty registered listeners for eventName: " + eventName);
		return;
	}
	
	eventPayload.EventName = eventName; // append extra information for the listener to consume (passed via the callback function parameter)
	
	var propsString = "[";
	//for (var i = 0; i < properties.length; i++)
	for (var key in eventPayload)
	{
		propsString += "{" + key + ":" + eventPayload[key] + "}, ";
	}
	propsString += "]";

	for (var i = 0; i < callbacks.length; i++)
	{
		console.log("Event.Dispatch - notifying: " + eventName + ", " + propsString);
		callbacks[i](eventPayload);
	}
};

_EventsManager.AddEventListener = function(eventName, callback)
{
	var callbacks = _EventListeners[eventName]; // simple indexed array of callback functions
	if (typeof callbacks == "undefined" || !callbacks)
	{
		console.log("Event.AddEventListener - init empty callbacks for eventName: " + eventName);
		_EventListeners[eventName] = [];
		callbacks = _EventListeners[eventName];
	}
	
	for (var i = 0; i < callbacks.length; i++)
	{
		if (callbacks[i] == callback)
		{
			console.log("Event.AddEventListener - callback already registered (duplicate ignored): " + eventName + ", " + callback);
			return;
		}
	}
	
	console.log("Event.AddEventListener - registered: " + eventName + ", " + callback);
	callbacks.push(callback);
};

_EventsManager.RemoveEventListener = function(eventName, callback)
{
	var callbacks = _EventListeners[eventName]; // simple indexed array of callback functions
	if (typeof callbacks == "undefined" || !callbacks)
	{
		console.log("Event.RemoveEventListener - no registered listeners for eventName: " + eventName);
		return;
	}
	
	if (callbacks.length == 0) // early check (fail-fast)
	{
		console.log("Event.RemoveEventListener - empty registered listeners for eventName: " + eventName);
		return;
	}
	
	var atLeastOneRemoved = false;
	for (var i = 0; i < callbacks.length; i++)
	{
		if (callbacks[i] == callback)
		{
			atLeastOneRemoved = true;
			console.log("Event.RemoveEventListener - unregistered: " + eventName + ", " + callback);
			//delete callbacks[i];
			callbacks.splice(i--, 1);
		}
	}
	
	if (callbacks.length == 0)
	{
		console.log("Event.RemoveEventListener - empty callback list, removing eventName entirely: " + eventName);
		delete _EventListeners[eventName];
	}

	if (!atLeastOneRemoved)
		console.log("Event.RemoveEventListener - callback for eventName not found: " + eventName + ", " + callback);
};

return _EventsManager;
})();
// END EventsManager ------------------
//=================================================

console.log("Checking namespace: " + "Scrabble.Core");
EnsureNamespace("Scrabble.Core");

console.log("Checking namespace: " + "Scrabble.UI");
EnsureNamespace("Scrabble.UI");

//=================================================
// BEGIN Scrabble.Core.Board ------------------
if (typeof _OBJECT_ROOT_.Scrabble.Core.Board == "undefined" || !_OBJECT_ROOT_.Scrabble.Core["Board"])
_OBJECT_ROOT_.Scrabble.Core.Board = (function(){
//var _Board = {}; // 'this' object (to be returned at the bottom of the containing auto-evaluated function)

console.log("inside Scrabble.Core.Board code scope");

//function _Board()
var _Board = function()
{
	function SetSquaresHorizontal()
	{
		var val = arguments[0];
		
		if (typeof val != 'number')
			throw new Error("Illegal argument Scrabble.Core.Board.SetSquaresHorizontal(), not a number: " + typeof val);
		
		if (val < 15)
			throw new Error("Illegal argument Scrabble.Core.Board.SetSquaresHorizontal(), number smaller than 15: " + val);
		
		this.SquaresHorizontal = val;
	}

	function SetSquaresVertical()
	{
		var val = arguments[0];
		
		if (typeof val != 'number')
			throw new Error("Illegal argument Scrabble.Core.Board.SetSquaresVertical(), not a number: " + typeof val);
		
		if (val < 15)
			throw new Error("Illegal argument Scrabble.Core.Board.SetSquaresVertical(), number smaller than 15: " + val);
		
		this.SquaresVertical = val;
	}

	//_Board.prototype.SetSquares = function()
	function SetSquares()
	{
		if (this instanceof _Board)
		{
			if (arguments.length > 0)
			{
				console.log("typeof ARGS: " + typeof arguments[0]);
				console.log("typeof ARGS: " + type_of(arguments[0]));
			
				switch (type_of(arguments[0]))
				{
					case 'number':
						SetSquaresHorizontal.apply(this, [arguments[0]]);
						SetSquaresVertical.apply(this, [arguments[1]]);
						console.log("Scrabble.Core.Board 'number' constructor: " + this.toString());
						return;
					case 'object':
						SetSquaresHorizontal.apply(this, [arguments[0]['SquaresHorizontal']]);
						SetSquaresVertical.apply(this, [arguments[0]['SquaresVertical']]);
						console.log("Scrabble.Core.Board 'object' constructor: " + this.toString());
						return;
					case 'array':
					default:
						var argumentsString = "";
						for (var i = 0; i < arguments.length; i++)
						{
							argumentsString += arguments[0] + ", ";
						}
						throw new Error("Illegal arguments Scrabble.Core.Board.SetSquares(): " + argumentsString);
						break;
				}
			}
			else
			{
				console.log("Scrabble.Core.Board constructor with empty parameters (default 15x15)");
				this.SquaresHorizontal = 15;
				this.SquaresVertical = 15;
			}
		}
		else
		{
			throw new Error('Illegal method call Scrabble.Core.Board.SetSquares() on :' + typeof this);
		}
	}
	
	console.log("Scrabble.Core.Board constructor before applying parameters");
	SetSquares.apply(this, arguments);
	//SetSquares(arguments);
}

_Board.prototype.SquaresHorizontal = NaN;
_Board.prototype.SquaresVertical = NaN;

_Board.prototype.toString = function()
{
	return "Scrabble.Core.Board toString(): " + this.SquaresHorizontal + " x " + this.SquaresVertical;
}

return _Board;
})();
// END Scrabble.Core.Board ------------------
//=================================================

//=================================================
// BEGIN Scrabble.Core.Square ------------------
if (typeof _OBJECT_ROOT_.Scrabble.Core.Square == "undefined" || !_OBJECT_ROOT_.Scrabble.Core["Square"])
_OBJECT_ROOT_.Scrabble.Core.Square = (function(){
var _Square = {}; // 'this' object (to be returned at the bottom of the containing auto-evaluated function)

console.log("inside Scrabble.Core.Square code scope");

return _Square;
})();
// END Scrabble.Core.Square ------------------
//=================================================

//=================================================
// BEGIN Scrabble.Core.Tile ------------------
if (typeof _OBJECT_ROOT_.Scrabble.Core.Tile == "undefined" || !_OBJECT_ROOT_.Scrabble.Core["Tile"])
_OBJECT_ROOT_.Scrabble.Core.Tile = (function(){
var _Tile = {}; // 'this' object (to be returned at the bottom of the containing auto-evaluated function)

console.log("inside Scrabble.Core.Tile code scope");

return _Tile;
})();
// END Scrabble.Core.Tile ------------------
//=================================================


//LetterDistribution

})();
// END script-scope ------------------


window.onload = function()
{

with (Scrabble)
{
	var board = new Core.Board();
	console.log("CHECK: " + board.toString());
	
	var board1 = new Core.Board(15, 15);
	console.log("CHECK: " + board1.toString());
	
	var board2 = new Core.Board({SquaresHorizontal:15, SquaresVertical:15});
	console.log("CHECK: " + board2.toString());
	
	try
	{
		var boardEx = new Core.Board("test");
	}
	catch(e)
	{
		alert(e.message);
	}
	
	try
	{
		var boardEx = new Core.Board(["test", 15, {test: "daniel"}]);
	}
	catch(e)
	{
		alert(e.message);
	}
	
	try
	{
		var boardEx = new Core.Board(15, "test");
	}
	catch(e)
	{
		alert(e.message);
	}
	
	try
	{
		var boardEx = new Core.Board({SquaresHorizontal:15, SquaresVertical:{test:"test"}});
	}
	catch(e)
	{
		alert(e.message);
	}
}

/*
var callback = function(eventPayload)
	{
		//for (var i = 0; i < eventPayload.length; i++)
		for (var key in eventPayload)
		{
			alert(key + "," + eventPayload[key]);
		}
	};
with (EventsManager)
{
AddEventListener('EVENT_NAME', callback);
DispatchEvent('EVENT_NAME', { 'key1': "value1", 'key2': "value2" });

AddEventListener('EVENT_NAME', callback);
DispatchEvent('EVENT_NAME', { '-key1': "-value1", '-key2': "-value2" });

RemoveEventListener('EVENT_NAME', callback);
DispatchEvent('EVENT_NAME', { '_key1': "_value1", '_key2': "_value2" });
}
*/

}; //END window.onload
