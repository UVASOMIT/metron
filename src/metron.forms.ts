namespace metron {
    export class forms {
        public static bindAll(): void {
            
        }
    }
    export class form<T> extends base {
        private _elem: Element;
        private _list: metron.list<any>;
        private _field_id: string;
        private _name: string;
        private _classNames: Array<string> = [];
        private _action: string = "";
        private _method:string = "POST";
        private _fields: Array<string> = [];
        private _primary: string;
        constructor(public model: string, public asscListing?: list<T>) {
            super();
            var self = this;
            if(asscListing != null) {
                self._list = asscListing;
            }
        }
        public init(): form<T> {
            function _save(context: form<T>, data: T): void {
                (<HTMLElement>context.elem.selectOne(`#${context.model}_${context.model}ID`)).val(<string><any>data[`${context.model}ID`]);
                context.elem.attribute("data-m-state", "hide");
                context.elem.hide();
                if(context._list != null) {
                    context._list.elem.attribute("data-m-state", "show");
                    context._list.elem.show();
                    context._list.callListing();
                }
            }
            var self = this;
            self._elem = document.selectOne(`[data-m-type='form'][data-m-model='${self.model}']`);
            if(self._elem != null) {
                var controlBlocks: NodeListOf<Element> = self._elem.selectAll("[data-m-segment='controls']");
                controlBlocks.each(function (idx: number, elem: Element) {
                    let actions = elem.selectAll("[data-m-action]");
                    actions.each(function (indx: number, el: Element) {
                        switch (el.attribute("data-m-action").lower()) {
                            case "save":
                                el.addEvent("click", function (e) {
                                    e.preventDefault();
                                    if (self.isValid()) {
                                        let parameters: any = { };
                                        let hasPrimary: boolean = false;
                                        self.elem.selectAll("input, select, textarea").each(function(idx: number, elem: Element) {
                                            parameters[<string>elem.attribute("name")] = (<HTMLElement>elem).val();
                                            if(elem.attribute("data-m-primary") != null && elem.attribute("data-m-primary").toBool() && (<HTMLElement>elem).val() != "") {
                                                hasPrimary = true;
                                            }
                                        });
                                        if(!hasPrimary) {
                                            metron.web.post(`${metron.fw.getAPIURL(self.model)}`, parameters, null, "json", function (data: T) {
                                                _save(self, data)
                                                if((<any>self).post_m_inject != null) {
                                                    (<any>self).post_m_inject();
                                                }
                                            });
                                        }
                                        else {
                                            metron.web.put(`${metron.fw.getAPIURL(self.model)}`, parameters, null, "json", function (data: T) {
                                                _save(self, data);
                                                if((<any>self).put_m_inject != null) {
                                                    (<any>self).put_m_inject();
                                                }
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
                                    if(self._list != null) {
                                        self._list.elem.attribute("data-m-state", "show");
                                        self._list.elem.show();
                                    }
                                    if((<any>self).cancel_m_inject != null) {
                                        (<any>self).cancel_m_inject();
                                    }
                                });
                                break;
                            default:
                                break;
                        }
                    });
                });
                if((<any>self).init_m_inject != null) {
                    (<any>self).init_m_inject();
                }
            }
            return self;
        }
        public clearForm(selector?: string, callback?: Function): void {
            var self = this;
            var f = (self._elem != null) ? self._elem : document.selectOne(selector);
            document.selectAll(".error").each(function (idx, elem) {
                document.selectOne(elem).removeClass("error");
            });
            f.selectAll("input, select").each(function(idx: number, elem: Element) {
                 (<HTMLElement>elem).val("");
            });
            f.selectAll("textarea").each(function(idx: number, elem: Element) {
                 (<HTMLElement>elem).val("");
            });
            f.selectAll("input[type='checkbox']").each(function(idx: number, elem: Element) {
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
        public set list(f: metron.list<any>) {
            this._list = f;
        }
    }
}
