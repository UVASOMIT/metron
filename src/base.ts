import { controls } from "./controls";
import { Event } from "./schema";
import { templates } from "./templates";
import { tools } from "./tools";
import { page } from "./page";

export abstract class base<T> {
    protected _name: string;
    protected _elem: Element;
    protected _template: string;
    public pivot: controls.pivot;
    constructor(public model: string, private baseType: string) {
    }
    protected attachPivot(elem: Element): controls.pivot {
        if(elem.up("[data-m-type='pivot']")) {
            const pivotName = elem.up("[data-m-type='pivot']").attribute("data-m-page");
            return controls.getPivot(pivotName);
        }
        return undefined;
    }
    public inject(type: string, method: string, func: Function): base<T> {
        const self = this;
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
    public on(method: Event, func: Function, overwrite: boolean = false): base<T> {
        const self = this;
        self.inject((overwrite) ? "overwrite" : "append", tools.eventEnumToString(method), func);
        return self;
    }
    public action(action: string, model: string, func: Function): base<T> {
        const self = this;
        page.action(action, model, func);
        return self;
    }
    public formatData(item: T, isTable: boolean = true): string {
        const self = this;
        const t: string = (self._template != null) ? self._template : self._elem.innerHTML;
        return templates.merge<T>(t, item, isTable);
    }
    public clearAlerts(): void {
        const self = this;
        page.clearAlerts(`[data-m-type='${self.baseType}'][data-m-model='${self.model}'] [data-m-segment='alert']`);
    }
    public showAlerts(className: string, txt: string, jsn?: any, xml?: XMLDocument): void {
        const self = this;
        page.showAlerts(`[data-m-type='${self.baseType}'][data-m-model='${self.model}'] [data-m-segment='alert']`, className, txt, jsn, xml);
    }
    public loadSelects(selects: NodeListOf<Element>, callback?: Function, reload: boolean = false): void {
        page.loadSelects(selects, callback, reload);
    }
    public clearFilters(selector: Element): void {
        page.clearFilters(selector);
    }
    public shouldRoute(options: any): boolean {
        if(options == null || options.hasRouting == null || options.hasRouting) {
            return true;
        }
        return false;
    }
}
