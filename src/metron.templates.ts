/// <reference path="metron.types.ts" />

namespace metron {
    export namespace templates {
        export function load(includesFile: string): any {
            var url =`${metron.fw.getAppUrl()}/${includesFile}`;
            return new RSVP.Promise((resolve, reject) => {
                metron.web.ajax(url, {}, "GET", true, "text/html", "text", (content) => {
                    resolve(content)
                }, (txt, jsn, xml) => {
                    console.log(`Error loading ${includesFile}: ${txt}`);
                    reject(txt);
                });
            });
        }
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
                    case "date":
                        return metron.tools.formatDate(<string><any>val);
                    case "time":
                        return metron.tools.formatTime(<Date><any>val);
                    case "formatmessage":
                        return metron.tools.formatMessage(<string><any>val, options["length"]);
                    default:
                        return metron.globals[type](<Element>val, options);
                }
            }
        }
        export namespace markdown {
            export function toHTML(src: string): string {
                let html: string = "";
                function escape(text: string): string {
                    return new Option(text).innerHTML;
                }
                function inlineEscape(str: string) {
                    return str.replace(/!\[([^\]]*)]\(([^(]+)\)/g, '<img alt="$1" src="$2" />')
                            .replace(/\[([^\]]+)]\(([^(]+)\)/g, (<any>'$1').link('$2'))
                            .replace(/`([^`]+)`/g, (match, p1, offset, string) => {
                                return `<code>${escape(p1)}</code>`
                            })
                            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                            .replace(/\*([^*]+)\*/g, '<em>$1</em>')
                            .replace(/  \n/g, '<br />')
                }
                function processWrappedMarkdown(prependType: Array<string>, line: string): string {
                    return prependType[1] + ("\n" + line)
                        .split(prependType[0])
                        .slice(1)
                        .map(prependType[3] ? escape : inlineEscape)
                        .join(prependType[3] || "</li>\n<li>") + prependType[2];
                }
                function processSemanticMarkdown(char: any, line: string): string {
                    return (char == "#")
                        ? ("<h" + (char = line.indexOf(" ")) + ">" + inlineEscape(line.slice(char + 1)) + "</h" + char + ">")
                        : (char == "<" ? line : "<p>" + inlineEscape(line) + "</p>")
                }
                src.replace(/&gt;/g, ">").replace(/^\s+|\r|\s+$/g, "").replace(/\t/g, "    ").split(/\n\n+/).forEach((line: string, idx: number, lines: Array<string>) => {
                    let char = line[0];
                    let prependType = {
                        '*': [/\n\* /, "<ul><li>", "</li></ul>"],
                        '1': [/\n[1-9]\d*\.? /, "<ol><li>", "</li></ol>"],
                        ' ': [/\n    /, "<pre><code>", "</pre></code>", "\n"],
                        '>': [/\n> /, "<blockquote>", "</blockquote>", "\n"],
                    }[char];
                    html += prependType ? processWrappedMarkdown(prependType, line) : processSemanticMarkdown(char, line);
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
            export function loadMaster(page: string): any {
                return new RSVP.Promise(function (resolve, reject) {
                    if (master.hasMaster(page)) {
                        let root: string = metron.tools.getMatching(page, /\{\{m:root=\"(.*)\"\}\}/g);
                        let fileName: string = metron.tools.getMatching(page, /\{\{m:master=\"(.*)\"\}\}/g);
                        metron.web.get(`${root}/${fileName}`, {}, "text/html", "text", (resp: string) => {
                            metron.templates.master.merge(resp);
                            resolve(resp);
                        }, (err) => {
                            document.documentElement.append(`<h1>Error: Failed to load [${root}/${fileName}].</h1><p>${err}</p>`);
                            reject(err);
                        });
                    }
                    else {
                        resolve();
                    }
                });
            }
            export function merge(template: string): void {
                function _copyAttributes(src: Element, elemName: string) {
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
