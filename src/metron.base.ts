namespace metron {
    export abstract class base {
        protected _name: string;
        public id: string;
        public pivot: metron.controls.pivot;
        constructor(public model: string, private baseType: string) {
        }
        protected attachPivot(elem: Element): metron.controls.pivot {
            if(elem.up("[data-m-type='pivot']")) {
                let pivotName = elem.up("[data-m-type='pivot']").attribute("data-m-page");
                return metron.controls.getPivot(pivotName);
            }
            return undefined;
        }
        public inject(type: string, method: string, func: Function): base {
            var self = this;
            if (func == null) {
                throw new Error("Error: No function passed for injection!");
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
        public on(method: metron.Event, func: Function, overwrite: boolean = false): base {
            var self = this;
            self.inject((overwrite) ? "overwrite" : "append", metron.tools.eventEnumToString(method), func);
            return self;
        }
        public action(action: string, model: string, func: Function): base {
            var self = this;
            component.action(action, model, func);
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
        public shouldRoute(options: any): boolean {
            if(options == null || options.hasRouting == null || options.hasRouting) {
                return true;
            }
            return false;
        }
    }
    export class component extends base {
        public static action(action: string, prefix: string, func: Function) {
            metron.globals.actions[`${prefix}_${action}`] = func;
        }
    }
}
