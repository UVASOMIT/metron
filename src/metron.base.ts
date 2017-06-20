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
        public setRouting(wsqs: string, wantsReplaceHash: boolean = false): void {
            var self = this;
            var hash = (wsqs.length > 1) ? wsqs.substr(1) : "";
            if(hash != "" && document.location.search != null) {
                try {
                    let hashItems = metron.tools.formatOptions(hash, metron.OptionTypes.QUERYSTRING);
                    let qsItems = metron.tools.formatOptions((document.location.search.startsWith("?") ? document.location.search.substr(1) : document.location.search), metron.OptionTypes.QUERYSTRING);
                    for(let h in hashItems) {
                        if(hashItems.hasOwnProperty(h)) {
                            if(qsItems[h] != null) {
                                delete hashItems[h];
                            }
                        }
                    }
                    hash = metron.web.querystringify(hashItems).substr(1);
                }
                catch(e) {
                    console.log(`Error: failed to parse query string and hash. ${e}`);
                }
            }
            if(self._name != null) {
                metron.globals.previousPage = metron.globals.currentPage;
                metron.globals.currentPage = self._name;
                hash = `/${self._name}/${hash}`;
            }
            else {
                metron.globals.previousModel = metron.globals.currentModel;
                metron.globals.previousBaseType = metron.globals.currentBaseType;
                metron.globals.currentModel = self.model;
                metron.globals.currentBaseType = self.baseType;
            }
            metron.globals.hashLoadedFromApplication = true;
            (wantsReplaceHash) ? document.location.hash = `#${hash}` : history.replaceState({ }, "", `#${hash}`);
        }
        public getRouting(filters?: any): any {
            var self = this;
            var hash = document.location.hash;
            if(hash.substr(0, 1) == "#") {
                hash = hash.substr(1);
            }
            if(hash.substr(0, 1) == "/") {
                hash = hash.substr(1);
            }
            if(hash.length > 1) {
                if(hash.indexOf("/") != -1) {
                    try {
                        hash = hash.split("/")[1];
                    }
                    catch(e) {
                        console.log(`Error: Failed to get routing. ${e}`);
                    }
                }
                let result = metron.tools.formatOptions(hash, metron.OptionTypes.QUERYSTRING);
                if(filters != null) {
                    for(let h in result) {
                        if(result.hasOwnProperty(h)) {
                            if(filters[h] != null) {
                                delete result[h];
                            }
                        }
                    }
                }
                return result;
            }
            return null;
        }
    }
}
