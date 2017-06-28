namespace metron {
    export abstract class base {
        protected _name: string;
        protected _pivot: metron.controls.pivot;
        constructor(public model: string, private baseType: string) {
        }
        protected attachPivot(elem: Element): metron.controls.pivot {
            if(elem.up("[data-m-type='pivot']")) {
                let pivotName = elem.up("[data-m-type='pivot']").attribute("data-m-page");
                if(metron.globals["pivots"][pivotName] != null) {
                    return metron.globals["pivots"][pivotName];
                }
            }
            return undefined;
        }
        public inject(type: string, method: string, func: Function): base {
            var self = this;
            if (func == null) {
                throw new Error("Error: No function passed for injection!");
            }
            if ((<any>self)[method] == null) {
                throw new Error(`Error: [${method}] does not exist!`);
            }
            switch (type.lower()) {
                case "append":
                    (<any>self)[`${method}_m_inject`] = func;
                    break;
                case "overwrite":
                    (<any>self)[method] = func;
                    break;
                default:
                    throw new Error("Error: Invalid injection type!");
            }
            return self;
        }
        public on(method: string, func: Function, overwrite: boolean = false): base {
            var self = this;
            self.inject((overwrite) ? "overwrite" : "append", method, func);
            return self;
        }
        public action(action: string, model: string, func: Function): base {
            var self = this;
            metron.globals.actions[`${model}_${action}`] = func;
            return self;
        }
        public clearAlerts(): void {
            var self = this;
            var elem = <HTMLElement>document.selectOne(`[data-m-type='${self.baseType}'][data-m-model='${self.model}'] [data-m-segment='alert']`);
            elem.innerHTML = "";
            elem.removeClass("info").removeClass("warning").removeClass("danger").removeClass("success"); //Create a removeClasses() method
            elem.attribute("data-m-state", "hide");
            elem.hide();
        }
        public showAlerts(className: string, txt: string, jsn?: any, xml?: XMLDocument): void {
            var self = this;
            var elem = <HTMLElement>document.selectOne(`[data-m-type='${self.baseType}'][data-m-model='${self.model}'] [data-m-segment='alert']`);
            elem.innerHTML = txt;
            elem.addClass(className);
            elem.attribute("data-m-state", "show");
            elem.show();
        }
    }
}
