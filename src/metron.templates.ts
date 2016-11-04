
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
                let fileName = metron.tools.getMatching(page, /\{\{m:master=\"(.*)\"\}\}/g);
                //let result = metron.templates.master.merge(match[0]);
                //Load template file
            }
            export function merge(template: string): void {
                let placeholder: Element = document.createElement("root");
                let content = document.documentElement.outerHTML;
                placeholder.append(template.replace("{{m:content}}", content));
                document.documentElement.empty();
                document.documentElement.append((<HTMLElement>placeholder).innerHTML);
            }
        }
    }
}
