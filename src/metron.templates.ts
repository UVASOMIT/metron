
namespace metron {
    /*
     * All of this will change when the templating engine is created.
     */
    export namespace templates {
        export namespace list {
            export function startRow(optionalId?: string, optionalClass?: string): string {
                if (optionalClass || optionalId) {
                    if (!optionalId)
                        return `<tr class="trow ${optionalClass}">`;
                    else if (!optionalClass)
                        return `<tr id="${optionalId}">`;
                    else
                        return `<tr id="${optionalId}">`;
                }
                return `<tr class="trow">`;
            }
            export function endRow(): string {
                return "</tr>";
            }
            export function getStandardActionButtonsCell(primaryValues: string, listType: string = "list"): string {
                switch (listType.lower()) {
                    case "lookup":
                        return `<td><button title="choose" class="choose" data-primary="${primaryValues}">choose</button></td>`;
                    default:
                        return `<td><button title="edit" class="edit" data-primary="${primaryValues}">edit</button><button title="delete" class="delete" data-primary="${primaryValues}">delete</button></td>`;
                }
            }
            export function getCell(content: string, attributes?: string): string {
                if (attributes) {
                    return `<td ${attributes}>${(content != null) ? content : ""}</td>`;
                }
                return `<td>${(content != null) ? content : ""}</td>`;
                
            }
            export function getInput(content: string, type: string, name: string, attributes?: string): string {
                if (attributes) {
                    return `<input type="${type}" name="${name}" ${attributes} value="${(content != null) ? content : ""}" />`;
                }
                return `<input type="${type}" name="${name}" value="${(content != null) ? content : ""}" />`;
            }
        }
    }
}
