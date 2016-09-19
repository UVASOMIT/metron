/// <reference path="metron.extenders.ts" />

namespace metron {
    export class lists {
        public static bindAll(): void {
            let sections: NodeListOf<Element> = document.selectAll("[data-m-type='list']");
            for(let i = 0; i < sections.length; i++) {
                let section: HTMLElement = <HTMLElement>sections[i];
                
            }
        }
    }
    abstract class list {
        constructor() {

        }
    }
}
