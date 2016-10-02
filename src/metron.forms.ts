namespace metron {
    export class forms {
        public static bindAll(): void {
            
        }
    }
    export abstract class form {
        private _field_id: string;
        private _name: string;
        private _classNames: Array<string> = [];
        private _action: string = "";
        private _method:string = "POST";
        private _fields: Array<string> = [];
        constructor() {

        }
        public static clearForm(selector: string, callback?: Function): void {
            document.selectAll(".error").each(function (idx, elem) {
                document.selectOne(elem).removeClass("error");
            });
            document.selectOne(selector).selectAll("input, select, textarea").each(function(idx: number, elem: Element) {
                 elem.attribute("value", "");
            });
            document.selectOne(selector).selectAll("input[type='checkbox']").each(function(idx: number, elem: Element) {
                 elem.removeAttribute("checked");
            });
            document.selectOne(selector).selectAll("div.input-group-addon").each(function(idx: number, elem: Element) {
                 (<HTMLElement>elem).innerHTML = "";
            });
            if (callback != null) {
                callback();
            }
        }
    }
}
