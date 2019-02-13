import { tools } from "./tools";
import { OptionTypes, AjaxRequest, Ajax } from "./schema";

export module web {
    function parseUrl(url: string, obj: any, encode: boolean = false): string {
        let paramPairs: Array<string> = [];
        if (url.contains('?')) {
            let parts: Array<string> = url.split('?');
            url = parts[0];
            paramPairs = paramPairs.concat(parts[1].split('&'));
        }
        for (let prop in obj) {
            if (obj.hasOwnProperty(prop) && !paramPairs.contains(prop, true)) {
                let item = (encode) ? encodeURIComponent(obj[prop]) : obj[prop];
                paramPairs.push(prop + '=' + item);
            }
            else if (obj.hasOwnProperty(prop) && paramPairs.contains(prop, true)) {
                let item = (encode) ? encodeURIComponent(obj[prop]) : obj[prop];
                paramPairs[paramPairs.indexOfPartial(prop)] = prop + '=' +item;
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
    export function hash(key?: string): string[] | any {
        var hash = document.location.hash;
        if (hash.substr(0, 1) == "#") {
            hash = hash.substr(1);
        }
        if (hash.substr(0, 1) == "/") {
            hash = hash.substr(1);
        }
        if (hash.length > 1) {
            if (hash.indexOf("/") != -1) {
                try {
                    hash = hash.split("/")[1];
                }
                catch (e) {
                    console.log(`Error: Failed to parse hash value: ${e}`);
                }
            }
            try {
                const result = tools.formatOptions(hash, OptionTypes.QUERYSTRING);
                if(key != null) {
                    return [result[key]];
                }
                return result;
            }
            catch(e) {
                console.log(`Error formatting has values: ${e}`);
            }
        }
    }
    export function querystringify(obj: any, encode = false): string {
        return parseUrl("", obj, encode);
    }
    export function loadJSON(url: string, callback: Function): void {
        if (!url.contains("://")) {
            url = `${window.location.protocol}//${normalizeURL(window.location.host)}/${url}`;
        }
        web.get(`${url}`, {}, null, "JSON", function (data: JSON) {
            if (callback != null) {
                callback(data);
            }
        });
    }
    export function cleanURL(url: string): string {
        if (url.startsWith("//")) {
            url = url.substring(1);
        }
        if (url.endsWith("?")) {
            url = url.substring(0, url.length - 1);
        }
        if (url == "/") {
            return "";
        }
        return url;
    }
    export function normalizeURL(url: string): string {
        if (url.endsWith("/")) {
            return url.substr(0, (url.length - 2));
        }
        return url;
    }
    export module cookie {
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
    export module headers {
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
    export function ajax(url: string, data: any = {}, method: string = "POST", async: boolean = true, contentType: string = "application/x-www-form-urlencoded; charset=UTF-8", dataType: string = "text", success?: Function, failure?: Function, always?: Function, headers?: any): Ajax {
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
                    if (request.status === 404 || request.status === 405 || request.status === 500) {
                        if (failure !== undefined) {
                            failure(request.responseText, request.responseJSON(), request.responseXML);
                        }
                        else {
                            (<HTMLElement>document.querySelector("[data-m-segment='alert']").addClass("danger")).innerHTML = `<p>${(request.responseText != null && request.responseText != "") ? request.responseText : "Error: A problem has occurred while attempting to complete the last operation!"}</p>`;
                            document.querySelector("[data-m-segment='alert']").show();
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
            if(headers != null) {
                for(let k in headers) {
                    if(headers.hasOwnProperty(k)) {
                        request.setRequestHeader(k, headers[k]);
                    }
                }
            }
            request.send(data);
        }
        let request: XMLHttpRequest = new XMLHttpRequest();
        let requestData = (typeof(data) !== "string") ? web.querystringify(data, true) : data;
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
    export function get(url: string, params: any = {}, contentType: string = "application/x-www-form-urlencoded; charset=UTF-8", dataType?: string, success?: Function, failure?: Function, always?: Function, headers?: any): Ajax {
        return ajax(url, params, "GET", true, (contentType != null) ? contentType : "application/x-www-form-urlencoded; charset=UTF-8", dataType, success, failure, always);
    }
    export function post(url: string, params: any = {}, contentType: string = "application/x-www-form-urlencoded; charset=UTF-8", dataType?: string, success?: Function, failure?: Function, always?: Function, headers?: any): Ajax {
        return ajax(url, params, "POST", true, (contentType != null) ? contentType : "application/x-www-form-urlencoded; charset=UTF-8", dataType, success, failure, always);
    }
    export function postAll(url: string, params: any = {}, contentType: string = "application/json;charset=utf-8", dataType?: string, success?: Function, failure?: Function, always?: Function, headers?: any): Ajax {
        return ajax(url, JSON.stringify({ "data": params }), "POST", true, (contentType != null) ? contentType : "application/json;charset=utf-8", dataType, success, failure, always);
    }
    export function put(url: string, params: any = {}, contentType: string = "application/x-www-form-urlencoded; charset=UTF-8", dataType?: string, success?: Function, failure?: Function, always?: Function, headers?: any): Ajax {
        return ajax(url, params, "PUT", true, (contentType != null) ? contentType : "application/x-www-form-urlencoded; charset=UTF-8", dataType, success, failure, always);
    }
    export function putAll(url: string, params: any = {}, contentType: string = "application/json;charset=utf-8", dataType?: string, success?: Function, failure?: Function, always?: Function, headers?: any): Ajax {
        return ajax(url, JSON.stringify({ "data": params }), "PUT", true, (contentType != null) ? contentType : "application/json;charset=utf-8", dataType, success, failure, always);
    }
    export function remove(url: string, params: any = {}, contentType: string = "application/x-www-form-urlencoded; charset=UTF-8", dataType?: string, success?: Function, failure?: Function, always?: Function, headers?: any): Ajax {
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
