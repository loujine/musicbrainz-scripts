/* global $ helper MB relEditor requests */
'use strict';
// ==UserScript==
// @name         MusicBrainz relation editor: Clone recording relations onto other recordings
// @namespace    mbz-loujine
// @author       loujine
// @version      2023.2.28
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
const cloneIdxHelp = `Index(es) to clone relationships from.
Indexes start at 1 and are related to the list of selected recordings, not the tracklist indexes.
Indexes can be empty (= 1, first selected), a number n or a range n1-n2.
Relations are cloned by looping over the 'source' recordings (e.g. '1-2' on 7 selected recordings
will clone the relations of R1 to R3,R5,R7 and the ones from R2 to R4,R6
`;

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

    const sourceRecordings = recordings.splice(startIdx, range);

    recordings.map((rec, idx) => {
        const sourceRecording = sourceRecordings[idx % sourceRecordings.length];
        const sourceRels = sourceRecording.relationships.filter(
            rel => !['recording-recording', 'recording-work'].includes(rel.entityTypes)
        );
        sourceRels.map(sourceRel => {
            MB.relationshipEditor.dispatch({
                type: 'update-relationship-state',
                sourceEntity: rec,
                ...relEditor.dispatchDefaults,
                batchSelectionCount: null,
                newRelationshipState: {
                    ...relEditor.stateDefaults,
                    _status: 1,
                    entity0: sourceRel.backward ? sourceRel.target : rec,
                    entity1: sourceRel.backward ? rec : sourceRel.target,
                    entity0_credit: sourceRel.entity0_credit,
                    entity1_credit: sourceRel.entity1_credit,
                    begin_date: sourceRel.begin_date,
                    end_date: sourceRel.end_date,
                    ended: sourceRel.ended,
                    attributes: relEditor.createAttributeTree(sourceRel.attributes),
                    linkTypeID: sourceRel.linkTypeID,
                },
            });
        });
    });
}

function cloneExtAR(recMBID) {
    if (recMBID.split('/').length > 1) {
        recMBID = recMBID.split('/')[4];
    }
    requests.GET(`/ws/js/entity/${recMBID}?inc=rels`, resp => {
        const sourceRels = JSON.parse(resp).relationships.filter(
            rel => rel.target_type != 'work'
        );

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

        recordings.map(async (rec, idx) => {
            await helper.delay(idx * 100);
            sourceRels.map(sourceRel => {
                MB.relationshipEditor.dispatch({
                    type: 'update-relationship-state',
                    sourceEntity: rec,
                    ...relEditor.dispatchDefaults,
                    batchSelectionCount: null,
                    newRelationshipState: {
                        ...relEditor.stateDefaults,
                        _status: 1,
                        entity0: sourceRel.backward ? sourceRel.target : rec,
                        entity1: sourceRel.backward ? rec : sourceRel.target,
                        entity0_credit: sourceRel.entity0_credit,
                        entity1_credit: sourceRel.entity1_credit,
                        begin_date: sourceRel.begin_date,
                        end_date: sourceRel.end_date,
                        ended: sourceRel.ended,
                        attributes: relEditor.createAttributeTree(sourceRel.attributes),
                        linkTypeID: sourceRel.linkTypeID,
                    },
                });
            });
        });
    });
}

function cloneReleaseExtAR(relMBID) {
    if (relMBID.split('/').length > 1) {
        relMBID = relMBID.split('/')[4];
    }

    requests.GET(`/ws/js/entity/${relMBID}?inc=rels`, async resp => {
        const sourceRels = JSON.parse(resp).relationships.filter(
            rel => rel.target_type !== 'url'
        );
        const dialogSource = MB.relationshipEditor.state.entity;

        sourceRels.map(sourceRel => {
            MB.relationshipEditor.dispatch({
                type: 'update-relationship-state',
                sourceEntity: dialogSource,
                ...relEditor.dispatchDefaults,
                batchSelectionCount: null,
                newRelationshipState: {
                    ...relEditor.stateDefaults,
                    _status: 1,
                    entity0: sourceRel.backward ? sourceRel.target : dialogSource,
                    entity1: sourceRel.backward ? dialogSource : sourceRel.target,
                    entity0_credit: sourceRel.entity0_credit,
                    entity1_credit: sourceRel.entity1_credit,
                    begin_date: sourceRel.begin_date,
                    end_date: sourceRel.end_date,
                    ended: sourceRel.ended,
                    attributes: relEditor.createAttributeTree(sourceRel.attributes),
                    linkTypeID: sourceRel.linkTypeID,
                },
            });
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
            Source recording index in selection:
          </span>
          &nbsp;
          <input type="text" id="cloneRef" placeholder="empty or n or 'n1-n2'">
          <span title="${cloneIdxHelp}">🛈</span>
          &nbsp;
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
    $('input#cloneRef').on('input', () => {
        document.getElementById('cloneExtRecording').value = '';
        autoCompleteRec();
    });
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
