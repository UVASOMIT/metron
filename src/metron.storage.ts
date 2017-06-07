namespace metron {
    export class store {
        private _db;
        private _hasIndexedDB: boolean = false;
        constructor() {
        }
        public init(): RSVP.Promise<metron.store> {
            var self = this;
            var p = new RSVP.Promise(function(resolve, reject) {
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
                        request.onupgradeneeded = function (evt) {
                            let objectStore = (<any>evt.currentTarget).result.createObjectStore("metron.store", { keyPath: "name" });
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
                let transaction = self._db.transaction("metron.store", "readwrite");
                return transaction.objectStore("metron.store");
            }
            catch(e) {
                console.log(`Error: Failed to get object store. ${e}`);
                return null;
            }
        }
        public getItem(s: string, val?: string): RSVP.Promise<metron.store> {
            var self = this;
            var p = new RSVP.Promise(function(resolve, reject) {
                try {
                    if(window.indexedDB != null) {
                        let objectStore = self.getObjectStore();
                        var request = objectStore.get(s);
                        request.onsuccess = function(evt) {
                            if(val != null) {
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
        public setItem(s: string, a: string): RSVP.Promise<metron.store> {
            var self = this;
            var p = new RSVP.Promise(function(resolve, reject) {
                try {
                    if(window.indexedDB != null) {
                        let objectStore = self.getObjectStore();
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
        public removeItem(s: string): RSVP.Promise<metron.store> {
            var self = this;
            var p = new RSVP.Promise(function(resolve, reject) {
                try {
                    let objectStore = self.getObjectStore();
                    if(window.indexedDB != null) {
                        var request = self._db.transaction([metron.globals["config.storage.localDBName"]], "readwrite").objectStore("metron.store").delete(s);
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
                    let objectStore = self.getObjectStore().clear();
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
}
