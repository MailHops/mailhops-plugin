var { ExtensionCommon } = ChromeUtils.import("resource://gre/modules/ExtensionCommon.jsm");
var { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");
const ehb = "expandedHeadersBottomBox";
const eh2 = "expandedHeaders2";
const win = Services.wm.getMostRecentWindow("mail:3pane");
const win2 = Services.wm.getMostRecentWindow("mail:messageWindow");

const mailHopsUI = class extends ExtensionCommon.ExtensionAPI {
    getAPI(context) {
      context.callOnClose(this);
      return {
        mailHopsUI: {
            insert(wd, basePath, iconPath, iconText, id, target) {
                let elm = wd.document.getElementById(target);
                const compact = "compact";
                let iconSize = 48, marginTop = 0;
                if (wd.document.getElementById(eh2).getAttribute(compact) == compact) {
                    iconSize = 32, marginTop = -16;
                }
                let mailHops = wd.document.getElementById(id);
                if (mailHops) {
                    mailHops.setAttribute("image", basePath + iconPath);
                    mailHops.setAttribute("tooltiptext", iconText);
                    mailHops.setAttribute("style", "flex-shrink: 0; padding: 0; margin:" + marginTop + "px 2px 0 2px");
                    for (let elm of mailHops.children) {
                        if (elm.nodeName == "image") {
                            elm.width = iconSize;
                            elm.height = iconSize;
                            elm.setAttribute("style", "margin: 0 2px 0 2px");
                            break;
                        }
                    }
                } else {
                    let mailHops = wd.document.createXULElement("toolbarbutton");
                    mailHops.id = id;
                    mailHops.setAttribute("image", basePath + iconPath);
                    mailHops.setAttribute("tooltiptext", iconText);
                    mailHops.setAttribute("style", "flex-shrink: 0; padding: 0; margin:" + marginTop + "px 2px 0 2px");
                    mailHops.addEventListener("click", () => {
                        wd.document.getElementById("mailhops-messageDisplayAction-toolbarbutton").click();
                    }, false);
                    wd.document.getElementById(ehb).insertBefore(mailHops, elm);
                    for (let elm of mailHops.children) {
                        if (elm.nodeName == "image") {
                            elm.width = iconSize;
                            elm.height = iconSize;
                            elm.setAttribute("style", "margin: 0 2px 0 2px");
                            break;
                        }
                    }
                }
            },
            mv(wd, id, target) {
                let mailHops = wd.document.getElementById(id);
                let elm = wd.document.getElementById(target);
                wd.document.getElementById(ehb).insertBefore(mailHops, elm);
            },
            rm(wd, id) {
                if (wd.document.getElementById(id)) wd.document.getElementById(id).remove();
            },
            async insertBefore(basePath, iconPath, iconText, id, target) {
                this.insert(win, basePath, iconPath, iconText, id, target);
                if (win2) {
                    this.insert(win2, basePath, iconPath, iconText, id, target);
                }
            },
            async move(id, target) {
                this.mv(win, id, target);
                if (win2) this.mv(win2, id, target);
            },
            async remove(id) {
                this.rm(win, id);
                if (win2) this.rm(win2, id);
            }
        }
      }
    }
    close() {
        let id = "countryIcon";
        if (win.document.getElementById(id)) win.document.getElementById(id).remove();
    }
};