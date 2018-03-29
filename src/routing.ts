namespace metron {
    export namespace routing {
        export function setRouteUrl(name: string, wsqs: string, wantsReplaceHash: boolean = false): void {
            var hash = (wsqs.length > 1) ? wsqs.substr(1) : "";
            if (hash != "" && document.location.search != null) {
                try {
                    let hashItems = metron.tools.formatOptions(hash, metron.OptionTypes.QUERYSTRING);
                    let qsItems = metron.tools.formatOptions((document.location.search.startsWith("?") ? document.location.search.substr(1) : document.location.search), metron.OptionTypes.QUERYSTRING);
                    for (let h in hashItems) {
                        if (hashItems.hasOwnProperty(h)) {
                            if (qsItems[h] != null) {
                                delete hashItems[h];
                            }
                        }
                    }
                    hash = metron.web.querystringify(hashItems).substr(1);
                }
                catch (e) {
                    console.log(`Error: failed to parse query string and hash. ${e}`);
                }
            }
            if (name != null) {
                hash = `/${name}/${hash}`;
            }
            metron.globals.hashLoadedFromApplication = true;
            if (hash != null && hash != "") {
                (wantsReplaceHash) ? document.location.hash = `#${hash}` : history.replaceState({}, "", `#${hash}`);
            }
        }
        export function getRouteUrl(filters?: any): any {
            var hash = document.location.hash;
            if (hash.substr(0, 1) == "#") {
                hash = hash.substr(1);
            }
            if (hash.substr(0, 1) == "/") {
                hash = hash.substr(1);
            }
            if (hash.length > 1) {
                if (hash.indexOf("/") != -1) {
                    try {
                        hash = hash.split("/")[1];
                    }
                    catch (e) {
                        console.log(`Error: Failed to get routing. ${e}`);
                    }
                }
                let result = metron.tools.formatOptions(hash, metron.OptionTypes.QUERYSTRING);
                if (filters != null) {
                    for (let h in result) {
                        if (result.hasOwnProperty(h)) {
                            if (filters[h] != null) { //This should be checking for undefined.
                                delete result[h];
                            }
                        }
                    }
                }
                return result;
            }
            return null;
        }
        export function getRouteName(): string {
            var hash = document.location.hash;
            if (hash.substr(0, 1) == "#") {
                hash = hash.substr(1);
            }
            if (hash.substr(0, 1) == "/") {
                hash = hash.substr(1);
            }
            if (hash.length > 1) {
                if (hash.indexOf("/") != -1) {
                    try {
                        hash = hash.split("/")[0];
                    }
                    catch (e) {
                        console.log(`Error: Failed to get routing. ${e}`);
                        return null;
                    }
                }
                return hash;
            }
            return null;
        }
    }
}
