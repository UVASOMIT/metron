import { tools } from "./tools";
import { OptionTypes, m } from "./schema";
import { web } from "./web";

export module routing {
    export function config(options: any): void {
        m.globals.pager.root = options && options.root ? '/' + clearSlashes(options.root) + '/' : '/';
    }
    export function getFragment(): string {
        let match = window.location.href.match(/#(.*)$/);
        let fragment = match ? match[1] : "";
        if(fragment.lastIndexOf("/") != -1) {
            fragment = fragment.substring(0, fragment.lastIndexOf("/"));
        }
        return clearSlashes(fragment);
    }
    export function clearSlashes(path: string): string {
        return path.toString().replace(/\/$/, "").replace(/^\//, "");
    }
    export function add(re, handler): void {
        if(typeof re == "function") {
            handler = re;
            re = "";
        }
        m.globals.pager.pages.push({ re: re, handler: handler});
    }
    export function remove(param: any): void {
        for(let i = 0, r; i < m.globals.pager.pages.length, r = m.globals.pager.pages[i]; i++) {
            if(r.handler === param || r.re.toString() === param.toString()) {
                m.globals.pager.pages.splice(i, 1); 
            }
        }
    }
    export function flush(): void {
        m.globals.pager.pages = [];
        m.globals.pager.root = "/";
    }
    export function check(f?: string): any {
        var fragment = f || getFragment();
        for(var i = 0; i < m.globals.pager.pages.length; i++) {
            var match = fragment.match(m.globals.pager.pages[i].re);
            if(match) {
                match.shift();
                m.globals.pager.pages[i].handler.apply({}, match);
                return m.globals.pager;
            }           
        }
        return m.globals.pager;
    }
    export function listen(): void {
        var current = getFragment();
        var fn = function() {
            if(current !== getFragment()) {
                current = getFragment();
                check(current);
            }
        }
        clearInterval(m.globals.pager.interval);
        m.globals.pager.interval = setInterval(fn, 50);
    }
    export function navigate(path: string, replace: boolean = false, callback?: Function): void {
        path = path ? path : '';
        if(replace) {
            history.replaceState(null, null, `#/${path}/`);
        }
        else {
            history.pushState(null, null, `#/${path}/`);
        }
        if(callback !== undefined) {
            callback();
        }
    }
    export function setRouteUrl(name: string, wsqs: string, wantsReplaceHash: boolean = false): void {
        var hash = (wsqs.length > 1) ? wsqs.substr(1) : "";
        if (hash != "" && document.location.search != null) {
            try {
                let hashItems = tools.formatOptions(hash, OptionTypes.QUERYSTRING);
                let qsItems = tools.formatOptions((document.location.search.startsWith("?") ? document.location.search.substr(1) : document.location.search), OptionTypes.QUERYSTRING);
                for (let h in hashItems) {
                    if (hashItems.hasOwnProperty(h)) {
                        if (qsItems[h] != null) {
                            delete hashItems[h];
                        }
                    }
                }
                hash = web.querystringify(hashItems).substr(1);
            }
            catch (e) {
                console.log(`Error: failed to parse query string and hash. ${e}`);
            }
        }
        if (name != null) {
            hash = `/${name}/${hash}`;
        }
        m.globals.hashLoadedFromApplication = true;
        if (hash != null && hash != "") {
            (wantsReplaceHash) ? document.location.hash = `#${hash}` : history.replaceState({}, "", `#${hash}`);
        }
    }
    export function getRouteUrl(filters?: any): any {
        var result = web.hash();
        if (filters != null) {
            for (let h in result) {
                if (result.hasOwnProperty(h)) {
                    if (filters[h] != null) { //This should be checking for undefined.
                        delete result[h];
                    }
                }
            }
        }
        return result;
    }
    export function getRouteName(): string {
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
                    hash = hash.split("/")[0];
                }
                catch (e) {
                    console.log(`Error: Failed to get routing. ${e}`);
                    return null;
                }
            }
            return hash;
        }
        return null;
    }
    export function getApplicationRoot(page: string): string {
        let root: string = (document.querySelector("body[data-m-root]") != null) ? `${document.querySelector("body[data-m-root]").attribute("data-m-root")}` : null;
        if (root == null) {
            root = tools.getMatching(page, /\{\{m:root=\"(.*)\"\}\}/g);
        }
        m.config["config.root"] = (root != null) ? root : "";
        return root;
    }
    export function getApplicationName(page: string): string {
        let appName: string = (document.querySelector("body[data-m-page]") != null) ? `${document.querySelector("body[data-m-page]").attribute("data-m-page")}` : null;
        if (appName == null) {
            appName = tools.getMatching(page, /\{\{m:page=\"(.*)\"\}\}/g);
        }
        m.config["config.appName"] = (appName != null) ? appName : "";
        return appName;
    }
    export function getBaseUrl(): string {
        if (m.config["config.baseURL"] != null) {
            return ((<string>m.config["config.baseURL"]).endsWith("/")) ? (<string>m.config["config.baseURL"]).substr(0, (<string>m.config["config.baseURL"]).length - 2) : `${m.config["config.baseURL"]}`;
        }
        return "";
    }
    export function getAppUrl(): string {
        if (m.config["config.baseURL"] != null) {
            let url = ((<string>m.config["config.baseURL"]).endsWith("/")) ? (<string>m.config["config.baseURL"]).substr(0, (<string>m.config["config.baseURL"]).length - 2) : `${m.config["config.baseURL"]}`;
            return (m.config["config.root"] != null && m.config["config.root"] != "") ? `${url}/${m.config["config.root"]}` : url;
        }
        return "";
    }
    export function getBaseAPI(): string {
        if (m.config["config.api.dir"] != null) {
            let url = ((<string>m.config["config.api.dir"]).endsWith("/")) ? (<string>m.config["config.api.dir"]).substr(0, (<string>m.config["config.api.dir"]).length - 2) : `${m.config["config.api.dir"]}`;
            return (m.config["config.root"] != null && m.config["config.root"] != "") ? `${m.config["config.root"]}/${url}` : url;
        }
        return "";
    }
    export function getAPIExtension(): string {
        if (m.config["config.api.extension"] != null) {
            return m.config["config.api.extension"];
        }
        return "";
    }
    export function getAPIURL(model: string): string {
        return `${getBaseUrl()}/${getBaseAPI()}/${model}${getAPIExtension()}`;
    }
}
