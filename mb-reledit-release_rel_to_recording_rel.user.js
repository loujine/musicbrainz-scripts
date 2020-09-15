/* global $ MB server relEditor */
'use strict';
// ==UserScript==
// @name         MusicBrainz relation editor: Replace release relations by recording relations
// @namespace    mbz-loujine
// @author       loujine
// @version      2020.9.14
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

function fetchLinkIds() {
    const typeInfo = server.getRelationshipTypeInfo()['artist-release'].filter(
        relation => relation.id === 34 // performance
    )[0];
    const ids = [typeInfo.id];
    for (const rel of typeInfo.children) {
        ids.push(rel.id);
        if (rel.children && rel.children.length) {
            for (const subrel of rel.children) {
                ids.push(subrel.id);
            }
        }
    }
    return ids;
}

function moveAR(ids) {
    const vm = MB.releaseRelationshipEditor;
    vm.source.relationships().filter(
        rel => rel.entityTypes === "artist-release" && ids.includes(rel.linkTypeID())
    ).forEach(rel => {
        const performer = rel.entities()[0];
        const releaseLinkType = rel.linkTypeID();
        const releaseLinkAttributes = rel.attributes();
        const recordings = MB.relationshipEditor.UI.checkedRecordings();
        for (const recording of recordings) {
            if (recording.relationships().filter(
                rel => rel.entityTypes === "artist-recording"
            ).map(
                rel => rel.entities()[0].id
            ).includes(performer.id)) {
                continue;
            }
            const dialog = new MB.relationshipEditor.UI.AddDialog({
                source: recording,
                target: performer,
                viewModel: vm
            });
            dialog.relationship().linkTypeID(
                server.releaseToRecordingLink(releaseLinkType)
            );
            dialog.accept();
            if (releaseLinkAttributes.length) {
                dialog.relationship().setAttributes(releaseLinkAttributes);
            }
        }
        if (recordings.length) {
            const realIdx = vm.source.relationships().indexOf(rel);
            document.querySelectorAll('#release-rels .remove-button')[realIdx].click();
        }
    });
}

(function displayToolbar() {
    relEditor.container(document.querySelector('div.tabs'))
             .insertAdjacentHTML('beforeend', `
        <h3>Move relations to recordings</h3>
        <input type="button" id="moveAR" value="Move relations to selected recordings">
    `);
})();

$(document).ready(function () {
    const ids = fetchLinkIds();
    document.getElementById('moveAR').addEventListener('click', () => {
        moveAR(ids);
        relEditor.editNote(
            GM_info.script,
            'Move performers in release relations to individual recordings'
        );
    });
    return false;
});
