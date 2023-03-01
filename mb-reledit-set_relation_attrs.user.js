/* global $ helper MB relEditor */
'use strict';
// ==UserScript==
// @name         MusicBrainz relation editor: Set relation attributes
// @namespace    mbz-loujine
// @author       loujine
// @version      2023.2.28
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

const setAttributes = (targetType, attrName, toggle) => {
    const attrType = Object.values(MB.linkedEntities.link_attribute_type).filter(
        attr => attr.name === attrName
    )[0];

    const recordings = MB.tree.toArray(MB.relationshipEditor.state.selectedRecordings);
    if (!recordings.length) {
        alert('No relation selected');
        return;
    }

    // sort recordings by order in tracklist to avoid having the dialog jump everywhere
    const recOrder = MB.getSourceEntityInstance().mediums.flatMap(
        m => m.tracks
    ).map(t => t.recording.id);
    recordings.sort((r1, r2) => recOrder.indexOf(r1.id) - recOrder.indexOf(r2.id));

    let recIdx = 0;
    recordings.map(async rec => {
        recIdx += 1;
        await helper.delay(recIdx * 100);
        let relIdx = 0;

        rec.relationships.filter(
            rel => rel.target_type === targetType
        ).map(async rel => {
            relIdx += 1;
            await helper.delay(relIdx * 10);

            const attrs = rel.attributes;
            const attr = attrs.filter(el => el.typeID === attrType.id);
            if (!attr.length) {
                attrs.push({
                    type: {gid: attrType.gid},
                    typeID: attrType.id,
                    typeName: attrType.name
                });
            } else if (toggle) {
                attrs.splice(attrs.indexOf(attr[0]), 1);
            }

            const relType = rel.backward
                ? `${rel.target_type}-${rel.source_type}`
                : `${rel.source_type}-${rel.target_type}`;

            await helper.waitFor(() => !MB.relationshipEditor.relationshipDialogDispatch, 1);

            document.getElementById(`edit-relationship-${relType}-${rel.id}`).click();
            await helper.waitFor(() => !!MB.relationshipEditor.relationshipDialogDispatch, 1);

            MB.relationshipEditor.relationshipDialogDispatch({
                type: 'set-attributes',
                attributes: attrs,
            });
            await helper.delay(1);

            document.querySelector('.dialog-content button.positive').click();
        });
    });
};


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
            setAttributes('work', attr.toLowerCase(), false);
            relEditor.editNote(GM_info.script);
        });
        document.getElementById(`toggle${attr}`).addEventListener('click', () => {
            setAttributes('work', attr.toLowerCase(), true);
            relEditor.editNote(GM_info.script);
        });
    }
    for (const attr of ['Solo', 'Additional', 'Guest']) {
        document.getElementById(`toggle${attr}`).addEventListener('click', () => {
            setAttributes('artist', attr.toLowerCase(), true);
            relEditor.editNote(GM_info.script);
        });
    }
    return false;
});
