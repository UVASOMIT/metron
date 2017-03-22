/// <reference path="metron.extenders.ts" />

type AjaxRequest = string | JSON | XMLDocument;

namespace metron {
    export interface Dictionary {
        setItem: (key: string, value: any) => void;
        getItem: (key: string) => any;
        hasItem: (key: string) => boolean;
        removeItem: (key: string) => any;
        keys: () => Array<string>;
        values: () => Array<any>;
        each: (callback: Function) => void;
        clear: () => void;
    }
    export interface Ajax {
        url: string;
        method: string;
        contentType: string;
        dataType: string;
        data: any;
        async: boolean;
        request: XMLHttpRequest;
        success?: (callback: Function) => XMLHttpRequest;
        error?: (callback: Function) => XMLHttpRequest;
        always?: (callback: Function) => XMLHttpRequest;
        send?: () => void;
    }

    export namespace dictionary {
        (function () {
            function dictionary(obj: any): any {
                this.length = 0;
                this.items = {};
                if (obj !== null) {
                    for (let prop in obj) {
                        if (obj.hasOwnProperty(prop)) {
                            this.items[prop] = obj[prop];
                            this.length++;
                        }
                    }
                }
            }
            dictionary.prototype.setItem = function (key: string, value: any): void {
                if (!this.hasItem(key)) {
                    this.length++;
                }
                this.items[key] = value;
            };
            dictionary.prototype.getItem = function (key: string): any {
                return this.hasItem(key) ? this.items[key] : null;
            };
            dictionary.prototype.hasItem = function (key: string): boolean {
                return this.items.hasOwnProperty(key);
            };
            dictionary.prototype.removeItem = function (key: string): any {
                if (this.hasItem(key)) {
                    this.length--;
                    let item: any = this.items[key];
                    delete this.items[key];
                    return item;
                }
                else {
                    return null;
                }
            };
            dictionary.prototype.keys = function (): Array<string> {
                let keys: Array<string> = [];
                for (let k in this.items) {
                    if (this.hasItem(k)) {
                        keys.push(k);
                    }
                }
                return keys;
            };
            dictionary.prototype.values = function (): Array<any> {
                let values: Array<any> = [];
                for (let k in this.items) {
                    if (this.hasItem(k)) {
                        values.push(this.items[k]);
                    }
                }
                return values;
            };
            dictionary.prototype.each = function (callback: Function): void {
                let i: number = 0;
                for (let key in this.items) {
                    callback(i, key, this.items[key]);
                    i++;
                }
            };
            dictionary.prototype.clear = function (): void {
                this.items = {};
                this.length = 0;
            };
            return dictionary;
        })();
    }
    export namespace web {
        function parseUrl(url: string, obj: any): string {
            let paramPairs: Array<string> = [];
            if (url.contains('?')) {
                let parts: Array<string> = url.split('?');
                url = parts[0];
                paramPairs = paramPairs.concat(parts[1].split('&'));
            }
            for (let prop in obj) {
                if (obj.hasOwnProperty(prop) && !paramPairs.contains(prop, true)) {
                    paramPairs.push(prop + '=' + obj[prop]);
                }
                else if (obj.hasOwnProperty(prop) && paramPairs.contains(prop, true)) {
                    paramPairs[paramPairs.indexOfPartial(prop)] = prop + '=' + obj[prop];
                }
            }
            return url + '?' + paramPairs.join('&');
        }
        export function querystring(obj?: any): Array<string> | string {
            if (typeof (document) !== 'undefined') {
                if (typeof (obj) === 'string' && arguments.length === 1) {
                    let result: Array<any> = [];
                    let match: RegExpExecArray;
                    let re: RegExp = new RegExp('(?:\\?|&)' + obj + '=(.*?)(?=&|$)', 'gi');
                    while ((match = re.exec(document.location.search)) !== null) {
                        result.push(match[1]);
                    }
                    return result;
                }
                else if (typeof (obj) === 'string' && arguments.length > 1) {
                    return [parseUrl(obj, arguments[1])];
                }
                else if (obj != null) {
                    return [parseUrl(document.location.href, obj)];
                }
                else {
                    return document.location.search.substring(1);
                }
            }
            else {
                throw 'Error: No document object found. Environment may not contain a DOM.';
            }
        }
        export function querystringify(obj: any): string {
            return parseUrl("", obj);
        }
        export namespace cookie {
            export function get(name: string): string {
                if (typeof (document) !== 'undefined') {
                    let cookieParts: Array<string> = document.cookie.split(';');
                    for (let i: number = 0; i < cookieParts.length; i++) {
                        let cookieName: string = cookieParts[i].substr(0, cookieParts[i].indexOf("="));
                        let cookieValue: string = cookieParts[i].substr(cookieParts[i].indexOf("=") + 1);
                        if (cookieName.trim() === name) {
                            return cookieValue;
                        }
                    }
                    return null;
                }
                else {
                    throw 'Error: No document object found. Environment may not contain a DOM.';
                }
            }
            export function set(name: string, val: string, date: Date) {
                if (typeof (document) !== 'undefined') {
                    let cookie: string = name + '=' + val + ';path="/"';
                    if (typeof (date) !== 'undefined') {
                        cookie += ';expires=' + date.toUTCString();
                    }
                    document.cookie = cookie;
                }
                else {
                    throw 'Error: No document object found. Environment may not contain a DOM.';
                }
            }
            export function remove(name: string): void {
                if (typeof (document) !== 'undefined') {
                    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
                }
                else {
                    throw 'Error: No document object found. Environment may not contain a DOM.';
                }
            }
        }
        export namespace headers {
            export function get(name: string) {
                if (typeof (document) !== 'undefined') {
                    let request: XMLHttpRequest = new XMLHttpRequest();
                    request.open("HEAD", document.location.href, false);
                    request.send(null);
                    if (name !== undefined) {
                        return request.getResponseHeader(name);
                    }
                    else {
                        return request.getAllResponseHeaders();
                    }
                }
                else {
                    throw 'Error: No document object found. Environment may not contain a DOM.';
                }
            }
        }
        export function ajax(url: string, data: any = {}, method: string = "POST", async: boolean = true, contentType: string = "application/x-www-form-urlencoded; charset=UTF-8", dataType: string = "text", success?: Function, failure?: Function, always?: Function): Ajax {
            function _parseResult(request: XMLHttpRequest): AjaxRequest {
                switch (dataType.lower()) {
                    case "text":
                        return request.responseText;
                    case "json":
                        return request.responseJSON();
                    case "xml":
                        return <XMLDocument>request.responseXML;
                    default:
                        return request.responseText;
                }
            }
            function _send(request: XMLHttpRequest, data: any): void {
                var ajx = this;
                request.open(method, url, async, data);
                request.onreadystatechange = function () {
                    if (request.readyState === 4) {
                        if (request.status === 200) {
                            if (success !== undefined) {
                                success(_parseResult(request));
                            }
                        }
                        if (request.status === 404 || request.status === 500) {
                            if (failure !== undefined) {
                                failure(request);
                            }
                        }
                        if (always !== undefined) {
                            always(request);
                        }
                    }
                };
                request.setRequestHeader("Content-Type", contentType);
                if (url.contains("localhost")) {
                    request.setRequestHeader("Cache-Control", "max-age=0");
                }
                request.send(data);
            }
            let request: XMLHttpRequest = new XMLHttpRequest();
            let requestData = metron.web.querystringify(data);
            if (requestData.startsWith("?")) {
                requestData = requestData.substr(1);
            }
            if (requestData.endsWith("?")) {
                requestData = requestData.substr(0, requestData.length - 2);
            }
            var self = {
                url: url
                , method: method
                , contentType: contentType
                , dataType: dataType
                , data: requestData
                , async: async
                , request: request
                , send: function (): void {
                    _send(request, requestData);
                }
            };
            if (success != null || failure != null || always != null) {
                self.send();
            }
            return self;
        }
        export function get(url: string, params: any = {}, contentType: string = "application/x-www-form-urlencoded; charset=UTF-8", dataType?: string, success?: Function, failure?: Function, always?: Function): Ajax {
            return ajax(url, params, "GET", true, (contentType != null) ? contentType : "application/x-www-form-urlencoded; charset=UTF-8", dataType, success, failure, always);
        }
        export function load(url: string, params: any = {}, contentType: string = "application/x-www-form-urlencoded; charset=UTF-8", dataType?: string, success?: Function, failure?: Function, always?: Function): Ajax {
            return ajax(url, params, "GET", false, (contentType != null) ? contentType : "application/x-www-form-urlencoded; charset=UTF-8", dataType, success, failure, always);
        }
        export function post(url: string, params: any = {}, contentType: string = "application/x-www-form-urlencoded; charset=UTF-8", dataType?: string, success?: Function, failure?: Function, always?: Function): Ajax {
            return ajax(url, params, "POST", true, (contentType != null) ? contentType : "application/x-www-form-urlencoded; charset=UTF-8", dataType, success, failure, always);
        }
        export function postAll(url: string, params: any = {}, contentType: string = "application/x-www-form-urlencoded; charset=UTF-8", dataType?: string, success?: Function, failure?: Function, always?: Function): Ajax {
            return ajax(url, JSON.stringify({ params }), "POST", true, (contentType != null) ? contentType : "application/x-www-form-urlencoded; charset=UTF-8", dataType, success, failure, always);
        }
        export function put(url: string, params: any = {}, contentType: string = "application/x-www-form-urlencoded; charset=UTF-8", dataType?: string, success?: Function, failure?: Function, always?: Function): Ajax {
            return ajax(url, params, "PUT", true, (contentType != null) ? contentType : "application/x-www-form-urlencoded; charset=UTF-8", dataType, success, failure, always);
        }
        export function putAll(url: string, params: any = {}, contentType: string = "application/x-www-form-urlencoded; charset=UTF-8", dataType?: string, success?: Function, failure?: Function, always?: Function): Ajax {
            return ajax(url, JSON.stringify({ params }), "PUT", true, (contentType != null) ? contentType : "application/x-www-form-urlencoded; charset=UTF-8", dataType, success, failure, always);
        }
        export function remove(url: string, params: any = {}, contentType: string = "application/x-www-form-urlencoded; charset=UTF-8", dataType?: string, success?: Function, failure?: Function, always?: Function): Ajax {
            return ajax(url, params, "DELETE", true, (contentType != null) ? contentType : "application/x-www-form-urlencoded; charset=UTF-8", dataType, function (data) {
                if (data != null && data instanceof Array && data.length > 0) {
                    success(data[0])
                }
                else {
                    success(data);
                }
            }, failure, always);
        }
    }
    export namespace observer {
        (function () {
            let callback: Function;
            let frequency: number;
            let isExecuting: boolean = false;
            var timer: number;
            function setupInterval(pe: any) {
                timer = setInterval(
                    function () {
                        pe.onTimer(pe);
                    },
                    frequency * 1000
                );
            }
            function execute(pe: any) {
                callback(pe);
            }
            function onTimer(pe: any) {
                if (!isExecuting) {
                    try {
                        isExecuting = true;
                        execute(pe);
                        isExecuting = false;
                    } catch (e) {
                        isExecuting = false;
                        throw e;
                    }
                }
            }
            return {
                watch: function (callback: Function, frequency: number) {
                    this.callback = callback;
                    this.frequency = frequency;
                    this.setupInterval(this);
                },
                stop: function (): void {
                    if (!timer) {
                        return;
                    }
                    clearInterval(timer);
                    timer = null;
                }
            };
        })();
    }
    export namespace guid {
        (function () {
            function generateGUIDPart(): string {
                return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
            }
            return {
                //Note that JavaScript doesn't actually have GUID or UUID functionality.
                //This is as best as it gets.
                newGuid: function (): string {
                    return (generateGUIDPart() + generateGUIDPart() + "-" + generateGUIDPart() + "-" + generateGUIDPart() + "-" + generateGUIDPart() + "-" + generateGUIDPart() + generateGUIDPart() + generateGUIDPart());
                }
            };
        })();
    }
}

if (typeof (document) !== 'undefined' && typeof (document.location) !== 'undefined') {
    if (typeof ((<any>document.location).querystring) === 'undefined') {
        (<any>document.location).querystring = metron.web.querystring;
    }
    if (typeof ((<any>document.location).headers) === 'undefined') {
        (<any>document.location).headers = metron.web.headers;
    }
}
