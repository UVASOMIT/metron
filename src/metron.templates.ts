/// <reference path="../node_modules/@types/rsvp/index.d.ts" />
/// <reference path="metron.extenders.ts" />

namespace metron {
    export namespace templates {
        export namespace list {
            export function row<T>(template: string, item: T, isTable: boolean = true): string {
                var result = template;
                for (let k in item) {
                    if (item.hasOwnProperty(k)) {
                        let replacement = `{{${k}}}`;
                        result = result.replace(new RegExp(replacement, "g"), (<string><any>item[k] != null && <string><any>item[k] != "null") ? <string><any>item[k] : "");
                    }
                }
                var doc = document.createElement((isTable ? "tbody" : "div"));
                doc.innerHTML = result;
                doc.selectAll("[data-m-format]").each((idx: number, elem: HTMLElement) => {
                    let options = (elem.attribute("data-m-options") != null) ? metron.tools.formatOptions(elem.attribute("data-m-options")) : null;
                    if (elem.firstElementChild == null) {
                        elem.innerText = format(elem.attribute("data-m-format"), elem.innerText, options);
                    }
                    else {
                        format(elem.attribute("data-m-format"), elem, options);
                    }
                });
                return doc.innerHTML;
            }
            export function format(type: string, val: string | Element, options?: any): string {
                switch (type.lower()) {
                    case "yesno":
                        return metron.tools.formatBoolean(<string><any>val);
                    case "datetime":
                        return metron.tools.formatDateTime(<string><any>val);
                    case "time":
                        return metron.tools.formatTime(<Date><any>val);
                    case "formatMessage":
                        return metron.tools.formatMessage(<string><any>val, options["length"]);
                    default:
                        return metron.globals[type](<Element>val, options);
                }
            }
        }
        export namespace markdown {
            export function toHTML(src: string): string { //Adapted from Mathieu 'p01' Henri: https://github.com/p01/mmd.js/blob/master/mmd.js
                let html: string = "";
                function escape(text: string): string {
                    return new Option(text).innerHTML;
                }
                function inlineEscape(str: string) {
                    return escape(str)
                        .replace(/!\[([^\]]*)]\(([^(]+)\)/g, '<img alt="$1" src="$2" />')
                        .replace(/\[([^\]]+)]\(([^(]+)\)/g, (<any>'$1').link('$2'))
                        .replace(/`([^`]+)`/g, '<code>$1</code>')
                        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
                        .replace(/  \n/g, '<br />')
                }

                src.replace(/&gt;/g, ">").replace(/^\s+|\r|\s+$/g, "").replace(/\t/g, "    ").split(/\n\n+/).forEach(function (b: string, f: number, R: Array<string>) {
                    f = <number><any>b[0];
                    R = {
                        '*': [/\n\* /, "<ul><li>", "</li></ul>"],
                        '1': [/\n[1-9]\d*\.? /, "<ol><li>", "</li></ol>"],
                        ' ': [/\n    /, "<pre><code>", "</pre></code>", "\n"],
                        '>': [/\n> /, "<blockquote>", "</blockquote>", "\n"],
                    }[f];
                    html += R ? R[1] + ("\n" + b)
                        .split(R[0])
                        .slice(1)
                        .map(R[3] ? escape : inlineEscape)
                        .join(R[3] || "</li>\n<li>") + R[2] : <string><any>f == "#" ? "<h" + (f = b.indexOf(" ")) + ">" + inlineEscape(b.slice(f + 1)) + "</h" + f + ">" : <string><any>f == "<" ? b : "<p>" + inlineEscape(b) + "</p>";
                });
                return html;
            }
        }
        export namespace master {
            export function hasMaster(page: string): boolean {
                if (page.match(/\{\{m:master=\"(.*)\"\}\}/g) != null && page.match(/\{\{m:master=\"(.*)\"\}\}/g).length > 0) {
                    return true;
                }
                return false;
            }
            export function loadMaster(page: string): void {
                var root: string = metron.tools.getMatching(page, /\{\{m:root=\"(.*)\"\}\}/g);
                var fileName: string = metron.tools.getMatching(page, /\{\{m:master=\"(.*)\"\}\}/g);
                var ajx = new RSVP.Promise(function (resolve, reject) {
                    metron.web.get(`${root}/${fileName}`, {}, "text/html", "text", (resp: string) => {
                        metron.templates.master.merge(resp);
                        resolve(resp);
                    }, (err) => {
                        document.documentElement.append(`<h1>Error: Failed to load [${root}/${fileName}].</h1><p>${err}</p>`);
                        reject(err);
                    });
                });
                RSVP.all([ajx]).then(function () {
                    console.log("Info: Loaded master template through Promise.");
                }).catch(function (reason) {
                    console.log("Error: Promise execution failed!");
                });
            }
            export function merge(template: string): void {
                function _copyAttributes(src: Node, elemName: string) {
                    for (let i = 0; i < src.attributes.length; i++) {
                        document.documentElement.querySelector(elemName).attribute(src.attributes[i].name, src.attributes[i].value);
                    }
                }
                let placeholder: Element = document.createElement("html");
                let content = getContentRoot();
                (<HTMLElement>placeholder).innerHTML = `<metron>${template.replace("{{m:content}}", content).replace(/head/g, "mhead").replace(/body/g, "mbody").replace(/mheader/g, "header")}</metron>`;
                document.documentElement.empty();
                if (document.documentElement.hasChildNodes()) {
                    (<HTMLElement>document.querySelector("head")).innerHTML = (<HTMLElement>placeholder.querySelector("mhead")).innerHTML;
                    _copyAttributes(placeholder.querySelector("mhead"), "head");
                    (<HTMLElement>document.querySelector("body")).innerHTML = (<HTMLElement>placeholder.querySelector("mbody")).innerHTML;
                    _copyAttributes(placeholder.querySelector("mbody"), "body");
                }
                else {
                    document.documentElement.append((<HTMLElement>placeholder).innerHTML);
                }
            }
            export function getContentRoot(): string {
                if (document.documentElement.querySelector("body") != null) {
                    return (<HTMLElement>document.documentElement.querySelector("body")).innerHTML.replace(/\{\{m:root=\"(.*)\"\}\}/g, "").replace(/\{\{m:master=\"(.*)\"\}\}/g, "");
                }
                return document.documentElement.innerHTML.replace(/\{\{m:root=\"(.*)\"\}\}/g, "").replace(/\{\{m:master=\"(.*)\"\}\}/g, "");
            }
        }
        export function register(n: string, func: Function): void {
            metron.globals[n] = func;
        }
    }
}
