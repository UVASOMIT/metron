/// <reference path="metron.extenders.ts" />
/// <reference path="metron.ts" />
/// <reference path="metron.lists.ts" />
/// <reference path="metron.forms.ts" />
/// <reference path="metron.tools.ts" />

namespace metron {
    export var globals: any = { };
    export function onready(callback: Function) {
        document.addEventListener("DOMContentLoaded", function(e) {
            let root: string = (document.selectOne("body[data-m-root]") != null)  ? `${document.selectOne("body[data-m-root]").attribute("data-m-root")}/` : "";
            metron.tools.loadJSON(`${root}metron.json`, function(configData: JSON) {
                for(let obj in configData) {
                    globals[obj] = configData[obj];
                }
                if(callback != null) {
                    callback(e);
                }
            });
        });
    }
    metron.onready(function(e: Event) {
        document.selectAll("[data-m-state='hide']").each(function(idx: number, elem: Element) {
            elem.hide();
        });
        metron.lists.bindAll();
        metron.forms.bindAll();
    });
}
