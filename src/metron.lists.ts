/// <reference path="metron.extenders.ts" />
/// <reference path="metron.ts" />
/// <reference path="metron.base.ts" />
/// <reference path="metron.framework.ts" />
/// <reference path="metron.forms.ts" />
/// <reference path="metron.templates.ts" />

namespace metron {
    export class lists {
        public static bindAll(): void {
            let sections: NodeListOf<Element> = document.selectAll("[data-m-type='list']");
            metron.globals["lists"] = [];
            for (let i = 0; i < sections.length; i++) {
                let section: Element = <Element>sections[i];
                var model: string = section.attribute("data-m-model");
                var l: list<any> = new list(model).init();
                metron.globals["lists"].push(l);
            }
        }
    }
    export class list<T> extends base {
        private _elem: Element;
        private _filters: T = null;
        private _items: Array<T>;
        private _rowTemplate: string;
        private _form: metron.form<any>;
        public recycleBin: Array<T> = [];
        public currentPageIndex: number = 1;
        public pageSize: number = 10;
        public totalPageSize: number = 0;
        public sortOrder: string = "DateCreated";
        public sortDirection: string = "DESC";
        constructor(public model: string, public listType: string = "list", public asscForm?: form<T>) {
            super();
            var self = this;
            if(asscForm != null) {
                self._form = asscForm;
            }
            if(self._filters == null) {
                self._filters = <any>{};
            }
        }
        public init(): list<T> {
            var self = this;
            self._elem = document.selectOne(`[data-m-type='list'][data-m-model='${self.model}']`);
            let f: metron.form<any> = (self.asscForm != null) ? self.asscForm : self.attachForm(new metron.form(self.model, self).init());
            let filterBlocks: NodeListOf<Element> = self._elem.selectAll("[data-m-segment='filters']");
            filterBlocks.each(function(idx: number, elem: Element) {
                let filters = elem.selectAll("[data-m-action='filter']");
                filters.each(function (indx: number, el: Element) {
                    if(el.attribute("data-m-binding") != null) {
                        let binding: string = el.attribute("data-m-binding");
                        let key: string = el.attribute("name");
                        let nText: string = el.attribute("data-m-text");
                        metron.web.get(`${metron.fw.getAPIURL(binding)}`, {}, null, "json", function (data: Array<T>) {
                            data.each(function(i: number, item: any) {
                                el.append(`<option value="${item[key]}">${item[nText]}</option>`);
                                if(f.elem.selectOne(`#${self.model}_${key}`) != null) {
                                    (<HTMLElement>f.elem.selectOne(`#${self.model}_${key}`)).append(`<option value="${item[key]}">${item[nText]}</option>`);
                                }
                            });
                        });
                        el.addEvent("change", function (e) {
                            let fil = self._filters;
                            fil[key] = ((<HTMLElement>this).val() == '') ? null : <any>(<HTMLElement>this).val();
                            self._filters = fil;
                            self.callListing();
                        });
                    }
                    if(el.attribute("data-m-search") != null) {
                        el.addEvent("click", function (e) {
                            e.preventDefault();
                            let itm: Element = this;
                            let fil = self._filters;
                            let terms: Array<string> = this.attribute("data-m-search").split(",");
                            terms.each(function(i: number, term: string) {
                                let parent: Element = itm.parent();
                                fil[term.trim()] = ((<HTMLElement>parent.selectOne(`#${itm.attribute("data-m-search-for")}`)).val() == '') ? null : <any>(<HTMLElement>parent.selectOne(`#${itm.attribute("data-m-search-for")}`)).val();
                            });
                            self._filters = fil;
                            self.callListing();
                        });
                    }
                });
            });
            let controlBlocks: NodeListOf<Element> = self._elem.selectAll("[data-m-segment='controls']");
            controlBlocks.each(function (idx: number, elem: Element) {
                let actions = elem.selectAll("[data-m-action]");
                actions.each(function (indx: number, el: Element) {
                    switch (el.attribute("data-m-action").lower()) {
                        case "new":
                            el.addEvent("click", function (e) {
                                e.preventDefault();
                                f.clearForm();
                                f.elem.attribute("data-m-state", "show");
                                f.elem.show();
                                self._elem.attribute("data-m-state", "hide");
                                self._elem.hide();
                            });
                            break;
                        case "undo":
                            el.addEvent("click", function (e) {
                                e.preventDefault();
                                self.undoLast();
                            });
                            el.hide();
                            break;
                        case "download":
                            el.addEvent("click", function (e) {
                                e.preventDefault();
                                document.location.href = `${metron.fw.getAPIURL(self.model)}/download`;
                            });
                            break;
                        default:
                            break;
                    }
                });
            });
            self.callListing();
            return self;
        }
        private populateListing(): void {
            var self = this;
            self.clearTable(`[data-m-type='list'][data-m-model='${self.model}'] table[data-m-segment='list']`);
            self.populateTable(`[data-m-type='list'][data-m-model='${self.model}'] table[data-m-segment='list']`);
            self.createPaging(`[data-m-type='list'][data-m-model='${self.model}'] [data-m-segment='paging']`, self.callListing, (self._items.length > 0) ? self._items[0]["TotalCount"] : 0);
            self.applyViewEvents();
        }
        private applyViewEvents(): void {
            var self = this;
            document.selectAll(`[data-m-type='list'][data-m-model='${self.model}'] [data-m-action='edit']`).each(function (idx: number, elem: Element) {
                elem.addEvent("click", function (e) {
                    e.preventDefault();
                    self._form.clearForm();
                    let parameters = {};
                    parameters[`${self.model}ID`] = <number><any>metron.tools.getDataPrimary(`${self.model}ID`, elem.attribute("data-m-primary"));
                    metron.web.get(`${metron.fw.getAPIURL(self.model)}${metron.web.querystringify(parameters)}`, parameters, null, "json", function (data: T) {
                        if(data instanceof Array) {
                            data = data[0];
                        }
                        for (let prop in data) {
                            if(data.hasOwnProperty(prop) && data[prop] != null && document.selectOne(`#${self.model}_${prop}`) != null) {
                                (<HTMLElement>document.selectOne(`#${self.model}_${prop}`)).val(data[prop]);
                            }
                        }
                        self._form.elem.attribute("data-m-state", "show");
                        self._form.elem.show();
                        self._elem.attribute("data-m-state", "hide");
                        self._elem.hide();
                    });
                });
            });
            document.selectAll(`[data-m-type='list'][data-m-model='${self.model}'] [data-m-action='delete']`).each(function (idx: number, elem: Element) {
                elem.addEvent("click", function (e) {
                    e.preventDefault();
                    if (confirm('Are you sure you want to delete this record?')) {
                        let current = this;
                        let parameters = {};
                        parameters[`${self.model}ID`] = <number><any>metron.tools.getDataPrimary(`${self.model}ID`, current.attribute("data-m-primary"));
                        metron.web.remove(`${metron.fw.getAPIURL(self.model)}${metron.web.querystringify(parameters)}`, parameters, null, "json", function (data: T) {
                            if(data instanceof Array) {
                                data = data[0];
                            }
                            self.recycleBin.push(data);
                            current.up("tr").drop();
                            document.selectOne(`[data-m-type='list'][data-m-model='${self.model}'] [data-m-action='undo']`).show();
                        });
                    }
                });
            });
            document.selectAll(`[data-m-type='list'][data-m-model='${self.model}'] th[data-m-action='sort']`).each(function (idx: number, elem: Element) {
                elem.addClass("pointer");
                elem.removeEvent("click").addEvent("click", function (e) {
                    self.sortOrder = elem.attribute("data-m-col");
                    if (self.sortDirection == "ASC") {
                        self.sortDirection = "DESC"
                    }
                    else {
                        self.sortDirection = "ASC";
                    }
                    self.callListing();
                });
            });
        }
        public undoLast(): void {
            var self = this;
            metron.web.post(`${metron.fw.getAPIURL(self.model)}/undo`, self.recycleBin.pop(), null, "json", function (data: T) {
                self.callListing();
            });
            if (self.recycleBin.length == 0) {
                document.selectOne(`[data-m-type='list'][data-m-model='${self.model}'] [data-m-action='undo']`).hide();
            }
        }
        public formatData(item: T): string {
            var self = this;
            return metron.templates.list.row(self._rowTemplate, item);
        }
        public callListing(): void {
            var self = this;
            var parameters: any = Object.extend({ PageIndex: self.currentPageIndex, PageSize: self.pageSize, SortOrder: self.sortOrder, SortDirection: self.sortDirection }, self._filters);
            metron.web.get(`${metron.fw.getAPIURL(self.model)}${metron.web.querystringify(parameters)}`, {}, null, "json", function (data: Array<T>) {
                self._items = data;
                self.populateListing();
            });
        }
        public populateTable(selector: string): void {
            var self = this;
            self._items.each(function (idx, item) {
                document.selectOne(`${selector} tbody`).append(self.formatData(item));
            });
        }
        public clearTable(selector: string): void {
            var self = this;
            if(String.isNullOrEmpty(self._rowTemplate)) {
                self._rowTemplate = (<HTMLElement>document.selectOne(`${selector} tbody tr[data-m-action='repeat']`)).outerHTML;
            }
            document.selectOne(`${selector} tbody`).empty();
        }
        public getRows(selector: string): number {
            return document.selectAll(`${selector} tbody tr`).length;
        }
        public setupPagingEvents(selector: string, callback: Function, filters?: any): void {
            var self = this;
            document.selectOne(`${selector} > li > a[title='Previous']`).removeEvent("click").addEvent("click", function (e) {
                e.preventDefault();
                self.pageListing(self.getPreviousPage(), callback, filters);
            });
            document.selectOne(`${selector} > li > a[title='Next']`).removeEvent("click").addEvent("click", function (e) {
                e.preventDefault();
                self.pageListing(self.getNextPage(), callback, filters);
            });
            document.selectOne(`${selector} > li > a[title='First']`).removeEvent("click").addEvent("click", function (e) {
                e.preventDefault();
                self.pageListing(1, callback, filters);
            });
            document.selectOne(`${selector} > li > a[title='Last']`).removeEvent("click").addEvent("click", function (e) {
                e.preventDefault();
                self.pageListing(self.totalPageSize, callback, filters);
            });
        }
        public createPaging(selector: string, callback: Function, totalCount, filters?: any): void {
            var self = this;
            if (self.currentPageIndex != null && self.pageSize != null) {
                this.totalPageSize = this.calculateTotalPageSize(totalCount);
                var startPage: number = ((parseInt(this.currentPageIndex.toString(), 10) - 5) < 1) ? 1 : (parseInt(this.currentPageIndex.toString(), 10) - 5);
                var endPage: number = ((parseInt(this.currentPageIndex.toString(), 10) + 5) > this.totalPageSize) ? this.totalPageSize : (parseInt(this.currentPageIndex.toString(), 10) + 5);

                this.setupPagingEvents(selector, callback, filters);

                document.selectAll(`${selector} > li`).each(function (idx: number, elem: Element) {
                    if (elem.first("a").attribute("title") != "Previous" && elem.first("a").attribute("title") != "Next" && elem.first("a").attribute("title") != "First" && elem.first("a").attribute("title") != "Last") {
                        elem.remove();
                    }
                });
                for (let i = 1; i <= this.totalPageSize; i++) {
                    if (i < startPage || i > endPage) {
                        continue;
                    }
                    let li: Element = document.create("<li />");
                    let idx = i;
                    let link: Element = document.create(`<a>${idx}</a>`).attribute("href", "#").attribute("title", <string><any>idx).addEvent("click", function (e) {
                        e.preventDefault();
                        self.pageListing(<number><any>this.attribute("title"), callback, filters);
                    });
                    li.append(link.asString());
                    document.selectOne(`${selector}`).insertBefore(li, document.selectOne(`${selector} > li > a[title='Next']`).parent());
                }
                document.selectOne(`${selector} > li > a[title='${this.currentPageIndex}']`).parent().addClass("active");
                if (document.selectAll(`${selector} > li`).length <= 5) {
                    document.selectOne(`${selector}`).hide();
                }
                else {
                    document.selectOne(`${selector}`).show();
                }
            }
            else {
                document.selectOne(`${selector}`).hide();
            }
            self.applyPageSizeEvents(selector);
        }
        private applyPageSizeEvents(selector: string): void {
            var self = this;
            var parent = document.selectOne(`${selector}`).parent();
            var control = parent.selectOne("[data-m-segment='controls'] [data-m-segment='paging']");
            control.addEvent("change", function(e) {
                self.pageSize = <number><any>(<HTMLElement>control).val();
                self.callListing();
            });
        }
        private calculateTotalPageSize(totalCount: number): number {
            return Math.ceil(totalCount / this.pageSize);
        }
        private pageListing(idx: number, callback: Function, filters?: any) {
            this.currentPageIndex = idx;
            callback(this, filters);
        }
        private getPreviousPage(): number {
            return (this.currentPageIndex === 0) ? this.currentPageIndex : (parseInt(<any>this.currentPageIndex, 10) - 1);
        }
        private getNextPage(): number {
            return (this.currentPageIndex === this.totalPageSize) ? this.currentPageIndex : (parseInt(<any>this.currentPageIndex, 10) + 1);
        }
        private attachForm(f: metron.form<any>): metron.form<any> {
            var self = this;
            self._form = f;
            return self._form;
        }
        public get elem(): Element {
            return this._elem;
        }
        public set elem(f: Element) {
            this._elem = f;
        }
        public get form(): metron.form<any> {
            return this._form;
        }
        public set form(f: metron.form<any>) {
            this._form = f;
        }
        public get filters(): T {
            return this._filters;
        }
        public set filters(f: T) {
            this._filters = f;
        }
    }
}
