/// <reference path="metron.base.ts" />

namespace metron {
    export class forms {
        public static bindAll(): void {
            let sections: NodeListOf<Element> = document.selectAll("[data-m-type='form']");
            metron.globals["forms"] = [];
            for (let i = 0; i < sections.length; i++) {
                let section: Element = <Element>sections[i];
                if (section.attribute("data-m-autoload") == null || section.attribute("data-m-autoload") == "true") {
                    let model: string = section.attribute("data-m-model");
                    let f: form<any> = new form(model).init();
                    metron.globals["forms"].push(f);
                }
            }
        }
    }
    export class form<T> extends base {
        private _elem: Element;
        private _list: metron.list<any>;
        private _fields: Array<string> = [];
        constructor(public model: string, public asscListing?: list<T>) {
            super();
            var self = this;
            if (asscListing != null) {
                self._list = asscListing;
            }
            var qs: string = <string><any>metron.web.querystring();
            if(qs != "") {
                let parameters = metron.tools.formatOptions(qs.substr(1), metron.tools.OptionTypes.QUERYSTRING);
                self.loadForm(parameters);
            }
        }
        public init(): form<T> {
            var self = this;
            self._elem = document.selectOne(`[data-m-type='form'][data-m-model='${self.model}']`);
            if (self._elem != null) {
                var controlBlocks: NodeListOf<Element> = self._elem.selectAll("[data-m-segment='controls']");
                controlBlocks.each((idx: number, elem: Element) => {
                    let actions = elem.selectAll("[data-m-action]");
                    actions.each((indx: number, el: Element) => {
                        switch (el.attribute("data-m-action").lower()) {
                            case "save":
                                el.addEvent("click", function (e) {
                                    e.preventDefault();
                                    if (self.isValid()) {
                                        let parameters: any = { };
                                        let hasPrimary: boolean = false;
                                        self.elem.selectAll("input, select, textarea").each(function (idx: number, elem: Element) {
                                            parameters[<string>elem.attribute("name")] = (<HTMLElement>elem).val();
                                            if (elem.attribute("data-m-primary") != null && elem.attribute("data-m-primary").toBool() && (<HTMLElement>elem).val() != "") {
                                                hasPrimary = true;
                                            }
                                        });
                                        if (!hasPrimary) {
                                            metron.web.post(`${metron.fw.getAPIURL(self.model)}`, parameters, null, "json", function (data: T) {
                                                self.save(self, data)
                                            });
                                        }
                                        else {
                                            metron.web.put(`${metron.fw.getAPIURL(self.model)}`, parameters, null, "json", function (data: T) {
                                                self.save(self, data);
                                            });
                                        }
                                    }
                                });
                                break;
                            case "cancel":
                                el.addEvent("click", function (e) {
                                    self.clearForm();
                                    self._elem.attribute("data-m-state", "hide");
                                    self._elem.hide();
                                    if (self._list != null) {
                                        self._list.elem.attribute("data-m-state", "show");
                                        self._list.elem.show();
                                    }
                                });
                                break;
                            default:
                                if (metron.globals.actions != null && metron.globals.actions[el.attribute("data-m-action").lower()] != null) {
                                    el.addEvent("click", function (e) {
                                        e.preventDefault();
                                        metron.globals.actions[el.attribute("data-m-action").lower()](self);
                                    });
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
        public save(context: form<T>, data: T): void {
            context.elem.selectAll("[data-m-primary]").each((idx: number, elem: Element) => {
                (<HTMLElement>elem).val(<string><any>data[<string><any>elem.attribute("name")]);
            });
            context.elem.attribute("data-m-state", "hide");
            context.elem.hide();
            if (context._list != null) {
                context._list.elem.attribute("data-m-state", "show");
                context._list.elem.show();
                context._list.callListing();
            }
        }
        public loadForm(parameters: any): void {
            var self = this;
            metron.web.get(`${metron.fw.getAPIURL(self.model)}${metron.web.querystringify(parameters)}`, parameters, null, "json", function (data: T) {
                if (data instanceof Array) {
                    data = data[0];
                }
                for (let prop in data) {
                    if (data.hasOwnProperty(prop) && data[prop] != null && document.selectOne(`#${self.model}_${prop}`) != null) {
                        (<HTMLElement>document.selectOne(`#${self.model}_${prop}`)).val(<any>data[prop]);
                    }
                }
                self._elem.attribute("data-m-state", "show");
                self._elem.show();
                if(self._list != null) {
                    self._list.elem.attribute("data-m-state", "hide");
                    self._list.elem.hide();
                }
            });
        }
        public clearForm(selector?: string, callback?: Function): void {
            var self = this;
            var f = (self._elem != null) ? self._elem : document.selectOne(selector);
            document.selectAll(".error").each(function (idx, elem) {
                document.selectOne(elem).removeClass("error");
            });
            f.selectAll("input, select").each(function (idx: number, elem: Element) {
                (<HTMLElement>elem).val("");
            });
            f.selectAll("textarea").each(function (idx: number, elem: Element) {
                (<HTMLElement>elem).val("");
            });
            f.selectAll("input[type='checkbox']").each(function (idx: number, elem: Element) {
                (<HTMLElement>elem).val("");
            });
            if (callback != null) {
                callback();
            }
        }
        public isValid(selector?: string): boolean {
            var self = this;
            var f = (self._elem != null) ? self._elem : document.selectOne(selector);
            var alert: Element = f.selectOne("[data-m-segment='alert']");
            alert.hide();
            alert.empty();
            document.selectAll(".error").each(function (idx, elem) {
                elem.removeClass("error");
            });
            var isValid: boolean = true;
            var required: NodeListOf<Element> = f.selectAll("[required='required']");
            required.each(function (idx: number, elem: Element) {
                if ((<HTMLElement>elem).val() == null || (<HTMLElement>elem).val().trim() === "") {
                    isValid = false;
                    alert.append(`<p>[${elem.attribute("name")}] is a required field.</p>`);
                    elem.up("div").addClass("has-error");
                }
            });
            if (!isValid) {
                alert.show();
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
        public get list(): metron.list<any> {
            return this._list;
        }
        public set list(l: metron.list<any>) {
            this._list = l;
        }
    }
}
