/**
 * @license Copyright (c) 2011 Mark McDonnell
 * LICENSE: see the LICENSE.txt file. 
 * If file is missing, this file is subject to the MIT License at: 
 * http://www.opensource.org/licenses/mit-license.php.
 */
(function(window, document, undef) {
	
	/**
	 * The following immediately invoked function expression checks the native Function object 
	 * for a native implementation of Function#bind and if it doesn't find one it modifies the Native object
	 * to include a pollyfill which mimics the new ECMAScript5 feature known as 'function binding'.
	 *
	 * @reference https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
	 */
 	if (!Function.prototype.bind) {
		Function.prototype.bind = function(obj) {
		
			var slice = [].slice,
				 args = slice.call(arguments, 1),
				 self = this,
				 nop = function(){},
				 bound = function() {
				 	return self.apply(this instanceof nop ? this : (obj || {}), args.concat(slice.call(arguments)));
				 };
			
			nop.prototype = self.prototype;
			bound.prototype = new nop();
			return bound;

		};
	}
	
	/**
	 * The following immediately invoked function expression checks the native Array object 
	 * for a native implementation of Array#indexOf and if it doesn't find one it modifies the Native object
	 * to include a pollyfill which mimics the indexOf feature (which is a recent addition to the ECMA-262 standard).
	 *
	 * @reference https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf#Compatibility
	 */
 	if (!Array.prototype.indexOf) {
  		
  		Array.prototype.indexOf = function(searchElement /*, fromIndex */) {
    		"use strict";

    		if (this === void 0 || this === null) {
    			throw new TypeError();
    		}

			var t = Object(this),
				 len = t.length >>> 0,
				 n = 0;
			
			if (len === 0) {
				return -1;
			}
			
			if (arguments.length > 0) {
      		n = Number(arguments[1]);
				if (n !== n) { // shortcut for verifying if it's NaN
					n = 0;
				} else if (n !== 0 && n !== (1 / 0) && n !== -(1 / 0)) {
        			n = (n > 0 || -1) * Math.floor(Math.abs(n));
        		}
			}

    		if (n >= len) {
      		return -1;
			}

    		var k = n >= 0 
    			? n
				: Math.max(len - Math.abs(n), 0);

			for (; k < len; k++) {
				if (k in t && t[k] === searchElement) {
					return k;
        		}
			}
			
			return -1;
		};
	}
	
	// Stand.ard.iz.er library
	var standardizer = (function(){
	
		// Private implementation
		var __standardizer = {
		
			/**
			 * Following property indicates whether the current rendering engine is Trident (i.e. Internet Explorer)
			 * 
			 * @return v { Integer|undefined } if IE then returns the version, otherwise returns 'undefined' to indicate NOT a IE browser
			 */
			isIE: (function() {
				var undef,
					 v = 3,
					 div = document.createElement('div'),
					 all = div.getElementsByTagName('i');
			
				while (
					div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
					all[0]
				);
			
				return v > 4 ? v : undef;
			}()),
			
			/**
			 * The following method is a direct copy from Douglas Crockfords json2.js script (https://github.com/douglascrockford/JSON-js/blob/master/json2.js)
			 * It is used to replicate the native JSON.parse method found in most browsers.
			 * e.g. IE<8 hasn't got a native implementation.
			 * 
			 * @return { Object } a JavaScript Object Notation (JSON) compatible object
			 */
			json: function(text) {
				// The parse method takes a text and returns a JavaScript value if the text is a valid JSON text.
				var j,
					 cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
				
				function walk(holder, key) {
					// The walk method is used to recursively walk the resulting structure so that modifications can be made.
					var k, v, value = holder[key];
					if (value && typeof value === 'object') {
						for (k in value) {
							if (Object.prototype.hasOwnProperty.call(value, k)) {
								v = walk(value, k);
								if (v !== undefined) {
									value[k] = v;
								} else {
									delete value[k];
								}
							}
						}
					}
					return reviver.call(holder, key, value);
				}
				
				// Parsing happens in four stages. In the first stage, we replace certain
				// Unicode characters with escape sequences. JavaScript handles many characters
				// incorrectly, either silently deleting them, or treating them as line endings.
				text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
            	text = text.replace(cx, function(a) {
               	return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
					});
            }
            
            // In the second stage, we run the text against regular expressions that look
				// for non-JSON patterns. We are especially concerned with '()' and 'new'
				// because they can cause invocation, and '=' because it can cause mutation.
				// But just to be safe, we want to reject all unexpected forms.
				
				// We split the second stage into 4 regexp operations in order to work around
				// crippling inefficiencies in IE's and Safari's regexp engines. First we
				// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
				// replace all simple value tokens with ']' characters. Third, we delete all
				// open brackets that follow a colon or comma or that begin the text. Finally,
				// we look to see that the remaining characters are only whitespace or ']' or
				// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.				
				if (/^[\],:{}\s]*$/
					.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
				   .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
				   .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
				
				// In the third stage we use the eval function to compile the text into a
				// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
				// in JavaScript: it can begin a block or an object literal. We wrap the text
				// in parens to eliminate the ambiguity.				
					j = eval('(' + text + ')');
				
				// In the optional fourth stage, we recursively walk the new structure, passing
				// each name/value pair to a reviver function for possible transformation.				
				   return typeof reviver === 'function' ? walk({'': j}, '') : j;
				}
				
				// If the text is not JSON parseable, then a SyntaxError is thrown.				
				throw new SyntaxError('JSON.parse');
			},
			
			// Errors for AJAX request
			errors: [],
			
			/**
			 * Listens for when the DOM is ready to be interacted with.
			 * Then processes queued functions.
			 * 
			 * @param fn { Function } a function to be executed when the DOM is ready.
			 * @return anonymous { Function } this method is an immediately-invoked function expression which returns an anonymous Function to be executed.
			 */
			domready: (function(){

				// Variables used throughout this function
				var win = window,
					 doc = win.document,
					 dce = doc.createElement,
					 supportAEL = (function(){
					 	if (doc.addEventListener) {
					 		return true;
					 	} else {
					 		return false;
					 	}
					 }()), 
					 queue = [],
					 exec,
					 loaded,
					 fallback_onload, 
					 explorerTimer,
					 readyStateTimer,
					 // Had to duplicate isIE function from above as both sections of the script rely on isIE being an IIFE 
					 // (immediately invoked function expression)
					 isIE = (function() {
						var undef,
							 v = 3,
							 div = doc.createElement('div'),
							 all = div.getElementsByTagName('i');
					
						while (
							div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
							all[0]
						);
					
						return v > 4 ? v : undef;
					}());
				
				// Private inner function which is called once DOM is loaded.
				function process() {
					// Let the script know the DOM is loaded
					loaded = true;
					
					// Cleanup
					if (supportAEL) {
						doc.removeEventListener("DOMContentLoaded", process, false);
					}
				
					// Move the zero index item from the queue and set 'exec' equal to it
					while ((exec = queue.shift())) {
						// Now execute the current function
						exec();
					}
				}
			
				return function(fn) {
					// if DOM is already loaded then just execute the specified function
					if (loaded) { 
						return fn();
					}
					
					if (supportAEL) {
						// Any number of listeners can be set for when this event fires,
						// but just know that this event only ever fires once
						doc.addEventListener("DOMContentLoaded", process, false);
					}
					
					// Internet Explorer versions less than 9 don't support DOMContentLoaded.
					// The doScroll('left') method  by Diego Perini (http://javascript.nwbox.com/IEContentLoaded/) appears to be the most reliable solution.
					// Microsoft documentation explains the reasoning behind this http://msdn.microsoft.com/en-us/library/ms531426.aspx#Component_Initialization
					else if (isIE < 9) {
						explorerTimer = win.setInterval(function() {
							if (doc.body) {
								// Check for doScroll success
								try {
									dce('div').doScroll('left');
									win.clearInterval(explorerTimer);
								} catch(e) { 
									return;
								}
								
								// Process function stack
								process();
								return;
							}
						}, 10);
						
						// Inner function to check readyState
						var checkReadyState = function() {
							if (doc.readyState == 'complete') {
								// Clean-up
								doc.detachEvent('onreadystatechange', checkReadyState);
								win.clearInterval(explorerTimer);
								win.clearInterval(readyStateTimer);
								
								// Process function stack
								process();
							}
						};
			
						// If our page is placed inside an <iframe> by another user then the above doScroll method wont work.
						// As a secondary fallback for Internet Explorer we'll check the readyState property.
						// Be aware that this will fire *just* before the window.onload event so isn't ideal.
						// Also notice that we use IE specific event model (attachEvent) to avoid being overwritten by 3rd party code.
						doc.attachEvent('onreadystatechange', checkReadyState);
						
						// According to @jdalton: some browsers don't fire an onreadystatechange event, but do update the document.readyState
						// So to workaround the above snippet we'll also poll via setInterval.
						readyStateTimer = win.setInterval(function() {
							checkReadyState();
						}, 10);
					}
					
					fallback_onload = function() {
						// Note: calling process() now wont cause any problem for modern browsers.
						// Because the function would have already been called when the DOM was loaded.
						// Meaning the queue of functions have already been executed
						process();
						
						// Clean-up
						if (supportAEL) {
							doc.removeEventListener('load', fallback_onload, false);
						} else {
							doc.detachEvent('onload', fallback_onload);
						}
					};
					
					// Using DOM1 model event handlers makes the script more secure than DOM0 event handlers.
					// This way we don't have to worry about an already existing window.onload being overwritten as DOM1 model allows multiple handlers per event.
					if (supportAEL) {
						doc.addEventListener('load', fallback_onload, false);
					} else {
						doc.attachEvent('onload', fallback_onload);
					}
					
					// As the DOM hasn't loaded yet we'll store this function and execute it later
					queue.push(fn);
				};
				
			}()),
			
			/**
			 * XMLHttpRequest abstraction.
			 * 
			 * @return xhr { XMLHttpRequest|ActiveXObject } a new instance of either the native XMLHttpRequest object or the corresponding ActiveXObject
			 */
		 	xhr: (function() {
	
				// Create local variable which will cache the results of this function
				var xhr;
				
				return function() {
					// Check if function has already cached the value
					if (xhr) {
						// Create a new XMLHttpRequest instance
						return new xhr();
					} else {
						// Check what XMLHttpRequest object is available and cache it
						xhr = (!window.XMLHttpRequest) ? function() {
							return new ActiveXObject(
								// Internet Explorer 5 uses a different XMLHTTP object from Internet Explorer 6
								(__standardizer.isIE < 6) ? "Microsoft.XMLHTTP" : "MSXML2.XMLHTTP"
							);
						} : window.XMLHttpRequest;
						
						// Return a new XMLHttpRequest instance
						return new xhr();
					}
				};
				
			}()),
			
			/**
			 * A basic AJAX method.
			 * 
			 * @param settings { Object } user configuration
			 * @return undefined {  } no explicitly returned value
			 */
		 	ajax: function(settings) {
		 	
		 		// JavaScript engine will 'hoist' variables so we'll be specific and declare them here
		 		var xhr, url, requestDone, xhrTimeout,  
		 		
		 		// Load the config object with defaults, if no values were provided by the user
				config = {
					// The type of HTTP Request
					method: settings.method || 'POST',
					
					// The data to POST to the server
					data: settings.data || '',
				
					// The URL the request will be made to
					url: settings.url || '',
				
					// How long to wait before considering the request to be a timeout
					timeout: settings.timeout || 5000,
				
					// Functions to call when the request fails, succeeds, or completes (either fail or succeed)
					onComplete: settings.onComplete || function(){},
					onError: settings.onError || function(){},
					onSuccess: settings.onSuccess || function(){},
				
					// The data type that'll be returned from the server
					// the default is simply to determine what data was returned from the server and act accordingly.
					dataType: settings.dataType || ''
				};
				
				// Create new cross-browser XMLHttpRequest instance
				xhr = __standardizer.xhr();
				
				// Open the asynchronous request
				xhr.open(config.method, config.url, true);
				
				// Determine the success of the HTTP response
				function httpSuccess(r) {
					try {
						// If no server status is provided, and we're actually
						// requesting a local file, then it was successful
						return !r.status && location.protocol == 'file:' ||
						
						// Any status in the 200 range is good
						( r.status >= 200 && r.status < 300 ) ||
						
						// Successful if the document has not been modified
						r.status == 304 ||
						
						// Safari returns an empty status if the file has not been modified
						navigator.userAgent.indexOf('Safari') >= 0 && typeof r.status == 'undefined';
					} catch(e){
						// Throw a corresponding error
						throw new Error("httpSuccess Error = " + e);
					}
					
					// If checking the status failed, then assume that the request failed too
					return false;
				}
				
				// Extract the correct data from the HTTP response
				function httpData(xhr, type) {
					
					if (type === 'json') {
						// Make sure JSON parser is natively supported
						if (window.JSON !== undefined) {
							return JSON.parse(xhr.responseText);
						} 
						// IE<8 hasn't a native JSON parser so instead of eval()'ing the code we'll use Douglas Crockford's json2 parse() method
						else {
							return __standardizer.json(xhr.responseText);
							//return eval('(' + xhr.responseText + ')');
						}
					} 
					
					/*
					// If the specified type is "script", execute the returned text response as if it was JavaScript
					else if (type === 'script') {
						eval.call(window, xhr.responseText);
					}
					*/
					
					//
					else if (type === 'html') {
						return xhr.responseText;
					}
					
					//
					else if (type === 'xml') {
						return xhr.responseXML;
					}
					
					// Attempt to work out the content type
					else {
						// Get the content-type header
						var contentType = xhr.getResponseHeader("content-type"), 
							 data = !type && contentType && contentType.indexOf("xml") >= 0; // If no default type was provided, determine if some form of XML was returned from the server
						
						// Get the XML Document object if XML was returned from the server,
						// otherwise return the text contents returned by the server
						data = (type == "xml" || data) ? xhr.responseXML : xhr.responseText;	
						
						// Return the response data (either an XML Document or a text string)
						return data;
					}
					
				}
				
				// Initalize a callback which will fire within the timeout range, also cancelling the request (if it has not already occurred)
				xhrTimeout = window.setTimeout(function() {
					requestDone = true;
					config.onComplete();
				}, config.timeout);
				
				// Watch for when the state of the document gets updated
				xhr.onreadystatechange = function() {
					
					// Wait until the data is fully loaded, and make sure that the request hasn't already timed out
					if (xhr.readyState == 4 && !requestDone) {
						
						// Check to see if the request was successful
						if (httpSuccess(xhr)) {
							// Execute the success callback
							config.onSuccess(httpData(xhr, config.dataType));
						}
						
						/**
						 * For some reason, in an example PHP script that returns JSON data,
						 * even though the request 'timed out' it still generated a readyState of 4.
						 * I believe this was because although the script used sleep() to delay the data returned, the fact it returned data after the timeout caused an error.
						 * So when the httpSuccess expression used in the above condition returns false we need to execute the onError handler.
						 */
						else {
							config.onError(xhr);
						}
			
						// Call the completion callback
						config.onComplete();
						
						// Clean up after ourselves (+ help to avoid memory leaks)
						clearTimeout(xhrTimeout);
						xhr.onreadystatechange = null;
						xhr = null;
						
					} else if (requestDone && xhr.readyState != 4) {
						// If the script timed out then keep a log of it so the developer can query this and handle any exceptions
						__standardizer.errors.push(url + " { timed out } ");
						
						// Bail out of the request immediately
						xhr.onreadystatechange = null;
						xhr = null;
					}
					
				};
				
				// Get if we should POST or GET...
				if (config.data) {
					// Settings
					xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
					
					// Establish the connection to the server
					xhr.send(config.data);
				} else {					
					// Establish the connection to the server
					xhr.send(null);
				}
	
			},
			
			/**
			 * hashchange event, HTML5 pushState support?
			 */
		 	history: function() {
		 		
		 	},
			
			/**
			 * Event management
			 * 
			 * Based on: addEvent/removeEvent written by Dean Edwards, 2005
			 * http://dean.edwards.name/weblog/2005/10/add-event/
			 * http://dean.edwards.name/weblog/2005/10/add-event2/
			 * 
			 * It doesn't utilises the DOM Level 2 Event Specification (http://www.w3.org/TR/2000/REC-DOM-Level-2-Events-20001113/ecma-script-binding.html)
			 * Instead it uses the traditional DOM Level 1 methods along with a hash map object to correlate the different listeners/handlers.
			 * 
			 * Originally I had used a branching technique for add/removeEventListener (W3C) & add/detachEvent (IE).
			 * But discovered that trying to standardise the event object for a listener was impossible because it meant wrapping the callback in a function.
			 * And within that function then executing the callback and passing through a normalised event object.
			 * Problem is the removeEventListener can't remove listeners for anonymous functions.
			 * 
			 * e.g. this doesn't work...
			   
			   element.addEventListener(eventType, function(e) {
            	handler(__standardizer.events.standardize(e));
            }, false); 
            
			 */
			events: {
			
				/**
				 * A counter to generate a unique event handler ID
				 */
				id: 1,
			
				/**
				 * The add method allows us to assign a function to execute when an event of a specified type occurs on a specific element
				 * 
				 * @param element { Element/Node } the element that will have the event listener attached
				 * @param eventType { String } the event type, e.g. 'click' that will trigger the event handler
				 * @param handler { Function } the function that will execute as the event handler
				 * @return undefined {  } no explicitly returned value
				 */
				add: function(element, eventType, handler) {
					
					// Normalise user input
					eventType = eventType.toLowerCase();

					// Assign each event handler function a unique ID (via a static property '$$guid')
					if (!handler.$$guid) { 
						handler.$$guid = __standardizer.events.id++;
					}
					
					// Create hash table of event types for the element.
					// As there could be different events for the same element.
					if (!element.events) { 
						element.events = {};
					}
					
					// Create hash table of event handlers for each element/event pair
					var handlers = element.events[eventType];
					if (!handlers) {
						// If no eventType found then create empty hash for it
						handlers = element.events[eventType] = {};

						// Store the current event handler.
						// As each eventType could have multiple handlers needed to be executed for it.
						if (element["on" + eventType]) {
							handlers[0] = element["on" + eventType];
						}
					}
					
					// Store the event handler in the hash table
					handlers[handler.$$guid] = handler;
					
					// Assign a global event handler to do all the work
					element["on" + eventType] = __standardizer.events.handler;
					
				},
				
				/**
				 * The remove method allows us to remove previously assigned code from an event
				 * 
				 * @param element { Element/Node } the element that will have the event listener detached
				 * @param eventType { String } the event type, e.g. 'click' that triggered the event handler
				 * @param handler { Function } the function that was to be executed as the event handler
				 * @return undefined {  } no explicitly returned value
				 */
				remove: function(element, eventType, handler) {
				
					// Normalise user input
					eventType = eventType.toLowerCase();
					
					// Delete the event handler from the hash table
					if (element.events && element.events[eventType]) {
						delete element.events[eventType][handler.$$guid];
					}
					
				},
			
				/**
				 * This method handles the event hash map object and executes each event handler for each event type stored
				 */
				handler: function(e) {
				
					var returnValue = true,
						 handlers,
						 fn;
	
					// Standardise the event object
					e = e || window.event;
					
					// If you try and pass e to standardize method without first checking for e || window.event then a race condition issue happens with IE<8
					e = __standardizer.events.standardize(e);
					
					// Get a reference to the hash table of event handlers
					handlers = this.events[e.type];

					// Execute each event handler
					for (var i in handlers) {
						// Store current handler to be executed
						fn = handlers[i];
						
						// If after executing the function it's return value is false, then explicitly set the return value
						if (fn(e) === false) {
							returnValue = false;
						}
					}
					
					return returnValue;
					
				},
								
				/**
				 * The standardize method produces a unified set of event properties, regardless of the browser
				 * 
				 * @param event { Object } the event object associated with the event that was triggered
				 * @return anonymous { Object } an un-named object literal with the relevant event properties normalised
				 */
			 	standardize: function(event) { 
				
					// These two methods, defined later, return the current position of the 
					// mouse pointer, relative to the document as a whole, and relative to the 
					// element the event occurred within 
					var page = this.getMousePositionRelativeToDocument(event),
						 offset = this.getMousePositionOffset(event),
						 type = event.type;
					
					// Let's stop events from firing on element nodes above the current...
					
					// W3C method 
					if (event.stopPropagation) { 
						event.stopPropagation(); 
					} 
					
					// Internet Explorer method 
					else { 
						event.cancelBubble = true; 
					}
					
					// We return an object literal containing seven properties and one method 
					return { 
					
						// The event type
						type: type,
						
						// The target is the element the event occurred on 
						target: this.getTarget(event), 
						
						// The relatedTarget is the element the event was listening for, 
						// which can be different from the target if the event occurred on an 
						// element located within the relatedTarget element in the DOM 
						relatedTarget: this.getRelatedTarget(event), 
						
						// If the event was a  keyboard- related one, key returns the character 
						key: this.getCharacterFromKey(event), 
						
						// Return the x and y coordinates of the mouse pointer, 
						// relative to the document 
						pageX: page.x, 
						pageY: page.y, 
						
						// Return the x and y coordinates of the mouse pointer, 
						// relative to the element the current event occurred on 
						offsetX: offset.x, 
						offsetY: offset.y, 
						
						// The preventDefault method stops the default event of the element 
						// we're acting upon from occurring. If we were listening for click 
						// events on a hyperlink, for example, this method would stop the 
						// link from being followed 
						preventDefault: function() {
						 
						 	// W3C method
							if (event.preventDefault) {
								event.preventDefault();
							} 
							
							// Internet Explorer method
							else { 
								event.returnValue = false; 
							} 
							
						}
						
					};
					
				},
				
				/**
				 * The getTarget method locates the element the event occurred on
				 * 
				 * @param event { Object } the event object associated with the event that was triggered
				 * @return target { Element/Node } the element that was the target of the triggered event
				 */
			 	getTarget: function(event) { 
				
					// Internet Explorer value is srcElement, W3C value is target 
					var target = event.srcElement || event.target; 
					
					// Window resize event causes 'undefined' value for target
					if (target !== undefined) {
						// Fix legacy Safari bug which reports events occurring on a text node instead of an element node 
						if (target.nodeType == 3) { // 3 denotes a text node 
							target = target.parentNode; // Get parent node of text node 
						}
					}
					
					// Return the element node the event occurred on 
					return target;
					 
				},
				
				/**
				 * The getCharacterFromKey method returns the character pressed when keyboard events occur. 
				 * You should use the keypress event as others vary in reliability
				 * 
				 * @param event { Object } the event object associated with the event that was triggered
				 * @return character { String } the character pressed when keyboard events occurred
				 */
			 	getCharacterFromKey: function(event) {
				 
					var character = "",
						 keycode; 
					
					// Internet Explorer 
					if (event.keyCode) {
						keycode = event.keyCode;
						character = String.fromCharCode(event.keyCode); 
					} 
					
					// W3C 
					else if (event.which) {
						keycode = event.which;
						character = String.fromCharCode(event.which); 
					} 
					
					return { code:keycode, character:character };
					
				},
				
				/**
				 * The getMousePositionRelativeToDocument method returns the current mouse pointer position relative to the top left edge of the current page.
				 * 
				 * @param event { Object } the event object associated with the event that was triggered
				 * @return anonymous { Object } the x and y coordinates
				 */
			 	getMousePositionRelativeToDocument: function(event) { 
					
					var x = 0, y = 0; 
					
					// pageX gets coordinates of pointer from left of entire document 
					if (event.pageX) { 
						x = event.pageX; 
						y = event.pageY; 
					} 
					
					// clientX gets coordinates from left of current viewable area 
					// so we have to add the distance the page has scrolled onto this value 
					else if (event.clientX) { 
						x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft; 
						y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop; 
					}
					
					// Return an object literal containing the x and y mouse coordinates 
					return { 
						x: x, 
						y: y 
					};
					
				},
				
				/**
				 * The getMousePositionOffset method returns the distance of the mouse pointer from the top left of the element the event occurred on
				 * 
				 * @param event { Object } the event object associated with the event that was triggered
				 * @return anonymous { Object } the x and y coordinates of the mouse relative to the element
				 */
			 	getMousePositionOffset: function(event) {
				 
					var x = 0, y = 0; 
				
					if (event.layerX) { 
						x = event.layerX; 
						y = event.layerY; 
					}
					
					// Internet Explorer proprietary
					else if (event.offsetX) { 
						x = event.offsetX; 
						y = event.offsetY; 
					} 
					
					// Returns an object literal containing the x and y coordinates of the mouse relative to the element the event fired on 
					return { 
						x: x, 
						y: y 
					};
					
				},
				
				/**
				 * The getRelatedTarget method returns the element node the event was set up to fire on, 
				 * which can be different from the element the event actually fired on
				 * 
				 * @param event { Object } the event object associated with the event that was triggered
				 * @return relatedTarget { Element/Node } the element the event was set up to fire on
				 */
			 	getRelatedTarget: function(event) { 
				
					var relatedTarget = event.relatedTarget; 
					
					// With mouseover events, relatedTarget is not set by default 
					if (event.type == "mouseover") { 
						relatedTarget = event.fromElement; 
					} 
					
					// With mouseout events, relatedTarget is not set by default
					else if (event.type == "mouseout") { 
						relatedTarget = event.toElement; 
					}
					
					return relatedTarget; 
					
				}
				
			},
			
			utilities: {
			
				/**
				 * The toCamelCase method takes a hyphenated value and converts it into a camel case equivalent.
				 * e.g. margin-left becomes marginLeft. 
				 * Hyphens are removed, and each word after the first begins with a capital letter.
				 * 
				 * @param hyphenatedValue { String } hyphenated string to be converted
				 * @return result { String } the camel case version of the string argument
				 */
			 	toCamelCase: function(hyphenatedValue) { 
					
					var result = hyphenatedValue.replace(/-\D/g, function(character) { 
						return character.charAt(1).toUpperCase(); 
					}); 
					
					return result;
					 
				}, 
				
				/**
				 * The toHyphens method performs the opposite conversion, taking a camel case string and converting it into a hyphenated one.
				 * e.g. marginLeft becomes margin-left
				 * 
				 * @param camelCaseValue { String } camel cased string to be converted
				 * @return result { String } the hyphenated version of the string argument
				 */
			 	toHyphens: function(camelCaseValue) { 
					
					var result = camelCaseValue.replace(/[A-Z]/g, function(character) { 
						return ('-' + character.charAt(0).toLowerCase()); 
					});
				
					return result; 

				},
				
				/**
				 * The following method truncates a string by the length specified.
				 * The second argument is the suffix (e.g. rather than ... you could have !!!)
				 *
				 * @param str { String } the string to 
				 * @param length { Integer } the length the string should be (if none specified a default is used)
				 * @param suffix { String } default value is ... but can be overidden with any number of characters
				 * @return { String } the modified String value
				 */
				truncate: function(str, length, suffix) {
					length = length || 30;
					suffix = (typeof suffix == "undefined") ? '...' : suffix;
					
					// If the string isn't longer than the specified cut-off length then just return the original string
					return (str.length > length) 
						// Otherwise, we borrow the String object's "slice()" method using the "call()" method
						? String.prototype.slice.call(str, 0, length - suffix.length) + suffix
						: str;
				},
				
				/**
				 * The following method inserts a specified element node into the DOM after the specified target element node.
				 * For some reason the DOM api provides different methods to acheive this functionality but no actual native method?
				 *
				 * @param newElement { Element/Node } new element node to be inserted
				 * @param targetElement { Element/Node } target element node where the new element node should be inserted after
				 * @return undefined {  } no explicitly returned value
				 */
				insertAfter: function(newElement, targetElement) {
					var parent = targetElement.parentNode;
					
					(parent.lastChild == targetElement) 
						? parent.appendChild(newElement) 
						: parent.insertBefore(newElement, targetElement.nextSibling);
					
				},
				
				/**
				 * The following method creates a new element or returns a copy of an element already created by this script.
				 *
				 * @param tagname { String } element to be created/copied
				 * @return { Element/Node } the newly created element
				 */
				createElement: function(tagname) {
					// Memorize previous elements created
					this.memory = this.memory || {};
					
					if (tagname in this.memory) {
						// If we've already created an element of the specified kind then duplicate it
						return this.memory[tagname].cloneNode(true);
					} else {
						// Create new instance of specified element and store it
						this.memory[tagname] = document.createElement(tagname);
						return this.memory[tagname].cloneNode(true);
					}
				},
				
				/**
				 * Following method is short hand for document.getElementById
				 * This can help improve performance by not having to keep looking up scope chain for either 'document' or 'getElementById'
				 * 
				 * @param id { String } the identifier for the element we want to access.
				 * @return { Element | Undefined } either the element we require or undefined if it's not found
				 */
				getEl: function(id) {
					return document.getElementById(id);
				},
				
				/**
				 * Following method is short hand for document.getElementsByTagName
				 * This can help improve performance by not having to keep looking up scope chain for either 'document' or 'getElementsByTagName'
				 * Also allows us to return the first found element if we so choose.
				 * 
				 * @param options { Object } object literal of options
				 *	@param tag { String } the HTML tag to search for (e.g. 'div')
				 *	@param context { Element/Node } an element to anchor the search by (defaults to window.document)
				 *	@param first { Boolean } determines if we return the first element or the entire HTMLCollection
				 * @return { Element | HTMLCollection/Array | Undefined } either the element(s) we require or undefined if it's not found
				 */
				getTag: function(options) {
					var tag = options.tag || '*', 
						 context = options.context || this.doc, 
						 returnFirstFound = options.first || false;
					
					return (returnFirstFound) 
						? context.getElementsByTagName(tag)[0] 
						: context.getElementsByTagName(tag);
				},
				
				/**
				 * The following method returns the height of the document/page.
				 * If the actual document’s body height is less than the viewport height then it will return the viewport height instead.
				 *
				 * @return { Integer } the height of the document/page ()
				 */
				getDocHeight: function() {
					var doc = document,
						 body = doc.body,
						 elem = doc.documentElement;
						 
					return Math.max(
						Math.max(body.scrollHeight, elem.scrollHeight),
						Math.max(body.offsetHeight, elem.offsetHeight),
						Math.max(body.clientHeight, elem.clientHeight)
					);
				},
				
				/**
				 * Following property stores a reference to the core Object's toString() method.
				 * This allows us to access JavaScript's internal [[Class]] property which helps us determine the type of certain primitives.
				 * This version was updated to use @cowboy's version: https://gist.github.com/1131946
				 * 
				 * Example Usage:
				 * 	__standardizer.utilities.getType([1, 2, 3]); 					// Array
				 * 	__standardizer.utilities.getType({ a: 1, b: 2, c: 3 }); 		// Object
				 * 	__standardizer.utilities.getType(123); 							// Number
				 * 	__standardizer.utilities.getType(new Date); 						// Date
				 * 	__standardizer.utilities.getType("String"); 						// String
				 * 	__standardizer.utilities.getType(window); 						// Global
				 * 
				 * Running {}.toString.call() doesn't work with null or undefined, because executing call() with null or undefined passes window as this.
				 * So for Null we check explicit value/type match, and after that if Null doesn't match then we check value is null so we know the obj is Undefined.
				 * 
				 * @return { String } a trimmed version of the internal [[Class]] value for the specified object (i.e. the object's true data type)
				 */
				getType: (function() {
					
					var types = {};
					
					return function(obj) {
						var key;
						
						// If the object is null, return "Null" (IE <= 8)
						return obj === null ? "Null"
							// If the object is undefined, return "Undefined" (IE <= 8)
							: obj == null ? "Undefined"
							// If the object is the global object, return "Global"
							: obj === window ? "Global"
							// Otherwise return the XXXXX part of the full [object XXXXX] value, from cache if possible.
							: types[key = types.toString.call(obj)] || (types[key] = key.slice(8, -1));
					};
					
				}()),
				
				/**
				 * Following method determines the left/top position of the target element.
				 * This is so we can more accurately position specific elements.
				 *
				 * @param elem { Node } the target element
				 * @param end { String } id value for the top most element we want to check against
				 * @return { Object } object containing x and y position for specified element
				 */
				getOffset: function(elem, end) {
					var _x = 0,
						 _y = 0;
					
					while (elem && !isNaN(elem.offsetLeft) && !isNaN(elem.offsetTop)) {
						// Store the x and y co-ordinates of the current element
						_x += elem.offsetLeft - elem.scrollLeft;
						_y += elem.offsetTop - elem.scrollTop;
						
						// Then move onto the next element up (and we keep going all the way to the top of the document unless stopped)
						// We use offsetParent instead of parentNode (like the original script had) because the offsetLeft/Top adds on extra un-needed dimensions!
						elem = elem.offsetParent;
						
						/*
							In the following if conditional…
							
							We need to avoid a situation where the <body> tag isn't considered an offsetParent and so the browser continues up until null is returned
							OR
							We can specify an elements id as the top level element to top checking for
							OR
							We can pass through '_now_' as the end value which means the check stops immediately
							OR
							Failing the id or _now_ we can try and stop at the document.body element (which will only work if the body is considered an offsetParent)
						 */
						if (elem == null || elem.id === end || end === '_now_' || elem.tagName.toLowerCase() === 'body') {
							break;
						}
					}
					
					return { top: _y, left: _x };
				},
				
				/**
				 * The following method is a Constructor with additional methods attached to the prototype
				 * which aid every time you need to check whether a property is present in an object.
				 * We approach an object as just a set of properties.
				 * And because we can use it to look things up by name, we will call it a 'Dictionary'.
				 * Lastly, as it's a constructor we'll use the correct naming convention of using a capitalised first letter.
				 *
				 * @notes for the prototype object see near bottom of script (after this __standardizer object definition has ended).
				 * @param {} x
				 * @return {} x
				 */
				Dictionary: function(startValues) {
					this.values =  startValues || {};
				}
				
			},
			
			css: {
			
				/**
				 * The getAppliedStyle method returns the current value of a specific CSS style property on a particular element
				 * 
				 * @param element { Element/Node } the element we wish to find the style value for
				 * @param styleName { String } the specific style property we're interested in
				 * @return style { String } the value of the style property found
				 */
			 	getAppliedStyle: function(element, styleName) {
			 	 
					var style = "";
					
					if (window.getComputedStyle) { 
						//  W3C specific method. Expects a style property with hyphens 
						style = element.ownerDocument.defaultView.getComputedStyle(element, null).getPropertyValue(__standardizer.utilities.toHyphens(styleName)); 
					} 
					
					else if (element.currentStyle) { 
						// Internet Explorer-specific method. Expects style property names in camel case 
						style = element.currentStyle[__standardizer.utilities.toCamelCase(styleName)]; 
					}
					  
					return style;
					
				},
				
				/**
				 * The getArrayOfClassNames method is a utility method which returns an array of all the CSS class names assigned to a particular element.
				 * Multiple class names are separated by a space character
				 * 
				 * @param element { Element/Node } the element we wish to retrieve class names for
				 * @return classNames { String } a list of class names separated with a space in-between
				 */
			 	getArrayOfClassNames: function(element) {
			 	
					var classNames = []; 
					
					if (element.className) { 
						// If the element has a CSS class specified, create an array 
						classNames = element.className.split(' '); 
					} 
					
					return classNames;
					
				},
				
				/**
				 * The addClass method adds a new CSS class of a given name to a particular element
				 * 
				 * @param element { Element/Node } the element we want to add a class name to
				 * @param className { String } the class name we want to add
				 * @return undefined {  } no explicitly returned value
				 */
			 	addClass: function(element, className) {
			 	
					// Get a list of the current CSS class names applied to the element 
					var classNames = this.getArrayOfClassNames(element); 
					
					// Make sure the class doesn't already exist on the element
				   if (this.hasClass(element, className)) {
				   	return;
				   }
				   
					// Add the new class name to the list 
					classNames.push(className);
					
					// Convert the list in space-separated string and assign to the element 
					element.className = classNames.join(' '); 
					
				},
				
				/**
				 * The removeClass method removes a given CSS class name from a given element
				 * 
				 * @param element { Element/Node } the element we want to remove a class name from
				 * @param className { String } the class name we want to remove
				 * @return undefined {  } no explicitly returned value
				 */
			 	removeClass: function(element, className) { 
			 	
					var classNames = this.getArrayOfClassNames(element),
						 resultingClassNames = []; // Create a new array for storing all the final CSS class names in 
			        
					for (var index = 0, len = classNames.length; index < len; index++) { 
					
						// Loop through every class name in the list 
						if (className != classNames[index]) { 
						
							// Add the class name to the new list if it isn't the one specified 
							resultingClassNames.push(classNames[index]); 
							
						} 
						
					}
					  
					// Convert the new list into a  space- separated string and assign it 
					element.className = resultingClassNames.join(" "); 
					
				},
				
				/**
				 * The hasClass method returns true if a given class name exists on a specific element, false otherwise
				 * 
				 * @param element { Element/Node } the element we want to check whether a class name exists on
				 * @param className { String } the class name we want to check for
				 * @return isClassNamePresent { Boolean } if class name was found or not
				 */
			 	hasClass: function(element, className) { 
			 	
					// Assume by default that the class name is not applied to the element 
					var isClassNamePresent = false,
						 classNames = this.getArrayOfClassNames(element); 
			        
					for (var index = 0, len = classNames.length; index < len; index++) { 
					
						// Loop through each CSS class name applied to this element 
						if (className == classNames[index]) { 
						
							// If the specific class name is found, set the return value to true 
							isClassNamePresent = true; 
							
						} 
						
					} 
			        
					// Return true or false, depending on if the specified class name was found 
					return isClassNamePresent; 
					
				}
				
			},
			
			/*!
			 * Morpheus - A Brilliant Animator
			 * https://github.com/ded/morpheus - (c) Dustin Diaz 2011
			 * License MIT
			 * 
			 * Note: The function defined here has been modified from the source by @ded (https://github.com/ded/morpheus/)
			 * TODO: Consider re-implementing a CSSTransitions fallback (as per my previous version which originally used emile.js by @thomasfuchs)
			 */
			animation: (function(context, doc, win) {
			
				/* The equations defined here are open source under BSD License.
				 * http://www.robertpenner.com/easing_terms_of_use.html (c) 2003 Robert Penner
				 * Adapted to single time-based by
				 * Brian Crescimanno <brian.crescimanno@gmail.com>
				 * Ken Snyder <kendsnyder@gmail.com>
				 */
				var easings = {
  					easeOut: function (t) {
						return Math.sin(t * Math.PI / 2);
					},

					easeOutStrong: function (t) {
						return (t == 1) ? 1 : 1 - Math.pow(2, -10 * t);
					},
					
					easeIn: function (t) {
						return t * t;
					},
					
					easeInStrong: function (t) {
						return (t == 0) ? 0 : Math.pow(2, 10 * (t - 1));
					},
					
					easeOutBounce: function(pos) {
						if ((pos) < (1/2.75)) {
							return (7.5625*pos*pos);
						} else if (pos < (2/2.75)) {
							return (7.5625*(pos-=(1.5/2.75))*pos + .75);
						} else if (pos < (2.5/2.75)) {
							return (7.5625*(pos-=(2.25/2.75))*pos + .9375);
						} else {
							return (7.5625*(pos-=(2.625/2.75))*pos + .984375);
						}
					},
					
					easeInBack: function(pos){
						var s = 1.70158;
						return (pos)*pos*((s+1)*pos - s);
					},
					
					easeOutBack: function(pos){
						var s = 1.70158;
						return (pos=pos-1)*pos*((s+1)*pos + s) + 1;
					},
					
					bounce: function(t) {
						if (t < (1 / 2.75)) {
							return 7.5625 * t * t;
						}
						if (t < (2 / 2.75)) {
							return 7.5625 * (t -= (1.5 / 2.75)) * t + 0.75;
						}
						if (t < (2.5 / 2.75)) {
							return 7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375;
						}
						return 7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375;
					},
					
					bouncePast: function(pos) {
						if (pos < (1 / 2.75)) {
							return (7.5625 * pos * pos);
						} else if (pos < (2 / 2.75)) {
							return 2 - (7.5625 * (pos -= (1.5 / 2.75)) * pos + .75);
						} else if (pos < (2.5 / 2.75)) {
							return 2 - (7.5625 * (pos -= (2.25 / 2.75)) * pos + .9375);
						} else {
							return 2 - (7.5625 * (pos -= (2.625 / 2.75)) * pos + .984375);
						}
					},
					
					swingTo: function(pos) {
						var s = 1.70158;
						return (pos -= 1) * pos * ((s + 1) * pos + s) + 1;
					},
					
					swingFrom: function(pos) {
						var s = 1.70158;
						return pos * pos * ((s + 1) * pos - s);
					},
					
					elastic: function(pos) {
						return -1 * Math.pow(4, -8 * pos) * Math.sin((pos * 6 - 1) * (2 * Math.PI) / 2) + 1;
					},
					
					spring: function(pos) {
						return 1 - (Math.cos(pos * 4.5 * Math.PI) * Math.exp(-pos * 6));
					},
					
					blink: function(pos, blinks) {
						return Math.round(pos*(blinks||5)) % 2;
					},
					
					pulse: function(pos, pulses) {
						return (-Math.cos((pos*((pulses||5)-.5)*2)*Math.PI)/2) + .5;
					},
					
					wobble: function(pos) {
						return (-Math.cos(pos*Math.PI*(9*pos))/2) + 0.5;
					},
					
					sinusoidal: function(pos) {
						return (-Math.cos(pos*Math.PI)/2) + 0.5;
					},
					
					flicker: function(pos) {
						var pos = pos + (Math.random()-0.5)/5;
						return easings.sinusoidal(pos < 0 ? 0 : pos > 1 ? 1 : pos);
					},
					
					mirror: function(pos) {
						if (pos < 0.5) {
							return easings.sinusoidal(pos*2);
						} else {
							return easings.sinusoidal(1-(pos-0.5)*2);
						}
					}

				};

				var html = doc.documentElement
				 , rgbOhex = /^rgb\(|#/
				 , relVal = /^([+\-])=([\d\.]+)/
				 , numUnit = /^(?:[\+\-]=)?\d+(?:\.\d+)?(%|in|cm|mm|em|ex|pt|pc|px)$/
				 , rotate = /rotate\(((?:[+\-]=)?([\-\d\.]+))deg\)/
				 , scale = /scale\(((?:[+\-]=)?([\d\.]+))\)/
				 , skew = /skew\(((?:[+\-]=)?([\-\d\.]+))deg, ?((?:[+\-]=)?([\-\d\.]+))deg\)/
				 , translate = /translate\(((?:[+\-]=)?([\-\d\.]+))px, ?((?:[+\-]=)?([\-\d\.]+))px\)/
				   // these elements do not require 'px'
				 , unitless = { lineHeight: 1, zoom: 1, zIndex: 1, opacity: 1, transform: 1}
				   // which property name does this browser use for transform
				
				 , transform = function () {
				     var styles = doc.createElement('a').style
				       , props = ['webkitTransform','MozTransform','OTransform','msTransform','Transform'], i
				     for (i = 0; i < props.length; i++) {
				       if (props[i] in styles) return props[i]
				     }
				   }()
				
				   // does this browser support the opacity property?
				 , opasity = function () {
				     return typeof doc.createElement('a').style.opacity !== 'undefined'
				   }()
				
				   // initial style is determined by the elements themselves
				 , getStyle = doc.defaultView && doc.defaultView.getComputedStyle ?
				     function (el, property) {
				       property = property == 'transform' ? transform : property
				       var value = null
				         , computed = doc.defaultView.getComputedStyle(el, '')
				       computed && (value = computed[camelize(property)])
				       return el.style[property] || value
				     } : html.currentStyle ?
				
				     function (el, property) {
				       property = camelize(property)
				
				       if (property == 'opacity') {
				         var val = 100
				         try {
				           val = el.filters['DXImageTransform.Microsoft.Alpha'].opacity
				         } catch (e1) {
				           try {
				             val = el.filters('alpha').opacity
				           } catch (e2) {}
				         }
				         return val / 100
				       }
				       var value = el.currentStyle ? el.currentStyle[property] : null
				       return el.style[property] || value
				     } :
				     function (el, property) {
				       return el.style[camelize(property)]
				     }
				 , frame = function () {
				     // native animation frames
				     // http://webstuff.nfshost.com/anim-timing/Overview.html
				     // http://dev.chromium.org/developers/design-documents/requestanimationframe-implementation
				     return win.requestAnimationFrame  ||
				       win.webkitRequestAnimationFrame ||
				       win.mozRequestAnimationFrame    ||
				       win.oRequestAnimationFrame      ||
				       win.msRequestAnimationFrame     ||
				       function (callback) {
				         win.setTimeout(function () {
				           callback(+new Date())
				         }, 10)
				       }
				   }()
				
				function parseTransform(style, base) {
				 var values = {}, m
				 if (m = style.match(rotate)) values.rotate = by(m[1], base ? base.rotate : null)
				 if (m = style.match(scale)) values.scale = by(m[1], base ? base.scale : null)
				 if (m = style.match(skew)) {values.skewx = by(m[1], base ? base.skewx : null); values.skewy = by(m[3], base ? base.skewy : null)}
				 if (m = style.match(translate)) {values.translatex = by(m[1], base ? base.translatex : null); values.translatey = by(m[3], base ? base.translatey : null)}
				 return values
				}
				
				function formatTransform(v) {
				 var s = ''
				 if ('rotate' in v) s += 'rotate(' + v.rotate + 'deg) '
				 if ('scale' in v) s += 'scale(' + v.scale + ') '
				 if ('translatex' in v) s += 'translate(' + v.translatex + 'px,' + v.translatey + 'px) '
				 if ('skewx' in v) s += 'skew(' + v.skewx + 'deg,' + v.skewy + 'deg)'
				 return s
				}
				
				function rgb(r, g, b) {
				 return '#' + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)
				}
				
				// convert rgb and short hex to long hex
				function toHex(c) {
				 var m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(c)
				 return (m ? rgb(m[1], m[2], m[3]) : c)
				   .replace(/#(\w)(\w)(\w)$/, '#$1$1$2$2$3$3') // short to long
				}
				
				// change font-size => fontSize etc.
				function camelize(s) {
				 return s.replace(/-(.)/g, function (m, m1) {
				   return m1.toUpperCase()
				 })
				}
				
				function fun(f) {
				 return typeof f == 'function'
				}
				
				/**
				 * Core tween method that requests each frame
				 * @param duration: time in milliseconds. defaults to 1000
				 * @param fn: tween frame callback function receiving 'position'
				 * @param done {optional}: complete callback function
				 * @param ease {optional}: easing method. defaults to easeOut
				 * @param from {optional}: integer to start from
				 * @param to {optional}: integer to end at
				 * @returns method to stop the animation
				 */
				function tween(duration, fn, done, ease, from, to) {
				 ease = ease || function (t) {
				   // default to a pleasant-to-the-eye easeOut (like native animations)
				   return Math.sin(t * Math.PI / 2)
				 }
				 var time = duration || 1000
				   , diff = to - from
				   , start = +new Date()
				   , stop = 0
				   , end = 0
				 frame(run)
				
				 function run(t) {
				   var delta = t - start
				   if (delta > time || stop) {
				     to = isFinite(to) ? to : 1
				     stop ? end && fn(to) : fn(to)
				     return done && done()
				   }
				   // if you don't specify a 'to' you can use tween as a generic delta tweener
				   // cool, eh?
				   isFinite(to) ?
				     fn((diff * ease(delta / time)) + from) :
				     fn(ease(delta / time))
				   frame(run)
				 }
				 return {
				   stop: function (jump) {
				     stop = 1
				     end = jump // jump to end of animation?
				   }
				 }
				}
				
				/**
				 * generic bezier method for animating x|y coordinates
				 * minimum of 2 points required (start and end).
				 * first point start, last point end
				 * additional control points are optional (but why else would you use this anyway ;)
				 * @param points: array containing control points
				    [[0, 0], [100, 200], [200, 100]]
				 * @param pos: current be(tween) position represented as float  0 - 1
				 * @return [x, y]
				 */
				function bezier(points, pos) {
				 var n = points.length, r = [], i, j
				 for (i = 0; i < n; ++i) {
				   r[i] = [points[i][0], points[i][1]]
				 }
				 for (j = 1; j < n; ++j) {
				   for (i = 0; i < n - j; ++i) {
				     r[i][0] = (1 - pos) * r[i][0] + pos * r[parseInt(i + 1, 10)][0]
				     r[i][1] = (1 - pos) * r[i][1] + pos * r[parseInt(i + 1, 10)][1]
				   }
				 }
				 return [r[0][0], r[0][1]]
				}
				
				// this gets you the next hex in line according to a 'position'
				function nextColor(pos, start, finish) {
				 var r = [], i, e
				 for (i = 0; i < 6; i++) {
				   from = Math.min(15, parseInt(start.charAt(i),  16))
				   to   = Math.min(15, parseInt(finish.charAt(i), 16))
				   e = Math.floor((to - from) * pos + from)
				   e = e > 15 ? 15 : e < 0 ? 0 : e
				   r[i] = e.toString(16)
				 }
				 return '#' + r.join('')
				}
				
				// this retreives the frame value within a sequence
				function getTweenVal(pos, units, begin, end, k, i, v) {
				 if (k == 'transform') {
				   v = {}
				   for(var t in begin[i][k]) {
				     v[t] = (t in end[i][k]) ? Math.round(((end[i][k][t] - begin[i][k][t]) * pos + begin[i][k][t]) * 1000) / 1000 : begin[i][k][t]
				   }
				   return v
				 } else if (typeof begin[i][k] == 'string') {
				   return nextColor(pos, begin[i][k], end[i][k])
				 } else {
				   // round so we don't get crazy long floats
				   v = Math.round(((end[i][k] - begin[i][k]) * pos + begin[i][k]) * 1000) / 1000
				   // some css properties don't require a unit (like zIndex, lineHeight, opacity)
				   if (!(k in unitless)) v += units[i][k] || 'px'
				   return v
				 }
				}
				
				// support for relative movement via '+=n' or '-=n'
				function by(val, start, m, r, i) {
				 return (m = relVal.exec(val)) ?
				   (i = parseFloat(m[2])) && (r = (start + i)) && m[1] == '+' ?
				   r : start - i :
				   parseFloat(val)
				}
				
				/**
				 * morpheus:
				 * @param element(s): HTMLElement(s)
				 * @param options: mixed bag between CSS Style properties & animation options
				 *  - {n} CSS properties|values
				 *     - value can be strings, integers,
				 *     - or callback function that receives element to be animated. method must return value to be tweened
				 *     - relative animations start with += or -= followed by integer
				 *  - duration: time in ms - defaults to 1000(ms)
				 *  - easing: a transition method - defaults to an 'easeOut' algorithm
				 *  - complete: a callback method for when all elements have finished
				 *  - bezier: array of arrays containing x|y coordinates that define the bezier points. defaults to none
				 *     - this may also be a function that receives element to be animated. it must return a value
				 */
				function morpheus(elements, options) {
				 var els = elements ? (els = isFinite(elements.length) ? elements : [elements]) : [], i
				   , complete = options.complete
				   , duration = options.duration
				   , ease = easings[options.easing]
				   , points = options.bezier
				   , begin = []
				   , end = []
				   , units = []
				   , bez = []
				   , originalLeft
				   , originalTop
				
				 delete options.complete;
				 delete options.duration;
				 delete options.easing;
				 delete options.bezier;
				
				 if (points) {
				   // remember the original values for top|left
				   originalLeft = options.left;
				   originalTop = options.top;
				   delete options.right;
				   delete options.bottom;
				   delete options.left;
				   delete options.top;
				 }
				
				 for (i = els.length; i--;) {
				
				   // record beginning and end states to calculate positions
				   begin[i] = {}
				   end[i] = {}
				   units[i] = {}
				
				   // are we 'moving'?
				   if (points) {
				
				     var left = getStyle(els[i], 'left')
				       , top = getStyle(els[i], 'top')
				       , xy = [by(fun(originalLeft) ? originalLeft(els[i]) : originalLeft || 0, parseFloat(left)),
				               by(fun(originalTop) ? originalTop(els[i]) : originalTop || 0, parseFloat(top))]
				
				     bez[i] = fun(points) ? points(els[i], xy) : points
				     bez[i].push(xy)
				     bez[i].unshift([
				         parseInt(left, 10)
				       , parseInt(top, 10)
				     ])
				   }
				
				   for (var k in options) {
				     var v = getStyle(els[i], k), unit
				       , tmp = fun(options[k]) ? options[k](els[i]) : options[k]
				     if (typeof tmp == 'string' &&
				         rgbOhex.test(tmp) &&
				         !rgbOhex.test(v)) {
				       delete options[k]; // remove key :(
				       continue; // cannot animate colors like 'orange' or 'transparent'
				                 // only #xxx, #xxxxxx, rgb(n,n,n)
				     }
				
				     begin[i][k] = k == 'transform' ? parseTransform(v) :
				       typeof tmp == 'string' && rgbOhex.test(tmp) ?
				         toHex(v).slice(1) :
				         parseFloat(v)
				     end[i][k] = k == 'transform' ? parseTransform(tmp,begin[i][k]) :
				       typeof tmp == 'string' && tmp.charAt(0) == '#' ?
				         toHex(tmp).slice(1) :
				         by(tmp, parseFloat(v));
				     // record original unit
				     (typeof tmp == 'string') && (unit = tmp.match(numUnit)) && (units[i][k] = unit[1])
				   }
				 }
				 // ONE TWEEN TO RULE THEM ALL
				 return tween(duration, function (pos, v, xy) {
				   // normally not a fan of optimizing for() loops, but we want something
				   // fast for animating
				   for (i = els.length; i--;) {
				     if (points) {
				       xy = bezier(bez[i], pos)
				       els[i].style.left = xy[0] + 'px'
				       els[i].style.top = xy[1] + 'px'
				     }
				     for (var k in options) {
				       v = getTweenVal(pos, units, begin, end, k, i)
				       k == 'transform' ?
				         els[i].style[transform] = formatTransform(v) :
				         k == 'opacity' && !opasity ?
				           (els[i].style.filter = 'alpha(opacity=' + (v * 100) + ')') :
				           (els[i].style[camelize(k)] = v)
				     }
				   }
				 }, complete, ease)
				}
				
				// expose useful methods
				morpheus.tween = tween;
				morpheus.getStyle = getStyle;
				morpheus.bezier = bezier;
				morpheus.transform = transform;
				morpheus.parseTransform = parseTransform;
				morpheus.formatTransform = formatTransform;
				
				return morpheus;
			
			}(this, document, window)),
			
			/**
			 * An event emitter facility which provides the observer(Publisher/Subscriber) design pattern to javascript objects
			 * Doesn't rely on the browser DOM. Super Simple.
			 *
			 * Modified from: 
			 * https://github.com/jeromeetienne/microevent.js/blob/master/microevent.js
			 *
			 * @notes All methods are added via the prototype chain (see below)
			 */
		 	observer: function(){},
			
			/**
			 * @license Copyright (c) 2011 Brian Cavalier
			 * LICENSE: see the LICENSE.txt file. If file is missing, this file is subject
			 * to the MIT License at: http://www.opensource.org/licenses/mit-license.php.
			 *
			 * File: when.js
			 * Version: 0.9.3
			 */
			promises: (function() {
				
				// No-op function used in function replacement in various places below.
				function noop() {}
			
				// Use freeze if it exists
				var freeze = Object.freeze || noop;
			
				// Creates a new, CommonJS compliant, Deferred with fully isolated resolver and promise parts, 
				// either or both of which may be given out safely to consumers.
				// The Deferred itself has the full API: resolve, reject, progress, and then. 
				// The resolver has resolve, reject, and progress.  The promise only has then.
				function defer() {
					var deferred, promise, resolver, result, listeners, tail,
						_then, _progress, complete;
			
					_then = function(callback, errback, progback) {
						var d, listener;
			
						listener = {
							deferred: (d = defer()),
							resolve: callback,
							reject: errback,
							progress: progback
						};
			
						if(listeners) {
							// Append new listener if linked list already initialized
							tail = tail.next = listener;
						} else {
							// Init linked list
							listeners = tail = listener;
						}
			
						return d.promise;
					};
			
					function then(callback, errback, progback) {
						return _then(callback, errback, progback);
					}
			
					function resolve(val) {
						complete('resolve', val);
					}
			
					function reject(err) {
						complete('reject', err);
					}
			
					_progress = function(update) {
						var listener, progress;
			
						listener = listeners;
			
						while(listener) {
							progress = listener.progress;
							if(progress) progress(update);
							listener = listener.next;
						}
					};
			
					function progress(update) {
						_progress(update);
					}
			
					complete = function(which, val) {
						// Save original _then
						var origThen = _then;
			
						// Replace _then with one that immediately notifies with the result.
						_then = function newThen(callback, errback) {
							var promise = origThen(callback, errback);
							notify(which);
							return promise;
						};
			
						// Replace complete so that this Deferred can only be completed once.  
						// Note that this leaves notify() intact so that it can be used in the rewritten _then above.
						// Replace _progress, so that subsequent attempts to issue progress throw.
						complete = _progress = function alreadyCompleted() {
							throw new Error("already completed");
						};
			
						// Final result of this Deferred.  This is immutable
						result = val;
			
						// Notify listeners
						notify(which);
					};
			
			      function notify(which) {
			         // Traverse all listeners registered directly with this Deferred, also making sure to handle chained thens
						while(listeners) {
							var listener, ldeferred, newResult, handler;
			
							listener  = listeners;
							ldeferred = listener.deferred;
							listeners = listeners.next;
			
							handler = listener[which];
							if(handler) {
								try {
									newResult = handler(result);
			
									if(isPromise(newResult)) {
										// If the handler returned a promise, chained deferreds should complete only after that promise does.
										_chain(newResult, ldeferred);
			
									} else {
										// Complete deferred from chained then()
										// FIXME: Which is correct?
										// The first always mutates the chained value, even if it is undefined
										// The second will only mutate if newResult !== undefined
										// ldeferred[which](newResult);
			
										ldeferred[which](newResult === undef ? result : newResult);
			
									}
								} catch(e) {
									// Exceptions cause chained deferreds to complete
									// TODO: Should it *also* switch this promise's handlers to failed??
									// I think no.
									// which = 'reject';
			
									ldeferred.reject(e);
								}
							}
						}
					}
			
					// The full Deferred object, with both Promise and Resolver parts
					deferred = {};
			
					// Promise and Resolver parts
			
					// Expose Promise API
					promise = deferred.promise  = {
						then: (deferred.then = then)
					};
			
					// Expose Resolver API
					resolver = deferred.resolver = {
						resolve:  (deferred.resolve  = resolve),
						reject:   (deferred.reject   = reject),
						progress: (deferred.progress = progress)
					};
			
					// Freeze Promise and Resolver APIs
					freeze(promise);
					freeze(resolver);
			
					return deferred;
				}
			
				// Determines if promiseOrValue is a promise or not.  Uses the feature
				// test from http://wiki.commonjs.org/wiki/Promises/A to determine if
				// promiseOrValue is a promise.
				//
				// Parameters:
				// 	promiseOrValue - anything
				//
				// Return true if promiseOrValue is a promise.
				function isPromise(promiseOrValue) {
					return promiseOrValue && typeof promiseOrValue.then === 'function';
				}
			
				// Register a handler for a promise or immediate value
				//
				// Parameters:
				// 	promiseOrValue - anything
				//
				// Returns a new promise that will resolve:
				// 1. if promiseOrValue is a promise, when promiseOrValue resolves
				// 2. if promiseOrValue is a value, immediately
				function when(promiseOrValue, callback, errback, progressHandler) {
					var deferred, resolve, reject;
			
					deferred = defer();
			
					resolve = callback ? callback : function(val) { return val; };
					reject  = errback  ? errback  : function(err) { return err; };
			
					if(isPromise(promiseOrValue)) {
						// If it's a promise, ensure that deferred will complete when promiseOrValue
						// completes.
						promiseOrValue.then(resolve, reject,
							function(update) { progressHandler(update); }
						);
						_chain(promiseOrValue, deferred);
			
					} else {
						// If it's a value, resolve immediately
						deferred.resolve(resolve(promiseOrValue));
			
					}
			
					return deferred.promise;
				}
			
				// Return a promise that will resolve when howMany of the supplied promisesOrValues
				// have resolved. The resolution value of the returned promise will be an array of
				// length howMany containing the resolutions values of the triggering promisesOrValues.
				function some(promisesOrValues, howMany, callback, errback, progressHandler) {
					var toResolve, results, ret, deferred, resolver, rejecter, handleProgress;
			
					toResolve = Math.max(0, Math.min(howMany, promisesOrValues.length));
					results = [];
					deferred = defer();
					ret = (callback || errback || progressHandler)
						? deferred.then(callback, errback, progressHandler)
						: deferred.promise;
			
					// Resolver for promises.  Captures the value and resolves
					// the returned promise when toResolve reaches zero.
					// Overwrites resolver var with a noop once promise has
					// be resolved to cover case where n < promises.length
					resolver = function(val) {
						results.push(val);
						if(--toResolve === 0) {
							resolver = handleProgress = noop;
							deferred.resolve(results);
						}
					};
			
					// Wrapper so that resolver can be replaced
					function resolve(val) {
						resolver(val);
					}
			
					// Rejecter for promises.  Rejects returned promise
					// immediately, and overwrites rejecter var with a noop
					// once promise to cover case where n < promises.length.
					// TODO: Consider rejecting only when N (or promises.length - N?)
					// promises have been rejected instead of only one?
					rejecter = function(err) {
						rejecter = handleProgress = noop;
						deferred.reject(err);
					};
			
					// Wrapper so that rejecer can be replaced
					function reject(err) {
						rejecter(err);
					}
			
					handleProgress = function(update) {
						deferred.progress(update);
					};
			
					function progress(update) {
						handleProgress(update);
					}
			
					if(toResolve === 0) {
						deferred.resolve(results);
					} else {
						var promiseOrValue, i = 0;
						while((promiseOrValue = promisesOrValues[i++])) {
							when(promiseOrValue, resolve, reject, progress);
						}
					}
			
					return ret;
				}
			
				// Return a promise that will resolve only once all the supplied promisesOrValues
				// have resolved. The resolution value of the returned promise will be an array
				// containing the resolution values of each of the promisesOrValues.
				function all(promisesOrValues, callback, errback, progressHandler) {
					return some(promisesOrValues, promisesOrValues.length, callback, errback, progressHandler);
				}
			
				// Return a promise that will resolve when any one of the supplied promisesOrValues
				// has resolved. The resolution value of the returned promise will be the resolution
				// value of the triggering promiseOrValue.
				function any(promisesOrValues, callback, errback, progressHandler) {
					return some(promisesOrValues, 1, callback, errback, progressHandler);
				}
			
				// Ensure that resolution of promiseOrValue will complete resolver with the completion
				// value of promiseOrValue, or instead with optionalValue if it is provided.
				//
				// Parameters:
				// 	promiseOrValue - Promise, that when completed, will trigger completion of resolver,
				//      or value that will trigger immediate resolution of resolver
				// 	resolver - Resolver to complete when promise completes
				// 	resolveValue - optional value to use as the resolution value
				// 		used to resolve second, rather than the resolution
				// 		value of first.
				//
				// Returns a new promise that will complete when promiseOrValue is completed,
				// with the completion value of promiseOrValue, or instead with optionalValue if it
				// is provided.
				function chain(promiseOrValue, resolver, resolveValue) {
					var inputPromise, initChain;
			
					inputPromise = when(promiseOrValue);
			
					// Check against args length instead of resolvedValue === undefined, since
					// undefined may be a valid resolution value.
					initChain = arguments.length > 2
						? function(resolver) { return _chain(inputPromise, resolver, resolveValue) }
						: function(resolver) { return _chain(inputPromise, resolver); };
			
					// Setup chain to supplied resolver
					initChain(resolver);
			
					// Setup chain to new promise
					return initChain(when.defer()).promise;
				}
			
				// Internal chain helper that does not create a new deferred/promise
				// Always returns it's 2nd arg.
				// NOTE: deferred must be a when.js deferred, or a resolver whose functions
				// can be called without their original context.
				function _chain(promise, deferred, resolveValue) {
					promise.then(
						// If resolveValue was supplied, need to wrap up a new function
						// If not, can use deferred.resolve directly
						arguments.length > 2
							? function() { deferred.resolve(resolveValue) }
							: deferred.resolve,
						deferred.reject,
						deferred.progress
					);
			
					return deferred;
				}
			
				//
				// Public API
				//
			
				when.defer     = defer;
			
				when.isPromise = isPromise;
				when.some      = some;
				when.all       = all;
				when.any       = any;
				when.chain     = chain;
			
				return when;
			
			}())
			
		};
		
		__standardizer.observer.prototype = {
			
			/**
			 * The following method binds a custom 'event' to a handler function.
			 * Whenever the custom event is triggered then the associated function is called.
			 * 
			 * @param event { String } the custom event to listen out for
			 * @param callback { Function } the handler function to be associated with the custom event
			 * @return undefined {  } no explicitly returned value
			 */
			bind: function(event, callback) {
			
				this._events = this._events || {};
				this._events[event] = this._events[event]	|| [];
				this._events[event].push(callback);
				
			},
			
			/**
			 * The following method removes the association of a handler function with a custom 'event'.
			 * Note: this function uses indexOf() method on the Array object (which IE < 9 doesn't support, so we augment the Array object to include it - see: utilities/indexOf method)
			 * 
			 * @param event { String } the custom event this function is associated with
			 * @param callback { Function } the handler function associated with the custom event
			 * @return undefined {  } no explicitly returned value (will return undefined if no event found)
			 */
			unbind: function(event, callback) {
			
				// Make sure that an object is available to be checked against (in the odd case where a user calls unbind before actually binding anything first!)
				this._events = this._events || {};
				
				// If the event cannot be found then we return undefined
				if(event in this._events === false) {	
					return;
				}
				
				// Removes the specified event from the list.
				// splice( position of where to start changing Array, number of items from specified position to remove )
				this._events[event].splice(this._events[event].indexOf(callback), 1);
				
			},
			
			/**
			 * The following method can trigger a recognised (i.e. binded) custom event.
			 * This will then call the associated handler function.
			 * 
			 * @param event { String } a custom event that has already been binded to a function
			 * @param ? { ? } Optional arguments that are passed onto the handler function
			 * @return undefined {  } no explicitly returned value (will return undefined if no event found)
			 */
			trigger: function(event /* , args... */) {
				
				// Make sure that an object is available to be checked against (in the odd case where a user calls trigger before actually binding anything first!)
				this._events = this._events || {};
				
				// If the event cannot be found then we return undefined
				if (event in this._events === false) {
					return
				};
				
				// Loop through the events list (executing any functions associated with the event)
				for(var i = 0; i < this._events[event].length; i++) {
				
					// If any additional arguments are passed through to this 'trigger' method then we pass those onto the handler function
					this._events[event][i].apply(this, Array.prototype.slice.call(arguments, 1));
					
				}
				
			}
			
		};
		
		/**
		 * This method will delegate all event emitter functions to the destination object
		 *
		 * @param destObject { Object } the object which will support MicroEvent
		 * @return undefined {  } no explicitly returned value
		 */
		__standardizer.observer.mixin = function(destObject) {
		
			var props	= ['bind', 'unbind', 'trigger'];
			
			for(var i = 0; i < props.length; i ++){
				destObject.prototype[props[i]] = __standardizer.observer.prototype[props[i]];
			}
			
		};
		
		// Here follows is the prototype for the Dictionary Constructor
		// See: __standardizer.utilities.dictionary
		__standardizer.utilities.Dictionary.prototype = {
			
			/**
			 * The following method stores a new property and associated value
			 * 
			 * @param name { String } the property name to create
			 * @param value { Value } the value to store under the specified property name
			 * @return undefined {  } no explicitly returned value
			 */
			store: function(name, value) {
				this.values[name] = value;
			},
			
			/**
			 * The following method checks the object for a named property.
			 * 
			 * @param name { String } the property name to lookup 
			 * @return { Value } returns the value associated with the specified object property name
			 */
			lookup: function(name) {
				return this.values[name];
			},
			
			/**
			 * The following method checks the object for a named property.
			 * 
			 * @param name { String } the property name to check for
			 * @return { Boolean } returns whether the object contains a specified property name
			 */
			contains: function(name) {
				return Object.prototype.hasOwnProperty.call(this.values, name) && 
						 Object.prototype.propertyIsEnumerable.call(this.values, name);
			},
			
			/**
			 * The following method executes a function for every property in this object.
			 * 
			 * @param action { Function } a user specified callback function to execute for each property in this object
			 * @return undefined {  } no explicitly returned value
			 */
			each: function(action) {
				var object = this.values;
				for (var property in object) {
					if (object.hasOwnProperty(property)) {
						action(property, object[property]);
					}
				}
			},
			
			/**
			 * The following method returns an Array of all property names within an object.
			 * 
			 * @return names { Array } a list of all property names in this object
			 */
			names: function() {
				var names = [];
				
				this.each(function(name, value) {
					names.push(name);
				});
				
				return names;
			}
			
		};
	
		// Return public API
		return {
			isIE: __standardizer.isIE,
			ondomready: __standardizer.domready,
			load: __standardizer.ajax,
			events: __standardizer.events,
			utils: __standardizer.utilities,
			css: __standardizer.css,
			observe: __standardizer.observer,
			anim: __standardizer.animation,
			promises: __standardizer.promises
		};
		
	}());
	
	// Expose st to the global object
	window.st = standardizer;
	
}(this, this.document));