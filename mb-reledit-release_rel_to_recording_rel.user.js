/* global $ MB server relEditor */
'use strict';
// ==UserScript==
// @name         MusicBrainz relation editor: Replace release relations by recording relations
// @namespace    mbz-loujine
// @author       loujine
// @version      2023.3.9
// @downloadURL  https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-reledit-release_rel_to_recording_rel.user.js
// @updateURL    https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-reledit-release_rel_to_recording_rel.user.js
// @supportURL   https://github.com/loujine/musicbrainz-scripts
// @icon         https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/icon.png
// @description  musicbrainz.org relation editor: Replace release relations by recording relations
// @compatible   firefox+tampermonkey
// @license      MIT
// @require      https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mbz-loujine-common.js
// @include      http*://*musicbrainz.org/release/*/edit-relationships
// @grant        none
// @run-at       document-end
// ==/UserScript==

function moveAR() {
    const release = MB.relationshipEditor.state.entity;
    const recordings = MB.tree.toArray(MB.relationshipEditor.state.selectedRecordings);
    release.relationships.filter(
        rel => Object.keys(server.releaseLinkTypeID).includes(String(rel.linkTypeID))
    ).map(artistRel => {
        recordings.map(rec => {
            MB.relationshipEditor.dispatch({
                type: 'update-relationship-state',
                sourceEntity: rec,
                ...relEditor.dispatchDefaults,
                newRelationshipState: {
                    ...relEditor.stateDefaults,
                    _status: 1,
                    attributes: relEditor.createAttributeTree(artistRel.attributes),
                    begin_date: artistRel.begin_date,
                    entity0: artistRel.target,
                    entity1: rec,
                    end_date: artistRel.end_date,
                    ended: artistRel.ended,
                    id: MB.relationshipEditor.getRelationshipStateId(),
                    linkTypeID: server.releaseToRecordingLink(artistRel.linkTypeID),
                },
            });
        });
        if (recordings.length) {
            document.getElementById(
                `remove-relationship-${artistRel.target_type}-` +
                `${artistRel.source_type}-${artistRel.id}`
            ).click();
        }
    });
}

(function displayToolbar() {
    relEditor.container(document.querySelector('div.tabs'))
             .insertAdjacentHTML('beforeend', `
        <h3>Move release relations to recordings</h3>
        <input type="button" id="moveAR" value="Move release relations to selected recordings">
    `);
})();

$(document).ready(function () {
    document.getElementById('moveAR').addEventListener('click', () => {
        moveAR();
        relEditor.editNote(
            GM_info.script,
            'Move performers in release relations to individual recordings'
        );
    });
    return false;
});
