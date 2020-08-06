import { templates } from "./templates";
import { tools } from "./tools";
import { DB, STORE, DBVERSION, OptionTypes, m } from "./schema";
import { store } from "./storage";
import { controls } from "./controls";
import { routing } from "./routing";
import { web } from "./web";
import { lists } from "./lists";
import { forms } from "./forms";

declare const Awesomplete;

export function onready(callback: Function, appName?: string) {
    document.addEventListener("DOMContentLoaded", function (e) {
        templates.master.loadMaster(document.documentElement.outerHTML).then(() => {
            let proms = [];
            document.querySelectorAll("[data-m-include]").each((idx: number, elem: Element) => {
                let prom = templates.load(elem.attribute("data-m-include")).then(result => {
                    if (elem.attribute("data-m-type") != null && elem.attribute("data-m-type") == "markdown") {
                        (<HTMLElement>elem).innerHTML = templates.markdown.toHTML(result);
                        (<HTMLElement>elem).show();
                    }
                    else {
                        (<HTMLElement>elem).innerHTML = result;
                    }
                });
                proms.push(prom);
            });
            Promise.all(proms).then(() => {
                document.querySelectorAll("[data-m-type='markdown']").each((idx: number, elem: Element) => {
                    if (elem.attribute("data-m-include") == null) {
                        (<HTMLElement>elem).innerHTML = templates.markdown.toHTML((<HTMLElement>elem).innerHTML);
                        (<HTMLElement>elem).show();
                    }
                });

                let root: string = routing.getApplicationRoot(document.documentElement.outerHTML);
                appName = (appName != null) ? appName : routing.getApplicationName(document.documentElement.outerHTML);

                let iDB = (appName == null) ? DB : `${DB}.${appName.lower()}`;
                let iDBStore = (appName == null) ? STORE : `${STORE}.${appName.lower()}`;

                let storage = new store(iDB, DBVERSION, iDBStore);
                storage.init().then((result) => {
                    return storage.getItem("metron.config", "value");
                }).then((result) => {
                    if (result != null) {
                        m.config = JSON.parse(<string><any>result);
                        m.globals.firstLoad = true;
                        if (callback != null) {
                            callback(e);
                        }
                    }
                    else {
                        new Promise((resolve, reject) => {
                            web.loadJSON(`${root}/metron.json`, (configData: JSON) => {
                                for (let obj in configData) {
                                    if (m.config[obj] == null) {
                                        m.config[obj] = configData[obj];
                                    }
                                }
                                m.config["config.baseURL"] = `${document.location.protocol}//${document.location.host}`;
                                storage.init().then((result) => {
                                    return storage.setItem("metron.config", JSON.stringify(m.config));
                                }).then((result) => {
                                    resolve(configData);
                                }).catch((rs) => {
                                    console.log(`Error: Failed to access storage. ${rs}`);
                                });
                            });
                        }).then(() => {
                            m.globals.firstLoad = true;
                            if (callback != null) {
                                callback(e);
                            }
                        }).catch((rsn) => {
                            console.log(`Error: Promise execution failed! ${rsn}`);
                        });
                    }
                }).catch((reason) => {
                    console.log(`Error: Failed to access storage. ${reason}`);
                });
            });
        }).catch(() => {
            console.log("Failed to check for master page.");
        });
    });
}
export function load(re: RegExp, func: Function | { n: string, func: Function }): void {
    let n, f;
    if(typeof func == "object") {
        n = func.n;
        f = func.func;
    }
    else {
        f = func;
    }
    let h = () => {
        if(n !== undefined) {
            let p = document.querySelector("[data-m-type='pivot']");
            if(p !== undefined) {
                controls.getPivot(p.attribute("data-m-page")).exact(n);
            }
        }
        f();
    };
    routing.add(re, h);
}
export function ifQuerystring(callback: Function): void {
    let qs: string = <string><any>web.querystring();
    if (qs != "") {
        let parameters = tools.formatOptions(qs, OptionTypes.QUERYSTRING);
        if (callback != null) {
            callback(parameters);
        }
    }
}
export function loadOptionalFunctionality(): void {
    if (typeof Awesomplete !== undefined) {
        document.querySelectorAll("[data-m-autocomplete]").each((idx: number, elem: Element) => {
            let endpoint = elem.attribute("data-m-autocomplete");
            let url: string = (endpoint.toLowerCase().startsWith("http")) ? endpoint : routing.getAPIURL(endpoint);
            let awesome = new Awesomplete(elem, {
                minChars: 1,
                sort: false,
                maxItems: 15,
                replace: function (item) {
                    if (elem.attribute("data-m-search-hidden-store") != null && elem.attribute("data-m-search-hidden-store") != '') {
                        this.input.value = item.label;
                        (<HTMLInputElement>document.querySelector(`#${elem.attribute("data-m-search-hidden-store")}`)).val(item.value);
                        (<HTMLInputElement>document.querySelector(`#${elem.attribute("data-m-search-hidden-store")}`)).dispatchEvent(new Event("change"));
                    } else {
                        this.input.value = item.value;
                    }
                }
            });
            elem.removeEvent("keyup").addEvent("keyup", function (e) {
                web.get(`${url}${web.querystringify({ IsActive: true, Search: this.val() })}`, null, null, "json", (result) => {
                    let list = [];
                    if (result != null) {  
                        for (var a in result) {
                            if (result.hasOwnProperty(a)) {
                                if (result[a][elem.attribute("data-m-search-text")] != null) {
                                    var item = { label: result[a][elem.attribute("data-m-search-text")], value: result[a][elem.attribute("data-m-search-value")] };
                                    list.push(item);
                                }
                            }
                        }
                        awesome.list = list;
                    }
                });
            });
        });
    }
}

window.onhashchange = function () {
    if (!m.globals.hashLoadedFromApplication) {
        let hasPivoted = false;
        let section = document.querySelector("[data-m-type='pivot']");
        if (section != null) {
            let page = section.attribute("data-m-page");
            if (page != null) {
                let p = controls.getPivot(page);
                p.previous();
                hasPivoted = true;
            }
        }
        if (!hasPivoted) {
            window.location.reload(false);
        }
    }
    m.globals.hashLoadedFromApplication = false;
}

onready((e: Event) => {
    function recursePivot(elem: Element): void {
        if (elem != null) {
            elem.show();
            let route = elem.attribute("data-m-page");
            let pivot = elem.up("[data-m-type='pivot']");
            let pivotPageName = pivot.attribute("data-m-page");
            elem.up("[data-m-type='pivot']").querySelectorAll("[data-m-segment='pivot-item']").each((idx: number, el: Element) => {
                if(el.up("[data-m-type='pivot']").attribute("data-m-page") === pivotPageName) {
                    if (el.attribute("data-m-page") != route) {
                        el.hide();
                    }
                }
            });
            let parent = elem.parent().up("[data-m-segment='pivot-item']");
            if(parent != null) {
                recursePivot(parent);
            }
        }
    }
    let wantsAutoload: boolean = ((document.querySelector("[data-m-autoload]") != null) && (document.querySelector("[data-m-autoload]").attribute("data-m-autoload") == "true"));
    document.querySelectorAll("[data-m-state='hide']").each((idx: number, elem: Element) => {
        elem.hide();
    });
    controls.pivots.bindAll(() => {
        let route = routing.getRouteName();
        if (route != null) {
            let page = document.querySelector(`[data-m-segment='pivot-item'][data-m-page="${route}"]`);
            recursePivot(page);
        }
        loadOptionalFunctionality();
        if (wantsAutoload) {
            lists.bindAll(() => {
                forms.bindAll(() => {
                    controls.polyfill();
                });
            });
        }
    });
});
