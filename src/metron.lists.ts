/// <reference path="metron.extenders.ts" />
/// <reference path="metron.ts" />
/// <reference path="metron.framework.ts" />
/// <reference path="metron.forms.ts" />

namespace metron {
    export class lists {
        public static bindAll(): void {
            let sections: NodeListOf<Element> = document.selectAll("[data-m-type='list']");
            metron.globals["lists"] = [];
            for (let i = 0; i < sections.length; i++) {
                let section: Element = <Element>sections[i];
                var model: string = section.attribute("data-m-model");
                var l: list<any> = new list(model);
                metron.globals["lists"].push(l);
            }
        }
    }
    export class list<T> {
        private _filters: T = null;
        private _items: Array<T>;
        private _rowTemplate: Element;
        public recycleBin: Array<T> = [];
        public currentPageIndex: number = 1;
        public pageSize: number = 10;
        public totalPageSize: number = 0;
        public sortOrder: string = "DateCreated";
        public sortDirection: string = "DESC";
        constructor(public model: string, public listType: string = "list") {
            var self = this;
            self.init();
            self.callListing();
        }
        private init(): void {
            var self = this;
            let listing: Element = document.selectOne(`[data-m-type='list'][data-m-model='${self.model}']`);
            let controlBlocks: NodeListOf<Element> = listing.selectAll("[data-m-segment='controls']");
            controlBlocks.each(function (idx: number, elem: Element) {
                let actions = elem.selectAll("[data-m-action]");
                actions.each(function (indx: number, el: Element) {
                    switch (el.attribute("data-m-action").lower()) {
                        case "new":
                            el.addEvent("click", function (e) {
                                e.preventDefault();
                                metron.form.clearForm(`[data-m-type='form'][data-m-model='${self.model}']`);
                                let form: Element = document.selectOne(`[data-m-type='form'][data-m-model='${self.model}']`);
                                form.attribute("data-m-state", "show");
                                form.show();
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
                        case "submit":
                            el.addEvent("click", function (e) {
                                e.preventDefault();
                                if (metron.form.isValid(`[data-m-type='form'][data-m-model='${self.model}']`)) {
                                    let parameters: any = { };
                                    let form: Element = document.selectOne(`[data-m-type='form'][data-m-model='${self.model}']`);
                                    form.selectAll("input, select, textarea").each(function(idx: number, elem: Element) {
                                        parameters[<string>elem.attribute("name")] = (<HTMLElement>elem).val();
                                    });
                                    metron.web.get(`${metron.fw.getAPIURL(self.model)}`, parameters, null, "json", function (data: T) {
                                        let form: Element = document.selectOne(`[data-m-type='form'][data-m-model='${self.model}']`);
                                        (<HTMLElement>form.selectOne(`#${self.model}_${self.model}ID`)).val(<string><any>data[`${self.model}ID`]);
                                        form.attribute("data-m-state", "hide");
                                        form.hide();
                                        self.callListing();
                                    });
                                }
                            });
                        default:
                            break;
                    }
                });
            });
        }
        private populateListing(): void {
            var self = this;
            self.clearTable(`[data-m-type='list'][data-m-model='${self.model}'] table[data-m-segment='list']`);
            self.populateTable(`[data-m-type='list'][data-m-model='${self.model}'] table[data-m-segment='list']`);
            self.createPaging(`[data-m-type='list'][data-m-model='${self.model}'] [data-m-segment='paging']`, this.callListing, (self._items.length > 0) ? self._items[0]["TotalCount"] : 0);
            self.applyViewEvents();
        }
        private applyViewEvents(): void {
            var self = this;
            document.selectAll(`[data-m-type='list'][data-m-model='${self.model}'] [data-m-action='edit']`).each(function (idx: number, elem: Element) {
                elem.addEvent("click", function (e) {
                    e.preventDefault();
                    metron.form.clearForm(`[data-m-type='form'][data-m-model='${self.model}']`);
                    let parameters = {};
                    parameters[`${self.model}ID`] = <number><any>metron.tools.getDataPrimary(`${self.model}ID`, elem.attribute("data-primary"));
                    metron.web.get(`${metron.fw.getAPIURL(self.model)}`, parameters, null, "json", function (data: T) {
                        for (let prop in data) {
                            (<HTMLElement>document.selectOne(`${self.model}_${prop}`)).val(data[prop]);
                        }
                        let form: Element = document.selectOne(`[data-m-type='form'][data-m-model='${self.model}']`);
                        form.attribute("data-m-state", "hide");
                        form.show();
                    });
                });
            });
            document.selectAll(`[data-m-type='list'][data-m-model='${self.model}'] [data-m-action='delete']`).each(function (idx: number, elem: Element) {
                elem.addEvent("click", function (e) {
                    e.preventDefault();
                    if (confirm('Are you sure you want to delete this record?')) {
                        let current = this;
                        let parameters = {};
                        parameters[`${self.model}ID`] = <number><any>metron.tools.getDataPrimary(`${self.model}ID`, current.attribute("data-primary"));
                        metron.web.remove(`${metron.fw.getAPIURL(self.model)}`, parameters, null, "json", function (data: T) {
                            self.recycleBin.push(data);
                            document.selectOne(`[data-m-type='list'][data-m-model='${self.model}'] [data-m-action='undo']`).show();
                            current.up(".trow").remove();
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
            metron.web.post(`${metron.fw.getAPIURL(self.model)}`, self.recycleBin.pop(), null, "json", function (data: T) {
                self.callListing();
            });
            if (self.recycleBin.length == 0) {
                document.selectOne(`[data-m-type='list'][data-m-model='${self.model}'] [data-m-action='undo']`).hide();
            }
        }
        public formatData(item: T): string {
            var self = this;
            return metron.templates.list.row(self._rowTemplate, item).toString();
        }
        public callListing(): void {
            var self = this;
            var params: any = Object.extend({ PageIndex: self.currentPageIndex, PageSize: self.pageSize, SortOrder: self.sortOrder, SortDirection: self.sortDirection }, self._filters);
            metron.web.get(`${metron.fw.getAPIURL(self.model)}`, {}, null, "json", function (data: T) {
                let items: Array<T> = metron.tools.normalizeModelItems(data, self.model);
                self._items = items;
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
            self._rowTemplate = document.selectOne(`${selector} tbody tr[data-m-action='repeat']`);
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
        }
        public createPaging(selector: string, callback: Function, totalCount, filters?: any): void {
            var self = this;
            if (self.currentPageIndex != null && self.pageSize != null) {
                this.totalPageSize = this.calculateTotalPageSize(totalCount);
                var startPage: number = ((parseInt(this.currentPageIndex.toString(), 10) - 5) < 1) ? 1 : (parseInt(this.currentPageIndex.toString(), 10) - 5);
                var endPage: number = ((parseInt(this.currentPageIndex.toString(), 10) + 5) > this.totalPageSize) ? this.totalPageSize : (parseInt(this.currentPageIndex.toString(), 10) + 5);

                this.setupPagingEvents(selector, callback, filters);

                document.selectAll(`${selector} > li`).each(function (idx: number, elem: Element) {
                    if (elem.first("a").attribute("title") != "Previous" && elem.first("a").attribute("title") != "Next") {
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
                    li.append(link.toString());
                    li.insertBefore(document.selectAll(`${selector} > li`).last());
                }
                document.selectOne(`${selector} > li > a[title='${this.currentPageIndex}']`).parent().addClass("active");
                if (document.selectAll(`${selector} > li`).length <= 3) {
                    document.selectOne(`${selector}`).hide();
                }
                else {
                    document.selectOne(`${selector}`).show();
                }
            }
            else {
                document.selectOne(`${selector}`).hide();
            }
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
    }
}
