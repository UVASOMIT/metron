/// <reference path="metron.extenders.ts" />

namespace metron {
    export namespace templates {
        export namespace list {
            export function row<T>(template: string, item: T): string {
                var result = template;
                for (let k in item) {
                    if(item.hasOwnProperty(k)) {
                        let replacement = `{{${k}}}`;
                        result = result.replace(new RegExp(replacement, "g"), item[k]);
                    }
                }
                return result;
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
                        .replace(/!\[([^\]]*)]\(([^(]+)\)/g, '<img alt="$1" src="$2">')
                        .replace(/\[([^\]]+)]\(([^(]+)\)/g, (<any>'$1').link('$2'))
                        .replace(/`([^`]+)`/g, '<code>$1</code>')
                        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
                }

                src.replace(/^\s+|\r|\s+$/g, "").replace(/\t/g, "    ").split(/\n\n+/).forEach(function(b: string, f: number, R: Array<string>) {
                    f = <number><any>b[0];
                    R= {
                        '*':[/\n\* /, "<ul><li>", "</li></ul>"],
                        '1':[/\n[1-9]\d*\.? /, "<ol><li>", "</li></ol>"],
                        ' ':[/\n    /, "<pre><code>", "</pre></code>", "\n"],
                        '>':[/\n> /, "<blockquote>", "</blockquote>", "\n"]
                    }[f];
                    html += R ? R[1] + ("\n" + b)
                        .split(R[0])
                        .slice(1)
                        .map(R[3]?escape:inlineEscape)
                        .join(R[3] || "</li>\n<li>")+R[2] : <string><any>f == "#" ? "<h" + (f = b.indexOf(" ")) + ">" + inlineEscape(b.slice(f + 1)) + "</h" + f + ">" : <string><any>f == "<" ? b : "<p>" + inlineEscape(b) + "</p>";
                    });
                return html;
            }
        }
        export namespace master {
            export function hasMaster(page: string): boolean {
                if(page.match(/\{\{m:master=\"(.*)\"\}\}/g).length > 0) {
                    return true;
                }
                return false;
            }
            export function loadMaster(page: string): void {
                let root: string = metron.tools.getMatching(page, /\{\{m:root=\"(.*)\"\}\}/g);
                let fileName: string = metron.tools.getMatching(page, /\{\{m:master=\"(.*)\"\}\}/g);
                metron.web.load(`${root}/${fileName}`, {}, "text/html", "text",  (resp: string) => {
                    metron.templates.master.merge(resp);
                },
                (err) => {
                    document.documentElement.append(`<h1>Error: Failed to load [${root}/${fileName}].</h1><p>${err}</p>`);
                });
            }
            export function merge(template: string): void {
                function _copyAttributes(src: Node, elemName: string) {
                    for(let i = 0; i < src.attributes.length; i++) {
                        document.documentElement.querySelector(elemName).attribute(src.attributes[i].name, src.attributes[i].value);
                    }
                }
                let placeholder: Element = document.createElement("html");
                let content = getContentRoot();
                (<HTMLElement>placeholder).innerHTML = `<metron>${template.replace("{{m:content}}", content).replace(/head/g, "mhead").replace(/body/g, "mbody").replace(/mheader/g, "header")}</metron>`;
                document.documentElement.empty();
                if(document.documentElement.hasChildNodes()) {
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
                if(document.documentElement.querySelector("body") != null) {
                    return (<HTMLElement>document.documentElement.querySelector("body")).innerHTML.replace(/\{\{m:root=\"(.*)\"\}\}/g, "").replace(/\{\{m:master=\"(.*)\"\}\}/g, "");
                }
                return document.documentElement.innerHTML.replace(/\{\{m:root=\"(.*)\"\}\}/g, "").replace(/\{\{m:master=\"(.*)\"\}\}/g, "");
            }
        }
    }
}
