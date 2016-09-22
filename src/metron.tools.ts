/// <reference path="metron.extenders.ts" />

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
        export function getDataPrimary(key: string, values: string): any {
            return this.getValueByKey(key, values);
        }
        export function getValueByKey(key: string, values: string): any {
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
