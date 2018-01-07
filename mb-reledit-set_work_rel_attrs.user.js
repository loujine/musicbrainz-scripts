/* global $ MB server relEditor GM_info */
'use strict';
// ==UserScript==
// @name         MusicBrainz relation editor: Set recording-work relation attributes
// @namespace    mbz-loujine
// @author       loujine
// @version      2018.1.6
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mb-reledit-set_work_rel_attrs.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mb-reledit-set_work_rel_attrs.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org relation editor: Set attributes (live, partial, solo...)
// @compatible   firefox+tampermonkey
// @license      MIT
// @require      https://greasyfork.org/scripts/13747-mbz-loujine-common/code/mbz-loujine-common.js?version=241520
// @include      http*://*musicbrainz.org/release/*/edit-relationships
// @grant        none
// @run-at       document-end
// ==/UserScript==

function setAttributes(relationType, attrId, toggle) {
    const recordings = MB.relationshipEditor.UI.checkedRecordings();
    for (const recording of recordings) {
        for (const relation of recording.relationships().filter(
            rel => rel.entityTypes === relationType
        )) {
            const attrs = relation.attributes(),
                attr = attrs.filter(el => el.type.id === attrId);
            if (!attr.length) {
                attrs.push({type: MB.attrInfoByID[attrId]});
            } else if (toggle) {
                attrs.splice(attrs.indexOf(attr), 1);
            }
            relation.setAttributes(attrs);
        }
    }
}


(function displayToolbar() {
    relEditor.container(document.querySelector('div.tabs'))
             .insertAdjacentHTML('beforeend', `
        <h3>Recording-Work relation attributes</h3>
        <input type="button" id="setLive" value="Set live">
        <input type="button" id="setPartial" value="Set partial">
        <input type="button" id="setInstrumental" value="Set instrumental">
        <input type="button" id="toggleLive" value="Toggle live">
        <input type="button" id="togglePartial" value="Toggle partial">
        <input type="button" id="toggleInstrumental" value="Toggle instrumental">
        <h3>Recording-Artist relation attributes</h3>
        <input type="button" id="toggleSolo" value="Toggle solo">
    `);
})();


$(document).ready(function() {
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
    document.getElementById(`toggleSolo`).addEventListener('click', () => {
        setAttributes('artist-recording', server.attr.solo, true);
        relEditor.editNote(GM_info.script);
    });
    return false;
});
