/// <reference path="metron.extenders.ts" />

namespace metron {
    export abstract class base {
        constructor() {
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
        public action(action: string, func: Function): base {
            var self = this;
            metron.globals.actions[action] = func;
            return self;
        }
    }
}
