namespace metron {
    export class views {
        public static bindAll(): void {
            let sections: NodeListOf<Element> = document.querySelectorAll("[data-m-type='view']");
            for (let i = 0; i < sections.length; i++) {
                let section: Element = <Element>sections[i];
                if (section.attribute("data-m-autoload") == null || section.attribute("data-m-autoload") == "true") {
                    let model: string = section.attribute("data-m-model");
                    if (metron.globals["views"][model] == null) {
                        let v: view<any> = new view(model).init();
                    }
                }
            }
        }
    }
    export class view<T> extends base<T> {
        private _form: string;
        public _elem: Element;
        public id: string;
        public gTypeName: string;
        constructor(public model: string) {
            super(model, VIEW);
            var self = this;
        }
        public init(): view<T> {
            var self = this;
            self._elem = (self.id != null) ? document.querySelector(`#${self.id}`) : document.querySelector(`[data-m-type='view'][data-m-model='${self.model}']`);
            if(self._elem != null) {
                self.pivot = self.attachPivot(self._elem);
                self._name = self._elem.attribute("[data-m-page]");
                let querystring = metron.web.querystring();
                self.callView(<any>querystring);
            }
            return self;
        }
        public callView(querystring: string): void {
            var self = this;
            let parameters = {};
            metron.web.get(`${metron.fw.getAPIURL(self.model)}${querystring}`, parameters, null, "json", function (data: T) {
                if(data instanceof Array) {
                    data = data[0];
                }
                self._elem.innerHTML = self.formatData(data, false);
                for (let prop in data) {
                    if(data.hasOwnProperty(prop) && data[prop] != null && document.querySelector(`#View_${self.model}_${prop}`) != null) {
                        (<HTMLElement>document.querySelector(`#View_${self.model}_${prop}`)).innerText = <any>data[prop];
                    }
                }
            });
        }
        public get elem(): Element {
            return this._elem;
        }
        public set elem(v: Element) {
            this._elem = v;
        }
        public get form(): string {
            return this._form;
        }
        public set form(f: string) {
            this._form = f;
        }
    }
}
