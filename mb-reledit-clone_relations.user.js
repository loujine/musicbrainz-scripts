/* global $ MB relEditor requests */
'use strict';
// ==UserScript==
// @name         MusicBrainz relation editor: Clone recording relations onto other recordings
// @namespace    mbz-loujine
// @author       loujine
// @version      2022.1.28
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

const MBID_REGEX = /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/;

function autoComplete(nodeId, entityType) {
    const $input = $(`input#${nodeId}`);
    const match = $input.val().match(MBID_REGEX);
    if (match) {
        const mbid = match[0];
        requests.GET(`/ws/2/${entityType}/${mbid}?fmt=json`, data => {
            data = JSON.parse(data);
            $input.data('mbid', mbid);
            $input.val(data.title || data.name);
            $input.css('background', '#bbffbb');
        });
    } else {
        $input.data().mbid = "";
        $input.css('background', '#ffaaaa');
    }
}

function autoCompleteRec() {
    return autoComplete('cloneExtRecording', 'recording');
}

function autoCompleteRel() {
    return autoComplete('cloneExtRelease', 'release');
}

function cloneAR(refIdx) {
    let startIdx;
    let range;
    if (refIdx.includes('-')) {
        startIdx = parseInt(refIdx.split('-')[0]) - 1;
        range = parseInt(refIdx.split('-')[1]) - startIdx;
    } else {
        startIdx = parseInt(refIdx) - 1 || 0;
        range = 1;
    }
    const vm = MB.releaseRelationshipEditor;
    const selectedRecordings = MB.relationshipEditor.UI.checkedRecordings();
    const sourceRecordings = selectedRecordings.splice(startIdx, range);
    let dialog;

    selectedRecordings.map((rec, idx) => {
        const sourceRecording = sourceRecordings[idx % sourceRecordings.length];
        const sourceRels = sourceRecording.relationships().filter(
            rel => !['recording-recording', 'recording-work'].includes(rel.entityTypes)
        );
        sourceRels.map(sourceRel => {
            dialog = new MB.relationshipEditor.UI.AddDialog({
                viewModel: vm,
                source: rec,
                target: sourceRel.entities().filter(ent => ent.entityType !== 'recording')[0],
            });
            dialog.accept();  // apparently required for Firefox

            dialog.relationship().linkTypeID(sourceRel.linkTypeID());
            dialog.relationship().setAttributes(sourceRel.attributes());

            dialog.relationship().entity0_credit(sourceRel.entity0_credit());
            dialog.relationship().entity1_credit(sourceRel.entity1_credit());

            if (sourceRel.begin_date) {
                dialog.relationship().begin_date.year(sourceRel.begin_date.year());
                dialog.relationship().begin_date.month(sourceRel.begin_date.month());
                dialog.relationship().begin_date.day(sourceRel.begin_date.day());
            }
            if (sourceRel.end_date) {
                dialog.relationship().end_date.year(sourceRel.end_date.year());
                dialog.relationship().end_date.month(sourceRel.end_date.month());
                dialog.relationship().end_date.day(sourceRel.end_date.day());
            }
            dialog.accept();
        });
    });
}

function cloneExtAR(recMBID) {
    if (recMBID.split('/').length > 1) {
        recMBID = recMBID.split('/')[4];
    }
    const vm = MB.releaseRelationshipEditor;
    const selectedRecordings = MB.relationshipEditor.UI.checkedRecordings();
    let dialog;

    requests.GET(`/ws/js/entity/${recMBID}?inc=rels`, resp => {
        const sourceRels = JSON.parse(resp).relationships.filter(
            rel => rel.target_type != 'work'
        );
        selectedRecordings.map(rec => {
            sourceRels.map(sourceRel => {
                dialog = new MB.relationshipEditor.UI.AddDialog({
                    viewModel: vm,
                    source: rec,
                    target: sourceRel.target,
                });
                dialog.accept();  // apparently required for Firefox

                dialog.relationship().linkTypeID(sourceRel.linkTypeID);
                dialog.relationship().setAttributes(sourceRel.attributes);

                dialog.relationship().entity0_credit(sourceRel.entity0_credit);
                dialog.relationship().entity1_credit(sourceRel.entity1_credit);

                if (sourceRel.target_type === 'recording'
                        && sourceRel.backward) {
                    dialog.changeDirection();
                }
                if (sourceRel.begin_date) {
                    dialog.relationship().begin_date.year(sourceRel.begin_date.year);
                    dialog.relationship().begin_date.month(sourceRel.begin_date.month);
                    dialog.relationship().begin_date.day(sourceRel.begin_date.day);
                }
                if (sourceRel.end_date) {
                    dialog.relationship().end_date.year(sourceRel.end_date.year);
                    dialog.relationship().end_date.month(sourceRel.end_date.month);
                    dialog.relationship().end_date.day(sourceRel.end_date.day);
                }
                dialog.accept();
            });
        });
    });
}

function cloneReleaseExtAR(relMBID) {
    if (relMBID.split('/').length > 1) {
        relMBID = relMBID.split('/')[4];
    }
    const vm = MB.releaseRelationshipEditor;
    const release = MB.entity({entityType: 'release', gid: document.URL.split('/')[4]});
    let dialog;

    requests.GET(`/ws/js/entity/${relMBID}?inc=rels`, resp => {
        const sourceRels = JSON.parse(resp).relationships.filter(
            rel => rel.target_type != 'url'
        );
        sourceRels.map(sourceRel => {
            dialog = new MB.relationshipEditor.UI.AddDialog({
                viewModel: vm,
                source: release,
                target: sourceRel.target,
            });

            dialog.relationship().linkTypeID(sourceRel.linkTypeID);
            dialog.relationship().setAttributes(sourceRel.attributes);

            dialog.relationship().entity0_credit(sourceRel.entity0_credit);
            dialog.relationship().entity1_credit(sourceRel.entity1_credit);

            if (sourceRel.begin_date) {
                dialog.relationship().begin_date.year(sourceRel.begin_date.year);
                dialog.relationship().begin_date.month(sourceRel.begin_date.month);
                dialog.relationship().begin_date.day(sourceRel.begin_date.day);
            }
            if (sourceRel.end_date) {
                dialog.relationship().end_date.year(sourceRel.end_date.year);
                dialog.relationship().end_date.month(sourceRel.end_date.month);
                dialog.relationship().end_date.day(sourceRel.end_date.day);
            }
            dialog.accept();
        });
    });
}

(function displayToolbar() {
    relEditor.container(document.querySelector('div.tabs'))
             .insertAdjacentHTML('beforeend', `
      <details id="clone_rels_script_toggle">
        <summary style="display: block;margin-left: 8px;cursor: pointer;">
          <h3 style="display: list-item;">
            Clone recording relations to selected recordings
          </h3>
        </summary>
        <div>
          <span>
            <abbr title="index of selected recording to clone from">
              Recording index in selection
            </abbr>
            :&nbsp;
          </span>
          <input type="text" id="cloneRef" placeholder="1 (clone from 1st selected recording)">
          <span>OR recording link:&nbsp;</span>
          <input type="text" id="cloneExtRecording" placeholder="recording mbid">
          <br />
          <input type="button" id="cloneAR" value="Apply">
        </div>
      </details>
      <details id="clone_release_rels_script_toggle">
        <summary style="display: block;margin-left: 8px;cursor: pointer;">
          <h3 style="display: list-item;">
            Clone release relations from another release
          </h3>
        </summary>
        <div>
          <span>release link:&nbsp;</span>
          <input type="text" id="cloneExtRelease" placeholder="release mbid">
          <br />
          <input type="button" id="cloneReleaseAR" value="Apply">
        </div>
      </details>
    `);
})();

$(document).ready(function () {
    $('input#cloneExtRecording').on('input', autoCompleteRec);
    $('input#cloneExtRelease').on('input', autoCompleteRel);
    let appliedNote = false;
    document.getElementById('cloneAR').addEventListener('click', () => {
        const recMBID = $('input#cloneExtRecording').data('mbid');
        if (recMBID) {
            cloneExtAR(recMBID);
        } else {
            const refIdx = document.getElementById('cloneRef').value;
            cloneAR(refIdx);
        }
        if (!appliedNote) {
            relEditor.editNote(GM_info.script);
            appliedNote = true;
        }
    });
    document.getElementById('cloneReleaseAR').addEventListener('click', () => {
        const relMBID = $('input#cloneExtRelease').data('mbid');
        if (relMBID) {
            cloneReleaseExtAR(relMBID);
        }
        if (!appliedNote) {
            relEditor.editNote(GM_info.script, 'Cloned from https://musicbrainz.org/release/' + relMBID);
            appliedNote = true;
        }
    });
    return false;
});
