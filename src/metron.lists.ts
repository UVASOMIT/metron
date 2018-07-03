/// <reference path="metron.types.ts" />

namespace metron {
    export class lists {
        public static bindAll(callback: Function): void {
            let sections: NodeListOf<Element> = document.selectAll("[data-m-type='list']");
            for (let i = 0; i < sections.length; i++) {
                let section: Element = <Element>sections[i];
                if (section.attribute("data-m-autoload") == null || section.attribute("data-m-autoload") == "true") {
                    let model: string = section.attribute("data-m-model");
                    let mID: string = section.attribute("id");
                    let gTypeName: string = (mID != null) ? `${mID}_${model}` : model;
                    if (metron.globals["lists"][gTypeName] == null) {
                        let l: list<any> = new list(model);
                        l.id = mID;
                        l.gTypeName = gTypeName;
                        l.init();
                    }
                }
            }
            if (callback != null) {
                callback();
            }
        }
    }
    export class list<T> extends base {
        private _elem: Element;
        private _filters: any = {};
        private _items: Array<T>;
        private _rowTemplate: string;
        private _form: string;
        public id: string;
        public gTypeName: string;
        public recycleBin: Array<T> = [];
        public currentPageIndex: number = 1;
        public pageSize: number = (!isNaN(<number><any>metron.config["config.options.pageSize"])) ? <number><any>metron.config["config.options.pageSize"] : 10;
        public totalPageSize: number = 0;
        public totalCount: number = 0;
        public sortOrder: string = (metron.config["config.options.sortOrder"] != null) ? metron.config["config.options.sortOrder"] : "DateCreated";
        public sortDirection: string = (metron.config["config.options.sortDirection"] != null) ? metron.config["config.options.sortDirection"] : "DESC";
        private _defaults: any = (metron.config["config.lists.defaults"] != null) ? metron.config["config.lists.defaults"] : { };
        public fetchURL: string;
        constructor(public model: string, public mID?: string) {
            super(model, LIST);
            var self = this;
            self.id = mID;
            self.gTypeName = (mID != null) ? `${mID}_${model}` : model;
            metron.globals["lists"][self.gTypeName] = self;
            self.setFilters();
        }
        public init(): list<T> {
            var self = this;
            self._elem = (self.id != null) ? document.selectOne(`#${self.id}`) : document.selectOne(`[data-m-type='list'][data-m-model='${self.model}']`);
            if (self._elem != null) {
                self.pivot = self.attachPivot(self._elem);
                self._name = self._elem.attribute("data-m-page");
                let filterBlocks: NodeListOf<Element> = self._elem.selectAll("[data-m-segment='filters']");
                filterBlocks.each(function (idx: number, elem: Element) {
                    let filters = elem.selectAll("[data-m-action='filter']");
                    self.loadFilters(filters);
                });
                var controlBlocks: NodeListOf<Element> = self._elem.selectAll("[data-m-segment='controls']");
                controlBlocks.each(function (idx: number, elem: Element) {
                    let actions = elem.selectAll("[data-m-action]");
                    actions.each(function (indx: number, el: Element) {
                        switch (el.attribute("data-m-action").lower()) {
                            case "new":
                                el.addEvent("click", function (e) {
                                    e.preventDefault();
                                    if (metron.globals.actions != null && metron.globals.actions[`${self.model}_${el.attribute("data-m-action").lower()}`] != null) { //Refactor getting the action overrides
                                        metron.globals.actions[`${self.model}_${el.attribute("data-m-action").lower()}`]();
                                    }
                                    else {
                                        if(self.pivot != null) {
                                            (el.attribute("data-m-pivot") != null) ? self.pivot.exact(<any>el.attribute("data-m-pivot")) : self.pivot.next();
                                        }
                                        if(metron.globals["forms"][self.model] != null) {
                                            try {
                                                metron.globals["forms"][self.model].loadForm();
                                            }
                                            catch(e) { }
                                        }
                                        if ((<any>self).new_m_inject != null) {
                                            (<any>self).new_m_inject();
                                        }
                                    }
                                }, true);
                                break;
                            case "undo":
                                el.addEvent("click", function (e) {
                                    e.preventDefault();
                                    if (metron.globals.actions != null && metron.globals.actions[`${self.model}_${el.attribute("data-m-action").lower()}`] != null) {
                                        metron.globals.actions[`${self.model}_${el.attribute("data-m-action").lower()}`]();
                                    }
                                    else {
                                        self.undoLast();
                                    }
                                    if ((<any>self).undo_m_inject != null) {
                                        (<any>self).undo_m_inject();
                                    }
                                }, true);
                                el.hide();
                                break;
                            case "download":
                                el.addEvent("click", function (e) {
                                    e.preventDefault();
                                    if (metron.globals.actions != null && metron.globals.actions[`${self.model}_${el.attribute("data-m-action").lower()}`] != null) {
                                        metron.globals.actions[`${self.model}_${el.attribute("data-m-action").lower()}`]();
                                    }
                                    else {
                                        document.location.href = `${metron.fw.getAppUrl()}/${self.model}/download`;
                                    }
                                    if ((<any>self).download_m_inject != null) {
                                        (<any>self).download_m_inject();
                                    }
                                }, true);
                                break;
                            default:
                                if (metron.globals.actions != null && metron.globals.actions[`${self.model}_${el.attribute("data-m-action").lower()}`] != null) {
                                    el.addEvent("click", function (e) {
                                        e.preventDefault();
                                        metron.globals.actions[`${self.model}_${el.attribute("data-m-action").lower()}`]();
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
        private loadFilters(filters: NodeListOf<Element>): void {
            var self = this;
            var promises: Array<any> = [];
            filters.each(function (indx: number, el: Element) {
                if (el.attribute("data-m-binding") != null) {
                    let binding: string = el.attribute("data-m-binding");
                    let key: string = (el.attribute("data-m-key")) != null ? el.attribute("data-m-key") : el.attribute("name");
                    let nm: string = el.attribute("name");
                    let nText: string = el.attribute("data-m-text");
                    let options: any = (el.attribute("data-m-options") != null) ? metron.tools.formatOptions(el.attribute("data-m-options")) : {};
                    let ajx = new RSVP.Promise((resolve, reject) => {
                        metron.web.get(`${metron.fw.getAPIURL(binding)}${self.withDefaults(options)}`, {}, null, "json", function (data: Array<T>) {
                            data.each((i: number, item: any) => {
                                if(self._filters[key] != null && self._filters[key] == item[key]) {
                                    el.append(`<option value="${item[key]}" selected="selected">${item[nText]}</option>`);
                                }
                                else {
                                    el.append(`<option value="${item[key]}">${item[nText]}</option>`);
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
                        self.currentPageIndex = 1;
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
                        self.currentPageIndex = 1;
                        self.callListing();
                    });
                }
            });
            RSVP.all(promises).then(() => {
                if ((<any>self).loadFilters_m_inject != null) {
                    (<any>self).loadFilters_m_inject();
                }
            }).catch(function (reason) {
                console.log(`Error: Promise execution failed! ${reason}`);
            });
        }
        private applyViewEvents(): void {
            var self = this;
            self._elem.selectAll(`[data-m-action='edit']`).each(function (idx: number, elem: Element) {
                elem.removeEvent("click").addEvent("click", function (e) {
                    e.preventDefault();
                    if (metron.globals.actions != null && metron.globals.actions[`${self.model}_${elem.attribute("data-m-action").lower()}`] != null) {
                        metron.globals.actions[`${self.model}_${elem.attribute("data-m-action").lower()}`](elem);
                    }
                    else {
                        let parameters = metron.tools.formatOptions(elem.attribute("data-m-primary"));
                        if(self.pivot != null) {
                            (elem.attribute("data-m-pivot") != null) ? self.pivot.exact(<any>elem.attribute("data-m-pivot")) : self.pivot.next();
                        }
                        if(metron.globals["forms"][self.model] != null) {
                            try {
                                metron.globals["forms"][self.model].loadForm(parameters);
                            }
                            catch(e) { }
                        }
                        if ((<any>self).edit_m_inject != null) {
                            (<any>self).edit_m_inject();
                        }
                    }
                }, true);
            });
            self._elem.selectAll(`[data-m-action='delete']`).each(function (idx: number, elem: Element) {
                elem.removeEvent("click").addEvent("click", function (e) {
                    e.preventDefault();
                    if (metron.globals.actions != null && metron.globals.actions[`${self.model}_${elem.attribute("data-m-action").lower()}`] != null) {
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
                                if(current.up("tr") != null) {
                                    current.up("tr").drop();
                                }
                                else {
                                    current.up(".row").drop();
                                }
                                self._elem.selectOne(`[data-m-action='undo']`).show();
                                if ((<any>self).delete_m_inject != null) {
                                    (<any>self).delete_m_inject();
                                }
                            });
                        }
                    }
                }, true);
            });
            self._elem.selectAll(`[data-m-action='sort']`).each(function (idx: number, elem: Element) {
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
            self._elem.selectAll(`[data-m-action]`).each(function (idx: number, elem: Element) {
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
        private withDefaults(parameters: any): string {
            var self = this;
            if (Object.keys(self._defaults).length) {
                let local = {};
                for (let k in self._defaults) {
                    if (self._defaults.hasOwnProperty(k)) {
                        local[k] = self._defaults[k];
                    }
                }
                let withDefaults: any = Object.extend(parameters, local);
                return metron.web.querystringify(metron.tools.normalizeModelData(withDefaults));
            }
            return metron.web.querystringify(metron.tools.normalizeModelData(parameters));
        }
        public populateListing(): void {
            var self = this;
            //-------------------------------
            self.clearTable(self._elem.selectOne(`[data-m-segment='list']`));
            self.populateTable(self._elem.selectOne(`[data-m-segment='list']`));
            self.totalCount = (self._items.length > 0) ? self._items[0]["TotalCount"] : 0;
            self.createPaging(self._elem.selectOne(`[data-m-segment='paging']`), self.totalCount);
            //-------------------------------
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
                self._elem.selectOne(`[data-m-action='undo']`).hide();
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
            if(!self._elem.isHidden()) {
                metron.routing.setRouteUrl(self._name, metron.web.querystringify(metron.tools.normalizeModelData(parameters)));
            }
            metron.web.get(`${metron.fw.getAPIURL(url)}${self.withDefaults(parameters)}`, {}, null, "json", function (data: Array<T>) {
                self._items = data;
                self.populateListing();
                if ((<any>self).callListing_m_inject != null) {
                    (<any>self).callListing_m_inject();
                }
            }, (txt: string, jsn: any, xml: XMLDocument) => {
                self.showAlerts(DANGER, txt, jsn, xml);
            });
        }
        public populateTable(selector: Element): void {
            var self = this;
            var tbody = selector.selectOne("[data-m-type='table-body']");
            var isTable: boolean = (tbody.nodeName.lower() == "tbody") ? true : false;
            self._items.each(function (idx, item) {
                selector.selectOne("[data-m-type='table-body']").append(self.formatData(item, isTable));
            });
            tbody.attribute("data-m-state", "show");
            if (isTable) {
                tbody.show("table-row-group");
            }
            else {
                tbody.show();
            }
        }
        public clearTable(selector: Element): void {
            var self = this;
            if (String.isNullOrEmpty(self._rowTemplate)) {
                self._rowTemplate = (<HTMLElement>selector.selectOne("[data-m-type='table-body'] [data-m-action='repeat']")).outerHTML;
            }
            selector.selectOne("[data-m-type='table-body']").empty();
        }
        public getRows(selector: string): number {
            return document.selectAll(`${selector} [data-m-type='table-body'] [data-m-type='row']`).length;
        }
        public setupPagingEvents(selector: Element, filters?: any): void {
            var self = this;
            selector.selectOne("li > a[title='Previous']").removeEvent("click").addEvent("click", function (e) {
                e.preventDefault();
                self.pageListing(self.getPreviousPage(), filters);
            }, true);
            selector.selectOne("li > a[title='Next']").removeEvent("click").addEvent("click", function (e) {
                e.preventDefault();
                self.pageListing(self.getNextPage(), filters);
            }, true);
            selector.selectOne("li > a[title='First']").removeEvent("click").addEvent("click", function (e) {
                e.preventDefault();
                self.pageListing(1, filters);
            }, true);
            selector.selectOne("li > a[title='Last']").removeEvent("click").addEvent("click", function (e) {
                e.preventDefault();
                self.pageListing(self.totalPageSize, filters);
            }, true);
        }
        public createPaging(selector: Element, totalCount, filters?: any): void {
            var self = this;
            if (selector == null){return;}
            if (self.currentPageIndex != null && self.pageSize != null ) {
                self.totalPageSize = self.calculateTotalPageSize(totalCount);
                var startPage: number = ((parseInt(this.currentPageIndex.toString(), 10) - 5) < 1) ? 1 : (parseInt(this.currentPageIndex.toString(), 10) - 5);
                var endPage: number = ((parseInt(this.currentPageIndex.toString(), 10) + 5) > this.totalPageSize) ? this.totalPageSize : (parseInt(this.currentPageIndex.toString(), 10) + 5);
                self.setupPagingEvents(selector, filters);
                selector.selectAll("li").each(function (idx: number, elem: Element) {
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
                    selector.insertBefore(li, selector.selectOne("li > a[title='Next']").parent());
                }
                if (self.totalPageSize > 0) {
                    selector.selectOne(`li > a[title='${self.currentPageIndex}']`).removeClass("button-outline").addClass("button-clear");
                }
                if (selector.selectAll("li").length <= 5) {
                    selector.hide();
                }
                else {
                    selector.show();
                }
            }
            else {
                selector.hide();
            }
            self.applyPageSizeEvents(selector);
        }
        private applyPageSizeEvents(selector: Element): void {
            var self = this;
            var parent = selector.parent();
            var control = parent.selectOne("[data-m-segment='controls'] [data-m-segment='paging']");
            (<HTMLElement>control).val(<string><any>self.pageSize);
            control.addEvent("change", function (e) {
                self.pageSize = <number><any>(<HTMLElement>control).val();
                metron.config["config.options.pageSize"] = self.pageSize;
                let store = new metron.store(metron.DB, metron.DBVERSION, metron.STORE);
                store.init().then((result) => {
                    return store.setItem("metron.config", metron.config);
                }).then((result) => {
                    self.callListing();
                }).catch((reason) => {
                    console.log(`Error: Failed to access storage. ${reason}`);
                    self.callListing();
                });
            }, true);
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
        private setFilters(): void {
            var self = this;
            var elem = (self._elem != null) ? self._elem : document.selectOne(`[data-m-type='list'][data-m-model='${self.model}']`); //Do we need this?
            var page = (elem != null) ? elem.attribute("data-m-page") : null;
            var routeName = metron.routing.getRouteName();
            var qs: string = <string><any>metron.web.querystring();
            if (qs != "") {
                self._filters = metron.tools.formatOptions(qs, metron.OptionTypes.QUERYSTRING);
            }
            let hash = metron.routing.getRouteUrl(self._filters);
            if (hash != null) {
                /* If getRouteUrl() has the filters set, then the below items should never be in the hash. Might be able to delete this. */
                self.pageSize = (hash["PageSize"] != null) ? hash["PageSize"] : self.pageSize;
                self.currentPageIndex = (hash["PageIndex"] != null) ? hash["PageIndex"] : self.currentPageIndex;
                self.sortOrder = (hash["_SortOrder"] != null) ? hash["_SortOrder"] : self.sortOrder;
                self.sortDirection = (hash["_SortDirection"] != null) ? hash["_SortDirection"] : self.sortDirection;
                delete hash["PageSize"];
                delete hash["PageIndex"];
                delete hash["_SortOrder"];
                delete hash["_SortDirection"];
                if (routeName == null || routeName == page) {
                    for (let h in hash) {
                        if (hash.hasOwnProperty(h)) {
                            if (self._filters[h] == null) {
                                self._filters[h] = hash[h];
                            }
                        }
                    }
                }
            }
        }
        public get elem(): Element {
            return this._elem;
        }
        public set elem(f: Element) {
            this._elem = f;
        }
        public get form(): string {
            return this._form;
        }
        public set form(f: string) {
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
