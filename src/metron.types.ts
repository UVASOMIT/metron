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
    export interface Pivot {
          parent: HTMLElement
        , current: Element
        , next: Element
        , previous: Element
    }
    export enum OptionTypes {
          QUERYSTRING = 1
        , KEYVALUE = 2
    }
    export enum Event {
          INIT = 0
        , LOAD_FILTERS = 1
        , APPLY_VIEW_EVENTS = 2
        , POPULATE_LISTING = 3
        , UNDO_LAST = 4
        , CALL_LISTING = 5
        , SAVE = 6
        , LOAD_FORM = 7
        , LOAD_SELECTS = 8
        , CLEAR_FORM = 9
    }
    export const LIST = "list";
    export const LOOKUP = "lookup";
    export const FORM = "form";
    export const VIEW = "view";
    export const INFO = "info";
    export const WARNING = "warning";
    export const DANGER = "danger";
    export const SUCCESS = "success";
    export const DB = "metron.db";
    export const DBVERSION = 1;
    export const STORE = "metron.store";
}
