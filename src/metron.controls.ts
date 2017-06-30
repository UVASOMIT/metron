declare var Awesomplete: any;

namespace metron {
    export namespace controls {
        export function getPivot(name: string, callback?: Function): metron.controls.pivot {
            var p: metron.controls.pivot;
            if (metron.globals["pivots"][name] != null) {
                p = <metron.controls.pivot>metron.globals["pivots"][name];
            }
            else {
                p = new metron.controls.pivot(<HTMLElement>document.selectOne(`[data-m-type='pivot'][data-m-page='${name}']`));
                metron.globals["pivots"][name] = p;
            }
            if(callback != null) {
                callback(p);
            }
            return p;
        }
        export class pivots {
            public static bindAll(callback?: Function): void {
                let pivots : NodeListOf<Element> = document.selectAll("[data-m-type='pivot']");
                for (let i = 0; i < pivots.length; i++) {
                    let section: Element = <Element>pivots[i];
                    let page: string = section.attribute("data-m-page");
                    if (metron.globals["pivots"][page] == null) {
                        let p: pivot = new controls.pivot(<Element>section);
                        metron.globals["pivots"][page] = p;
                        section.selectAll("[data-m-pivot]").each((idx: number, elem: Element) => {
                            if(elem.closest("[data-m-type='pivot']").attribute("data-m-page") === page) {
                                elem.addEvent("click", (e) => {
                                    e.preventDefault();
                                    p.exact(elem.attribute("data-m-pivot"));
                                }, true);
                            }
                        });
                    }
                }
                if (callback != null) {
                    callback();
                }
            }
        }
        export class pivot {
            private _pivotContainer: Element;
            private _items: Array<Element> = [];
            private _item: Pivot;
            private _previousButton: any;
            private _nextButton: any;
            public preEventFuntions: EventFunction = {};
            public postEventFunctions: EventFunction = {};

            constructor(private pivotCollection: Element, private displayIndex: number = 0, private nextButton?: any, private previousButton?: any, private eventFunction?: Function, private preEventFunction?: Function) {
                var self = this;
                self._pivotContainer = pivotCollection;
                self._nextButton = (nextButton != null) ? document.selectOne(`#${nextButton}`): self._pivotContainer.selectOne("[data-m-segment='controls'] [data-m-action='next']");
                self._previousButton = (previousButton != null) ? document.selectOne(`#${previousButton}`): self._pivotContainer.selectOne("[data-m-segment='controls'] [data-m-action='previous']");

                if (self.displayIndex != null) {
                    let i = 0;
                    let itemList = self._pivotContainer.selectAll("[data-m-segment='pivot-item']");
                    itemList.each(function (idx: number, elem: Element) {
                        self._items.push(elem);
                        if (idx == self.displayIndex) {
                            self.init(elem);
                            elem.show();
                        }
                        else {
                            elem.hide();
                        }
                    });
                }
            }
            
            private init(el: Element) {
                var self = this;
                self._item = {
                    parent: el.parentElement,
                    current: el,
                    next: (el.nextElementSibling != null &&el.nextElementSibling.attribute("data-m-segment") != null && el.nextElementSibling.attribute("data-m-segment") == "pivot-item") ? el.nextElementSibling : null,
                    previous: (el.previousElementSibling != null && el.previousElementSibling.attribute("data-m-segment") != null && el.previousElementSibling.attribute("data-m-segment") == "pivot-item") ? el.previousElementSibling : null,
                };
                if (self._nextButton != null || self._previousButton != null) {
                    if (self._item.next == null) {
                        self._nextButton.attribute("disabled", "disabled");
                    }
                    else {
                        self._nextButton.removeAttribute("disabled");
                        self._nextButton.addEvent("click", function (e) {
                            e.preventDefault();
                            self.next();
                        }, true);
                    }
                    if (self._item.previous == null) {
                        self._previousButton.attribute("disabled", "disabled");
                    }
                    else {
                        self._previousButton.removeAttribute("disabled");
                        self._previousButton.addEvent("click", function (e) {
                            e.preventDefault();
                            self.previous();
                        }, true);
                    }
                }

                if (self._item.current.attribute('data-m-page') != null){
                    if (self.postEventFunctions[self._item.current.attribute('data-m-page')] != undefined){
                        self.postEventFunctions[self._item.current.attribute('data-m-page')]();
                    }
                }
            }
            public next(): boolean {
                var self = this;
                if (!self._item.next) {
                    console.log("Couldn't find next pivot");
                    return false;
                }
                self.applyPreEvent(self._item.current);
                self._item.current.hide();
                self._item.next.show();
                self.init(self._item.next);
                return true;
            }
            public previous(): boolean {
                var self = this;
                if (!self._item.previous) {
                    console.log("Couldn't find previous pivot");
                    return false;
                }
                self.applyPreEvent(self._item.current);
                self._item.current.hide();
                self._item.previous.show();
                self.init(self._item.previous);
                return true;
            }
            public exact(target: number | string): boolean {
                var self = this;
                var idx;
                if(isNaN(<any>target)) {
                    for(let i = 0; i < self._items.length; i++) {
                        let page = self._items[i].attribute("data-m-page");
                        if(page != null && page == target) {
                            idx = i;
                        }
                    }
                    if(idx == null) {
                        throw new Error(`Error: Cannot find a pivot with page name ${target}`);
                    }
                }
                else {
                    idx = target;
                }
                if(!self._items[idx]) {
                    console.log(`Error: No pivot at index ${idx}`);
                    return false;
                }
                self.applyPreEvent(self._item.current);
                for(let i = 0; i < self._items.length; i++) {
                    self._items[i].hide();
                }
                self._items[idx].show();
                if(self._items[idx].attribute("data-m-page") != null) {
                    metron.routing.setRouteUrl(self._items[idx].attribute("data-m-page"), "", true);
                }
                self.init(self._items[idx]);
                return true;
            }
            private applyPreEvent(el: Element) {
                var self = this;
                if (el.attribute('data-m-page') != null){
                    if (self.preEventFuntions[el.attribute('data-m-page')] != undefined){
                        self.preEventFuntions[el.attribute('data-m-page')]();
                    }
                    
                }
            }
        }
    }
}
