declare var Awesomplete: any;

namespace metron {
    export namespace controls {
        export module pivot {
            export class pivots {
                public static bindAll(callback?: Function): void {
                    let pivots : NodeListOf<Element> = document.selectAll("[data-m-type='pivot']");
                    for (let i = 0; i < pivots.length; i++) {
                            let pivot: Element = <Element>pivots[i];
                            if (pivot.attribute("data-m-autoload") == null || pivot.attribute("data-m-autoload") == "true") {
                                new controls.pivot.pivot(pivot);
                            }
                    }
                    if (callback != null){
                        callback();
                    }
                }
            }
            export class pivot{
                private pivotItemContainer: Element;
                private pivotItem: any;
                private pivotPreviousButton: any;
                private pivotNextButton: any;

                constructor(private Pivot: Element, private displayIndex: number = 0, private nextButton?: any, private previousButton?: any, private eventFunction?: Function, private preEventFunction?: Function){
                    var self = this;
                    self.pivotItemContainer = Pivot;
                    self.pivotNextButton = (nextButton != null) ? document.selectOne(`#${nextButton}`): Pivot.selectOne("[data-m-segment='controls'] [data-m-action='next']");
                    self.pivotPreviousButton = (previousButton != null) ? document.selectOne(`#${previousButton}`): Pivot.selectOne("[data-m-segment='controls'] [data-m-action='previous']");
                    if (displayIndex != null){
                        let i = 0;
                        let itemList = self.pivotItemContainer.selectAll("[data-m-segment='pivot-item']");
                        itemList.each(function (idx: number, elm: Element){
                            if (idx == displayIndex){
                                self.initPivotControls(elm);
                                elm.attribute("style", "display: block;");
                            }
                            else {
                                elm.attribute("style", "display: none");
                            }
                        });
                    }
                }

                private initPivotControls(ItemContainer: Element){
                    var self = this;
                    this.pivotItemContainer = ItemContainer;
                    this.pivotItem = new Object({
                        //parent : document.selectOne(`[data-m-type='pivot'] < [data-m-segment='pivot-item']`),
                        parent: ItemContainer.parentElement,
                        next: ItemContainer.nextElementSibling,
                        previous: ItemContainer.previousElementSibling
                    });

                    if (this.pivotNextButton != null || this.pivotPreviousButton != null){
                        if (this.pivotItem["next"] == undefined){
                            this.pivotNextButton.attribute("disabled", "disabled");
                        }
                        else {
                            this.pivotNextButton.attribute("disabled", null);
                            this.pivotNextButton.removeEvent("click").addEvent("click", function (e) {
                                e.preventDefault();
                                self.next();
                            });
                        }
                        if (this.pivotItem["previous"] == undefined){
                            this.pivotPreviousButton.attribute("disabled", "disabled");
                        }
                        else{
                            this.pivotPreviousButton.attribute("disabled", null);
                            this.pivotPreviousButton.removeEvent("click").addEvent("click", function (e) {
                                e.preventDefault();
                                self.previous();
                            });
                        }
                    }
                }

                private initControlsAction(el: Element){
                        
                }

                private next(): void {
                    if (!this.pivotItem['next']){
                        console.log("Couldn't find next pivot");
                        return;
                    }
                    this.pivotItemContainer.toggle();
                    this.pivotItem["next"].show();
                    this.initPivotControls(this.pivotItem["next"]);
                }

                private previous(): void {
                    if (!this.pivotItem['previous']){
                        console.log("Couldn't find previous pivot");
                        return;
                    }
                    this.pivotItemContainer.toggle();
                    this.pivotItem["previous"].show();
                    this.initPivotControls(this.pivotItem["previous"]);
                }
            }
        }
    }
}