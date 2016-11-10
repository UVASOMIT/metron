/// <reference path="metron.extenders.ts" />
/// <reference path="metron.ts" />

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
            if(!first) {
                if(obj[model] != null) {
                    result = obj[model];
                }
            }
            else {
                if(obj[model] != null) {
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
            if(url.endsWith("/")) {
                return url.substr(0, (url.length - 2));
            }
            return url;
        }
        export function loadJSON(url: string, callback: Function): void {
            if(!url.contains("://")) {
                url = `${window.location.protocol}//${normalizeURL(window.location.host)}/${url}`;
            }
            metron.web.load(`${url}`, {}, null, "JSON", function(data: JSON) {
                if(callback != null) {
                    console.log(data);
                    callback(data);
                }
            });
        }
        export function getMatching(text: string, regex: RegExp) {
            let match = regex.exec(text);
            if(match[1] !== undefined) {
                return match[1];
            }
            return null;
        }
        export function getDataPrimary(key: string, values: string): any {
            return values.getValueByKey(key);
        }
        export function formatMessage(message: string, length?: number): string {
            try {
                let len = (length != null && length > 0) ? length : 15;
                if (message.split(" ").length > len) {
                    return message.truncateWords(len) + "...";
                }
            }
            catch (e) {
            }
            return message;
        }
        export function formatDate(datetime: string): string {
            if (datetime != null && datetime.indexOf("T") != -1) {
                return datetime.split("T")[0];
            }
            return "";
        }
        export function formatDateTime(datetime: string): string {
            if (datetime != null && datetime.indexOf("T") != -1) {
                return datetime.replace("T", " ").split(".")[0];
            }
            return "";
        }
        export function formatDecimal(num: number): string {
            return num.toFixed(2);
        }
    }
}
