namespace metron {
    export class forms {
        public static bindAll(): void {
            
        }
    }
    abstract class form {
        private _field_id: string;
        private _name: string;
        private _classNames: Array<string> = [];
        private _action: string = "";
        private _method:string = "POST";
        private _fields: Array<string> = [];
        constructor() {

        }
    }
}
