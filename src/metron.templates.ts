
namespace metron {
    export namespace templates {
        export namespace list {
            export function row<T>(template: Element, item: T): string {
                var result = template.toString();
                for (let k in item) {
                    if(item.hasOwnProperty(k)) {
                        let replacement = `{{${k}}}`;
                        result = result.replace(new RegExp(replacement, "g"), item[k]);
                    }
                }
                return result;
            }
        }
    }
}
