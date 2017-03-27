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
    export enum OptionTypes {
            QUERYSTRING = 1
            , KEYVALUE = 2
    }
    export const INFO = "info";
    export const WARNING = "warning";
    export const DANGER = "danger";
    export const SUCCESS = "success";
}
