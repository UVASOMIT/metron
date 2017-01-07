/// <reference path="metron.extenders.ts" />

namespace metron {
    export abstract class base {
        constructor() {
        }
        public inject(type: string, method: string, func: Function): base {
            var self = this;
            if(func == null) {
                throw new Error("Error: No function passed for injection!");
            }
            if((<any>self).prototype[method] == null) {
                throw new Error(`Error: [${method}] does not exist!`);
            }
            switch(type.lower()) {
                case "append":
                    (<any>self).prototype[`${method}_m_inject`] = method;
                    break;
                case "overwrite":
                    (<any>self).prototype[method] = method;
                    break;
                default:
                    throw new Error("Error: Invalid injection type!");
            }
            return self;
        }
    }
}
