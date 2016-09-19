/// <reference path="metron.extenders.ts" />

namespace metron {
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
