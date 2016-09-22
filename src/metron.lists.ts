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
    export abstract class list {
        public currentPageIndex: number = 1;
        public pageSize: number = 10;
        public totalPageSize: number = 0;
        public sortOrder: string = "DateCreated";
        public sortDirection: string = "DESC";
        constructor(public listType: string = "list") {

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
        /*
        public createPaging(selector: string, callback: Function, totalCount, filters?: any): void {
            var self = this;
            if (self.currentPageIndex != null && self.pageSize != null) {
                this.totalPageSize = this.calculateTotalPageSize(totalCount);
                var startPage: number = ((parseInt(this.currentPageIndex.toString(), 10) - 5) < 1) ? 1 : (parseInt(this.currentPageIndex.toString(), 10) - 5);
                var endPage: number = ((parseInt(this.currentPageIndex.toString(), 10) + 5) > this.totalPageSize) ? this.totalPageSize : (parseInt(this.currentPageIndex.toString(), 10) + 5);

                this.setupPagingEvents(selector, callback, filters);

                $(`${selector} ul.pagination > li`).each(function () {
                    if ($(this).children("a").attr("aria-label") != "Previous" && $(this).children("a").attr("aria-label") != "Next") {
                        $(this).remove();
                    }
                });
                for (let i = 1; i <= this.totalPageSize; i++) {
                    if (i < startPage || i > endPage) {
                        continue;
                    }
                    let li = $("<li />");
                    let idx = i;
                    let link = $(`<a>${idx}</a>`).attr({ "href": "#", "title": idx }).click(function (e) {
                        e.preventDefault();
                        self.pageListing(<number><any>$(this).attr("title"), callback, filters);
                    });
                    link.appendTo(li);
                    li.insertBefore(`${selector} ul.pagination > li:last`);
                }
                $(`${selector} ul.pagination > li > a[title = ${this.currentPageIndex}]`).parent().addClass("active");
                if ($(`${selector} ul.pagination > li`).length <= 3) {
                    $(`${selector} ul.pagination`).closest("nav").hide();
                }
                else {
                    $(`${selector} ul.pagination`).closest("nav").show();
                }
            }
            else {
                $(`${selector} ul.pagination`).closest("nav").hide();
            }
        }
        */
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
