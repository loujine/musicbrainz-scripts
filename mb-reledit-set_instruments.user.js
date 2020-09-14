/* global $ MB roles server relEditor GM_info */
'use strict';
// ==UserScript==
// @name         MusicBrainz relation editor: set role in recording-artist relation
// @namespace    mbz-loujine
// @author       loujine
// @version      2020.9.8
// @downloadURL  https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-reledit-set_instruments.user.js
// @updateURL    https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-reledit-set_instruments.user.js
// @supportURL   https://github.com/loujine/musicbrainz-scripts
// @icon         https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/icon.png
// @description  musicbrainz.org relation editor: set/unset role relations on selected recordings
// @compatible   firefox+tampermonkey
// @license      MIT
// @require      https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mbz-loujine-common.js
// @include      http*://*musicbrainz.org/release/*/edit-relationships
// @grant        none
// @run-at       document-end
// ==/UserScript==

function setInstrument(fromType, toType, fromAttrId, toAttrId) {
    const attrInfo = server.getInstrumentRelationshipAttrInfo();
    const toAttr = isNaN(toAttrId)
        ? null
        : attrInfo.filter(attr => attr.id === toAttrId)[0];

    for (const recording of MB.relationshipEditor.UI.checkedRecordings()) {
        recording.relationships().filter(
            relation => relation.linkTypeID() === fromType
        ).filter(
            relation => (
                (isNaN(fromAttrId) && relation.attributes().length === 0)
                || relation.attributes().map(attr => attr.type.id).includes(fromAttrId)
            )
        ).map(relation => {
            let attrs = relation.attributes();
            let idx = 0;
            relation.linkTypeID(toType);
            if (!isNaN(fromAttrId)) {
                idx = attrs.findIndex(attr => attr.type.id == fromAttrId);
                attrs = attrs.filter(attr => attr.type.id != fromAttrId);
            }
            if (toAttr) {
                // attrs order must be kept for credits, etc.
                attrs.splice(idx, 0, {type: toAttr});
            }
            relation.setAttributes(attrs);
        });
    }
}


(function displayToolbar() {
    relEditor.container(document.querySelector('div.tabs'))
             .insertAdjacentHTML('beforeend', `
        <h3><span id="instrument_script_toggle">▶ Replace artist role</span></h3>
        <div id="instrument_script_block" style="display:none;">
        <p>
          From: <select id="fromRole">${roles.roles}</select>
          with attr:
            <select id="fromRoleAttrs">${roles.roleAttrs}</select>
          <input type="text" id="fromId" value="" placeholder="or use instrument/vocal id">
          <br />
          To:&nbsp;&nbsp;&nbsp;<select id="toRole">${roles.roles}</select>
          with attr:
            <select id="toRoleAttrs">${roles.roleAttrs}</select>
          <input type="text" id="toId" value="" placeholder="or use instrument/vocal id">
          <br />
          <input type="button" id="setRole" value='Apply'>
        </p>
        </div>
    `);
})();


$(document).ready(function () {
    document.getElementById('instrument_script_toggle').addEventListener('click', () => {
        const header = document.getElementById('instrument_script_toggle');
        const block = document.getElementById('instrument_script_block');
        const display = block.style.display;
        header.textContent = header.textContent.replace(/./, display == "block" ? "▶" : "▼");
        block.style.display = display == "block" ? "none" : "block";
    });
    document.getElementById('fromRole').addEventListener('change', () => {
        document.getElementById('fromRoleAttrs').options.selectedIndex = 0;
        document.getElementById('fromId').value = '';
    });
    document.getElementById('toRole').addEventListener('change', () => {
        document.getElementById('toRoleAttrs').options.selectedIndex = 0;
        document.getElementById('toId').value = '';
    });
    document.getElementById('setRole').addEventListener('click', () => {
        setInstrument(
            parseInt(document.getElementById('fromRole').value),
            parseInt(document.getElementById('toRole').value),
            parseInt(document.getElementById('fromId').value) ||
                parseInt(document.getElementById('fromRoleAttrs').value),
            parseInt(document.getElementById('toId').value) ||
                parseInt(document.getElementById('toRoleAttrs').value)
        );
        relEditor.editNote(GM_info.script);
    });
    return false;
});
