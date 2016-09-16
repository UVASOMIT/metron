interface StringConstructor {
    isNullOrEmpty: (val: any) => boolean;
}

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
}

interface Document {
    select: (selector: string) => Element;
}

interface Element {
    select: (selector: string) => Element;
}

interface HTMLElement {
    clean: () => HTMLElement;
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
    if (String.isNullOrEmpty(this)) {
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

//toPhoneNumber() needs to be a part of some validation mechanism
String.prototype.toPhoneNumber = function (): string {
    try {
        return this.substring(0, 3) + '-' + this.substring(3, 6) + '-' + this.substring(6);
    }
    catch (e) {
        return this;
    }
};

String.prototype.isNullOrEmpty = function (val: any): boolean {
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

Number.prototype.random = function (min: number, max: number): number {
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

Document.prototype.select = function(selector: string): Element {
    return document.querySelector(selector);
};

Element.prototype.select = function(selector: string) : Element {
    return this.querySelector(selector);
};

HTMLElement.prototype.clean = function(): HTMLElement {
    this.value = this.value.replace(/\r?\n/g, "\r\n");
    return this;
};
