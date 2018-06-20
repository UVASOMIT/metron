namespace metron {
    export class page {
        private _elem: Element;
        public static action(action: string, prefix: string, func: Function) {
            var actionName = (prefix != null) ? `${prefix}_${action}` : action;
            metron.globals.actions[actionName] = func;
        }
        public static loadSelects(selects: NodeListOf<Element>, callback?: Function, reload: boolean = false): void {
            function populateSelects(el: Element, rl: boolean): Promise<any> {
                let rli: boolean = rl;
                let node: HTMLElement = <HTMLElement>el;
                let binding: string = el.attribute("data-m-binding");
                let key: string = (el.attribute("data-m-key")) != null ? el.attribute("data-m-key") : el.attribute("name");
                let nm: string = el.attribute("name");
                let nText: string = el.attribute("data-m-text");
                let options: any = (el.attribute("data-m-options") != null) ? metron.tools.formatOptions(el.attribute("data-m-options")) : { };
                return new Promise((resolve, reject) => {
                    if (rli || (binding != null && node.selectAll("option").length <= 1)) {
                        metron.web.get(`${metron.fw.getAPIURL(binding)}${metron.web.querystringify(options)}`, {}, null, "json", function (data: Array<any>) {
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
                    if(el.nodeName.lower() === "a" || el.nodeName.lower() === "button" || (el.nodeName.lower() === "input" && (el.attribute("type").lower() === "submit" || el.attribute("type").lower() === "button"))) {
                        ev = "click";
                    }
                    else {
                        ev = "change";
                    }
                    el.addEvent(ev, function (e) {
                        e.preventDefault();
                        metron.globals.actions[a.lower()]();
                    }, true);
                }
            });
        }
        public static bindActions(): void {
            page.loadActions(document.selectAll("[data-m-action]"));
        }
        public static showAlerts(selector: string, className: string, txt: string, jsn?: any, xml?: XMLDocument): void {
            var elem = <HTMLElement>document.selectOne(selector);
            elem.innerHTML = txt;
            elem.addClass(className);
            elem.attribute("data-m-state", "show");
            elem.show();
        }
        public get elem(): Element {
            if(this._elem == null) {
                try {
                    this._elem = document.selectOne("[data-m-root]");
                }
                catch(e) {
                    console.log(e);
                }
            }
            return this._elem;
        }
    }
}
