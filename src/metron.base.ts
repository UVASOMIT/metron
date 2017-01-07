namespace metron {
    export abstract class base {
        constructor() {
        }
        public inject(type: string, func: Function): base {
            var self = this;
            return self;
        }
    }
}
