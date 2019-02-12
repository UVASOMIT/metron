import { OptionTypes, Event } from "./schema";

export module tools {
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
    export function eventEnumToString(e: Event): string {
        switch(e) {
            case Event.INIT:
                return "init";
            case Event.LOAD_FILTERS:
                return "loadFilters";
            case Event.APPLY_VIEW_EVENTS:
                return "applyViewEvents";
            case Event.POPULATE_LISTING:
                return "populateListing";
            case Event.UNDO_LAST:
                return "undoLast";
            case Event.CALL_LISTING:
                return "callListing";
            case Event.SAVE:
                return "save";
            case Event.LOAD_FORM:
                return "loadForm";
            case Event.LOAD_SELECTS:
                return "loadSelects";
            case Event.CLEAR_FORM:
                return "clearForm";
            case Event.NEW:
                return "new";
            case Event.UNDO:
                return "undo";
            case Event.DOWNLOAD:
                return "download";
            case Event.EDIT:
                return "edit";
            case Event.DELETE:
                return "delete";
            case Event.CANCEL:
                return "cancel";
            default:
                throw new Error("Error: Invalid enum.");
        }
    }
    export function formatDecimal(num: number): string {
        let dec = parseFloat(num.toString());
        return dec.toFixed(2);
    }
    export function formatDate(datetime: string): string {
        if (!String.isNullOrEmpty(datetime)) {
            let d: Date = convertDateStringToDate(datetime);
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
            let d: Date = convertDateStringToDate(datetime);
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
            if ((<string>datetime).length) {
                d = convertDateStringToDate(<string>datetime);
            } else {
                d = <Date><any>datetime;
            }
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
    export function convertDateStringToDate(datetime: string): Date {
        if (datetime.indexOf("T") > 0 && datetime.indexOf("-") > 0 && datetime.toLowerCase().indexOf("gmt") == -1) {
            let dateString: string = datetime.substring(0, datetime.indexOf("T"));
            let dateArray: Array<string> = dateString.split("-");
            let timeString: string = datetime.substring(datetime.indexOf("T") + 1, datetime.length);
            let timeArray: Array<string> = timeString.split(":");
            return new Date(parseInt(dateArray[0]), parseInt(dateArray[1]) - 1, parseInt(dateArray[2]), parseInt(timeArray[0], 10), parseInt(timeArray[1], 10), parseInt(timeArray[2], 10), 0);
        } else if (datetime.indexOf(" ") > 0 && datetime.indexOf("/") > 0) {
            let dateString: string = datetime.substring(0, datetime.indexOf(" "));
            let dateArray: Array<string> = dateString.split("/");
            let timeString: string = datetime.substring(datetime.indexOf(" ") + 1, datetime.length);
            let timeArray: Array<string> = timeString.split(":");
            return new Date(parseInt(dateArray[2]), parseInt(dateArray[0]) - 1, parseInt(dateArray[1]), parseInt(timeArray[0], 10), parseInt(timeArray[1], 10), parseInt(timeArray[2], 10), 0);
        }
        return new Date(datetime);
    }
    export function formatBoolean(b: string): string {
        if (b.toBool()) {
            return "yes";
        }
        return "no";
    }
}
