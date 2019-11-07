import { ListOptions, LIST, OptionTypes, DANGER, DB, DBVERSION, STORE, m } from "./schema";
import { base } from "./base";
import { routing } from "./routing";
import { web } from "./web";
import { tools } from "./tools";
import { store } from "./storage";

export class lists {
    public static bindAll(callback: Function): void {
        let sections: NodeListOf<Element> = document.querySelectorAll("[data-m-type='list']");
        for (let i = 0; i < sections.length; i++) {
            let section: Element = <Element>sections[i];
            if (section.attribute("data-m-autoload") == null || section.attribute("data-m-autoload") == "true") {
                let model: string = section.attribute("data-m-model");
                let mID: string = section.attribute("id");
                let gTypeName: string = (mID != null) ? `${mID}_${model}` : model;
                if (m.globals["lists"][gTypeName] == null) {
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
export class list<T> extends base<T> {
    private _filters: any = {};
    private _items: Array<T>;
    private _form: string;
    public id: string;
    public gTypeName: string;
    public recycleBin: Array<T> = [];
    public currentPageIndex: number = 1;
    public pageSize: number = (!isNaN(<number><any>m.config["config.options.pageSize"])) ? <number><any>m.config["config.options.pageSize"] : 10;
    public totalPageSize: number = 0;
    public totalCount: number = 0;
    public sortOrder: string = (m.config["config.options.sortOrder"] != null) ? m.config["config.options.sortOrder"] : "DateCreated";
    public sortDirection: string = (m.config["config.options.sortDirection"] != null) ? m.config["config.options.sortDirection"] : "DESC";
    private _defaults: any = (m.config["config.lists.defaults"] != null) ? m.config["config.lists.defaults"] : { };
    public fetchURL: string;
    constructor(public model: string, public options?: ListOptions) {
        super(model, LIST);
        var self = this;
        self.id = (options != null) ? options.id : null;
        self.gTypeName = (options != null && options.id != null) ? `${options.id}_${model}` : model;
        m.globals["lists"][self.gTypeName] = self;
        self.setFilters();
    }
    public init(): list<T> {
        var self = this;
        self._elem = (self.id != null) ? document.querySelector(`#${self.id}`) : document.querySelector(`[data-m-type='list'][data-m-model='${self.model}']`);
        if (self._elem != null) {
            self.pivot = self.attachPivot(self._elem);
            self._name = self._elem.attribute("data-m-page");
            let filterBlocks: NodeListOf<Element> = self._elem.querySelectorAll("[data-m-segment='filters']");
            filterBlocks.each(function (idx: number, elem: Element) {
                let filters = elem.querySelectorAll("[data-m-action='filter']");
                self.loadFilters(filters);
            });
            var controlBlocks: NodeListOf<Element> = self._elem.querySelectorAll("[data-m-segment='controls']");
            controlBlocks.each(function (idx: number, elem: Element) {
                let actions = elem.querySelectorAll("[data-m-action]");
                actions.each(function (indx: number, el: Element) {
                    switch (el.attribute("data-m-action").lower()) {
                        case "new":
                            el.addEvent("click", function (e) {
                                e.preventDefault();
                                if (m.globals.actions != null && m.globals.actions[`${self.model.lower()}_${el.attribute("data-m-action").lower()}`] != null) {
                                    m.globals.actions[`${self.model.lower()}_${el.attribute("data-m-action").lower()}`]();
                                }
                                else {
                                    if(self.pivot != null) {
                                        (el.attribute("data-m-pivot") != null)
                                            ? self.pivot.exact(<any>el.attribute("data-m-pivot"))
                                            : self.pivot.next((nextPage: string) => {
                                                if(nextPage != null) {
                                                    routing.setRouteUrl(nextPage, "", true);
                                                }
                                            });
                                    }
                                    if(m.globals["forms"][self.model] != null) {
                                        try {
                                            m.globals["forms"][self.model].loadForm();
                                        }
                                        catch(e) {
                                            console.log(e);
                                        }
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
                                if (m.globals.actions != null && m.globals.actions[`${self.model.lower()}_${el.attribute("data-m-action").lower()}`] != null) {
                                    m.globals.actions[`${self.model.lower()}_${el.attribute("data-m-action").lower()}`]();
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
                                if (m.globals.actions != null && m.globals.actions[`${self.model.lower()}_${el.attribute("data-m-action").lower()}`] != null) {
                                    m.globals.actions[`${self.model.lower()}_${el.attribute("data-m-action").lower()}`]();
                                }
                                else {
                                    document.location.href = `${routing.getAppUrl()}/${self.model}/download`;
                                }
                                if ((<any>self).download_m_inject != null) {
                                    (<any>self).download_m_inject();
                                }
                            }, true);
                            break;
                        case "clear":
                            el.addEvent("click", function (e) {
                                e.preventDefault();
                                if (m.globals.actions != null && m.globals.actions[`${self.model.lower()}_${el.attribute("data-m-action").lower()}`] != null) {
                                    m.globals.actions[`${self.model.lower()}_${el.attribute("data-m-action").lower()}`]();
                                }
                                else {
                                    self._elem.querySelectorAll("[data-m-segment='filters']").each((idx: number, elem: Element) => {
                                        self.clearFilters(elem);
                                        for(let key in self.filters) {
                                            if(self._filters.hasOwnProperty(key)) {
                                                self._filters[key] = null;
                                            }
                                        }
                                        const qs: string = <string><any>web.querystring();
                                        if (qs != "") {
                                            self._filters = tools.formatOptions(qs, OptionTypes.QUERYSTRING);
                                        }
                                        self.currentPageIndex = 1;
                                        self.callListing();
                                    });
                                }
                                if ((<any>self).clear_m_inject != null) {
                                    (<any>self).clear_m_inject();
                                }
                            }, true);
                            break;
                        default:
                            if (m.globals.actions != null && m.globals.actions[`${self.model.lower()}_${el.attribute("data-m-action").lower()}`] != null) {
                                let ev: string;
                                if(el.nodeName.lower() === "a" || el.nodeName.lower() === "button" || el.nodeName.lower() === "div" || el.nodeName.lower() === "span" || (el.nodeName.lower() === "input" && (el.attribute("type").lower() === "submit" || el.attribute("type").lower() === "button"))) {
                                    ev = "click";
                                }
                                else {
                                    ev = "change";
                                }
                                el.addEvent(ev, function (e) {
                                    e.preventDefault();
                                    m.globals.actions[`${self.model.lower()}_${el.attribute("data-m-action").lower()}`]();
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
                if(!self._filters.hasOwnProperty(key)) {
                    console.log(`Warning: You have set the data-m-key to ${key}, which is not expected according to the <T> interface type of ${binding}.`);
                }
                let nm: string = el.attribute("name");
                let nText: string = el.attribute("data-m-text");
                let options: any = (el.attribute("data-m-options") != null) ? tools.formatOptions(el.attribute("data-m-options")) : {};
                let ajx = new Promise((resolve, reject) => {
                    web.get(`${routing.getAPIURL(binding)}${self.withDefaults(options)}`, {}, null, "json", function (data: Array<T>) {
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
                        fil[term.trim()] = ((<HTMLElement>parent.querySelector(`#${itm.attribute("data-m-search-for")}`)).val() == '') ? null : <any>(<HTMLElement>parent.querySelector(`#${itm.attribute("data-m-search-for")}`)).val();
                    });
                    self._filters = fil;
                    self.currentPageIndex = 1;
                    self.callListing();
                });
            }
        });
        Promise.all(promises).then(() => {
            if ((<any>self).loadFilters_m_inject != null) {
                (<any>self).loadFilters_m_inject();
            }
        }).catch(function (reason) {
            console.log(`Error: Promise execution failed! ${reason}`);
        });
    }
    private applyViewEvents(): void {
        var self = this;
        self._elem.querySelectorAll(`[data-m-action='edit']`).each(function (idx: number, elem: Element) {
            elem.removeEvent("click").addEvent("click", function (e) {
                e.preventDefault();
                if (m.globals.actions != null && m.globals.actions[`${self.model.lower()}_${elem.attribute("data-m-action").lower()}`] != null) {
                    m.globals.actions[`${self.model.lower()}_${elem.attribute("data-m-action").lower()}`](elem);
                }
                else {
                    let parameters = tools.formatOptions(elem.attribute("data-m-primary"));
                    if(self.pivot != null) {
                        (elem.attribute("data-m-pivot") != null)
                            ? self.pivot.exact(<any>elem.attribute("data-m-pivot"))
                            : self.pivot.next((nextPage: string) => {
                                if(nextPage != null) {
                                    routing.setRouteUrl(nextPage, web.querystringify(parameters), true);
                                }
                            });
                    }
                    if(m.globals["forms"][self.model] != null) {
                        try {
                            m.globals["forms"][self.model].loadForm(parameters);
                        }
                        catch(e) { }
                    }
                    if ((<any>self).edit_m_inject != null) {
                        (<any>self).edit_m_inject();
                    }
                }
            }, true);
        });
        self._elem.querySelectorAll(`[data-m-action='delete']`).each(function (idx: number, elem: Element) {
            elem.removeEvent("click").addEvent("click", function (e) {
                e.preventDefault();
                if (m.globals.actions != null && m.globals.actions[`${self.model.lower()}_${elem.attribute("data-m-action").lower()}`] != null) {
                    m.globals.actions[`${self.model.lower()}_${elem.attribute("data-m-action").lower()}`](elem);
                }
                else {
                    if (confirm('Are you sure you want to delete this record?')) {
                        let current = this;
                        let parameters = tools.formatOptions(elem.attribute("data-m-primary"));
                        web.remove(`${routing.getAPIURL(self.model)}${web.querystringify(parameters)}`, parameters, null, "json", function (data: T) {
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
                            self._elem.querySelector(`[data-m-action='undo']`).show();
                            if ((<any>self).delete_m_inject != null) {
                                (<any>self).delete_m_inject();
                            }
                        });
                    }
                }
            }, true);
        });
        self._elem.querySelectorAll(`[data-m-action='sort']`).each(function (idx: number, elem: Element) {
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
        self._elem.querySelectorAll(`[data-m-action]`).each(function (idx: number, elem: Element) {
            if (elem.attribute("data-m-action") != "edit" && elem.attribute("data-m-action") != "delete" && elem.attribute("data-m-action") != "sort" && elem.attribute("data-m-action") != "filter") { //Use an in/keys here
                if (m.globals.actions != null && m.globals.actions[`${self.model.lower()}_${elem.attribute("data-m-action").lower()}`] != null) {
                    let ev: string;
                    if(elem.nodeName.lower() === "a" || elem.nodeName.lower() === "button" || elem.nodeName.lower() === "div" || elem.nodeName.lower() === "span" || (elem.nodeName.lower() === "input" && (elem.attribute("type").lower() === "submit" || elem.attribute("type").lower() === "button"))) {
                        ev = "click";
                    }
                    else {
                        ev = "change";
                    }
                    elem.removeEvent(ev).addEvent(ev, function (e) {
                        e.preventDefault();
                        m.globals.actions[`${self.model.lower()}_${elem.attribute("data-m-action").lower()}`](elem);
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
            return web.querystringify(tools.normalizeModelData(withDefaults));
        }
        return web.querystringify(tools.normalizeModelData(parameters));
    }
    public populateListing(): void {
        var self = this;
        try {
            self.clearTable(self._elem.querySelector(`[data-m-segment='list']`));
            self.populateTable(self._elem.querySelector(`[data-m-segment='list']`));
            self.totalCount = (self._items.length > 0) ? self._items[0]["TotalCount"] : 0;
            self.createPaging(self._elem.querySelector(`[data-m-segment='paging']`), self.totalCount);
            self.applyViewEvents();
            if ((<any>self).populateListing_m_inject != null) {
                (<any>self).populateListing_m_inject();
            }
        }
        catch(e) {
            console.log(`Failed to populate listing: ${e}`);
        }
    }
    public undoLast(): void {
        var self = this;
        web.post(`${routing.getAPIURL(self.model)}/undo`, self.recycleBin.pop(), null, "json", function (data: T) {
            self.callListing();
        });
        if (self.recycleBin.length == 0) {
            self._elem.querySelector(`[data-m-action='undo']`).hide();
        }
        if ((<any>self).undoLast_m_inject != null) {
            (<any>self).undoLast_m_inject();
        }
    }
    public callListing(): void {
        var self = this;
        self.clearAlerts();
        var parameters: any = Object.extend({ PageIndex: self.currentPageIndex, PageSize: self.pageSize, _SortOrder: self.sortOrder, _SortDirection: self.sortDirection }, self._filters);
        var url = (self.fetchURL != null) ? self.fetchURL : self.model;
        if(!self._elem.isHidden() && self.shouldRoute(self.options)) {
            routing.setRouteUrl(self._name, web.querystringify(tools.normalizeModelData(parameters)));
        }
        web.get(`${routing.getAPIURL(url)}${self.withDefaults(parameters)}`, {}, null, "json", function (data: Array<T>) {
            self._items = data;
            self.populateListing();
            if ((<any>self).callListing_m_inject != null) {
                (<any>self).callListing_m_inject(data);
            }
        }, (txt: string, jsn: any, xml: XMLDocument) => {
            self.showAlerts(DANGER, txt, jsn, xml);
        });
    }
    public populateTable(selector: Element): void {
        var self = this;
        var tbody = selector.querySelector("[data-m-type='table-body']");
        var isTable: boolean = (tbody.nodeName.lower() == "tbody") ? true : false;
        self._items.each(function (idx, item) {
            selector.querySelector("[data-m-type='table-body']").append(self.formatData(item, isTable));
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
        const self = this;
        if (String.isNullOrEmpty(self._template)) {
            const t: Element = selector.up("[data-m-page]");
            try {
                if(t != null) {
                    self._template = m.globals.templates[t.attribute("data-m-page")];
                }
                if(self._template == null) {
                    self._template = (<HTMLElement>selector.querySelector("[data-m-type='table-body'] [data-m-action='repeat']")).outerHTML;
                    m.globals.templates[t.attribute("data-m-page")] = self._template;
                }
            }
            catch(e) {
                console.log(`DOM has no element that matches the selector "${selector} [data-m-type='table-body'] [data-m-action='repeat']": ${e}`);
            }
        }
        selector.querySelector("[data-m-type='table-body']").empty();
    }
    public getRows(selector: string): number {
        return document.querySelectorAll(`${selector} [data-m-type='table-body'] [data-m-type='row']`).length;
    }
    public setupPagingEvents(selector: Element, filters?: any): void {
        var self = this;
        selector.querySelector("li > a[title='Previous']").removeEvent("click").addEvent("click", function (e) {
            e.preventDefault();
            self.pageListing(self.getPreviousPage(), filters);
        }, true);
        selector.querySelector("li > a[title='Next']").removeEvent("click").addEvent("click", function (e) {
            e.preventDefault();
            self.pageListing(self.getNextPage(), filters);
        }, true);
        selector.querySelector("li > a[title='First']").removeEvent("click").addEvent("click", function (e) {
            e.preventDefault();
            self.pageListing(1, filters);
        }, true);
        selector.querySelector("li > a[title='Last']").removeEvent("click").addEvent("click", function (e) {
            e.preventDefault();
            self.pageListing(self.totalPageSize, filters);
        }, true);
    }
    public createPaging(selector: Element, totalCount, filters?: any): void {
        var self = this;
        if (selector == null) {
            return;
        }
        if (self.currentPageIndex != null && self.pageSize != null) {
            self.totalPageSize = self.calculateTotalPageSize(totalCount);
            var startPage: number = ((parseInt(this.currentPageIndex.toString(), 10) - 5) < 1) ? 1 : (parseInt(this.currentPageIndex.toString(), 10) - 5);
            var endPage: number = ((parseInt(this.currentPageIndex.toString(), 10) + 5) > this.totalPageSize) ? this.totalPageSize : (parseInt(this.currentPageIndex.toString(), 10) + 5);
            self.setupPagingEvents(selector, filters);
            selector.querySelectorAll("li").each(function (idx: number, elem: Element) {
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
                selector.insertBefore(li, selector.querySelector("li > a[title='Next']").parent());
            }
            if (self.totalPageSize > 0) {
                selector.querySelector(`li > a[title='${self.currentPageIndex}']`).removeClass("button-outline").addClass("button-clear");
            }
            if (selector.querySelectorAll("li").length <= 5) {
                selector.hide();
            }
            else {
                selector.show();
            }
            if (self._elem.querySelector(`[data-m-segment='recordcount']`) != null) {
                if(this.totalPageSize != null && this.totalPageSize > 0) {
                    let isOne = (this.totalPageSize === 1) ? "1 " : "";
                    self._elem.querySelector(`[data-m-segment='recordcount']`).innerHTML = `<label class="record-count">${isOne}of ${this.totalPageSize} Pages (${totalCount} Total Records)</label>`;
                }
                else {
                    self._elem.querySelector(`[data-m-segment='recordcount']`).innerHTML = `<label class="record-count">No records found...</label>`;
                }
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
        var control = parent.querySelector("[data-m-segment='controls'] [data-m-segment='paging']");
        (<HTMLElement>control).val(<string><any>self.pageSize);
        control.addEvent("change", function (e) {
            self.pageSize = <number><any>(<HTMLElement>control).val();
            m.config["config.options.pageSize"] = self.pageSize;
            let storage = new store(DB, DBVERSION, STORE);
            storage.init().then((result) => {
                return storage.setItem("metron.config", m.config);
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
        var elem = (self._elem != null) ? self._elem : document.querySelector(`[data-m-type='list'][data-m-model='${self.model}']`); //Do we need this?
        var page = (elem != null) ? elem.attribute("data-m-page") : null;
        var routeName = routing.getRouteName();
        var qs: string = <string><any>web.querystring();
        if (qs != "") {
            self._filters = tools.formatOptions(qs, OptionTypes.QUERYSTRING);
        }
        let hash = routing.getRouteUrl(self._filters);
        if (hash != null) {
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
