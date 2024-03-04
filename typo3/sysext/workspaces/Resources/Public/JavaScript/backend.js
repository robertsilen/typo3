/*
 * This file is part of the TYPO3 CMS project.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 *
 * The TYPO3 project - inspiring people to share!
 */
import DocumentService from"@typo3/core/document-service.js";import $ from"jquery";import{html}from"lit";import"@typo3/backend/element/icon-element.js";import{SeverityEnum}from"@typo3/backend/enum/severity.js";import"@typo3/backend/input/clearable.js";import"@typo3/workspaces/renderable/record-table.js";import"@typo3/backend/element/pagination.js";import Workspaces from"@typo3/workspaces/workspaces.js";import{default as Modal}from"@typo3/backend/modal.js";import Persistent from"@typo3/backend/storage/persistent.js";import Utility from"@typo3/backend/utility.js";import windowManager from"@typo3/backend/window-manager.js";import RegularEvent from"@typo3/core/event/regular-event.js";import{topLevelModuleImport}from"@typo3/backend/utility/top-level-module-import.js";import{selector}from"@typo3/core/literals.js";import IconHelper from"@typo3/workspaces/utility/icon-helper.js";import DeferredAction from"@typo3/backend/action-button/deferred-action.js";var Identifiers;!function(e){e.searchForm="#workspace-settings-form",e.searchTextField='#workspace-settings-form input[name="search-text"]',e.searchSubmitBtn='#workspace-settings-form button[type="submit"]',e.depthSelector='#workspace-settings-form [name="depth"]',e.languageSelector='#workspace-settings-form select[name="languages"]',e.stagesSelector='#workspace-settings-form select[name="stages"]',e.workspaceActions=".workspace-actions",e.chooseStageAction='.workspace-actions [name="stage-action"]',e.chooseSelectionAction='.workspace-actions [name="selection-action"]',e.chooseMassAction='.workspace-actions [name="mass-action"]',e.container="#workspace-panel",e.contentsContainer="#workspace-contents",e.noContentsContainer="#workspace-contents-empty",e.previewLinksButton=".t3js-preview-link",e.pagination="#workspace-pagination"}(Identifiers||(Identifiers={}));class Backend extends Workspaces{constructor(){super(),this.elements={},this.settings={dir:"ASC",id:TYPO3.settings.Workspaces.id,depth:1,language:"all",limit:30,query:"",sort:"label_Live",start:0,filterTxt:""},this.paging={currentPage:1,totalPages:1,totalItems:0},this.markedRecordsForMassAction=[],this.handleCheckboxStateChanged=e=>{const t=$(e.target),n=t.parents("tr"),a=t.prop("checked"),s=n.data("table")+":"+n.data("uid")+":"+n.data("t3ver_oid");if(a)this.markedRecordsForMassAction.push(s);else{const e=this.markedRecordsForMassAction.indexOf(s);e>-1&&this.markedRecordsForMassAction.splice(e,1)}n.data("collectionCurrent")?Backend.changeCollectionChildrenState(n.data("collectionCurrent"),a):n.data("collection")&&(Backend.changeCollectionChildrenState(n.data("collection"),a),Backend.changeCollectionParentState(n.data("collection"),a)),this.elements.$chooseMassAction.prop("disabled",this.markedRecordsForMassAction.length>0)},this.viewChanges=e=>{e.preventDefault();const t=$(e.currentTarget).closest("tr");this.sendRemoteRequest(this.generateRemotePayload("getRowDetails",{stage:t.data("stage"),t3ver_oid:t.data("t3ver_oid"),table:t.data("table"),uid:t.data("uid"),filterFields:!0})).then((async e=>{const n=(await e.resolve())[0].result.data[0],a=$("<div />"),s=$("<ul />",{class:"nav nav-tabs",role:"tablist"}),o=$("<div />",{class:"tab-content"}),i=[];a.append($("<p />").html(TYPO3.lang.path.replace("{0}",n.path_Live)),$("<p />").html(TYPO3.lang.current_step.replace("{0}",n.label_Stage).replace("{1}",n.stage_position).replace("{2}",n.stage_count))),n.diff.length>0&&(s.append($("<li />",{role:"presentation",class:"nav-item"}).append($("<a />",{class:"nav-link",href:"#workspace-changes","aria-controls":"workspace-changes",role:"tab","data-bs-toggle":"tab"}).text(TYPO3.lang["window.recordChanges.tabs.changeSummary"]))),o.append($("<div />",{role:"tabpanel",class:"tab-pane",id:"workspace-changes"}).append($("<div />",{class:"form-section"}).append(Backend.generateDiffView(n.diff))))),n.comments.length>0&&(s.append($("<li />",{role:"presentation",class:"nav-item"}).append($("<a />",{class:"nav-link",href:"#workspace-comments","aria-controls":"workspace-comments",role:"tab","data-bs-toggle":"tab"}).html(TYPO3.lang["window.recordChanges.tabs.comments"]+"&nbsp;").append($("<span />",{class:"badge"}).text(n.comments.length)))),o.append($("<div />",{role:"tabpanel",class:"tab-pane",id:"workspace-comments"}).append($("<div />",{class:"form-section"}).append(Backend.generateCommentView(n.comments))))),n.history.total>0&&(s.append($("<li />",{role:"presentation",class:"nav-item"}).append($("<a />",{class:"nav-link",href:"#workspace-history","aria-controls":"workspace-history",role:"tab","data-bs-toggle":"tab"}).text(TYPO3.lang["window.recordChanges.tabs.history"]))),o.append($("<div />",{role:"tabpanel",class:"tab-pane",id:"workspace-history"}).append($("<div />",{class:"form-section"}).append(Backend.generateHistoryView(n.history.data))))),s.find("li > a").first().addClass("active"),o.find(".tab-pane").first().addClass("active"),a.append($("<div />").append(s,o)),!1!==n.label_PrevStage&&t.data("stage")!==t.data("prevStage")&&i.push({text:n.label_PrevStage.title,active:!0,btnClass:"btn-default",name:"prevstage",trigger:(e,n)=>{n.hideModal(),this.sendToStage(t,"prev")}}),!1!==n.label_NextStage&&i.push({text:n.label_NextStage.title,active:!0,btnClass:"btn-default",name:"nextstage",trigger:(e,n)=>{n.hideModal(),this.sendToStage(t,"next")}}),i.push({text:TYPO3.lang.close,active:!0,btnClass:"btn-info",name:"cancel",trigger:(e,t)=>t.hideModal()}),Modal.advanced({type:Modal.types.default,title:TYPO3.lang["window.recordInformation"].replace("{0}",t.find(".t3js-title-live").text().trim()),content:a,severity:SeverityEnum.info,buttons:i,size:Modal.sizes.medium})}))},this.confirmDeleteRecordFromWorkspace=e=>{const t=$(e.target).closest("tr"),n=Modal.confirm(TYPO3.lang["window.discard.title"],TYPO3.lang["window.discard.message"],SeverityEnum.warning,[{text:TYPO3.lang.cancel,active:!0,btnClass:"btn-default",name:"cancel",trigger:()=>{n.hideModal()}},{text:TYPO3.lang.ok,btnClass:"btn-warning",name:"ok"}]);n.addEventListener("button.clicked",(e=>{"ok"===e.target.name&&this.sendRemoteRequest([this.generateRemoteActionsPayload("deleteSingleRecord",[t.data("table"),t.data("uid")])]).then((()=>{n.hideModal(),this.getWorkspaceInfos(),Backend.refreshPageTree()}))}))},this.runSelectionAction=e=>{const t=$(e.currentTarget).val(),n="discard"!==t;if(0===t.length)return;const a=[];for(let e=0;e<this.markedRecordsForMassAction.length;++e){const t=this.markedRecordsForMassAction[e].split(":");a.push({table:t[0],liveId:t[2],versionId:t[1]})}n?this.checkIntegrity({selection:a,type:"selection"}).then((async e=>{"warning"===(await e.resolve())[0].result.result?this.openIntegrityWarningModal().addEventListener("confirm.button.ok",(()=>{this.renderSelectionActionModal(t,a)})):this.renderSelectionActionModal(t,a)})):this.renderSelectionActionModal(t,a)},this.openIntegrityWarningModal=()=>{const e=Modal.confirm(TYPO3.lang["window.integrity_warning.title"],html`<p>${TYPO3.lang["integrity.hasIssuesDescription"]}<br>${TYPO3.lang["integrity.hasIssuesQuestion"]}</p>`,SeverityEnum.warning);return e.addEventListener("button.clicked",(()=>e.hideModal())),e},this.runMassAction=e=>{const t=$(e.currentTarget).val(),n="discard"!==t;0!==t.length&&(n?this.checkIntegrity({language:this.settings.language,type:t}).then((async e=>{"warning"===(await e.resolve())[0].result.result?this.openIntegrityWarningModal().addEventListener("confirm.button.ok",(()=>{this.renderMassActionModal(t)})):this.renderMassActionModal(t)})):this.renderMassActionModal(t))},this.sendToSpecificStageAction=e=>{const t=[],n=$(e.currentTarget).val();for(let e=0;e<this.markedRecordsForMassAction.length;++e){const n=this.markedRecordsForMassAction[e].split(":");t.push({table:n[0],uid:n[1],t3ver_oid:n[2]})}this.sendRemoteRequest(this.generateRemoteActionsPayload("sendToSpecificStageWindow",[n,t])).then((async e=>{const a=this.renderSendToStageWindow(await e.resolve());a.addEventListener("button.clicked",(e=>{if("ok"===e.target.name){const e=Utility.convertFormToObject(a.querySelector("form"));e.affects={elements:t,nextStage:n},this.sendRemoteRequest([this.generateRemoteActionsPayload("sendToSpecificStageExecute",[e]),this.generateRemotePayload("getWorkspaceInfos",this.settings)]).then((async e=>{const t=await e.resolve();a.hideModal(),this.renderWorkspaceInfos(t[1].result),Backend.refreshPageTree()}))}})),a.addEventListener("typo3-modal-hide",(()=>{this.elements.$chooseStageAction.val("")}))}))},this.generatePreviewLinks=()=>{this.sendRemoteRequest(this.generateRemoteActionsPayload("generateWorkspacePreviewLinksForAllLanguages",[this.settings.id])).then((async e=>{const t=(await e.resolve())[0].result,n=document.createElement("dl");for(const[e,a]of Object.entries(t)){const t=document.createElement("dt");t.textContent=e;const s=document.createElement("a");s.href=a,s.target="_blank",s.textContent=a;const o=document.createElement("dd");o.appendChild(s),n.append(t,o)}Modal.show(TYPO3.lang.previewLink,n,SeverityEnum.info,[{text:TYPO3.lang.ok,active:!0,btnClass:"btn-info",name:"ok",trigger:(e,t)=>t.hideModal()}],["modal-inner-scroll"])}))},topLevelModuleImport("@typo3/workspaces/renderable/send-to-stage-form.js"),topLevelModuleImport("@typo3/workspaces/renderable/comment-view.js"),topLevelModuleImport("@typo3/workspaces/renderable/history-view.js"),topLevelModuleImport("@typo3/workspaces/renderable/diff-view.js"),DocumentService.ready().then((()=>{this.getElements(),this.registerEvents(),this.notifyWorkspaceSwitchAction(),this.settings.depth=this.elements.$depthSelector.val(),this.settings.language=this.elements.$languageSelector.val(),this.settings.stage=this.elements.$stagesSelector.val(),this.elements.$container.length&&this.getWorkspaceInfos()}))}static refreshPageTree(){top.document.dispatchEvent(new CustomEvent("typo3:pagetree:refresh"))}static generateDiffView(e){const t=document.createElement("typo3-workspaces-diff-view");return t.diffs=e,t}static generateCommentView(e){const t=document.createElement("typo3-workspaces-comment-view");return t.comments=e,t}static generateHistoryView(e){const t=document.createElement("typo3-workspaces-history-view");return t.historyItems=e,t}static changeCollectionParentState(e,t){const n=document.querySelector('tr[data-collection-current="'+e+'"] input[type=checkbox]');null!==n&&n.checked!==t&&(n.checked=t,n.dataset.manuallyChanged="true",n.dispatchEvent(new CustomEvent("multiRecordSelection:checkbox:state:changed",{bubbles:!0,cancelable:!1})))}static changeCollectionChildrenState(e,t){const n=document.querySelectorAll(selector`tr[data-collection="${e}"] input[type=checkbox]`);n.length&&n.forEach((e=>{e.checked!==t&&(e.checked=t,e.dataset.manuallyChanged="true",e.dispatchEvent(new CustomEvent("multiRecordSelection:checkbox:state:changed",{bubbles:!0,cancelable:!1})))}))}notifyWorkspaceSwitchAction(){const e=document.querySelector("main[data-workspace-switch-action]");if(e.dataset.workspaceSwitchAction){const t=JSON.parse(e.dataset.workspaceSwitchAction);top.TYPO3.WorkspacesMenu.performWorkspaceSwitch(t.id,t.title),top.document.dispatchEvent(new CustomEvent("typo3:pagetree:refresh")),top.TYPO3.ModuleMenu.App.refreshMenu()}}checkIntegrity(e){return this.sendRemoteRequest(this.generateRemotePayload("checkIntegrity",e))}getElements(){this.elements.$searchForm=$(Identifiers.searchForm),this.elements.$searchTextField=$(Identifiers.searchTextField),this.elements.$searchSubmitBtn=$(Identifiers.searchSubmitBtn),this.elements.$depthSelector=$(Identifiers.depthSelector),this.elements.$languageSelector=$(Identifiers.languageSelector),this.elements.$stagesSelector=$(Identifiers.stagesSelector),this.elements.$container=$(Identifiers.container),this.elements.$contentsContainer=$(Identifiers.contentsContainer),this.elements.$noContentsContainer=$(Identifiers.noContentsContainer),this.elements.$tableBody=this.elements.$contentsContainer.find("tbody"),this.elements.$workspaceActions=$(Identifiers.workspaceActions),this.elements.$chooseStageAction=$(Identifiers.chooseStageAction),this.elements.$chooseSelectionAction=$(Identifiers.chooseSelectionAction),this.elements.$chooseMassAction=$(Identifiers.chooseMassAction),this.elements.$previewLinksButton=$(Identifiers.previewLinksButton),this.elements.$pagination=$(Identifiers.pagination)}registerEvents(){$(document).on("click",'[data-action="publish"]',(e=>{const t=e.target.closest("tr");this.checkIntegrity({selection:[{liveId:t.dataset.uid,versionId:t.dataset.t3ver_oid,table:t.dataset.table}],type:"selection"}).then((async e=>{"warning"===(await e.resolve())[0].result.result?this.openIntegrityWarningModal().addEventListener("confirm.button.ok",(()=>{this.renderPublishModal(t)})):this.renderPublishModal(t)}))})).on("click",'[data-action="prevstage"]',(e=>{this.sendToStage($(e.currentTarget).closest("tr"),"prev")})).on("click",'[data-action="nextstage"]',(e=>{this.sendToStage($(e.currentTarget).closest("tr"),"next")})).on("click",'[data-action="changes"]',this.viewChanges).on("click",'[data-action="preview"]',this.openPreview.bind(this)).on("click",'[data-action="open"]',(e=>{const t=e.currentTarget.closest("tr"),n=TYPO3.settings.FormEngine.moduleUrl+"&returnUrl="+encodeURIComponent(document.location.href)+"&id="+TYPO3.settings.Workspaces.id+"&edit["+t.dataset.table+"]["+t.dataset.uid+"]=edit";window.location.href=n})).on("click",'[data-action="version"]',(e=>{const t=e.currentTarget.closest("tr"),n="pages"===t.dataset.table?t.dataset.t3ver_oid:t.dataset.pid;window.location.href=TYPO3.settings.WebLayout.moduleUrl+"&id="+n})).on("click",'[data-action="remove"]',this.confirmDeleteRecordFromWorkspace).on("click",'[data-action="expand"]',(e=>{const t=$(e.currentTarget);let n;n="true"===t.first().attr("aria-expanded")?"actions-caret-down":"actions-caret-right",t.empty().append(IconHelper.getIcon(n))})),$(window.top.document).on("click",".t3js-workspace-recipients-selectall",(()=>{$(".t3js-workspace-recipient",window.top.document).not(":disabled").prop("checked",!0)})).on("click",".t3js-workspace-recipients-deselectall",(()=>{$(".t3js-workspace-recipient",window.top.document).not(":disabled").prop("checked",!1)})),this.elements.$searchForm.on("submit",(e=>{e.preventDefault(),this.settings.filterTxt=this.elements.$searchTextField.val(),this.getWorkspaceInfos()})),this.elements.$searchTextField.on("keyup",(e=>{""!==e.target.value?this.elements.$searchSubmitBtn.removeClass("disabled"):(this.elements.$searchSubmitBtn.addClass("disabled"),this.getWorkspaceInfos())}));const e=this.elements.$searchTextField.get(0);void 0!==e&&e.clearable({onClear:()=>{this.elements.$searchSubmitBtn.addClass("disabled"),this.settings.filterTxt="",this.getWorkspaceInfos()}}),new RegularEvent("multiRecordSelection:checkbox:state:changed",this.handleCheckboxStateChanged).bindTo(document),this.elements.$depthSelector.on("change",(e=>{const t=e.target.value;Persistent.set("moduleData.workspaces_admin.depth",t),this.settings.depth=t,this.getWorkspaceInfos()})),this.elements.$previewLinksButton.on("click",this.generatePreviewLinks),this.elements.$languageSelector.on("change",(e=>{const t=$(e.target);Persistent.set("moduleData.workspaces_admin.language",t.val()),this.settings.language=t.val(),this.sendRemoteRequest(this.generateRemotePayload("getWorkspaceInfos",this.settings)).then((async e=>{const n=await e.resolve();this.elements.$languageSelector.prev().html(t.find(":selected").data("icon")),this.renderWorkspaceInfos(n[0].result)}))})),this.elements.$stagesSelector.on("change",(e=>{const t=e.target.value;Persistent.set("moduleData.workspaces_admin.stage",t),this.settings.stage=t,this.getWorkspaceInfos()})),this.elements.$chooseStageAction.on("change",this.sendToSpecificStageAction),this.elements.$chooseSelectionAction.on("change",this.runSelectionAction),this.elements.$chooseMassAction.on("change",this.runMassAction),this.elements.$pagination.on("click","[data-action]",(e=>{e.preventDefault();const t=$(e.currentTarget);let n=!1;switch(t.data("action")){case"previous":this.paging.currentPage>1&&(this.paging.currentPage--,n=!0);break;case"next":this.paging.currentPage<this.paging.totalPages&&(this.paging.currentPage++,n=!0);break;case"page":this.paging.currentPage=parseInt(t.data("page"),10),n=!0;break;default:throw'Unknown action "'+t.data("action")+'"'}n&&(this.settings.start=parseInt(this.settings.limit.toString(),10)*(this.paging.currentPage-1),this.getWorkspaceInfos())}))}sendToStage(e,t){let n,a,s;if("next"===t)n=e.data("nextStage"),a="sendToNextStageWindow",s="sendToNextStageExecute";else{if("prev"!==t)throw"Invalid direction given.";n=e.data("prevStage"),a="sendToPrevStageWindow",s="sendToPrevStageExecute"}this.sendRemoteRequest(this.generateRemoteActionsPayload(a,[e.data("uid"),e.data("table"),e.data("t3ver_oid")])).then((async t=>{const a=this.renderSendToStageWindow(await t.resolve());a.addEventListener("button.clicked",(t=>{if("ok"===t.target.name){const t=Utility.convertFormToObject(a.querySelector("form"));t.affects={table:e.data("table"),nextStage:n,t3ver_oid:e.data("t3ver_oid"),uid:e.data("uid"),elements:[]},this.sendRemoteRequest([this.generateRemoteActionsPayload(s,[t]),this.generateRemotePayload("getWorkspaceInfos",this.settings)]).then((async e=>{const t=await e.resolve();a.hideModal(),this.renderWorkspaceInfos(t[1].result),Backend.refreshPageTree()}))}}))}))}getWorkspaceInfos(){this.sendRemoteRequest(this.generateRemotePayload("getWorkspaceInfos",this.settings)).then((async e=>{this.renderWorkspaceInfos((await e.resolve())[0].result)}))}renderWorkspaceInfos(e){this.resetMassActionState(e.data.length),this.buildPagination(e.total),0===e.total?(this.elements.$contentsContainer.hide(),this.elements.$noContentsContainer.show()):(this.elements.$contentsContainer.show(),this.elements.$noContentsContainer.hide());document.querySelector("typo3-workspaces-record-table").results=e.data}buildPagination(e){if(0===e)return void this.elements.$pagination.contents().remove();if(this.paging.totalItems=e,this.paging.totalPages=Math.ceil(e/parseInt(this.settings.limit.toString(),10)),1===this.paging.totalPages)return void this.elements.$pagination.contents().remove();const t=document.createElement("typo3-backend-pagination");t.paging=this.paging,this.elements.$pagination.empty().append(t)}openPreview(e){const t=$(e.currentTarget).closest("tr");this.sendRemoteRequest(this.generateRemoteActionsPayload("viewSingleRecord",[t.data("table"),t.data("uid")])).then((async e=>{const t=(await e.resolve())[0].result;windowManager.localOpen(t)}))}renderPublishModal(e){const t=Modal.advanced({title:TYPO3.lang["window.publish.title"],content:TYPO3.lang["window.publish.message"],severity:SeverityEnum.info,staticBackdrop:!0,buttons:[{text:TYPO3.lang.cancel,btnClass:"btn-default",trigger:function(){t.hideModal()}},{text:TYPO3.lang.label_doaction_publish,btnClass:"btn-info",action:new DeferredAction((async()=>{await this.sendRemoteRequest(this.generateRemoteActionsPayload("publishSingleRecord",[e.dataset.table,e.dataset.t3ver_oid,e.dataset.uid])),this.getWorkspaceInfos(),Backend.refreshPageTree()}))}]})}renderSelectionActionModal(e,t){const n=Modal.advanced({title:TYPO3.lang["window.selectionAction.title"],content:html`<p>${TYPO3.lang["tooltip."+e+"Selected"]}</p>`,severity:SeverityEnum.warning,staticBackdrop:!0,buttons:[{text:TYPO3.lang.cancel,btnClass:"btn-default",trigger:function(){n.hideModal()}},{text:TYPO3.lang["label_doaction_"+e],btnClass:"btn-warning",action:new DeferredAction((async()=>{await this.sendRemoteRequest(this.generateRemoteActionsPayload("executeSelectionAction",{action:e,selection:t})),this.markedRecordsForMassAction=[],this.getWorkspaceInfos(),Backend.refreshPageTree()}))}]});n.addEventListener("typo3-modal-hidden",(()=>{this.elements.$chooseSelectionAction.val("")}))}renderMassActionModal(e){let t,n;switch(e){case"publish":t="publishWorkspace",n=TYPO3.lang.label_doaction_publish;break;case"discard":t="flushWorkspace",n=TYPO3.lang.label_doaction_discard;break;default:throw"Invalid mass action "+e+" called."}const a=async e=>{const n=(await e.resolve())[0].result;n.processed<n.total?this.sendRemoteRequest(this.generateRemoteMassActionsPayload(t,n)).then(a):(this.getWorkspaceInfos(),Modal.dismiss())},s=Modal.advanced({title:TYPO3.lang["window.massAction.title"],content:html`
        <p>${TYPO3.lang["tooltip."+e+"All"]}</p>
        <p>${TYPO3.lang["tooltip.affectWholeWorkspace"]}</p>
      `,severity:SeverityEnum.warning,staticBackdrop:!0,buttons:[{text:TYPO3.lang.cancel,btnClass:"btn-default",trigger:function(){s.hideModal()}},{text:n,btnClass:"btn-warning",action:new DeferredAction((async()=>{const e=await this.sendRemoteRequest(this.generateRemoteMassActionsPayload(t,{init:!0,total:0,processed:0,language:this.settings.language}));await a(e)}))}]});s.addEventListener("typo3-modal-hidden",(()=>{this.elements.$chooseMassAction.val("")}))}resetMassActionState(e){this.markedRecordsForMassAction=[],e&&(this.elements.$workspaceActions.removeClass("hidden"),this.elements.$chooseMassAction.prop("disabled",!1)),document.dispatchEvent(new CustomEvent("multiRecordSelection:actions:hide"))}}export default new Backend;