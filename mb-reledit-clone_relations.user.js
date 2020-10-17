/* global $ MB relEditor */
'use strict';
// ==UserScript==
// @name         MusicBrainz relation editor: Clone recording relations onto other recordings
// @namespace    mbz-loujine
// @author       loujine
// @version      2020.10.15
// @downloadURL  https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-reledit-clone_relations.user.js
// @updateURL    https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-reledit-clone_relations.user.js
// @supportURL   https://github.com/loujine/musicbrainz-scripts
// @icon         https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/icon.png
// @description  musicbrainz.org relation editor: Clone recording relations onto other recordings
// @compatible   firefox+tampermonkey
// @license      MIT
// @require      https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mbz-loujine-common.js
// @include      http*://*musicbrainz.org/release/*/edit-relationships
// @grant        none
// @run-at       document-end
// ==/UserScript==

function cloneAR(refIdx) {
    refIdx = refIdx - 1 || 0;
    const vm = MB.releaseRelationshipEditor;
    const selectedRecordings = MB.relationshipEditor.UI.checkedRecordings();
    const sourceRecording = selectedRecordings.splice(refIdx, 1)[0];
    const sourceRels = sourceRecording.relationships().filter(
        rel => !['recording-recording', 'recording-work'].includes(rel.entityTypes)
    );
    let dialog;

    selectedRecordings.map(rec => {
        sourceRels.map(sourceRel => {
            dialog = new MB.relationshipEditor.UI.AddDialog({
                viewModel: vm,
                source: rec,
                target: sourceRel.entities().filter(ent => ent.entityType !== 'recording')[0],
            });

            dialog.relationship().linkTypeID(sourceRel.linkTypeID());
            dialog.relationship().setAttributes(sourceRel.attributes());

            dialog.relationship().entity0_credit(sourceRel.entity0_credit());
            dialog.relationship().entity1_credit(sourceRel.entity1_credit());

            dialog.relationship().begin_date.year(sourceRel.begin_date.year());
            dialog.relationship().begin_date.month(sourceRel.begin_date.month());
            dialog.relationship().begin_date.day(sourceRel.begin_date.day());
            dialog.relationship().end_date.year(sourceRel.end_date.year());
            dialog.relationship().end_date.month(sourceRel.end_date.month());
            dialog.relationship().end_date.day(sourceRel.end_date.day());
            dialog.accept();
        });
    });
}

(function displayToolbar() {
    relEditor.container(document.querySelector('div.tabs'))
             .insertAdjacentHTML('beforeend', `
        <h3>Clone recording relations to selected recordings</h3>
        <span>
          <abbr title="index of source recording to clone from">Reference recording</abbr>:&nbsp;
        </span>
        <input type="text" id="cloneRef" placeholder="1 (clone from 1st recording)">
        <input type="button" id="cloneAR" value="Clone relations">
    `);
})();

$(document).ready(function () {
    document.getElementById('cloneAR').addEventListener('click', () => {
        const refIdx = parseInt(document.getElementById('cloneRef').value);
        cloneAR(refIdx);
        relEditor.editNote(
            GM_info.script
        );
    });
    return false;
});
