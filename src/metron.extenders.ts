interface String {
    lower: () => string;
    upper: () => string;
    ltrim: () => string;
    rtrim: () => string;
    //trim: () => string;
    normalize: () => string;
    startsWith: (part: string) => boolean;
    endsWith: (part: string) => boolean;
    capFirst: () => string;
    capWords: () => string;
    truncateWords: (number: number) => string;
    truncateWordsWithHtml: (number: number) => string;
    stripHtml: () => string;
    escapeHtml: () => string;
    toBool: () => boolean;
    contains: (val: string) => boolean;
    slugify: (lower?: boolean) => string;
    toPhoneNumber: () => string;
    getValueByKey: (key: string, values: string) => string;
    setValueByKey: (key: string, values: string, replacement: string) => string;
    //isNullOrEmpty: (val: any) => boolean;
}

interface StringConstructor {
    isNullOrEmpty: (val: any) => boolean;
}

interface Number {
    toBool: () => boolean;
    random: (min: number, max: number) => number;
}

interface Array<T> {
    empty: () => Array<any>;
    isEmpty: () => boolean;
    each: (callback: Function) => void;
    remove: (item: any) => any;
    contains: (partial: string, strict: boolean) => boolean;
    indexOfPartial: (partial: string) => number;
    toObjectArray: (objName: string) => Array<any>;
}

interface Object {
    isEmpty: (obj: any) => boolean;
    getName: () => string;
    extend: (dest: any, src: any) => any;
}

interface Document {
    selectOne: (selector: string) => Element;
    selectAll: (selector: string) => NodeListOf<Element>;
    create: (html: string) => Element;
}

interface NodeList {
    each: (callback: Function) => void;
    last: () => Element;
}

interface Element {
    attribute: (name: string, value?: string) => string & Element;
    up: (selector: string) => Element;
    parent: () => Element;
    first: (selector: string) => Element;
    append: (html: string) => Element;
    empty: () => Element;
    removeEvent: (event: string) => Element;
    addEvent: (event: string, callback: Function) => Element;
    show: () => Element;
    hide: () => Element;
    addClass: (className: string) => Element;
    removeClass: (className: string) => Element;
    toString: () => string;
    selectOne: (selector: string) => Element;
    selectAll: (selector: string) => NodeListOf<Element>;
}

interface HTMLElement {
    clean: () => HTMLElement;
    val: (val?: string) => string;
}

interface XMLHttpRequest {
    responseJSON: () => JSON;
}

String.prototype.lower = function (): string {
    return this.toLowerCase();
};

String.prototype.upper = function (): string {
    return this.toUpperCase();
};

/*
String.prototype.trim = function (): string {
    return this.replace(/^\s+|\s+$/g, "");
};
*/

String.prototype.ltrim = function (): string {
    return this.replace(/^\s+/, "");
};

String.prototype.rtrim = function (): string {
    return this.replace(/\s+$/, "");
};

String.prototype.normalize = function (): string {
    return this.replace(/^\s*|\s(?=\s)|\s*$/g, "");
};

String.prototype.startsWith = function (part: string): boolean {
    return this.slice(0, part.length) == part;
};

String.prototype.endsWith = function (part: string): boolean {
    return this.slice(-part.length) == part;
};

String.prototype.capFirst = function (): string {
    if (this.length == 1) {
        return this.toUpperCase();
    }
    else if (this.length > 0) {
        let regex: RegExp = /^(\(|\[|"|')/;
        if (regex.test(this)) {
            return this.substring(0, 2).toUpperCase() + this.substring(2);
        }
        else {
            return this.substring(0, 1).toUpperCase() + this.substring(1);
        }
    }
    return null;
};

String.prototype.capWords = function (): string {
    let regexp: RegExp = /\s/;
    let words = this.split(regexp);
    if (words.length == 1) {
        return words[0].capFirst();
    }
    else if (words.length > 1) {
        let result: string = '';
        for (let i = 0; i < words.length; i++) {
            if (words[i].capFirst() !== null) {
                result += words[i].capFirst() + ' ';
            }
        }
        result.trim();
        return result;
    }
    return null;
};

String.prototype.truncateWords = function (num: number): string {
    let words: Array<string> = this.split(/\s+/);
    if (words.length > num) {
        return words.slice(0, num).join(' ');
    }
    return words.join(' ');
};

String.prototype.truncateWordsWithHtml = function (num: number): string {
    let tags: Array<string> = [];
    let truncation: string = this.truncateWords(num);
    let matches: RegExpMatchArray = truncation.match(/<[\/]?([^> ]+)[^>]*>/g);
    for (let i: number = 0; i < matches.length; i++) {
        let opening: string = matches[i].replace('/', '');
        if (matches[i].indexOf('/') != -1 && tags.indexOf(opening) != -1) {
            (<any>tags).remove(opening);
        }
        else if (matches[i].indexOf('/') != -1) {
            continue;
        }
        else {
            tags.push(matches[i]);
        }
    }
    for (let i: number = 0; i < tags.length; i++) {
        truncation += tags[i].replace('<', '</').replace(/(\s*)(\w+)=("[^<>"]*"|'[^<>']*'|\w+)/g, '');
    }
    return truncation;
};

String.prototype.stripHtml = function (): string {
    let content: string = this.replace(/<[\/]?([^> ]+)[^>]*>/g, '');
    content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/ig, '');
    content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/ig, '');
    content = content.replace(/<!--[\s\S]*?-->/g, '');
    content = content.replace('&nbsp;', ' ');
    content = content.replace('&amp;', '&');
    return content;
};

String.prototype.escapeHtml = function (): string {
    let content: string = this.replace(/"/g, '&quot;');
    content.replace(/&(?!\w+;)/g, '&amp;');
    content.replace(/>/g, '&gt;');
    content.replace(/</g, '&lt;');
    return content;
};

String.prototype.toBool = function (): boolean {
    if ((<any>String).isNullOrEmpty(this)) {
        return false;
    }
    else if (this.lower() === "true" || this.lower() === "1" || this.lower() === "y" || this.lower() === "t") {
        return true;
    }
    return false;
};

String.prototype.contains = function (val: string): boolean {
    if (this.indexOf(val) !== -1) {
        return true;
    }
    return false;
};

String.prototype.slugify = function (lower: boolean = true): string {
    if (!lower) {
        return this.lower().normalize().replace(/[^a-z0-9]/gi, '-');
    }
    return this.normalize().replace(/[^a-z0-9]/gi, '-');
};

//toPhoneNumber() needs to be a part of some validation mechanism, and needs to be improved a great deal.
String.prototype.toPhoneNumber = function (): string {
    try {
        return this.substring(0, 3) + '-' + this.substring(3, 6) + '-' + this.substring(6);
    }
    catch (e) {
        return this;
    }
};

String.prototype.getValueByKey = function (key: string, values: string): string {
    var collection: Array<string> = values.split(";");
    for (let i = 0; i < collection.length; i++) {
        if (collection[i].contains(":")) {
            let pairs = collection[i].split(":");
            if (pairs[0] == key) {
                return pairs[1];
            }
        }
    }
    return null;
};

String.prototype.setValueByKey = function (key: string, values: string, replacement: string): string {
    var collection: Array<string> = values.split(";");
    var returnCollection: Array<string>;
    for (let i = 0; i < collection.length; i++) {
        if (collection[i].contains(":")) {
            let pairs = collection[i].split(":");
            if (pairs[0] == key) {
                pairs[1] = replacement;
            }
            returnCollection.push(pairs.join(":"));
        }
    }
    return returnCollection.join(';');
};

String.isNullOrEmpty = function (val: any): boolean {
    if (val === undefined || val === null || val.trim() === '') {
        return true;
    }
    return false;
};

/*
 * Remember that Number extensions require the number to be in () or use the .. syntax:
 * (1).toBool()
 * 1..toBool()
 */

Number.prototype.toBool = function (): boolean {
    if (this === 0) {
        return false;
    }
    return true;
};

(<any>Number).random = function (min: number, max: number): number {
    if (isNaN(min) || isNaN(max)) {
        throw 'Error: Only numbers are accepted as arguments.';
    }
    //There are issues with base 8 versus base 10 in some instances, so force it to use base 10.
    return Math.floor(Math.random() * (parseInt(max.toString(), 10) - parseInt(min.toString(), 10) + 1) + parseInt(min.toString(), 10));
};

Array.prototype.empty = function (): Array<any> {
    return this.splice(0, this.length);
};

Array.prototype.isEmpty = function (): boolean {
    if (this.length === 0) {
        return true;
    }
    return false;
};

Array.prototype.each = function (callback: Function): void {
    for (let i: number = 0; i < this.length; i++) {
        callback(i, this[i]);
    }
};

Array.prototype.remove = function (item: any): any {
    let index: number = this.indexOf(item);
    if (index != -1) {
        return this.splice(index, 1);
    }
    return null;
};

Array.prototype.contains = function (partial: string, strict: boolean): boolean {
    for (let i: number = 0; i < this.length; i++) {
        if (!strict && this[i].contains(partial)) {
            return true;
        }
        if (strict && this[i] === partial) {
            return true;
        }
    }
    return false;
};

Array.prototype.indexOfPartial = function (partial: string): number {
    for (let i: number = 0; i < this.length; i++) {
        if (this[i].contains(partial)) {
            return i;
        }
    }
    return -1;
};

/*
 * There are frameworks that auto-generate JSON based on data schemas, but sometimes they
 * return data in inconsistent ways. For example, an array of strings might be returned
 * instead of an array of objects containing strings, etc. because the underlying data at the time
 * only cotains the string value, but when other data is present (in the database, etc.),
 * it will return the object array. Certain convience methods are necessary to force proper formatting.
 */

Array.prototype.toObjectArray = function (objName: string): Array<any> {
    if (objName === undefined || objName === null) {
        throw 'Error: Property name must be provided for conversion.';
    }
    let items: any = this;
    if (typeof (items[0]) === 'string' || typeof (items[0]) === 'number' || typeof (items[0]) === 'boolean') {
        for (let i: number = 0; i < items.length; i++) {
            let val: any = items[i];
            items[i] = {};
            items[i][objName] = val;
        }
        return items;
    }
    else {
        return this;
    }
};

//This doesn't make sense for isEmpty()
Object.prototype.isEmpty = function (obj: string) {
    return (Object.getOwnPropertyNames(obj).length === 0);
};

Object.prototype.getName = function (): string {
    let regex: RegExp = /function (.{1,})\(/;
    let results: RegExpExecArray = regex.exec((this).constructor.toString());
    return (results && results.length > 1) ? results[1] : "";
};

(<any>Object).extend = function(dest: any, src: any) {
    for (let prop in src) {
        dest[prop] = src[prop];
    }
    return dest;
};

Document.prototype.selectOne = function(selector: string): Element {
    return document.querySelector(selector);
};

Document.prototype.selectAll = function(selector: string): NodeListOf<Element> {
    return document.querySelectorAll(selector);
};

Document.prototype.create = function(html: string): Element {
    var placeholder = document.createElement("div");
    placeholder.innerHTML = html;
    return <Element>placeholder.childNodes[0];
};

NodeList.prototype.each = function (callback: Function): void {
    for (let i: number = 0; i < this.length; i++) {
        callback(i, this[i]);
    }
};

NodeList.prototype.last = function (): Element {
    return this[this.length - 1];
};

Element.prototype.selectOne = function(selector: string): Element {
    return this.querySelector(selector);
};

Element.prototype.selectAll = function(selector: string): NodeListOf<Element> {
    return this.querySelectorAll(selector);
};

Element.prototype.attribute = function(name: string, value?: string): string & Element {
    if(value != null) {
        this.setAttribute(name, value);
        return this;
    }
    return this.getAttribute(name);
};

Element.prototype.parent = function(): Element {
    return this.parentNode;
};

Element.prototype.up = function(selector: string): Element {
    var self = this;
    function _upper(selector: string) {
        try {
            let _up = self.parent().parent();
            if(_up.selectOne(selector) != null) {
                _upper(_up);
            }
            return _up.selectOne(selector);
        }
        catch(e) {
            return null;
        }
    } 
    if(self.closest != null) {
        return self.closest(selector);
    }
    return _upper(selector);
};

Element.prototype.first = function(selector: string): Element {
    function _decend(node: Element): Element {
        let _currentNode = node;
        let nodeList: NodeList = _currentNode.childNodes;
        for(let i = 0; i < nodeList.length; i++) {
            if(nodeList[i].nodeName.lower() === selector.lower()) {
                return <Element>nodeList[i];
            }
        }
        _decend(_currentNode);
    }
    return _decend(this);
};

Element.prototype.append = function(html: string): Element {
    this.insertAdjacentHTML('beforeend', html);
    return this;
};

Element.prototype.empty = function(): Element {
    this.innerHTML = "";
    return this;
};

Element.prototype.removeEvent = function(event: string): Element {
    if(this[`on${event}`] != null) {
        this[`on${event}`] = null;
    }
    return this;
};

Element.prototype.addEvent = function(event: string, callback:Function): Element {
    this.addEventListener(event, callback);
    return this;
};

Element.prototype.show = function(): Element {
    let styles = this.attribute("style");
    if(styles != null && styles != "") {
        return this.attribute("style", styles.setValueByKey("display", styles, "block"));
    }
    return this.attribute("style", `${styles};display:block`);
};

Element.prototype.hide = function(): Element {
    let styles = this.attribute("style");
    if(styles != null && styles != "") {
        return this.attribute("style", styles.setValueByKey("display", styles, "none"));
    }
    return this.attribute("style", `${styles};display:none`);
};

Element.prototype.addClass = function(className: string) : Element {
    this.className += ` ${className}`;
    return this;
};

Element.prototype.removeClass = function(className: string) : Element {
    this.className = (<string>this.className).replace(className, "").normalize();
    return this;
};

Element.prototype.toString = function(): string {
    return this.outerHTML;
};

HTMLElement.prototype.clean = function(): HTMLElement {
    this.value = this.value.replace(/\r?\n/g, "\r\n");
    return this;
};

HTMLElement.prototype.val = function(val?: string): string {
    if(val != null) {
        if(this.nodeName.lower() == "textarea") {
            this.innerHTML = val;
        }
        else if(this.nodeName.lower() == "input") {
            switch(this.attribute("type").lower()) {
                case "text":
                    this.attribute("value", val);
                    break;
                case "select":
                    for(let i = 0; i < this.options.length; i++) {
                        if(this.options[i].innerHTML == val) {
                            this.selectedIndex = i;
                            break;
                        }
                    }
                    break;
                case "checkbox":
                    if(val.toBool()) {
                        this.attribute("checked", "checked");
                    }
                    break;
                case "radio":
                    let name: string = this.attribute("name");
                    let radios: NodeListOf<Element> = document.selectAll(`input[type='radio'][name='${name}']`);
                    radios.each(function(idx: number, elem: Element) {
                        if(elem.attribute("value") == val) {
                            elem.attribute("checked", "checked");
                        }
                        else {
                            elem.removeAttribute("checked");
                        }
                    });
                    break;
                default:
                    throw new Error("Error: No [type] attribute on element.");
            }
        }
    }
    else {
        if(this.nodeName.lower() == "textarea") {
            return this.innerHTML;
        }
        else if(this.nodeName.lower() == "input") {
            switch(this.attribute("type").lower()) {
                case "text":
                    return this.attribute("value");
                case "select":
                    return this.options[this.selectedIndex].value;
                case "checkbox":
                    return this.checked;
                case "radio":
                    let name: string = this.attribute("name");
                    return (<HTMLInputElement>document.selectOne(`input[type='radio'][name='${name}']:checked`)).value;
                default:
                    throw new Error("Error: No [type] attribute on element.");
            }
        }
    }
    return val;
};

XMLHttpRequest.prototype.responseJSON = function(): JSON {
    return JSON.parse(this.responseText);
};
