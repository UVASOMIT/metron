/// <reference path="../node_modules/@types/rsvp/index.d.ts" />
/// <reference path="metron.extenders.ts" />
/// <reference path="metron.tools.ts" />
/// <reference path="metron.ts" />
/// <reference path="metron.base.ts" />
/// <reference path="metron.framework.ts" />
/// <reference path="metron.forms.ts" />
/// <reference path="metron.templates.ts" />

namespace metron {
    export class lists {
        public static bindAll(callback: Function): void {
            let sections: NodeListOf<Element> = document.selectAll("[data-m-type='list']");
            for (let i = 0; i < sections.length; i++) {
                let section: Element = <Element>sections[i];
                if (section.attribute("data-m-autoload") == null || section.attribute("data-m-autoload") == "true") {
                    let model: string = section.attribute("data-m-model");
                    if (metron.globals["lists"][model] == null) {
                        let l: list<any> = new list(model).init();
                        metron.globals["lists"][model] = l;
                    }
                }
            }
            if(callback != null) {
                callback();
            }
        }
    }
    export class list<T> extends base {
        private _elem: Element;
        private _filters: any = {};
        private _items: Array<T>;
        private _rowTemplate: string;
        private _form: metron.form<any>;
        public recycleBin: Array<T> = [];
        public currentPageIndex: number = 1;
        public pageSize: number = 10;
        public totalPageSize: number = 0;
        public totalCount: number = 0;
        public sortOrder: string = "DateCreated";
        public sortDirection: string = "DESC";
        public fetchURL: string;
        constructor(public model: string, public listType: string = LIST, public asscForm?: form<T>) {
            super(model, listType);
            var self = this;
            if (asscForm != null) {
                self._form = asscForm;
            }
            var qs: string = <string><any>metron.web.querystring();
            if (qs != "") {
                self._filters = metron.tools.formatOptions(qs, metron.OptionTypes.QUERYSTRING);
            }
        }
        public init(): list<T> {
            var self = this;
            self._elem = document.selectOne(`[data-m-type='list'][data-m-model='${self.model}']`);
            if (self._elem != null) {
                let f: metron.form<any> = (self.asscForm != null) ? self.asscForm : self.attachForm(self.model);
                let filterBlocks: NodeListOf<Element> = self._elem.selectAll("[data-m-segment='filters']");
                filterBlocks.each(function (idx: number, elem: Element) {
                    let filters = elem.selectAll("[data-m-action='filter']");
                    self.loadFilters(f, filters);
                });
                var controlBlocks: NodeListOf<Element> = self._elem.selectAll("[data-m-segment='controls']");
                controlBlocks.each(function (idx: number, elem: Element) {
                    let actions = elem.selectAll("[data-m-action]");
                    actions.each(function (indx: number, el: Element) {
                        switch (el.attribute("data-m-action").lower()) {
                            case "new":
                                el.addEvent("click", function (e) {
                                    e.preventDefault();
                                    if (metron.globals.actions != null && metron.globals.actions[el.attribute("data-m-action").lower()] != null) { //Refactor getting the action overrides
                                        metron.globals.actions[el.attribute("data-m-action").lower()]();
                                    }
                                    else {
                                        f.clearForm();
                                        f.elem.attribute("data-m-state", "show");
                                        f.elem.show();
                                        self._elem.attribute("data-m-state", "hide");
                                        self._elem.hide();
                                    }
                                });
                                break;
                            case "undo":
                                el.addEvent("click", function (e) {
                                    e.preventDefault();
                                    if (metron.globals.actions != null && metron.globals.actions[el.attribute("data-m-action").lower()] != null) {
                                        metron.globals.actions[el.attribute("data-m-action").lower()]();
                                    }
                                    else {
                                        self.undoLast();
                                    }
                                });
                                el.hide();
                                break;
                            case "download":
                                el.addEvent("click", function (e) {
                                    e.preventDefault();
                                    if (metron.globals.actions != null && metron.globals.actions[el.attribute("data-m-action").lower()] != null) {
                                        metron.globals.actions[el.attribute("data-m-action").lower()]();
                                    }
                                    else {
                                        document.location.href = `${metron.fw.getBaseUrl()}/${self.model}/download`;
                                    }
                                });
                                break;
                            default:
                                if (metron.globals.actions != null && metron.globals.actions[el.attribute("data-m-action").lower()] != null) {
                                    el.addEvent("click", function (e) {
                                        e.preventDefault();
                                        metron.globals.actions[el.attribute("data-m-action").lower()]();
                                    });
                                }
                                break;
                        }
                    });
                });
                self.callListing();
                if ((<any>self).init_m_inject != null) {
                    (<any>self).init_m_inject();
                }
            }
            return self;
        }
        private loadFilters(f: metron.form<T>, filters: NodeListOf<Element>): void {
            var self = this;
            var promises: Array<any> = [];
            filters.each(function (indx: number, el: Element) {
                if (el.attribute("data-m-binding") != null) {
                    let binding: string = el.attribute("data-m-binding");
                    let key: string = (el.attribute("data-m-key")) != null ? el.attribute("data-m-key") : el.attribute("name");
                    let nm: string = el.attribute("name");
                    let nText: string = el.attribute("data-m-text");
                    let options: any = (el.attribute("data-m-options") != null) ? metron.tools.formatOptions(el.attribute("data-m-options")) : {};
                    let ajx = new RSVP.Promise(function (resolve, reject) {
                        metron.web.get(`${metron.fw.getAPIURL(binding)}${metron.web.querystringify(options)}`, {}, null, "json", function (data: Array<T>) {
                            data.each(function (i: number, item: any) {
                                el.append(`<option value="${item[key]}">${item[nText]}</option>`);
                                if (f.elem != null && f.elem.selectOne(`#${self.model}_${key}`) != null) {
                                    (<HTMLElement>f.elem.selectOne(`#${self.model}_${nm}`)).append(`<option value="${item[key]}">${item[nText]}</option>`);
                                }
                            });
                            resolve(data);
                        });
                    });
                    promises.push(ajx);
                    el.addEvent("change", function (e) {
                        let fil = self._filters;
                        fil[key] = ((<HTMLElement>this).val() == '') ? null : <any>(<HTMLElement>this).val();
                        self._filters = fil;
                        self.callListing();
                    });
                }
                if (el.attribute("data-m-search") != null) {
                    el.addEvent("click", function (e) {
                        e.preventDefault();
                        let itm: Element = this;
                        let fil = self._filters;
                        let terms: Array<string> = this.attribute("data-m-search").split(";");
                        terms.each(function (i: number, term: string) {
                            let parent: Element = itm.parent();
                            fil[term.trim()] = ((<HTMLElement>parent.selectOne(`#${itm.attribute("data-m-search-for")}`)).val() == '') ? null : <any>(<HTMLElement>parent.selectOne(`#${itm.attribute("data-m-search-for")}`)).val();
                        });
                        self._filters = fil;
                        self.callListing();
                    });
                }
            });
            RSVP.all(promises).then(function () {
                if ((<any>self).loadFilters_m_inject != null) {
                    (<any>self).loadFilters_m_inject();
                }
            }).catch(function (reason) {
                console.log("Error: Promise execution failed!");
            });
        }
        private applyViewEvents(): void {
            var self = this;
            document.selectAll(`[data-m-type='list'][data-m-model='${self.model}'] [data-m-action='edit']`).each(function (idx: number, elem: Element) {
                elem.removeEvent("click").addEvent("click", function (e) {
                    e.preventDefault();
                    if (metron.globals.actions != null && metron.globals.actions[`${self.model}_${elem.attribute("data-m-action").lower()}`] != null) { //Refactor getting the action overrides
                        metron.globals.actions[`${self.model}_${elem.attribute("data-m-action").lower()}`](elem);
                    }
                    else {
                        self._form.clearForm();
                        let parameters = metron.tools.formatOptions(elem.attribute("data-m-primary"));
                        self._form.loadForm(parameters);
                    }
                });
            });
            document.selectAll(`[data-m-type='list'][data-m-model='${self.model}'] [data-m-action='delete']`).each(function (idx: number, elem: Element) {
                elem.removeEvent("click").addEvent("click", function (e) {
                    e.preventDefault();
                    if (metron.globals.actions != null && metron.globals.actions[`${self.model}_${elem.attribute("data-m-action").lower()}`] != null) { //Refactor getting the action overrides
                        metron.globals.actions[`${self.model}_${elem.attribute("data-m-action").lower()}`](elem);
                    }
                    else {
                        if (confirm('Are you sure you want to delete this record?')) {
                            let current = this;
                            let parameters = metron.tools.formatOptions(elem.attribute("data-m-primary"));
                            metron.web.remove(`${metron.fw.getAPIURL(self.model)}${metron.web.querystringify(parameters)}`, parameters, null, "json", function (data: T) {
                                if (data instanceof Array) {
                                    data = data[0];
                                }
                                self.recycleBin.push(data);
                                current.up("tr").drop();
                                document.selectOne(`[data-m-type='list'][data-m-model='${self.model}'] [data-m-action='undo']`).show();
                            });
                        }
                    }
                });
            });
            document.selectAll(`[data-m-type='list'][data-m-model='${self.model}'] th[data-m-action='sort']`).each(function (idx: number, elem: Element) {
                elem.removeClass("pointer").addClass("pointer");
                elem.removeEvent("click").addEvent("click", function (e) {
                    self.sortOrder = elem.attribute("data-m-col");
                    if (self.sortDirection == "ASC") {
                        self.sortDirection = "DESC"
                    }
                    else {
                        self.sortDirection = "ASC";
                    }
                    self.callListing();
                }, true);
            });
            document.selectAll(`[data-m-type='list'][data-m-model='${self.model}'] [data-m-action]`).each(function (idx: number, elem: Element) {
                if (elem.attribute("data-m-action") != "edit" && elem.attribute("data-m-action") != "delete" && elem.attribute("data-m-action") != "sort" && elem.attribute("data-m-action") != "filter") { //Use an in/keys here
                    if (metron.globals.actions != null && metron.globals.actions[`${self.model}_${elem.attribute("data-m-action").lower()}`] != null) {
                        elem.removeEvent("click").addEvent("click", function (e) {
                            e.preventDefault();
                            metron.globals.actions[`${self.model}_${elem.attribute("data-m-action").lower()}`](elem);
                        });
                    }
                }
            });
            if ((<any>self).applyViewEvents_m_inject != null) {
                (<any>self).applyViewEvents_m_inject();
            }
        }
        public populateListing(): void {
            var self = this;
            self.clearTable(`[data-m-type='list'][data-m-model='${self.model}'] [data-m-segment='list']`);
            self.populateTable(`[data-m-type='list'][data-m-model='${self.model}'] [data-m-segment='list']`);
            self.totalCount = (self._items.length > 0) ? self._items[0]["TotalCount"] : 0;
            self.createPaging(`[data-m-type='list'][data-m-model='${self.model}'] [data-m-segment='paging']`, self.totalCount);
            self.applyViewEvents();
            if ((<any>self).populateListing_m_inject != null) {
                (<any>self).populateListing_m_inject();
            }
        }
        public undoLast(): void {
            var self = this;
            metron.web.post(`${metron.fw.getAPIURL(self.model)}/undo`, self.recycleBin.pop(), null, "json", function (data: T) {
                self.callListing();
            });
            if (self.recycleBin.length == 0) {
                document.selectOne(`[data-m-type='list'][data-m-model='${self.model}'] [data-m-action='undo']`).hide();
            }
            if ((<any>self).undoLast_m_inject != null) {
                (<any>self).undoLast_m_inject();
            }
        }
        public formatData(item: T, isTable: boolean = true): string {
            var self = this;
            return metron.templates.list.row<T>(self._rowTemplate, item, isTable);
        }
        public callListing(): void {
            var self = this;
            self.clearAlerts();
            var parameters: any = Object.extend({ PageIndex: self.currentPageIndex, PageSize: self.pageSize, _SortOrder: self.sortOrder, _SortDirection: self.sortDirection }, self._filters);
            var url = (self.fetchURL != null) ? self.fetchURL : self.model;
            metron.web.get(`${metron.fw.getAPIURL(url)}${metron.web.querystringify(metron.tools.normalizeModelData(parameters))}`, {}, null, "json", function (data: Array<T>) {
                self._items = data;
                self.populateListing();
                if ((<any>self).callListing_m_inject != null) {
                    (<any>self).callListing_m_inject();
                }
            }, (txt: string, jsn: any, xml: XMLDocument) => {
                self.showAlerts(DANGER, txt, jsn, xml);
            });
        }
        public populateTable(selector: string): void {
            var self = this;
            var tbody = document.selectOne(`${selector} [data-m-type='table-body']`);
            var isTable: boolean = (tbody.nodeName.lower() == "tbody") ? true : false;
            self._items.each(function (idx, item) {
                document.selectOne(`${selector} [data-m-type='table-body']`).append(self.formatData(item, isTable));
            });
            tbody.attribute("data-m-state", "show");
            if (isTable) {
                tbody.show("table-row-group");
            }
            else {
                tbody.show();
            }
        }
        public clearTable(selector: string): void {
            var self = this;
            if (String.isNullOrEmpty(self._rowTemplate)) {
                self._rowTemplate = (<HTMLElement>document.selectOne(`${selector} [data-m-type='table-body'] [data-m-action='repeat']`)).outerHTML;
            }
            document.selectOne(`${selector} [data-m-type='table-body']`).empty();
        }
        public getRows(selector: string): number {
            return document.selectAll(`${selector} [data-m-type='table-body'] [data-m-type='row']`).length;
        }
        public setupPagingEvents(selector: string, filters?: any): void {
            var self = this;
            document.selectOne(`${selector} > li > a[title='Previous']`).removeEvent("click").addEvent("click", function (e) {
                e.preventDefault();
                self.pageListing(self.getPreviousPage(), filters);
            }, true);
            document.selectOne(`${selector} > li > a[title='Next']`).removeEvent("click").addEvent("click", function (e) {
                e.preventDefault();
                self.pageListing(self.getNextPage(), filters);
            }, true);
            document.selectOne(`${selector} > li > a[title='First']`).removeEvent("click").addEvent("click", function (e) {
                e.preventDefault();
                self.pageListing(1, filters);
            }, true);
            document.selectOne(`${selector} > li > a[title='Last']`).removeEvent("click").addEvent("click", function (e) {
                e.preventDefault();
                self.pageListing(self.totalPageSize, filters);
            }, true);
        }
        public createPaging(selector: string, totalCount, filters?: any): void {
            var self = this;
            if (self.currentPageIndex != null && self.pageSize != null) {
                self.totalPageSize = self.calculateTotalPageSize(totalCount);
                var startPage: number = ((parseInt(this.currentPageIndex.toString(), 10) - 5) < 1) ? 1 : (parseInt(this.currentPageIndex.toString(), 10) - 5);
                var endPage: number = ((parseInt(this.currentPageIndex.toString(), 10) + 5) > this.totalPageSize) ? this.totalPageSize : (parseInt(this.currentPageIndex.toString(), 10) + 5);

                self.setupPagingEvents(selector, filters);

                document.selectAll(`${selector} > li`).each(function (idx: number, elem: Element) {
                    if (elem.first("a").attribute("title") != "Previous" && elem.first("a").attribute("title") != "Next" && elem.first("a").attribute("title") != "First" && elem.first("a").attribute("title") != "Last") {
                        elem.drop();
                    }
                });
                for (let i = 1; i <= self.totalPageSize; i++) {
                    if (i < startPage || i > endPage) {
                        continue;
                    }
                    let li: Element = document.create("<li />");
                    let idx = i;
                    let link: Element = document.create(`<a class="button button-outline">${idx}</a>`).attribute("href", "#").attribute("title", <string><any>idx).addEvent("click", function (e) {
                        e.preventDefault();
                        self.pageListing(<number><any>this.attribute("title"), filters);
                    });
                    li.appendChild(link);
                    document.selectOne(`${selector}`).insertBefore(li, document.selectOne(`${selector} > li > a[title='Next']`).parent());
                }
                if (self.totalPageSize > 0) {
                    document.selectOne(`${selector} > li > a[title='${self.currentPageIndex}']`).removeClass("button-outline").addClass("button-clear");
                }
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
            control.addEvent("change", function (e) {
                self.pageSize = <number><any>(<HTMLElement>control).val();
                self.callListing();
            });
        }
        private calculateTotalPageSize(totalCount: number): number {
            return Math.ceil(totalCount / this.pageSize);
        }
        private pageListing(idx: number, filters?: any) {
            this.currentPageIndex = idx;
            this.callListing();
        }
        private getPreviousPage(): number {
            return (this.currentPageIndex === 0) ? this.currentPageIndex : (parseInt(<any>this.currentPageIndex, 10) - 1);
        }
        private getNextPage(): number {
            return (this.currentPageIndex === this.totalPageSize) ? this.currentPageIndex : (parseInt(<any>this.currentPageIndex, 10) + 1);
        }
        private attachForm(m: string): metron.form<any> {
            var self = this;
            var f: metron.form<T> = (metron.globals["forms"][self.model] != null) ? metron.globals["forms"][self.model] : new metron.form(m, self);
            if(f.list == null) {
                f.list = self;
            }
            metron.globals["forms"][self.model] = f;
            var elem = document.selectOne(`[data-m-type='form'][data-m-model='${m}']`);
            if (!f.hasLoaded && elem != null && (elem.attribute("data-m-autoload") == null || elem.attribute("data-m-autoload") == "true")) {
                f.init();
            }
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
