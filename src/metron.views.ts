/// <reference path="metron.base.ts" />

namespace metron {
    export class views {
        public static bindAll(): void {

        }
    }
    export class view<T> extends base {
        private _elem: Element;
        private _form: metron.form<any>;
        constructor(public model: string, public asscForm?: form<T>) {
            super();
            var self = this;
            if(asscForm != null) {
                self._form = asscForm;
            }
        }
        public init(): view<T> {
            var self = this;
            self._elem = document.selectOne(`[data-m-type='view'][data-m-model='${self.model}']`);
            if(self._elem != null) {
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
                /*
                self._form.elem.attribute("data-m-state", "show");
                self._elem.attribute("data-m-state", "hide");
                self._form.elem.show();
                self._elem.hide();
                */
            });
        }
        public get elem(): Element {
            return this._elem;
        }
        public set elem(v: Element) {
            this._elem = v;
        }
        public get form(): metron.form<any> {
            return this._form;
        }
        public set form(f: metron.form<any>) {
            this._form = f;
        }
    }
}
