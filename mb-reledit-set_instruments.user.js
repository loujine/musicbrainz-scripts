/* global $ MB roles server relEditor GM_info */
'use strict';
// ==UserScript==
// @name         MusicBrainz relation editor: set role in recording-artist relation
// @namespace    mbz-loujine
// @author       loujine
// @version      2018.8.18
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mb-reledit-set_instruments.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mb-reledit-set_instruments.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org relation editor: set/unset role relations on selected recordings
// @compatible   firefox+tampermonkey
// @license      MIT
// @require      https://greasyfork.org/scripts/13747-mbz-loujine-common/code/mbz-loujine-common.js?version=621615
// @include      http*://*musicbrainz.org/release/*/edit-relationships
// @grant        none
// @run-at       document-end
// ==/UserScript==

function setInstrument(fromType, toType, fromAttrId, toAttrId) {
    const attrInfo = server.getInstrumentRelationshipAttrInfo();
    const toAttr = isNaN(toAttrId) ? null :
                     attrInfo.filter(attr => attr.id === toAttrId)[0];

    for (const recording of MB.relationshipEditor.UI.checkedRecordings()) {
        recording.relationships().filter(
            relation => relation.linkTypeID() === fromType
        ).filter(
            relation => (
                (isNaN(fromAttrId) && relation.attributes().length === 0)
                || relation.attributes().map(attr => attr.type.id).includes(fromAttrId)
            )
        ).map(relation => {
            relation.linkTypeID(toType);
            let attrs = relation.attributes();
            if (!isNaN(fromAttrId)) {
                attrs = attrs.filter(attr => attr.type.id != fromAttrId);
            }
            if (toAttr) {
                attrs.push({type: toAttr});
            }
            relation.setAttributes(attrs);
        });
    }
}


(function displayToolbar() {
    relEditor.container(document.querySelector('div.tabs'))
             .insertAdjacentHTML('beforeend', `
        <h3>Replace artist role</h3>
        <p>
          From: <select id="fromRole">${roles.roles}</select>
          with attr:
            <select id="fromRoleAttrs">${roles.roleAttrs}</select>
          <br />
          To: <select id="toRole">${roles.roles}</select>
          with attr:
            <select id="toRoleAttrs">${roles.roleAttrs}</select>
          <input type="button" id="setRole" value='Apply'>
        </p>
    `);
})();


$(document).ready(function () {
    document.getElementById('fromRole').addEventListener('change', () => {
        document.getElementById('fromRoleAttrs').options.selectedIndex = 0;
    });
    document.getElementById('toRole').addEventListener('change', () => {
        document.getElementById('toRoleAttrs').options.selectedIndex = 0;
    });
    document.getElementById('setRole').addEventListener('click', () => {
        setInstrument(
            parseInt(document.getElementById('fromRole').value),
            parseInt(document.getElementById('toRole').value),
            parseInt(document.getElementById('fromRoleAttrs').value),
            parseInt(document.getElementById('toRoleAttrs').value)
        );
        relEditor.editNote(GM_info.script);
    });
    return false;
});
