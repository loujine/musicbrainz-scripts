/* global $ MB server relEditor GM_info */
'use strict';
// ==UserScript==
// @name         MusicBrainz relation editor: Replace release relations by recording relations
// @namespace    mbz-loujine
// @author       loujine
// @version      2018.1.6
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mb-reledit-release_rel_to_recording_rel.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mb-reledit-release_rel_to_recording_rel.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org relation editor: Replace release relations by recording relations
// @compatible   firefox+tampermonkey
// @license      MIT
// @require      https://greasyfork.org/scripts/13747-mbz-loujine-common/code/mbz-loujine-common.js?version=241520
// @include      http*://*musicbrainz.org/release/*/edit-relationships
// @grant        none
// @run-at       document-end
// ==/UserScript==

function fetchLinkIds() {
    const ids = [MB.typeInfo['artist-release'][0].id];
    for (const rel of MB.typeInfo['artist-release'][0].children) {
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
    ).forEach((rel, idx) => {
        const performer = rel.entities()[0],
            releaseLinkType = rel.linkTypeID(),
            releaseLinkAttributes = rel.attributes(),
            recordings = MB.relationshipEditor.UI.checkedRecordings();
        for (const recording of recordings) {
            if (recording.relationships().filter(
                rel => rel.entityTypes === "artist-recording"
            ).map(
                rel => rel.entities()[0].id
            ).includes(performer.id)) {
                return;
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
            document.querySelectorAll('#release-rels .remove-button')[idx].click();
        }
    });
}

(function displayToolbar() {
    relEditor.container(document.querySelector('div.tabs'))
             .insertAdjacentHTML('beforeend', `
        <h3>Move AR to recordings</h3>
        <input type="button" id="moveAR" value="Move AR to selected recordings">
    `);
})();


$(document).ready(function() {
    const ids = fetchLinkIds();
    document.getElementById('moveAR').addEventListener('click', () => {
        moveAR(ids);
        relEditor.editNote(
            GM_info.script,
            'Move performers in release AR to individual recordings'
        );
    });
    return false;
});
