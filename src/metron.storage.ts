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
        public getItem(s: string): any {
            try {
                if(localStorage != null) {
                    return localStorage.getItem(s);
                }
            }
            catch(e) {
                return null;        
            }
            return null;
        }
        public setItem(s: string, a: any): boolean {
            try {
                if(localStorage != null) {
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
            try {
                if(localStorage != null) {
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
            try {
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
