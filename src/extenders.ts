interface String {
    lower: () => string;
    upper: () => string;
    ltrim: () => string;
    rtrim: () => string;
    //trim: () => string;
    normalize: () => string;
    startsWith: (part: string, pos?: number) => boolean;
    endsWith: (part: string, pos?: number) => boolean;
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
    getValueByKey: (key: string) => string;
    setValueByKey: (key: string, replacement: string) => string;
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
    parent: () => Element;
    first: (selector: string) => Element;
    append: (html: string) => Element;
    empty: () => Element;
    drop: () => Element;
    removeEvent: (event: string) => Element;
    addEvent: (event: string, callback: Function, overwrite?: boolean) => Element;
    show: (t?: string) => Element | void;
    hide: () => Element;
    toggle:()=> Element;
    addClass: (className: string) => Element;
    removeClass: (className: string) => Element;
    asString: () => string;
    selectOne: (selector: string) => Element;
    selectAll: (selector: string) => NodeListOf<Element>;
    hasMatches: (selector: string) => boolean;
    up: (selector: string) => Element;
    isHidden: () => Boolean;
    val: (val?: string) => string;
}

interface HTMLElement {
    clean: () => HTMLElement;
    val: (val?: string) => string;
}

interface XMLHttpRequest {
    responseJSON?: () => JSON;
}

function getElementValue(_self: any, val?: string): string {
    if(val != null) {
        if(_self.nodeName.lower() == "textarea") {
            _self.innerHTML = val;
            try {
                _self.innerText = val;
            }
            catch (e) { }
            try {
                _self.value = val;
            }
            catch (e) { }
        }
        else if(_self.nodeName.lower() == "input" && _self.attribute("type") != null) {
            switch(_self.attribute("type").lower()) {
                case "file":
                    break;
                case "checkbox":
                    if (<boolean><any>val) {
                        _self.checked = true;
                    }
                    else {
                        _self.checked = false;
                    }
                    break;
                case "radio":
                    const name: string = _self.attribute("name");
                    const radios: NodeListOf<Element> = document.selectAll(`input[type='radio'][name='${name}']`);
                    radios.each(function(idx: number, elem: Element) {
                        if(elem.attribute("value") == val) {
                            (<HTMLInputElement>elem).checked = true;
                        }
                        else {
                            (<HTMLInputElement>elem).checked = false;
                        }
                    });
                    break;
                    case "date":
                        let date: string = val;
                        if (date.contains("T")) {
                            date = date.slice(0, date.indexOf("T"));
                        }
                        if (metron.globals.requiresDateTimePolyfill && /\d{4}-\d{2}-\d{2}/g.test(val)) {
                            _self.value = `${date.slice(5, 7)}/${date.slice(8, 10)}/${date.slice(0, 4)}`;
                        }
                        else if (metron.globals.requiresDateTimePolyfill && /\d{2}\/\d{2}\/\d{4}/g.test(val)) {
                            _self.value = date;
                        } else if (/\d{2}\/\d{2}\/\d{4}/g.test(val)) {
                            _self.value = `${date.slice(6, 10)}-${date.slice(0, 2)}-${date.slice(3, 5)}`;
                        } else {
                            _self.value = date;
                        }
                    break;
                case "time":
                    const time: string = val;
                    if (metron.globals.requiresDateTimePolyfill) {
                        if (/\d{2}:\d{2}:\d{2}/g.test(time)) {
                            let hour: number = Number(time.slice(0, 2));
                            const period: string = hour > 11 ? "PM" : "AM";
                            hour = hour > 12 ? hour - 12 : hour;
                            const hourStr: string = hour > 9 ? hour.toString() : "0" + hour.toString();
                            _self.value = `${hourStr}:${time.slice(3, 5)} ${period}`;
                        }
                        else {
                            _self.value = time;
                        }
                    }
                    else {
                        if (/\d{2}:\d{2}:\d{2}/g.test(time)) {
                            _self.value = time.slice(0, 5);
                        }
                        else {
                            _self.value = time;
                        }
                    }
                    break;
                default:
                _self.value = val;
                    break;
            }
        }
        else if(_self.nodeName.lower() == "select") {
            for(let i = 0; i < _self.options.length; i++) {
                if(_self.options[i].value == val) {
                    _self.selectedIndex = i;
                    break;
                }
            }
        }
    }
    else {
        if (_self.nodeName.lower() == "textarea") {
            try {
                return _self.value;
            }
            catch (e) { }
            if (_self.innerText != null && (<string>_self.innerText).trim() != "") {
                return _self.innerText;
            }
            else if (_self.innerHTML != null && _self.innerHTML.trim() != "") {
                return _self.innerHTML;
            }
            return null;
        }
        else if(_self.nodeName.lower() == "input" && _self.attribute("type") != null) {
            switch(_self.attribute("type").lower()) {
                case "checkbox":
                    return _self.checked;
                case "radio":
                    const name: string = _self.attribute("name");
                    return (<HTMLInputElement>document.selectOne(`input[type='radio'][name='${name}']:checked`) != null) ? (<HTMLInputElement>document.selectOne(`input[type='radio'][name='${name}']:checked`)).value : null;
                case "time":
                    if (metron.globals.requiresDateTimePolyfill && /\d{2}:\d{2} \S{2}/g.test((<any>self).value)) {
                        const period: string = _self.value.slice(6, 8);
                        const hour: number = Number(_self.value.slice(0, 2));
                        const hourStr: string = (period == "PM" && hour < 12) ? (hour + 12).toString() : hour.toString();
                        return `${hourStr}:${_self.value.slice(3, 5)}:00`;
                    }
                    else {
                        return _self.value;
                    }
                default:
                    return _self.value;
            }
        }
        else if(_self.nodeName.lower() == "select") {
            return _self.options[_self.selectedIndex].value;
        }
    }
    return val;
}

String.prototype.lower = function (): string {
    return this.toLowerCase();
};

String.prototype.upper = function (): string {
    return this.toUpperCase();
};

String.prototype.trim = function (): string {
    return this.replace(/^\s+|\s+$/g, "");
};

String.prototype.ltrim = function (): string {
    return this.replace(/^\s+/, "");
};

String.prototype.rtrim = function (): string {
    return this.replace(/\s+$/, "");
};

String.prototype.normalize = function (): string {
    return this.replace(/^\s*|\s(?=\s)|\s*$/g, "");
};

String.prototype.startsWith = function (part: string, pos?: number): boolean {
    return this.slice(0, part.length) == part;
};

String.prototype.endsWith = function (part: string, pos?: number): boolean {
    return this.slice(part.length) == part;
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

String.prototype.getValueByKey = function (key: string): string {
    var collection: Array<string> = this.split(";");
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

String.prototype.setValueByKey = function (key: string, replacement: string): string {
    var collection: Array<string> = this.split(";");
    var returnCollection: Array<string> = [];
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
 * it will return the object array. Certain convenience methods are necessary to force proper formatting.
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

(<any>Object).extend = function(dest: any, src: any) {
    for (let prop in src) {
        if(src.hasOwnProperty(prop)) {
            dest[prop] = src[prop];
        }
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

Element.prototype.selectOne = function(selector: string): Element | HTMLElement {
    return this.querySelector(selector);
};

Element.prototype.selectAll = function(selector: string): NodeListOf<Element> | NodeListOf<HTMLElement> {
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

Element.prototype.hasMatches = function(selector: string): boolean {
    if((<any>this).matches != null) {
        return (<any>this).matches(selector);
    }
    else if((<any>this).msMatchesSelector != null) {
        return (<any>this).msMatchesSelector(selector);
    }
    return false;
};

Element.prototype.up = function (selector: string): Element {
    var el: Element = this;
    if((<any>el).closest != null) {
        return (<any>el).closest(selector);
    }
    else {
        while (el) {
            if (el.hasMatches(selector)) {
                return <Element>el;
            }
            el = el.parentElement;
        }
    }
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

Element.prototype.drop = function(): Element {
    var self = this;
    var parent = self.parentNode;
    parent.removeChild(self);
    return self;
};

Element.prototype.removeEvent = function (event: string): Element {
    if (this.id == "")
        return this;

    if (metron.globals.handlers[this.id])
    {
        if (metron.globals.handlers[this.id][event])
        {
            for (var i = 0; i < metron.globals.handlers[this.id][event].length; i++)
                this.removeEventListener(event, metron.globals.handlers[this.id][event][i]);
            metron.globals.handlers[this.id][event].empty();
        }
    }
    return this;
};

Element.prototype.addEvent = function (event: string, callback: Function, overwrite: boolean = false): Element {
    if (overwrite) {
        this.removeEvent(event);
    }
    this.addEventListener(event, callback);
    if (this.id == "") {
        this.id = metron.guid.newGuid();
    }
    if (!metron.globals.handlers[this.id]) {
        metron.globals.handlers[this.id] = {};
    }
    if (!metron.globals.handlers[this.id][event]) {
        metron.globals.handlers[this.id][event] = [];
    }
    metron.globals.handlers[this.id][event].push(callback);
    return this;
};

Element.prototype.show = function(t: string = "block"): Element | void {
    let styles = this.attribute("style");
    if(styles != null && styles != "") {
        return this.attribute("style", styles.setValueByKey("display", t));
    }
    return this.attribute("style", `display:${t}`);
};

Element.prototype.hide = function(): Element {
    let styles = this.attribute("style");
    if(styles != null && styles != "") {
        return this.attribute("style", styles.setValueByKey("display", "none"));
    }
    return this.attribute("style", `display:none;`);
};

Element.prototype.toggle = function(): Element {
    if (!(this.offsetWidth || this.offsetHeight || this.getClientRects().length)){
        return this.show();
    }
    else {
        return this.hide();
    }
};

Element.prototype.addClass = function(className: string) : Element {
    this.className += ` ${className}`;
    this.className = this.className.trim();
    return this;
};

Element.prototype.removeClass = function(className: string) : Element {
    this.className = (<string>this.className).replace(className, "").normalize();
    return this;
};

Element.prototype.asString = function(): string {
    return this.outerHTML;
};

Element.prototype.isHidden = function(): boolean {
    return (this.offsetParent === null);
};

Element.prototype.val = function(val?: string): string {
    return getElementValue(this, val);
}

HTMLElement.prototype.clean = function(): HTMLElement {
    this.value = this.value.replace(/\r?\n/g, "\r\n");
    return this;
};

HTMLElement.prototype.val = function(val?: string): string {
    return getElementValue(this, val);
};

XMLHttpRequest.prototype.responseJSON = function(): JSON {
    try {
        return JSON.parse(this.responseText);
    }
    catch(e) {
        return JSON.parse(`{ "data": "${this.responseText}" }`);
    }
};
