declare var Awesomplete: any;

namespace metron {
    export namespace controls {
        export function polyfill(): void {
            function fillDateInput(currentDate: string, keyCode: number): string {
                let currentLength: number = currentDate.length;
                let lastCharEntered: string = currentDate[currentLength - 1];
                let daysInMonth: string[] = ["0","31","28","31","30","31","30","31","31","30","31","30","31"];
                let currentMonth: number = currentLength > 2 ? Number(currentDate.substring(0,2)) : 0;
                if (currentLength == 2 && currentDate[0] == "1" && lastCharEntered == "/")
                    return "01/";
                if (!isNumber(lastCharEntered)) {
                    return currentDate.substring(0, currentLength - 1);
                }
                if (currentLength > 10) {
                    return currentDate.substring(0, 10);
                }
                if (currentLength == 1 && Number(currentDate) > 1) {
                    return "0" + currentDate + '/';
                } 
                else if (currentLength == 3) {
                    if (Number(lastCharEntered) > 3) {
                        return currentDate.substring(0, 2) + "/0" + lastCharEntered + '/';
                    } 
                    else {
                        return currentDate.substring(0, 2) + "/" + lastCharEntered;
                    }
                } 
                else if (currentLength == 4 && Number(currentDate[3]) > 3) {
                    return currentDate.substring(0, 3) + "0" + currentDate[3] + '/';
                } 
                else if (currentLength == 4 && Number(currentDate[3]) == 3 && currentMonth == 2) {
                    return currentDate.substring(0, 3) + "0" + currentDate[3] + '/';
                } 
                else if (currentLength == 4 && Number(currentDate[3]) == 3 && currentMonth != 0) {
                    if (keyCode != 8) {
                        if (daysInMonth[currentMonth] == "30") {
                            return currentDate.substring(0, 3) + daysInMonth[currentMonth] + '/';
                        } 
                        else {
                            return currentDate;
                        }
                    }
                    else {
                        return currentDate.substring(0, 3);
                    }
                } 
                else if (currentLength == 2) {
                    if (keyCode != 8) {
                        if (Number(lastCharEntered) > 2 && currentDate[0] == "1") {
                            return currentDate.substring(0, currentLength - 1);
                        } 
                        else {
                            return currentDate + '/';
                        }
                    }
                } 
                else if (currentLength == 5) {
                    if (keyCode != 8) {
                        if (Number(currentDate[3]) == 3 && Number(lastCharEntered) > 1) {
                            return currentDate.substring(0, currentLength - 1);
                        } 
                        else {
                            return currentDate + '/';
                        }
                    }
                } 
                else if (currentLength == 6) {
                    return currentDate.substring(0, 5) + "/" + lastCharEntered;
                } 
                else if (currentLength == 10 && Number(currentDate[3]) == 2 && Number(currentDate[4]) == 9 && currentMonth == 2) {
                    if (!isLeapYear(currentDate.substring(6))) {
                        return currentDate.replace("29","28");
                    }
                }
                return currentDate;
            }
            function fillTimeInput(currentTime: string, keyCode: number): string {
                let currentLength: number = currentTime.length;
                let lastCharEntered: string = currentTime[currentLength - 1];
                if (currentLength < 6 && !isNumber(lastCharEntered)) {
                    return currentTime.substring(0, currentLength - 1);
                }
                if ((currentLength == 6 || currentLength == 7) && !(lastCharEntered.toLowerCase() == "a" || lastCharEntered.toLowerCase() == "p")) {
                    return currentTime.substring(0, currentLength - 1);
                }
                if (currentLength > 8) {
                    return currentTime.substring(0, 8);
                }
                if (currentLength == 1 && Number(currentTime) > 1) {
                    return "0" + currentTime + ':';
                } 
                else if (currentLength == 3) {
                    if (Number(lastCharEntered) > 5) {
                        return currentTime.substring(0, 2) + ":0" + lastCharEntered + ' ';
                    } 
                    else {
                        return currentTime.substring(0, 2) + ":" + lastCharEntered;
                    }
                } 
                else if (currentLength == 4 && Number(currentTime[3]) > 5) {
                    return currentTime.substring(0, 3) + "0" + currentTime[3] + ' ';
                } 
                else if (currentLength == 2) {
                    if (keyCode != 8) {
                        return currentTime + ':';
                    }
                } 
                else if (currentLength == 5) {
                    if (keyCode != 8) {
                        return currentTime + ' ';
                    }
                } 
                else if (currentLength == 6) {
                    if (lastCharEntered.toLowerCase() == "a")
                        return currentTime.substring(0, 5) + " AM";
                    if (lastCharEntered.toLowerCase() == "p")
                        return currentTime.substring(0, 5) + " PM";
                } 
                else if (currentLength == 6 || currentLength == 7) {
                    if (keyCode == 8) {
                        return currentTime.substring(0, currentLength - 1);
                    } 
                    else {
                        if (lastCharEntered.toLowerCase() == "a")
                            return currentTime.substring(0, 5) + " AM";
                        if (lastCharEntered.toLowerCase() == "p")
                            return currentTime.substring(0, 5) + " PM";
                    }
                }
                return currentTime;
            }

            function isNumber(n): boolean {
                return !isNaN(parseFloat(n)) && isFinite(n);
            }
              
            function isLeapYear(year): boolean {
                return ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);
            }

            function checkDateInputSupport(): boolean {
                let input: HTMLInputElement = document.createElement("input");
                input.setAttribute("type", "date");
                let notADateValue: string = "not-a-date";
                input.setAttribute("value", notADateValue);
                return !(input.value === notADateValue);
            }
            if (!checkDateInputSupport() && typeof window.orientation === 'undefined') {
                metron.globals.requiresDateTimePolyfill = true;
                document.selectAll("input[type=date]").each((idx: number, elem: HTMLInputElement) => {
                    elem.placeholder = "mm/dd/yyyy";
                    elem.addEventListener("keyup", (e) => {
                        elem.val(fillDateInput(elem.val(), e.keyCode));
                    });
                });
                document.selectAll("input[type=time]").each((idx: number, elem: HTMLInputElement) => {
                    elem.placeholder = "--:-- --";
                    elem.addEventListener("keyup", (e) => {
                        elem.value = fillTimeInput(elem.val(), e.keyCode); // don't set elem.value with val extender here. elem.val(fillTimeInput(elem.val(), e.keyCode));
                    });
                });
            }
        }
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
                            if(elem.up("[data-m-type='pivot']").attribute("data-m-page") == null || elem.up("[data-m-type='pivot']").attribute("data-m-page") === page) {
                                elem.addEvent("click", (e) => {
                                    e.preventDefault();
                                    let p1 = <metron.controls.pivot>metron.globals["pivots"][page];
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
            private _name: string;
            private _pivotContainer: Element;
            private _items: Array<Element> = [];
            private _item: Pivot;
            private _previousButton: any;
            private _nextButton: any;
            private _preEventFunctions: EventFunction = {};
            private _postEventFunctions: EventFunction = {};
            constructor(private pivotCollection: Element, private displayIndex: number = 0, private nextButton?: any, private previousButton?: any) {
                var self = this;
                self._name = pivotCollection.attribute("data-m-page");
                self._pivotContainer = pivotCollection;
                self._nextButton = (nextButton != null) ? document.selectOne(`#${nextButton}`): self._pivotContainer.selectOne("[data-m-segment='controls'] [data-m-action='next']");
                self._previousButton = (previousButton != null) ? document.selectOne(`#${previousButton}`): self._pivotContainer.selectOne("[data-m-segment='controls'] [data-m-action='previous']");

                if (self.displayIndex != null) {
                    let i = 0;
                    let itemList = self._pivotContainer.selectAll("[data-m-segment='pivot-item']");
                    itemList.each(function (idx: number, elem: Element) {
                        if(elem.up("[data-m-type='pivot']").attribute("data-m-page") == null || elem.up("[data-m-type='pivot']").attribute("data-m-page") === self._name) {
                            self._items.push(elem);
                            if (idx == self.displayIndex) {
                                self.init(elem);
                                elem.show();
                            }
                            else {
                                elem.hide();
                            }
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
                    if (self._postEventFunctions[self._item.current.attribute('data-m-page')] != undefined){
                        self._postEventFunctions[self._item.current.attribute('data-m-page')]();
                    }
                }
            }
            private applyPreEvent(el: Element) {
                var self = this;
                if (el.attribute('data-m-page') != null) {
                    if (self._preEventFunctions[el.attribute('data-m-page')] != undefined){
                        self._preEventFunctions[el.attribute('data-m-page')]();
                    }
                    
                }
            }
            public addPreEvent(name:string, func:Function){
                var self = this;
                if (self._preEventFunctions[name] == undefined) {
                    self._preEventFunctions[name] = func;
                }
                else {
                    console.log(`${name} pre-event function already exists.`);
                }
            }
            public addPostEvent(name:string, func:Function){
                var self = this;
                if (self._postEventFunctions[name] == undefined) {
                    self._postEventFunctions[name] = func;
                }
                else {
                    console.log(`${name} pre-event function already exists.`);
                }
            }
            public removePostEvent(name: string) {
                delete this._postEventFunctions[name];
            }
            public removePreEvent(name: string) {
                delete this._preEventFunctions[name];
            }
            public next(): void {
                var self = this;
                if (!self._item.next) {
                    console.log("Couldn't find next pivot. Using last pivot instead.");
                    self._item.next = self._items[self._items.length - 1];
                }
                self.applyPreEvent(self._item.current);
                for (let i = 0; i < self._items.length; i++) {
                    self._items[i].hide();
                }
                self._item.next.show();
                self.init(self._item.next);
            }
            public previous(): void {
                var self = this;
                if (!self._item.previous) {
                    console.log("Couldn't find previous pivot. Using first pivot instead.");
                    self._item.previous = self._items[0];
                }
                self.applyPreEvent(self._item.current);
                for (let i = 0; i < self._items.length; i++) {
                    self._items[i].hide();
                }
                self._item.previous.show();
                self.init(self._item.previous);
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
        }
    }
}
