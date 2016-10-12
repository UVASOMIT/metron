namespace metron {
    export class forms {
        public static bindAll(): void {
            
        }
    }
    export class form<T> {
        private _elem: Element;
        private _list: metron.list<any>;
        private _field_id: string;
        private _name: string;
        private _classNames: Array<string> = [];
        private _action: string = "";
        private _method:string = "POST";
        private _fields: Array<string> = [];
        constructor(public model: string, public asscListing?: list<T>) {
            var self = this;
            if(asscListing != null) {
                self._list = asscListing;
            }
            self.init();
        }
        private init(): void {
            var self = this;
            self._elem = document.selectOne(`[data-m-type='form'][data-m-model='${self.model}']`);
            let controlBlocks: NodeListOf<Element> = self._elem.selectAll("[data-m-segment='controls']");
            controlBlocks.each(function (idx: number, elem: Element) {
                let actions = elem.selectAll("[data-m-action]");
                actions.each(function (indx: number, el: Element) {
                    switch (el.attribute("data-m-action").lower()) {
                        case "submit":
                            el.addEvent("click", function (e) {
                                e.preventDefault();
                                if (self.isValid()) {
                                    let parameters: any = { };
                                    self._elem.selectAll("input, select, textarea").each(function(idx: number, elem: Element) {
                                        parameters[<string>elem.attribute("name")] = (<HTMLElement>elem).val();
                                    });
                                    metron.web.get(`${metron.fw.getAPIURL(self.model)}`, parameters, null, "json", function (data: T) {
                                        (<HTMLElement>self._elem.selectOne(`#${self.model}_${self.model}ID`)).val(<string><any>data[`${self.model}ID`]);
                                        self._elem.attribute("data-m-state", "hide");
                                        self._elem.hide();
                                        if(self.asscListing != null) {
                                            self.asscListing.callListing();
                                            self._list.elem.attribute("data-m-state", "show");
                                            self._list.elem.show();
                                        }
                                    });
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
                            });
                            break;
                        default:
                            break;
                    }
                });
            });
        }
        public clearForm(selector?: string, callback?: Function): void {
            var self = this;
            var f = (self._elem != null) ? self._elem : document.selectOne(selector);
            document.selectAll(".error").each(function (idx, elem) {
                document.selectOne(elem).removeClass("error");
            });
            f.selectAll("input, select").each(function(idx: number, elem: Element) {
                 elem.attribute("value", "");
            });
            f.selectAll("textarea").each(function(idx: number, elem: Element) {
                 (<HTMLElement>elem).innerHTML = "";
            });
            f.selectAll("input[type='checkbox']").each(function(idx: number, elem: Element) {
                 elem.removeAttribute("checked");
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
