import { tools } from "./tools";
import { web } from "./web";
import { m } from "./schema";
import { routing } from "./routing";

export class page {
    private _elem: Element;
    public static action(action: string, prefix: string, func: Function) {
        var actionName = (prefix != null) ? `${prefix}_${action}` : action;
        m.globals.actions[actionName.lower()] = func;
    }
    public static loadSelects(selects: NodeListOf<Element>, callback?: Function, reload: boolean = false): void {
        function populateSelects(el: Element, rl: boolean): Promise<any> {
            let rli: boolean = rl;
            let node: HTMLElement = <HTMLElement>el;
            let binding: string = el.attribute("data-m-binding");
            let key: string = (el.attribute("data-m-key")) != null ? el.attribute("data-m-key") : el.attribute("name");
            let nm: string = el.attribute("name");
            let nText: string = el.attribute("data-m-text");
            let options: any = (el.attribute("data-m-options") != null) ? tools.formatOptions(el.attribute("data-m-options")) : { };
            return new Promise((resolve, reject) => {
                if (rli || (binding != null && node.querySelectorAll("option").length <= 1)) {
                    web.get(`${routing.getAPIURL(binding)}${web.querystringify(options)}`, {}, null, "json", function (data: Array<any>) {
                        data.each(function (i: number, item: any) {
                            node.append(`<option value="${item[key]}">${item[nText]}</option>`);
                        });
                        resolve(data);
                    });
                }
                else {
                    resolve();
                }
            });
        }
        var promises: Array<Promise<any>> = [];
        selects.each(function (indx: number, el: Element) {
            promises.push(populateSelects(el, reload));
        });
        Promise.all(promises).then(() => {
            if (callback != null) {
                callback();
            }
            if ((<any>self).loadSelects_m_inject != null) {
                (<any>self).loadSelects_m_inject();
            }
        }).catch((reason) => {
            console.log("Error: Promise execution failed!");
        });
    }
    public static loadActions(actions: NodeListOf<Element>): void {
        actions.each(function (indx: number, el: Element) {
            let a = el.attribute("data-m-action");
            if(el.up("[data-m-segment='controls']") == null && el.up("[data-m-type='row']") == null) {
                let ev: string;
                if(el.nodeName.lower() === "a" || el.nodeName.lower() === "button" || el.nodeName.lower() === "div" || el.nodeName.lower() === "span" || (el.nodeName.lower() === "input" && (el.attribute("type").lower() === "submit" || el.attribute("type").lower() === "button"))) {
                    ev = "click";
                }
                else {
                    ev = "change";
                }
                el.addEvent(ev, function (e) {
                    e.preventDefault();
                    m.globals.actions[a.lower()]();
                }, true);
            }
        });
    }
    public static bindActions(): void {
        page.loadActions(document.querySelectorAll("[data-m-action]"));
    }
    public static clearAlerts(selector: string) {
        var elem = <HTMLElement>document.querySelector(selector);
        elem.innerHTML = "";
        elem.removeClass("info").removeClass("warning").removeClass("danger").removeClass("success"); //Create a removeClasses() method
        elem.attribute("data-m-state", "hide");
        elem.hide();
    }
    public static showAlerts(selector: string, className: string, txt: string, jsn?: any, xml?: XMLDocument): void {
        var elem = <HTMLElement>document.querySelector(selector);
        elem.innerHTML = txt;
        elem.addClass(className);
        elem.attribute("data-m-state", "show");
        elem.show();
    }
    public static clearFilters(selector: Element): void {
        selector.querySelectorAll("[data-m-action='filter'],.custom-filter").each((idx: number, elem: Element) => {
            try {
                elem.val("");
            }
            catch(e) {
                console.log(`Could not clear value for ${(elem != null) ? elem.outerHTML : idx}: ${e}`);
            }
        });
    }
    public get elem(): Element {
        if(this._elem == null) {
            try {
                this._elem = document.querySelector("[data-m-root]");
            }
            catch(e) {
                console.log(e);
            }
        }
        return this._elem;
    }
}
