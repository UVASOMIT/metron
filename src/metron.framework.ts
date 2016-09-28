/// <reference path="metron.extenders.ts" />
/// <reference path="metron.ts" />
/// <reference path="metron.lists.ts" />
/// <reference path="metron.forms.ts" />
/// <reference path="metron.tools.ts" />

namespace metron {
    export var globals: any = { };
    export function onready(callback: Function) {
        document.addEventListener("DOMContentLoaded", function(e) {
            let root: string = (document.selectOne("body[data-m-root]") != null)  ? `${document.selectOne("body[data-m-root]").attribute("data-m-root")}` : "";
            metron.tools.loadJSON(`${root}/metron.json`, function(configData: JSON) {
                for(let obj in configData) {
                    globals[obj] = configData[obj];
                }
                if(callback != null) {
                    callback(e);
                }
            });
        });
    }
    export namespace fw {
        export function getBaseUrl(): string {
            if(metron.globals["config.baseURL"] != null) {
                return ((<string>metron.globals["config.baseURL"]).endsWith("/")) ? (<string>metron.globals["config.baseURL"]).substr(0, (<string>metron.globals["config.baseURL"]).length - 2) : `${metron.globals["config.baseURL"]}`;
            }
            return "";
        }
        export function getBaseAPI(): string {
            if(metron.globals["config.api.dir"] != null) {
                return ((<string>metron.globals["config.api.dir"]).endsWith("/")) ? (<string>metron.globals["config.api.dir"]).substr(0, (<string>metron.globals["config.api.dir"]).length - 2) : `${metron.globals["config.api.dir"]}`;
            }
            return "";
        }
        export function getAPIExtension(): string {
            if(metron.globals["config.api.extension"] != null) {
                return metron.globals["config.api.extension"];
            }
            return "";
        }
    }
    metron.onready(function(e: Event) {
        document.selectAll("[data-m-state='hide']").each(function(idx: number, elem: Element) {
            elem.hide();
        });
        metron.lists.bindAll();
        metron.forms.bindAll();
    });
}
