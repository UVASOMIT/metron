import { m } from "./schema";

export class store {
    private _db;
    private _hasIndexedDB: boolean = false;
    constructor(public localDBName?: string, public localDBVersion?: number, public localDBStore?: string) {
        var self = this;
        if(localDBName == null) {
            self.localDBName = m.config["config.storage.localDBName"];
        }
        if(localDBVersion == null) {
            self.localDBVersion = m.config["config.storage.localDBVersion"];
        }
        if(localDBStore == null) {
            self.localDBStore = m.config["config.storage.localDBStore"];
        }
    }
    public init(): any {
        var self = this;
        var p = new Promise(function(resolve, reject) {
            try {
                (<any>window).indexedDB = (<any>window).indexedDB || (<any>window).mozIndexedDB || (<any>window).webkitIndexedDB || (<any>window).msIndexedDB;
                (<any>window).IDBTransaction = (<any>window).IDBTransaction || (<any>window).webkitIDBTransaction || (<any>window).msIDBTransaction || { READ_WRITE: "readwrite" }; 
                (<any>window).IDBKeyRange = (<any>window).IDBKeyRange || (<any>window).webkitIDBKeyRange || (<any>window).msIDBKeyRange;
                if (!window.indexedDB) {
                    console.log("Warning: IndexedDB is unavailable. Using localStorage instead.");
                }
                else {
                    self._hasIndexedDB = true;
                    let request = window.indexedDB.open(self.localDBName, self.localDBVersion);
                    request.onerror = function(evt) {
                        self._hasIndexedDB = false;
                        console.log("Warning: Access to IndexedDB for application has been rejected.");
                    };
                    request.onupgradeneeded = function (evt) {
                        let objectStore = (<any>evt.currentTarget).result.createObjectStore(self.localDBStore, { keyPath: "name" });
                        objectStore.createIndex("name", "name", { unique: true });
                        objectStore.transaction.oncomplete = function(oevt) {
                            console.log(`Info: Object store has been successfully created. ${objectStore}`);
                        };
                    };
                    request.onsuccess = function(evt) {
                        self._db = (<any>evt.target).result;
                        console.log(`Info: Database initialized. ${self._db}`);
                        resolve(self._db);
                    };
                }
            }
            catch(e) {
                console.log(`Error: Failed to initialize storage. ${e}`);
                reject(e);
            }
        });
        return p;
    }
    private getObjectStore(): any {
        var self = this;
        try {
            let transaction = self._db.transaction(self.localDBStore, "readwrite");
            return transaction.objectStore(self.localDBStore);
        }
        catch(e) {
            console.log(`Error: Failed to get object store. ${e}`);
            return null;
        }
    }
    public getItem(s: string, val?: string): any {
        var self = this;
        var p = new Promise(function(resolve, reject) {
            try {
                if(window.indexedDB != null) {
                    let objectStore = self.getObjectStore();
                    var request = objectStore.get(s);
                    request.onsuccess = function(evt) {
                        if(val != null && evt.target.result != null) {
                            resolve(evt.target.result[val]);
                        }
                        else {
                            resolve(evt.target.result);
                        }
                    };
                }
                else if(sessionStorage != null) {
                    resolve(sessionStorage.getItem(s));
                }
            }
            catch(e) {
                console.log(`Error: Failed to retrieve item. ${e}`);
                reject(e);      
            }
        });
        return p;
    }
    public setItem(s: string, a: any): any {
        var self = this;
        var p = new Promise(function(resolve, reject) {
            try {
                if(window.indexedDB != null) {
                    let objectStore = self.getObjectStore();
                    if(!(typeof a === "string")) {
                        let b = { };
                        for(let prop in a) {
                            if(a.hasOwnProperty(prop) && (!(a[prop] instanceof Function))) {
                                b[prop] = a[prop];
                            }
                        }
                        delete b["__proto__"];
                        a = JSON.stringify(b);
                    }
                    let item = { "name": s, "value": a };
                    var request = objectStore.put(item);
                        request.onsuccess = function(evt) {
                            console.log(`Info: Item added to the object store. ${evt.target.result}`);
                            resolve(evt.target.result);
                    };
                }
                else if(sessionStorage != null) {
                    sessionStorage.setItem(s, a);
                    resolve(true);
                }
            }
            catch(e) {
                console.log(`Error: Failed to set item. ${e}`);
                reject(e);
            }
        });
        return p;
    }
    public removeItem(s: string): any {
        var self = this;
        var p = new Promise(function(resolve, reject) {
            try {
                if(window.indexedDB != null) {
                    var request = self.getObjectStore().delete(s);
                    request.onsuccess = function(evt) {
                        console.log("Info: Object deleted.");
                        resolve(true);
                    };
                }
                else if(sessionStorage != null) {
                    sessionStorage.removeItem(s);
                    resolve(true);
                }
            }
            catch(e) {
                console.log(`Error: Failed to remove item. ${e}`);
                reject(e);
            }
        });
        return p;
    }
    public clearItems(): boolean {
        var self = this;
        try {
            if(window.indexedDB != null) {
                self.getObjectStore().clear();
            }
            if(sessionStorage != null) {
                sessionStorage.clear();
                return true;
            }
        }
        catch(e) {
            console.log(`Error: Failed to clear items. ${e}`);
            return false;
        }
        return false;
    }
}
