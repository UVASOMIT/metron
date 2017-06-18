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
                        metron.globals["pivots"][page] = p;
                    }
                }
                if (callback != null) {
                    callback();
                }
            }
        }

        export class pivot {
            private _items: Element;
            private _item: Pivot;
            private _previousButton: any;
            private _nextButton: any;
            constructor(private pivotCollection: Element, private displayIndex: number = 0, private nextButton?: any, private previousButton?: any, private eventFunction?: Function, private preEventFunction?: Function) {
                var self = this;
                self._items = pivotCollection;
                self._nextButton = (nextButton != null) ? document.selectOne(`#${nextButton}`): self._items.selectOne("[data-m-segment='controls'] [data-m-action='next']");
                self._previousButton = (previousButton != null) ? document.selectOne(`#${previousButton}`): self._items.selectOne("[data-m-segment='controls'] [data-m-action='previous']");
                if (displayIndex != null) {
                    let i = 0;
                    let itemList = self._items.selectAll("[data-m-segment='pivot-items'] [data-m-segment='pivot-item']");
                    itemList.each(function (idx: number, elem: Element) {
                        if (idx == displayIndex) {
                            self.init(elem);
                            elem.show();
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
                    next: item.nextElementSibling,
                    previous: item.previousElementSibling
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
                self._item.current.toggle();
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
                self._item.current.toggle();
                self._item.previous.show();
                self.init(self._item.previous);
                return true;
            }
            public exact(idx: number): boolean {
                var self = this;
                if(!self._items[idx]) {
                    console.log(`Error: No pivot at index ${idx}`);
                    return false;
                }
                self._item.current.hide();
                self._items[idx].show();
                self.init(self._items[idx]);
                return true;
            }
        }
    }
}
