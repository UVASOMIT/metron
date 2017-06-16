declare var Awesomplete: any;

namespace metron {
    export namespace controls {
        export class pivots {
            public static bindAll(callback?: Function): void {
                let pivots : NodeListOf<Element> = document.selectAll("[data-m-type='pivot']");
                for (let i = 0; i < pivots.length; i++) {
                    new controls.pivot(<Element>pivots[i]);
                }
                if (callback != null) {
                    callback();
                }
            }
        }

        export class pivot {
            private _itemContainer: Element;
            private _item: Pivot;
            private _previousButton: any;
            private _nextButton: any;
            constructor(private pivotCollection: Element, private displayIndex: number = 0, private nextButton?: any, private previousButton?: any, private eventFunction?: Function, private preEventFunction?: Function){
                var self = this;
                self._itemContainer = pivotCollection;
                self._nextButton = (nextButton != null) ? document.selectOne(`#${nextButton}`): self._itemContainer.selectOne("[data-m-segment='controls'] [data-m-action='next']");
                self._previousButton = (previousButton != null) ? document.selectOne(`#${previousButton}`): self._itemContainer.selectOne("[data-m-segment='controls'] [data-m-action='previous']");
                if (displayIndex != null) {
                    let i = 0;
                    let itemList = self._itemContainer.selectAll("[data-m-segment='pivot-items'] [data-m-segment='pivot-item']");
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
            private next(): boolean {
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

            private previous(): boolean {
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
        }
    }
}
