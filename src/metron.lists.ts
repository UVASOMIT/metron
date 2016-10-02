/// <reference path="metron.extenders.ts" />
/// <reference path="metron.ts" />
/// <reference path="metron.framework.ts" />
/// <reference path="metron.forms.ts" />

namespace metron {
    export class lists {
        public static bindAll(): void {
            let sections: NodeListOf<Element> = document.selectAll("[data-m-type='list']");
            metron.globals["lists"] = [];
            for(let i = 0; i < sections.length; i++) {
                let section: Element = <Element>sections[i];
                var model: string = section.attribute("data-m-model");
                metron.web.get(`${metron.fw.getBaseUrl()}/${metron.fw.getBaseAPI()}/${model}${metron.fw.getAPIExtension()}`, {}, null, "json", function(data: any) {
                    let items = metron.tools.normalizeModelItems(data, model);
                    let l: list<any> = new list(model);
                    metron.globals["lists"].push(l);
                });
            }
        }
    }
    export class list<T> {
        private _filters: T = null;
        public recycleBin: Array<T> = [];
        public currentPageIndex: number = 1;
        public pageSize: number = 10;
        public totalPageSize: number = 0;
        public sortOrder: string = "DateCreated";
        public sortDirection: string = "DESC";
        constructor(public model: string, public listType: string = "list") {
            var self = this;
            self.init();
            //self.callListing();
        }
        private init(): void {
            var self = this;
            let listing: Element = document.selectOne(`[data-m-type='list'][data-m-model='${self.model}']`);
            let controlBlocks: NodeListOf<Element> = listing.selectAll("[data-m-segment='controls']");
            controlBlocks.each(function(idx: number, elem: Element) {
                let actions = elem.selectAll("[data-m-action]");
                actions.each(function(indx: number, el: Element) {
                    switch(el.attribute("data-m-action").lower()) {
                        case "new":
                            el.addEvent("click", function (e) {
                                e.preventDefault();
                                metron.form.clearForm(`[data-m-type='form'][data-m-model='${self.model}']`);
                                let form: Element = document.selectOne(`[data-m-type='form'][data-m-model='${self.model}']`);
                                form.attribute("data-m-state", "hide");
                                form.show();
                            });
                            break;
                        default:
                            break;
                    }
                });
            });
        }
        public populateTable(data: Array<any>, selector: string, callback: Function): void {
            var self = this;
            data.each(function (idx, item) {
                document.selectOne(`${selector} tbody`).append(callback(self, item));
            });
        }
        public clearTable(selector: string): void {
            document.selectOne(`${selector} tbody`).empty();
        }
        public getRows(selector: string): number {
            return document.selectAll(`${selector} tbody tr`).length;
        }
        public setupPagingEvents(selector: string, callback: Function, filters?: any): void {
            var self = this;
            document.selectOne(`${selector} ul.pagination > li > a[aria-label=Previous]`).removeEvent("click").addEvent("click", function (e) {
                e.preventDefault();
                self.pageListing(self.getPreviousPage(), callback, filters);
            });
            document.selectOne(`${selector} ul.pagination > li > a[aria-label=Next]`).removeEvent("click").addEvent("click", function (e) {
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

                document.selectAll(`${selector} ul.pagination > li`).each(function (idx: number, elem: Element) {
                    if (elem.first("a").attribute("aria-label") != "Previous" && elem.first("a").attribute("aria-label") != "Next") {
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
                    li.insertBefore(document.selectAll(`${selector} ul.pagination > li`).last());
                }
                document.selectOne(`${selector} ul.pagination > li > a[title = ${this.currentPageIndex}]`).parent().addClass("active");
                if (document.selectAll(`${selector} ul.pagination > li`).length <= 3) {
                    document.selectOne(`${selector} ul.pagination`).up("nav").hide();
                }
                else {
                    document.selectOne(`${selector} ul.pagination`).up("nav").show();
                }
            }
            else {
                document.selectOne(`${selector} ul.pagination`).up("nav").hide();
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
