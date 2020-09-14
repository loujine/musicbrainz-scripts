/* global $ MB server relEditor GM_info */
'use strict';
// ==UserScript==
// @name         MusicBrainz relation editor: Set relation attributes
// @namespace    mbz-loujine
// @author       loujine
// @version      2020.9.8
// @downloadURL  https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-reledit-set_relation_attrs.user.js
// @updateURL    https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-reledit-set_relation_attrs.user.js
// @supportURL   https://github.com/loujine/musicbrainz-scripts
// @icon         https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/icon.png
// @description  musicbrainz.org relation editor: Set attributes (live, partial, solo...)
// @compatible   firefox+tampermonkey
// @license      MIT
// @require      https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mbz-loujine-common.js
// @include      http*://*musicbrainz.org/release/*/edit-relationships
// @grant        none
// @run-at       document-end
// ==/UserScript==

function setAttributes(relationType, attrId, toggle) {
    const attrInfo = server.getRelationshipAttrInfo();
    for (const recording of MB.relationshipEditor.UI.checkedRecordings()) {
        for (const relation of recording.relationships().filter(
            rel => rel.entityTypes === relationType
        )) {
            const attrs = relation.attributes();
            const attr = attrs.filter(el => el.type.id === attrId);
            if (!attr.length) {
                const attrType = attrInfo.filter(attr => attr.id == attrId)[0];
                attrs.push({type: attrType});
            } else if (toggle) {
                attrs.splice(attrs.indexOf(attr[0]), 1);
            }
            relation.setAttributes(attrs);
        }
    }
}


(function displayToolbar() {
    relEditor.container(document.querySelector('div.tabs'))
             .insertAdjacentHTML('beforeend', `
        <h3><span id="relattrs_script_toggle">▶ Relation attributes</span></h3>
        <div id="relattrs_script_block" style="display:none;">
        <h3>Recording-Work relation attributes</h3>
        <input type="button" id="setLive" value="Set live">
        <input type="button" id="setPartial" value="Set partial">
        <input type="button" id="setInstrumental" value="Set instrumental">
        <input type="button" id="toggleLive" value="Toggle live">
        <input type="button" id="togglePartial" value="Toggle partial">
        <input type="button" id="toggleInstrumental" value="Toggle instrumental">
        <h3>Recording-Artist relation attributes</h3>
        <input type="button" id="toggleSolo" value="Toggle solo">
        <input type="button" id="toggleAdditional" value="Toggle additional">
        <input type="button" id="toggleGuest" value="Toggle guest">
        </div>
    `);
})();


$(document).ready(function() {
    document.getElementById('relattrs_script_toggle').addEventListener('click', () => {
        const header = document.getElementById('relattrs_script_toggle');
        const block = document.getElementById('relattrs_script_block');
        const display = block.style.display;
        header.textContent = header.textContent.replace(/./, display == "block" ? "▶" : "▼");
        block.style.display = display == "block" ? "none" : "block";
    });
    for (const attr of ['Live', 'Partial', 'Instrumental']) {
        document.getElementById(`set${attr}`).addEventListener('click', () => {
            setAttributes('recording-work', server.attr[attr.toLowerCase()], false);
            relEditor.editNote(GM_info.script);
        });
        document.getElementById(`toggle${attr}`).addEventListener('click', () => {
            setAttributes('recording-work', server.attr[attr.toLowerCase()], true);
            relEditor.editNote(GM_info.script);
        });
    }
    for (const attr of ['Solo', 'Additional', 'Guest']) {
        document.getElementById(`toggle${attr}`).addEventListener('click', () => {
            setAttributes('artist-recording', server.attr[attr.toLowerCase()], true);
            relEditor.editNote(GM_info.script);
        });
    }
    return false;
});
