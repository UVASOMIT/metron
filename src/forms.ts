/// <reference path="types.ts" />

namespace metron {
    export class forms {
        public static bindAll(callback: Function): void {
            let sections: NodeListOf<Element> = document.selectAll("[data-m-type='form']");
            for (let i = 0; i < sections.length; i++) {
                let section: Element = <Element>sections[i];
                if (section.attribute("data-m-autoload") == null || section.attribute("data-m-autoload") == "true") {
                    let model: string = section.attribute("data-m-model");
                    let mID: string = section.attribute("id");
                    let gTypeName: string = (mID != null) ? `${mID}_${model}` : model;
                    if (metron.globals["forms"][gTypeName] == null) {
                        let f: form<any> = new form(model);
                        f.id = mID;
                        f.gTypeName = gTypeName;
                        f.init();
                    }
                }
            }
            if (callback != null) {
                callback();
            }
        }
    }
    export class form<T> extends base<T> {
        private _fields: Array<string> = [];
        private _defaults: Array<any> = (metron.config["config.forms.defaults"] != null) ? metron.config["config.forms.defaults"] : [];
        public id: string;
        public gTypeName: string;
        public hasLoaded: boolean = false;
        constructor(public model: string, public options?: metron.FormOptions) {
            super(model, FORM);
            var self = this;
            self.id = (options != null) ? options.id : null;
            self.gTypeName = (options != null && options.id != null) ? `${options.id}_${model}` : model;
            metron.globals["forms"][self.gTypeName] = self;
            self._elem = (self.id != null) ? document.selectOne(`#${self.id}`) : document.selectOne(`[data-m-type='form'][data-m-model='${self.model}']`);
        }
        private loadDefaults(): void {
            var self = this;
            if (self._defaults != null && self._defaults.length > 0) {
                for (let i = 0; i < self._defaults.length; i++) {
                    let pair: any = self._defaults[i];
                    for (let k in pair) {
                        if (pair.hasOwnProperty(k)) {
                            let v = pair[k];
                            if ((<string>k).contains(`${self.model}_`) && document.selectOne(`#${k}`) != null) {
                                (<HTMLElement>document.selectOne(`#${k}`)).val(v);
                            }
                            else if (!(<string>k).contains("_") && document.selectOne(`#${self.model}_${k}`) != null) {
                                (<HTMLElement>document.selectOne(`#${self.model}_${k}`)).val(v);
                            }
                        }
                    }
                }
            }
        }
        public init(toggle: boolean = false): form<T> {
            var self = this;
            self.hasLoaded = true;
            if (self._elem != null) {
                self.pivot = self.attachPivot(self._elem);
                self._name = self._elem.attribute("data-m-page");
                let selects = self._elem.selectAll("select");
                self.loadSelects(selects, () => {
                    let parameters: any;
                    let defaults: any;
                    let qs: string = <string><any>metron.web.querystring();
                    if (qs != "") {
                        defaults = metron.tools.formatOptions(qs, metron.OptionTypes.QUERYSTRING);
                    }
                    if (metron.globals.firstLoad) {
                        parameters = metron.routing.getRouteUrl({"PageSize": 1, "PageIndex": 1, "_SortOrder": 1, "_SortDirection": 1}); ///This should send null values or by removed by default.
                    }
                    self.loadForm(parameters, defaults);
                });
                let controlBlocks: NodeListOf<Element> = self._elem.selectAll("[data-m-segment='controls']");
                controlBlocks.each((idx: number, elem: Element) => {
                    let actions = elem.selectAll("[data-m-action]");
                    actions.each((indx: number, el: Element) => {
                        switch (el.attribute("data-m-action").lower()) {
                            case "save":
                                el.addEvent("click", function (e) {
                                    e.preventDefault();
                                    el.attribute("disabled", "disabled");
                                    if (metron.globals.actions != null && metron.globals.actions[`${self.model.lower()}_${el.attribute("data-m-action").lower()}`] != null) { //Refactor getting the action overrides
                                        metron.globals.actions[`${self.model.lower()}_${el.attribute("data-m-action").lower()}`]();
                                    }
                                    else {
                                        if (self.isValid()) {
                                            let parameters: any = {};
                                            let hasPrimary: boolean = false;
                                            self.elem.selectAll("input, select, textarea").each(function (idx: number, elem: Element) {
                                                parameters[<string>elem.attribute("name")] = (<HTMLElement>elem).val();
                                                if (elem.attribute("data-m-autocomplete") != null && (<HTMLElement>elem).val() != "") {
                                                    parameters[<string>elem.attribute("name")] = metron.globals.autolists[(<HTMLInputElement>elem).attribute("id")][(<HTMLElement>elem).val()];
                                                } else {
                                                    parameters[<string>elem.attribute("name")] = (<HTMLElement>elem).val();
                                                }
                                                if (elem.attribute("data-m-primary") != null && elem.attribute("data-m-primary").toBool() && (<HTMLElement>elem).val() != "") {
                                                    hasPrimary = true;
                                                }
                                            });
                                            if (!hasPrimary) {
                                                metron.web.post(`${metron.fw.getAPIURL(self.model)}`, parameters, null, "json", (data: T) => {
                                                    self.save(data, <number><any>el.attribute("data-m-pivot"), el)
                                                }, (txt, jsn, xml) => {
                                                    self.showAlerts(metron.DANGER, txt, jsn, xml);
                                                    el.removeAttribute("disabled");
                                                });
                                            }
                                            else {
                                                metron.web.put(`${metron.fw.getAPIURL(self.model)}`, parameters, null, "json", (data: T) => {
                                                    self.save(data, <number><any>el.attribute("data-m-pivot"), el);
                                                }, (txt, jsn, xml) => {
                                                    self.showAlerts(metron.DANGER, txt, jsn, xml);
                                                    el.removeAttribute("disabled");
                                                });
                                            }
                                        }
                                        else {
                                            el.removeAttribute("disabled");
                                        }
                                    }
                                }, true);
                                break;
                            case "cancel":
                                el.addEvent("click", function (e) {
                                    e.preventDefault();
                                    if (metron.globals.actions != null && metron.globals.actions[`${self.model.lower()}_${el.attribute("data-m-action").lower()}`] != null) {
                                        metron.globals.actions[`${self.model.lower()}_${el.attribute("data-m-action").lower()}`]();
                                    }
                                    else {
                                        self.clearForm();
                                        if(self.pivot != null) { //Might want to use the history here and just go back. Pivoting this way is causing an entry in the history object.
                                            (el.attribute("data-m-pivot") != null) ? self.pivot.exact(<any>el.attribute("data-m-pivot")) : self.pivot.previous();
                                        }
                                        if (metron.globals["lists"][self.model] != null) {
                                            metron.globals["lists"][self.model].callListing();
                                        }
                                        if ((<any>self).cancel_m_inject != null) {
                                            (<any>self).cancel_m_inject();
                                        }
                                    }
                                }, true);
                                break;
                            default:
                                if (metron.globals.actions != null && metron.globals.actions[`${self.model.lower()}_${el.attribute("data-m-action").lower()}`] != null) {
                                    el.addEvent("click", function (e) {
                                        e.preventDefault();
                                        metron.globals.actions[`${self.model.lower()}_${el.attribute("data-m-action").lower()}`]();
                                    }, true);
                                }
                                break;
                        }
                    });
                });
                if ((<any>self).init_m_inject != null) {
                    (<any>self).init_m_inject();
                }
            }
            return self;
        }
        public save(data: T, pivotPosition: number, saveElement: Element): void {
            var self = this;
            self.elem.selectAll("[data-m-primary]").each((idx: number, elem: Element) => {
                (<HTMLElement>elem).val(<string><any>data[<string><any>elem.attribute("name")]);
            });
            if(self.pivot != null) {
                (pivotPosition != null) ? self.pivot.exact(pivotPosition) : self.pivot.previous();
            }
            if (metron.globals["lists"][self.model] != null) {
                try {
                    metron.globals["lists"][self.model].callListing();
                }
                catch(e) { }
            }
            saveElement.removeAttribute("disabled");
            if ((<any>self).save_m_inject != null) {
                (<any>self).save_m_inject(data);
            }
        }
        public loadForm(parameters?: any, defaults?: any): void {
            var self = this;
            self.clearForm();
            if (!self._elem.isHidden() && self.shouldRoute(self.options)) {
                metron.routing.setRouteUrl(self._name, metron.web.querystringify(parameters), true);
            }
            if (defaults != null) {
                for (let prop in defaults) {
                    if (defaults.hasOwnProperty(prop) && defaults[prop] != null && document.selectOne(`#${self.model}_${prop}`) != null) {
                        if ((<Element>document.selectOne(`#${self.model}_${prop}`)).attribute("data-m-autocomplete") != null) {
                            (<HTMLElement>document.selectOne(`#${self.model}_${prop}`)).val(<any>defaults[(<Element>document.selectOne(`#${self.model}_${prop}`)).attribute("data-m-display-text")]);
                        } else {
                            (<HTMLElement>document.selectOne(`#${self.model}_${prop}`)).val(<any>defaults[prop]);
                        }
                    }
                }
            }
            if (parameters != null && Object.keys(parameters).length > 0) {
                metron.web.get(`${metron.fw.getAPIURL(self.model)}${metron.web.querystringify(parameters)}`, parameters, null, "json", function (data: T) {
                    if (data instanceof Array) {
                        data = data[0];
                    }
                    //Need to do the below a different way...
                    //self._elem.innerHTML = self.formatData(data, false);
                    for (let prop in data) {
                        if (self.id == null) {
                            if (data.hasOwnProperty(prop) && data[prop] != null && document.selectOne(`#${self.model}_${prop}`) != null) {
                                (<HTMLElement>document.selectOne(`#${self.model}_${prop}`)).val(<any>data[prop]);
                            }
                        } else {
                            if (data.hasOwnProperty(prop) && data[prop] != null && document.selectOne(`#${self.id} > fieldset > #${self.model}_${prop}`) != null) {
                                (<HTMLElement>document.selectOne(`#${self.id} > fieldset > #${self.model}_${prop}`)).val(<any>data[prop]);
                            }
                        }
                    }
                    if ((<any>self).loadForm_m_inject != null) {
                        (<any>self).loadForm_m_inject(data);
                    }
                });
            }
            else if ((<any>self).loadForm_m_inject != null) {
                (<any>self).loadForm_m_inject(null);
            }
        }
        public clearForm(selector?: string, callback?: Function): void {
            var self = this;
            var f = (self._elem != null) ? self._elem : document.selectOne(selector);
            document.selectAll(".error").each(function (idx, elem) {
                (<HTMLElement>elem).removeClass("error");
            });
            document.selectAll(".label-error").each(function (idx, elem) {
                (<HTMLElement>elem).removeClass("label-error");
            });
            f.selectAll("input:not([data-m-ignore='true']), select:not([data-m-ignore='true'])").each(function (idx: number, elem: Element) {
                (<HTMLElement>elem).val("");
            });
            f.selectAll("textarea:not([data-m-ignore='true'])").each(function (idx: number, elem: Element) {
                (<HTMLElement>elem).val("");
            });
            f.selectAll("input[type='checkbox']:not([data-m-ignore='true'])").each(function (idx: number, elem: Element) {
                (<HTMLElement>elem).val("");
            });
            self.clearAlerts();
            self.loadDefaults();
            if (callback != null) {
                callback();
            }
            if ((<any>self).clearForm_m_inject != null) {
                (<any>self).clearForm_m_inject();
            }
        }
        public isValid(selector?: string): boolean {
            var self = this;
            self.clearAlerts();
            var result = "";
            var f = (self._elem != null) ? self._elem : document.selectOne(selector);
            f.selectAll(".error").each(function (idx, elem) {
                elem.removeClass("error");
            });
            f.selectAll(".label-error").each(function (idx, elem) {
                elem.removeClass("label-error");
            });
            var isValid: boolean = true;
            var required: NodeListOf<Element> = f.selectAll("[required='required']");
            required.each(function (idx: number, elem: Element) {
                try {
                    if ((<HTMLElement>elem).val() == null || (<HTMLElement>elem).val().trim() === "") {
                        isValid = false;
                        elem.addClass("error");
                        if (f.selectOne(`label[for='${elem.attribute("id")}']`) != null) {
                            f.selectOne(`label[for='${elem.attribute("id")}']`).addClass("label-error");
                        }
                        if  (f.selectOne(`label[for='${elem.attribute("id")}']`) != null && (<HTMLElement>f.selectOne(`label[for='${elem.attribute("id")}']`)).innerText != "") {
                            result += `<p>${(<HTMLElement>f.selectOne(`label[for='${elem.attribute("id")}']`)).innerText} is a required field.</p>`;
                        } else {
                            result += `<p>[${elem.attribute("name")}] is a required field.</p>`;
                        }
                    }
                }
                catch(e) {
                    console.log(`An error occurred while validating the form: ${e}`);
                    isValid = false;
                }
            });
            if (!isValid) {
                self.showAlerts(DANGER, result);
                window.scrollTo(0, 0);
            }
            return isValid;
        }
        public get elem(): Element {
            return this._elem;
        }
        public set elem(f: Element) {
            this._elem = f;
        }
    }
}
