namespace metron {
    export namespace tools {
        export function reduceObject<T>(key: string, obj: T[]): Array<any> {
            let resp = [];
            obj.forEach(function (val, idx) {
                for (let k in val) {
                    if (k === key) {
                        resp.push(val[k]);
                    }
                }
            });
            return resp;
        }
        export function normalizeModelItems(obj: any, model: string, first: boolean = false): Array<any> {
            var result = obj;
            if (!first) {
                if (obj[model] != null) {
                    result = obj[model];
                }
            }
            else {
                if (obj[model] != null) {
                    result = obj[model][0];
                }
            }
            return result;
        }
        export function normalizeModelData(obj: any): any {
            for (let k in obj) {
                if (obj[k] == null || obj[k] === "null") {
                    delete obj[k];
                }
            }
            return obj;
        }
        export function formatOptions(attr: string, opt: OptionTypes = OptionTypes.KEYVALUE): any {
            var pairDivider;
            var optDivider;
            switch (opt) {
                case OptionTypes.QUERYSTRING:
                    pairDivider = "&";
                    optDivider = "=";
                    break;
                default:
                    pairDivider = ";";
                    optDivider = ":";
                    break;
            }
            var pairs = attr.split(pairDivider);
            if (pairs[pairs.length - 1].trim() == "") {
                pairs.pop();
            }
            var result = "";
            for (let i = 0; i < pairs.length; i++) {
                let p = pairs[i].split(optDivider);
                try {
                    result += `"${p[0].trim()}":"${p[1].trim()}"`;
                    if (i != (pairs.length - 1)) {
                        result += ",";
                    }
                }
                catch (e) {
                    throw new Error("Error: Invalid key/value pair!");
                }
            }
            var response = null;
            try {
                response = JSON.parse(`{${result}}`);
            }
            catch (e) {
                throw new Error("Error: Invalid JSON for options!");
            }
            return response;
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
        export function loadJSON(url: string, callback: Function): void {
            if (!url.contains("://")) {
                url = `${window.location.protocol}//${normalizeURL(window.location.host)}/${url}`;
            }
            metron.web.get(`${url}`, {}, null, "JSON", function (data: JSON) {
                if (callback != null) {
                    callback(data);
                }
            });
        }
        export function getMatching(text: string, regex: RegExp) {
            let match = regex.exec(text);
            if (match[1] !== undefined) {
                if (match[1].contains("\"")) { //Edge isn't handling regex matches correctly
                    return match[1].split("\"")[0];
                }
                return match[1];
            }
            return null;
        }
        export function getDataPrimary(key: string, values: string): any {
            return values.getValueByKey(key);
        }
        export function formatMessage(message: string, length?: number, closetags?: boolean): string {
            try {
                let len = (length != null && length > 0) ? length : 15;
                if(closetags && typeof(message) !== "string") {
                    let result = `${(<Element>message).innerHTML.truncateWordsWithHtml(len)}...`;
                    (<Element>message).innerHTML = result;
                    return result;
                }
                if (message.split(" ").length > len) {
                    
                    return `${message.truncateWords(len)}...`;
                }
            }
            catch (e) {
            }
            return message;
        }
        export function eventEnumToString(e: metron.Event): string {
            switch(e) {
                case metron.Event.INIT:
                    return "init";
                case metron.Event.LOAD_FILTERS:
                    return "loadFilters";
                case metron.Event.APPLY_VIEW_EVENTS:
                    return "applyViewEvents";
                case metron.Event.POPULATE_LISTING:
                    return "populateListing";
                case metron.Event.UNDO_LAST:
                    return "undoLast";
                case metron.Event.CALL_LISTING:
                    return "callListing";
                case metron.Event.SAVE:
                    return "save";
                case metron.Event.LOAD_FORM:
                    return "loadForm";
                case metron.Event.LOAD_SELECTS:
                    return "loadSelects";
                case metron.Event.CLEAR_FORM:
                    return "clearForm";
                case metron.Event.NEW:
                    return "new";
                case metron.Event.UNDO:
                    return "undo";
                case metron.Event.DOWNLOAD:
                    return "download";
                case metron.Event.EDIT:
                    return "edit";
                case metron.Event.DELETE:
                    return "delete";
                case metron.Event.CANCEL:
                    return "cancel";
                default:
                    throw new Error("Error: Invalid enum.");
            }
        }
        export function formatDecimal(num: number): string {
            return num.toFixed(2);
        }
        export function formatDate(datetime: string): string {
            if (!String.isNullOrEmpty(datetime)) {
                let d = new Date(datetime);
                let m = d.getMonth() + 1;
                let mm = m < 10 ? "0" + m : m;
                let dd = d.getDate();
                let ddd = dd < 10 ? "0" + dd : dd;
                let y = d.getFullYear();
                return `${mm}-${ddd}-${y}`;
            }
            return "";
        }
        export function formatDateTime(datetime: string): string {
            if (!String.isNullOrEmpty(datetime)) {
                let d = new Date(datetime);
                let m = d.getMonth() + 1;
                let mm = m < 10 ? "0" + m : m;
                let dd = d.getDate();
                let ddd = dd < 10 ? "0" + dd : dd;
                let y = d.getFullYear();
                let time = formatTime(d, true);
                return `${mm}-${ddd}-${y} ${time}`;
            }
            return "";
        }
        export function formatTime(datetime: string | Date, isFullDate = false): string {
            var d: Date;
            if (isFullDate) {
                d = <Date><any>datetime;
            }
            else {
                let c: Array<string> = (<string><any>datetime).split(":");
                d = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), parseInt(c[0], 10), parseInt(c[1], 10), parseInt(c[2], 10))
            }
            var h = d.getHours();
            var m = d.getMinutes();
            var ampm = h >= 12 ? "pm" : "am";
            h = h % 12;
            h = h ? h : 12;
            var mm = m < 10 ? "0" + m : m;
            var result = `${h}:${mm} ${ampm}`;
            return result;
        }
        export function formatBoolean(b: string): string {
            if (b.toBool()) {
                return "yes";
            }
            return "no";
        }
    }
}
