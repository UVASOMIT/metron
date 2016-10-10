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
            document.selectOne(selector).selectAll("input, select").each(function(idx: number, elem: Element) {
                 elem.attribute("value", "");
            });
            document.selectOne(selector).selectAll("textarea").each(function(idx: number, elem: Element) {
                 (<HTMLElement>elem).innerHTML = "";
            });
            document.selectOne(selector).selectAll("input[type='checkbox']").each(function(idx: number, elem: Element) {
                 elem.removeAttribute("checked");
            });
            if (callback != null) {
                callback();
            }
        }
        public static isValid(selector: string): boolean {
            var form: Element = document.selectOne(selector);
            var alert: Element = form.selectOne("[data-m-segment='alert']");
            alert.hide();
            alert.empty();
            document.selectAll(".error").each(function (idx, elem) {
                elem.removeClass("error");
            });
            var isValid: boolean = true;
            var required: NodeListOf<Element> = form.selectAll("[required='required']");
            required.each(function (idx: number, elem: Element) {
                if ((<HTMLElement>elem).val() == null || (<HTMLElement>elem).val().trim() === "") {
                    isValid = false;
                    alert.append(`<p>[${elem.attribute("name")}] is a required field.</p>`);
                    elem.up("div").addClass("has-error");
                }
            });
            if (!isValid) {
                alert.show();
                window.scrollTo(0, 0);
            }
            return isValid;
        }
    }
}
