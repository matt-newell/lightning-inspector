!function(e){var t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)n.d(r,o,function(t){return e[t]}.bind(null,o));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=75)}({75:function(e,t,n){e.exports=n(76)},76:function(e,t,n){"use strict";!function(){var e=document.currentScript.ownerDocument,t=Object.create(HTMLDivElement.prototype);function n(e){var t,n=this.textContent,r=this.getAttribute("expression");if(n&&!r){var o=function(e){if(!e)return null;var t=e.split("$");return{prefix:t[0],component:t[1],method:t[3]}}(n);if(!o)return;t=`\n                (function(definition) {\n                    if(definition) {\n                        inspect(definition.prototype.controller["${o.method}"]);\n                    }\n                })($A.componentService.getComponentClass("markup://${o.prefix}:${o.component}"))`,chrome.devtools.inspectedWindow.eval(t)}else if(r){r=this.getAttribute("expression");var i=this.getAttribute("component");r&&i&&(t=`\n                    (function(cmp){\n                        if(!cmp){ return; }\n                        var reference = cmp.controller["${r=r.substring(4,r.length-1)}"];\n                        if(reference) {\n                            inspect(reference);\n                        }\n                    })($A.getComponent("${i}"));\n                `,chrome.devtools.inspectedWindow.eval(t))}}t.createdCallback=function(){var t=this.getAttribute("expression"),r=this.getAttribute("component");if(t&&r){var o=e.querySelector("template"),i=document.importNode(o.content,!0);i.querySelector("aurainspector-auracomponent").setAttribute("globalId",r);var c=i.querySelector("#expression");c.appendChild(document.createTextNode(t)),c.addEventListener("click",n.bind(this)),this.createShadowRoot().appendChild(i)}else this.addEventListener("click",n.bind(this))},document.registerElement("aurainspector-controllerreference",{prototype:t})}()}});