namespace metron {
    export class views {
        public static bindAll(): void {

        }
    }
    export class view<T> extends base {
        private _elem: Element;
        private _form: string;
        public id: string;
        public gTypeName: string;
        constructor(public model: string) {
            super(model, VIEW);
            var self = this;
        }
        public init(): view<T> {
            var self = this;
            self._elem = (self.id != null) ? document.selectOne(`#${self.id}`) : document.selectOne(`[data-m-type='view'][data-m-model='${self.model}']`);
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
                for (let prop in data) {
                    if(data.hasOwnProperty(prop) && data[prop] != null && document.selectOne(`#View_${self.model}_${prop}`) != null) {
                        (<HTMLElement>document.selectOne(`#View_${self.model}_${prop}`)).innerText = <any>data[prop];
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
