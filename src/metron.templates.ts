
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
                let placeholder: Element = document.createElement("html");
                let content = document.documentElement.outerHTML;
                placeholder.append(template.replace("{{m:content}}", content));
                document.documentElement.empty();
                document.documentElement.append((<HTMLElement>placeholder).innerHTML);
                console.log(document.documentElement.outerHTML);
            }
        }
    }
}
