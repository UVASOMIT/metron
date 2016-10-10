namespace metron {
    export class forms {
        public static bindAll(): void {
            
        }
    }
    export class form<T> {
        private _field_id: string;
        private _name: string;
        private _classNames: Array<string> = [];
        private _action: string = "";
        private _method:string = "POST";
        private _fields: Array<string> = [];
        constructor(public model: string, public asscListing?: list<T>) {
            var self = this;
            self.init();
        }
        private init(): void {
            var self = this;
            let form: Element = document.selectOne(`[data-m-type='form'][data-m-model='${self.model}']`);
            let controlBlocks: NodeListOf<Element> = form.selectAll("[data-m-segment='controls']");
            controlBlocks.each(function (idx: number, elem: Element) {
                let actions = elem.selectAll("[data-m-action]");
                actions.each(function (indx: number, el: Element) {
                    switch (el.attribute("data-m-action").lower()) {
                        case "submit":
                            el.addEvent("click", function (e) {
                                e.preventDefault();
                                if (metron.form.isValid(`[data-m-type='form'][data-m-model='${self.model}']`)) {
                                    let parameters: any = { };
                                    let form: Element = document.selectOne(`[data-m-type='form'][data-m-model='${self.model}']`);
                                    form.selectAll("input, select, textarea").each(function(idx: number, elem: Element) {
                                        parameters[<string>elem.attribute("name")] = (<HTMLElement>elem).val();
                                    });
                                    metron.web.get(`${metron.fw.getAPIURL(self.model)}`, parameters, null, "json", function (data: T) {
                                        let form: Element = document.selectOne(`[data-m-type='form'][data-m-model='${self.model}']`);
                                        (<HTMLElement>form.selectOne(`#${self.model}_${self.model}ID`)).val(<string><any>data[`${self.model}ID`]);
                                        form.attribute("data-m-state", "hide");
                                        form.hide();
                                        if(self.asscListing != null) {
                                            self.asscListing.callListing();
                                        }
                                    });
                                }
                            });
                            break;
                        case "cancel":
                            el.addEvent("click", function (e) {
                                metron.form.clearForm(`[data-m-type='form'][data-m-model='${self.model}']`);
                                let form: Element = document.selectOne(`[data-m-type='form'][data-m-model='${self.model}']`);
                                form.attribute("data-m-state", "hide");
                                form.hide();
                            });
                            break;
                        default:
                            break;
                    }
                });
            });
        }
        public static clearForm(selector: string, callback?: Function): void {
            document.selectAll(".error").each(function (idx, elem) {
                document.selectOne(elem).removeClass("error");
            });
            document.selectOne(selector).selectAll("input, select").each(function(idx: number, elem: Element) {
                 elem.attribute("value", "");
            });
            document.selectOne(selector).selectAll("textarea").each(function(idx: number, elem: Element) {
                 (<HTMLElement>elem).innerHTML = "";
            });
            document.selectOne(selector).selectAll("input[type='checkbox']").each(function(idx: number, elem: Element) {
                 elem.removeAttribute("checked");
            });
            if (callback != null) {
                callback();
            }
        }
        public static isValid(selector: string): boolean {
            var form: Element = document.selectOne(selector);
            var alert: Element = form.selectOne("[data-m-segment='alert']");
            alert.hide();
            alert.empty();
            document.selectAll(".error").each(function (idx, elem) {
                elem.removeClass("error");
            });
            var isValid: boolean = true;
            var required: NodeListOf<Element> = form.selectAll("[required='required']");
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
    }
}
