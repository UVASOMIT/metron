namespace metron {
    export abstract class base<T> {
        protected _name: string;
        protected _elem: Element;
        protected _template: string;
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
        public inject(type: string, method: string, func: Function): base<T> {
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
        public on(method: metron.Event, func: Function, overwrite: boolean = false): base<T> {
            var self = this;
            self.inject((overwrite) ? "overwrite" : "append", metron.tools.eventEnumToString(method), func);
            return self;
        }
        public action(action: string, model: string, func: Function): base<T> {
            var self = this;
            metron.page.action(action, model, func);
            return self;
        }
        public formatData(item: T, isTable: boolean = true): string {
            var self = this;
            var t: string = (self._template != null) ? self._template : self._elem.innerHTML;
            return metron.templates.merge<T>(self._template, item, isTable);
        }
        public clearAlerts(): void {
            var self = this;
            metron.page.clearAlerts(`[data-m-type='${self.baseType}'][data-m-model='${self.model}'] [data-m-segment='alert']`);
        }
        public showAlerts(className: string, txt: string, jsn?: any, xml?: XMLDocument): void {
            var self = this;
            metron.page.showAlerts(`[data-m-type='${self.baseType}'][data-m-model='${self.model}'] [data-m-segment='alert']`, className, txt, jsn, xml);
        }
        public loadSelects(selects: NodeListOf<Element>, callback?: Function, reload: boolean = false): void {
            var self = this;
            metron.page.loadSelects(selects, callback, reload);
        }
        public clearFilters(selector: Element): void {
            var self = this;
            metron.page.clearFilters(selector);
        }
        public shouldRoute(options: any): boolean {
            if(options == null || options.hasRouting == null || options.hasRouting) {
                return true;
            }
            return false;
        }
    }
}
