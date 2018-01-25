/* See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * Esri Inc. licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function(){

  gs.context.browser.WebContext = gs.Object.create(gs.context.Context,{

    newXmlInfo: {value: function(task,xmlString) {
      // TODO if (window.DOMParser)
      var parser = new DOMParser();
      var dom = parser.parseFromString(xmlString, "text/xml");
      var root = dom.documentElement; // TODO?
      var xmlInfo = gs.Object.create(gs.context.browser.XmlInfo).mixin({
        dom: dom,
        root: root
      });
      return xmlInfo;
    }},

    sendHttpRequest: {value: function(task,url,data,dataContentType) {
      var promise = this.newPromise();
      var req = new XMLHttpRequest();
      req.onload = function() {
        if (req.status === 200) {
          promise.resolve(req.response);
        } else {
          promise.reject(new Error(req.statusText)); // TODO
        }
      };
      req.onerror = function() {
        promise.reject(new Error("Network error")); // TODO
      };
      if (typeof data !== "undefined" && data !== null) {
        req.open("POST",url);
        if (typeof dataContentType === "string" && dataContentType.length > 0) {
          // TODO Request header field Content-type is not allowed by Access-Control-Allow-Headers in preflight response.
          //req.setRequestHeader("Content-type",dataContentType);
        }
        req.send(data);
      } else {
        req.open("GET",url);
        req.send();
      }
      return promise;
    }}

  });

  /* ============================================================================================== */

  gs.context.browser.XmlInfo = gs.Object.create(gs.base.XmlInfo,{

    NODETYPE_ATTRIBUTE: {writable: true, value: 2},
    NODETYPE_ELEMENT: {writable: true, value: 1},
    NODETYPE_TEXT: {writable: true, value: 3},

    dom: {writable: true, value: null},
    root: {writable: true, value: null},

    forEachAttribute: {value: function(node,callback) {
      var r, self = this;
      this.getAttributes(node).forEach(function(child){
        if (callback) {
          r = callback(self.getNodeInfo(child,true));
          if (r === "break") return;
        }
      });
    }},

    forEachChild: {value: function(node,callback) {
      var r, self = this;
      this.getChildren(node).forEach(function(child){
        if (callback) {
          r = callback(self.getNodeInfo(child,true));
          if (r === "break") return;
        }
      });
    }},

    getAttributes: {value: function(node) {
      if (node) {
        return this._nodeListToArray(node.attributes); // TODO?
      }
      return [];
    }},

    getAttributeValue: {value: function(node,localName,namespaceURI) {
      var value = null;
      var ns = (typeof namespaceURI === "string" && namespaceURI.length > 0);
      this.forEachAttribute(node,function(info){
        if (localName === info.localName) {
          if (ns) {
            if (namespaceURI === info.namespaceURI) {
              value = info.nodeText;
              return "break";
            }
          } else {
            value = info.nodeText;
            return "break";
            /*
            if (typeof info.namespaceURI !== "string" ||
                info.namespaceURI.length === 0) {
              value = info.nodeText;
              return "break";
            }
            */
          }
        }
      });
      return value;
    }},

    getChildren: {value: function(node) {
      if (node) {
        return this._nodeListToArray(node.childNodes);
      }
      return [];
    }},

    /*
     * nodeInfo:
     * {
     *   node: ,
     *   nodeText: , (if requested)
     *   nodeName: ,
     *   localName: ,
     *   namespaceURI: ,
     *   isAttributeNode: ,
     *   isElementNode: ,
     *   isTextNode:
     * }
     */
    getNodeInfo: {value: function(node,withText) {
      if (!node) return null;
      var info = {
        node: node,
        nodeText: this.getNodeText(node),
        nodeName: node.nodeName,
        localName: node.localName, // TODO?
        namespaceURI: node.namespaceURI, // TODO?
        isAttributeNode: node.nodeType === this.NODETYPE_ATTRIBUTE,
        isElementNode: node.nodeType === this.NODETYPE_ELEMENT,
        isTextNode: node.nodeType === this.NODETYPE_TEXT
      };
      if (withText) info.nodeText = this.getNodeText(node);
      return info;
    }},

    getNodeText: {value: function(node) {
      var v;
      if (node) {
        if (node.nodeType === this.NODETYPE_ELEMENT) {
          v = node.textContent; // TODO is this correct?
          if (typeof v === "string") v = v.trim();
        } else {
          v = node.nodeValue;
        }
        if (typeof v === "string") {
          return v;
        }
      }
      return null;
    }},

    _nodeListToArray: {value: function(nl) {
      var i, a = [];
      if (nl) {
        for (i = 0; i < nl.length; i++) {
          a.push(nl.item(i));
        }
      }
      return a;
    }}

  });

  /* ============================================================================================== */

}());
