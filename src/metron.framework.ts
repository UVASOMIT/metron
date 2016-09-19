/// <reference path="metron.extenders.ts" />
/// <reference path="metron.ts" />
/// <reference path="metron.lists.ts" />
/// <reference path="metron.forms.ts" />

namespace metron {
    export var global: any = { };
    export function onready(callback: Function) {
        document.addEventListener("DOMContentLoaded", function(e) {
            if(callback != null) {
                callback(e);
            }
        });
    }
    metron.onready(function(e: Event) {
        metron.lists.bindAll();
        metron.forms.bindAll();
    });
}
