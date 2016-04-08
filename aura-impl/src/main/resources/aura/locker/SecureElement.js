/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function SecureElement(el, key) {
	"use strict";

	// A secure element can have multiple forms, this block allows us to apply
	// some polymorphic behavior to SecureElement depending on the tagName
	var tagName = el.tagName && el.tagName.toUpperCase();
	switch (tagName) {
		case 'IFRAME':
			return SecureIFrameElement(el, key);
	}

	// SecureElement is it then!
	var o = Object.create(null, {
		toString : {
			value : function() {
				return "SecureElement: " + el + "{ key: " + JSON.stringify(key) + " }";
			}
		},

		appendChild : {
			value : function(child) {
				$A.lockerService.util.verifyAccess(o, child);

				if (child.$run) {
					// special case for SecureScriptElement to execute without insertion.
					// TODO: improve
					child.$run();
				} else {
					el.appendChild(getLockerSecret(child, "ref"));
				}

				return child;
			}
		}
	});

	Object.defineProperties(o, {
		addEventListener : SecureElement.createAddEventListenerDescriptor(o, el, key),

		removeEventListener : SecureThing.createFilteredMethod(o, el, "removeEventListener"),
		dispatchEvent : SecureThing.createFilteredMethod(o, el, "dispatchEvent"),

		childNodes : SecureThing.createFilteredProperty(o, el, "childNodes"),
		children : SecureThing.createFilteredProperty(o, el, "children"),

		firstChild : SecureThing.createFilteredProperty(o, el, "firstChild"),
		lastChild : SecureThing.createFilteredProperty(o, el, "lastChild"),

        compareDocumentPosition: SecureThing.createFilteredMethod(o, el, "compareDocumentPosition"),

		getAttribute: SecureThing.createFilteredMethod(o, el, "getAttribute"),
		setAttribute: SecureThing.createFilteredMethod(o, el, "setAttribute"),

        getElementsByClassName: SecureThing.createFilteredMethod(o, el, "getElementsByClassName"),
        getElementsByTagName: SecureThing.createFilteredMethod(o, el, "getElementsByTagName"),

		ownerDocument : SecureThing.createFilteredProperty(o, el, "ownerDocument"),
		parentNode : SecureThing.createFilteredProperty(o, el, "parentNode"),

        nodeName: SecureThing.createFilteredProperty(o, el, "nodeName"),
        nodeType: SecureThing.createFilteredProperty(o, el, "nodeType"),

        removeChild: SecureThing.createFilteredMethod(o, el, "removeChild"),

		// Standard HTMLElement methods
		// https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement#Methods
		blur: SecureThing.createFilteredMethod(o, el, "blur"),
		click: SecureThing.createFilteredMethod(o, el, "click"),
		focus: SecureThing.createFilteredMethod(o, el, "focus"),

		innerHTML : SecureThing.createFilteredProperty(o, el, "innerHTML", { returnValue: undefined, afterSetCallback: function() {
			// DCHASMAN TODO We need these to then depth first traverse/visit and $A.lockerServer.trust() all of the new nodes!
			$A.lockerService.trust(o, el.firstChild);
		} }),

        cloneNode: SecureThing.createFilteredMethod(o, el, "cloneNode", { afterCallback: function(fnReturnedValue) {
			// DCHASMAN TODO We need these to then depth first traverse/visit and $A.lockerServer.trust() all of the new nodes!
			$A.lockerService.trust(o, fnReturnedValue);
			return fnReturnedValue;
		} }),

        textContent: SecureThing.createFilteredProperty(o, el, "textContent", { returnValue: "" })
	});

	// applying standard secure element properties
	SecureElement.addSecureProperties(o, el);

	SecureElement.addElementSpecificProperties(o, el);

	setLockerSecret(o, "key", key);
	setLockerSecret(o, "ref", el);

	return o;
}

SecureElement.addSecureProperties = function(se, raw) {
	[
		// Standard Element interface represents an object of a Document.
		// https://developer.mozilla.org/en-US/docs/Web/API/Element#Properties
		'childElementCount', 'classList', 'className', 'id', 'tagName',
		// Note: ignoring 'attributes', 'children', 'firstElementChild', 'innerHTML', 'lastElementChild', 'namespaceURI',
		//      'nextElementSibling' and 'previousElementSibling' from the list above.

		// Standard HTMLElement interface represents any HTML element
		// https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement#Properties
		'accessKey', 'accessKeyLabel', 'contentEditable', 'isContentEditable',
		'contextMenu', 'dataset', 'dir', 'draggable', 'dropzone', 'hidden', 'lang', 'spellcheck',
		'style', 'tabIndex', 'title'
		// Note: ignoring 'offsetParent' from the list above.
	].forEach(function (name) {
		Object.defineProperty(se, name, SecureThing.createFilteredProperty(se, raw, name));
	});
};

SecureElement.createAddEventListenerDescriptor = function(st, el, key) {
	return {
		value : function(event, callback, useCapture) {
			if (!callback) {
				return; // by spec, missing callback argument does not throw, just ignores it.
			}

			var sCallback = function(e) {
				var se = SecureDOMEvent(e, key);
				callback.call(st, se);
			};

			el.addEventListener(event, sCallback, useCapture);
		}
	};
};

SecureElement.addElementSpecificProperties = function(se, el) {
	var tagName = el.tagName && el.tagName.toUpperCase();
	if (tagName) {
		var whitelist = SecureElement.elementSpecificWhitelists[tagName];
		if (whitelist) {
			whitelist.forEach(function(name) {
				Object.defineProperty(se, name, SecureThing.createFilteredProperty(se, el, name));
			});
		}
	}
};

SecureElement.elementSpecificWhitelists = {
	"A": ["hash", "host", "hostname", "href", "origin", "pathname", "port", "protocol", "search"]
};
