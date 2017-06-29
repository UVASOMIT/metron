declare var Awesomplete: any;

namespace metron {
    export namespace controls {
        export class pivots {
            public static bindAll(callback?: Function): void {
                let pivots : NodeListOf<Element> = document.selectAll("[data-m-type='pivot']");
                for (let i = 0; i < pivots.length; i++) {
                    let section: Element = <Element>pivots[i];
                    let page: string = section.attribute("data-m-page");
                    if (metron.globals["pivots"][page] == null) {
                        let p: pivot = new controls.pivot(<Element>section);
                        p._postEventFunctions["hello"] = function(){
                            console.log("Hello");
                        };
                        p._postEventFunctions["hi"] = function(){
                            console.log("Hi");
                        };
                        p.initPivot();
                        metron.globals["pivots"][page] = p;
                    }
                }
                if (callback != null) {
                    callback();
                }
            }
        }
        export interface EventFunction {
            [name: string]: ()=>void;
        }
        export class pivot {
            private _pivotContainer: Element;
            private _items: Array<Element> = [];
            private _item: Pivot;
            private _previousButton: any;
            private _nextButton: any;
            public _preEventFuntions: EventFunction = {};
            public _postEventFunctions: EventFunction = {};

            constructor(private pivotCollection: Element, private displayIndex: number = 0, private nextButton?: any, private previousButton?: any, private eventFunction?: Function, private preEventFunction?: Function) {
                var self = this;
                self._pivotContainer = pivotCollection;
                self._nextButton = (nextButton != null) ? document.selectOne(`#${nextButton}`): self._pivotContainer.selectOne("[data-m-segment='controls'] [data-m-action='next']");
                self._previousButton = (previousButton != null) ? document.selectOne(`#${previousButton}`): self._pivotContainer.selectOne("[data-m-segment='controls'] [data-m-action='previous']");
            }

            public initPivot(){
                var self = this;
                if (self.displayIndex != null) {
                    let i = 0;
                    let itemList = self._pivotContainer.selectAll("[data-m-segment='pivot-item']");
                    itemList.each(function (idx: number, elem: Element) {
                        self._items.push(elem);
                        if (idx == self.displayIndex) {
                            self.init(elem);
                            elem.show();
                            if (elem.attribute('data-m-page') != null){
                                self._postEventFunctions[elem.attribute('data-m-page')]();
                            }
                        }
                        else {
                            elem.hide();
                        }
                    });
                }
            }
            private init(item: Element) {
                var self = this;
                self._item = {
                    parent: item.parentElement,
                    current: item,
                    next: (item.nextElementSibling != null && item.nextElementSibling.attribute("data-m-segment") != null && item.nextElementSibling.attribute("data-m-segment") == "pivot-item") ? item.nextElementSibling : null,
                    previous: (item.previousElementSibling != null && item.previousElementSibling.attribute("data-m-segment") != null && item.previousElementSibling.attribute("data-m-segment") == "pivot-item") ? item.previousElementSibling : null,
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
            }
            private applyActionEvents(el: Element) {
            }
            public next(): boolean {
                var self = this;
                if (!self._item.next) {
                    console.log("Couldn't find next pivot");
                    return false;
                }
                if (self._item.current.attribute('data-m-page') != null){
                    self._preEventFuntions[self._item.current.attribute('data-m-page')]();
                }
                self._item.current.toggle();
                self._item.next.show();
                if (self._item.next.attribute('data-m-page') != null){
                    self._postEventFunctions[self._item.next.attribute('data-m-page')]();
                }
                self.init(self._item.next);
                return true;
            }
            public previous(): boolean {
                var self = this;
                if (!self._item.previous) {
                    console.log("Couldn't find previous pivot");
                    return false;
                }
                if (self._item.current.attribute('data-m-page') != null){
                    self._preEventFuntions[self._item.current.attribute('data-m-page')]();
                }
                self._item.current.toggle();
                self._item.previous.show();
                if (self._item.previous.attribute('data-m-page') != null){
                    self._postEventFunctions[self._item.previous.attribute('data-m-page')]();
                }
                self.init(self._item.previous);
                return true;
            }
            public exact(idx: number): boolean {
                var self = this;
                if(!self._items[idx]) {
                    console.log(`Error: No pivot at index ${idx}`);
                    return false;
                }
                if (self._item.current.attribute('data-m-page') != null){
                    self._preEventFuntions[self._item.current.attribute('data-m-page')]();
                }
                self._item.current.hide();
                self._items[idx].show();
                if (self._items[idx].attribute('data-m-page') != null){
                    self._postEventFunctions[self._items[idx].attribute('data-m-page')]();
                }
                self.init(self._items[idx]);
                return true;
            }
        }
    }
}
