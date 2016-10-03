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
                var l: list<any> = new list(model);
                metron.globals["lists"].push(l);
            }
        }
    }
    export class list<T> {
        private _filters: T = null;
        private _items: Array<T>;
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
        private populateListing(data: Array<T>): void {
            var self = this;
            self.clearTable(`[data-m-type='list'][data-m-model='${self.model}'] table[data-m-segment='list']`);
            self.populateTable(data, `[data-m-type='list'][data-m-model='${self.model}'] table[data-m-segment='list']`, self.formatData);
            //self.applyViewEvents();
            self.createPaging("#responseactions", this.callListing, (data.length > 0) ? data[0]["TotalCount"] : 0);
        }
        /*
        private applyViewEvents(): void {
          var self = this;
          $('#responseaction-table button.view').each(function () {
            $(this).click(function (e) {
              e.preventDefault();
              Base.Form.clearForm("#responseaction-modal");
              getCallback(`${self.baseURL}/${self.baseFolder}/api/ResponseAction`, {
                ResponseActionID: <number><any>self.getDataPrimary("ResponseActionID", $(this).data('primary'))
                
                }, function (data: ResponseAction) {
                
                      $('#ResponseAction_ResponseActionID').val(<string><any>data.ResponseActionID);
                    
                      $('#ResponseAction_Name').val(<string><any>data.Name);
                    
                      $('#ResponseAction_Description').val(<string><any>data.Description);
                    
                      $('#ResponseAction_DateCreated').val(<string><any>data.DateCreated);
                    
                      $('#ResponseAction_DateModified').val(<string><any>data.DateModified);
                    
                      $('#ResponseAction_ComputingID').val(<string><any>data.ComputingID);
                    
                      if (data.Active) {
                      $('#ResponseAction_Active').prop('checked', true);
                      }
                    
                      $('#ResponseAction_Guid').val(<string><any>data.Guid);
                    
                (<any>$('#responseaction-modal')).modal();
              });
            });
          });
          $('#responseaction-table button.delete').each(function () {
            $(this).click(function (e) {
              e.preventDefault();
              if (confirm('Are you sure you want to delete this record?')) {
                let elem = this;
                
                  let ResponseActionID = self.getDataPrimary("ResponseActionID", $(elem).data('primary'));
                
                deleteCallback(`${self.baseURL}/${self.baseFolder}/api/ResponseAction`, {
                ResponseActionID: <number><any>ResponseActionID
                  }, function (data: ResponseAction) {
                  self.recycleBin.push(data);
                  //$("#responseaction-controls button[title = 'Undo']").show();
                  $(elem).closest(".arow").remove();
                });
              }
            });
          });
          $('th[data-sort]').each(function (idx, elem) {
              $(this).css('cursor','pointer');
              $(this).off('click').on('click', function (e) {
                  self.sortOrder = $(this).data('sort');
                  if (self.sortOrderDirection == "ASC") {
                      self.sortOrderDirection = "DESC"
                  }
                  else {
                      self.sortOrderDirection = "ASC";
                  }
                  self.callListing(self);
              });
          });
        }
        */
        public formatData(item: T, custom: Function): string {
            var self = this;
            var primaries = `${self.model}ID:${item[self.model + "ID"]};`
            var str = `${metron.templates.list.startRow()}${metron.templates.list.getStandardActionButtonsCell(primaries)}`;
            if (self._items.length === 0) {
                for (let k in item) {
                    str += metron.templates.list.getCell(item[k]);
                }
            }
            else {
                for (let i = 0; i < self._items.length; i++) {
                    str += metron.templates.list.getCell(item[<any>self._items[i]]);
                }
            }
            str += metron.templates.list.endRow();
            return str;
        }
        public callListing(): void {
            var self = this;
            var params: any = Object.extend({ PageIndex: self.currentPageIndex, PageSize: self.pageSize, SortOrder: self.sortOrder, SortDirection: self.sortDirection }, self._filters);
            metron.web.get(`${metron.fw.getAPIURL(self.model)}`, {}, null, "json", function(data: T) {
                let items: Array<T> = metron.tools.normalizeModelItems(data, self.model);
                self._items = items;
                self.populateListing(items);
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
