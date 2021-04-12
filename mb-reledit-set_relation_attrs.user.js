/* global $ MB server relEditor */
'use strict';
// ==UserScript==
// @name         MusicBrainz relation editor: Set relation attributes
// @namespace    mbz-loujine
// @author       loujine
// @version      2021.4.12
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
    let checkedEntities = [];
    if (relationType.includes('work')) {
        checkedEntities = MB.relationshipEditor.UI.checkedWorks();
    }
    if (!checkedEntities.length) {
        checkedEntities = MB.relationshipEditor.UI.checkedRecordings();
    }
    if (!checkedEntities.length) {
        alert('No relation selected');
    }
    for (const recordingOrWork of checkedEntities) {
        for (const relation of recordingOrWork.relationships().filter(
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
      <details id="relattrs_script_toggle">
        <summary style="display: block;margin-left: 8px;cursor: pointer;">
          <h3 style="display: list-item;">
            Relation attributes
          </h3>
        </summary>
        <div>
          <h3>Recording-Work relation attributes</h3>
          <table>
            <tr>
              <td><input type="button" id="setCover" value="Set cover"></td>
              <td><input type="button" id="setLive" value="Set live"></td>
              <td><input type="button" id="setPartial" value="Set partial"></td>
              <td><input type="button" id="setInstrumental" value="Set instrumental"></td>
              <td><input type="button" id="setMedley" value="Set medley"></td>
            </tr>
            <tr>
              <td><input type="button" id="toggleCover" value="Toggle cover"></td>
              <td><input type="button" id="toggleLive" value="Toggle live"></td>
              <td><input type="button" id="togglePartial" value="Toggle partial"></td>
              <td><input type="button" id="toggleInstrumental" value="Toggle instrumental"></td>
              <td><input type="button" id="toggleMedley" value="Toggle medley"></td>
            </tr>
          </table>
          <h3>Recording-Artist relation attributes</h3>
          <input type="button" id="toggleSolo" value="Toggle solo">
          <input type="button" id="toggleAdditional" value="Toggle additional">
          <input type="button" id="toggleGuest" value="Toggle guest">
        </div>
      </details>
    `);
})();


$(document).ready(function() {
    for (const attr of ['Cover', 'Live', 'Partial', 'Instrumental', 'Medley']) {
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
