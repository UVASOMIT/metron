namespace metron {
    export class store {
        private _db;
        private _hasIndexedDB: boolean = false;
        constructor() {
            var self = this;
            self.init();
        }
        private init(): metron.store {
            var self = this;
            try {
                (<any>window).indexedDB = (<any>window).indexedDB || (<any>window).mozIndexedDB || (<any>window).webkitIndexedDB || (<any>window).msIndexedDB;
                (<any>window).IDBTransaction = (<any>window).IDBTransaction || (<any>window).webkitIDBTransaction || (<any>window).msIDBTransaction || { READ_WRITE: "readwrite" }; 
                (<any>window).IDBKeyRange = (<any>window).IDBKeyRange || (<any>window).webkitIDBKeyRange || (<any>window).msIDBKeyRange;
                if (!window.indexedDB) {
                    console.log("Warning: IndexedDB is unavailable. Using localStorage instead.");
                }
                else {
                    self._hasIndexedDB = true;
                    let request = window.indexedDB.open(metron.globals["config.storage.localDBName"], <number><any>metron.globals["config.storage.localDBVersion"]);
                    request.onerror = function(evt) {
                        self._hasIndexedDB = false;
                        console.log("Warning: Access to IndexedDB for application has been rejected.");
                    };
                    request.onsuccess = function(evt) {
                        self._db = (<any>evt.target).result;
                        let objectStore = self._db.createObjectStore("metron.store", { keyPath: "name" });
                        objectStore.createIndex("name", "name", { unique: true });
                        objectStore.transaction.oncomplete = function(oevt) {
                            console.log("Info: Object store has been successfully created.");
                        };
                    }
                }
            }
            catch(e) {
                console.log("Error: Failed to initialize storage.");
            }
            return self;
        }
        private getObjectStore(): any {
            var self = this;
            try {
                let transaction = self._db.transaction([metron.globals["config.storage.localDBName"]], "readwrite");
                return transaction.objectStore("metron.store");
            }
            catch(e) {
                console.log("Error: Failed to get object store.");
                return null;
            }
        }
        public getItem(s: string): any {
            var self = this;
            try {
                if(window.indexedDB != null) {
                    let objectStore = self.getObjectStore();
                    var request = objectStore.get(s);
                    request.onsuccess = function(evt) {
                        alert("Name for SSN 444-44-4444 is " + evt.target.result.value);
                    };
                }
                else if(localStorage != null) {
                    return localStorage.getItem(s);
                }
            }
            catch(e) {
                return null;        
            }
            return null;
        }
        public setItem(s: string, a: any): boolean {
            var self = this;
            try {
                if(window.indexedDB != null) {
                    let objectStore = self.getObjectStore();
                    let item = { "name": s, "value": JSON.stringify(a) };
                    var request = objectStore.put(item);
                        request.onsuccess = function(evt) {
                            console.log("Info: Item added to the object store.");
                            return true;
                    };
                }
                else if(localStorage != null) {
                    localStorage.setItem(s, a);
                    return true;
                }
            }
            catch(e) {
                return false;
            }
            return false;
        }
        public removeItem(s: string): boolean {
            var self = this;
            try {
                let objectStore = self.getObjectStore();
                if(window.indexedDB != null) {
                    var request = self._db.transaction([metron.globals["config.storage.localDBName"]], "readwrite").objectStore("metron.store").delete(s);
                    request.onsuccess = function(evt) {
                        console.log("Info: Object deleted.");
                    };
                }
                else if(localStorage != null) {
                    localStorage.removeItem(s);
                    return true;
                }
            }
            catch(e) {
                return false;
            }
            return false;
        }
        public clearItems(): boolean {
            var self = this;
            try {
                if(window.indexedDB != null) {
                    let objectStore = self.getObjectStore().clear();
                }
                if(localStorage != null) {
                    localStorage.clear();
                    return true;
                }
            }
            catch(e) {
                return false;
            }
            return false;
        }
    }
}
