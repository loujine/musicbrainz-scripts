/* global $ MB server relEditor GM_info */
'use strict';
// ==UserScript==
// @name         MusicBrainz relation editor: Copy dates on recording relations
// @namespace    mbz-loujine
// @author       loujine
// @version      2020.9.8
// @downloadURL  https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-reledit-copy_dates.user.js
// @updateURL    https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-reledit-copy_dates.user.js
// @supportURL   https://github.com/loujine/musicbrainz-scripts
// @icon         https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/icon.png
// @description  musicbrainz.org relation editor: Copy/remove dates on recording relations
// @compatible   firefox+tampermonkey
// @license      MIT
// @require      https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mbz-loujine-common.js
// @include      http*://*musicbrainz.org/release/*/edit-relationships
// @grant        none
// @run-at       document-end
// ==/UserScript==

function copyDate(from_relation, relation) {
    ['begin_date', 'end_date'].forEach(function(date) {
        ['day', 'month', 'year'].forEach(function(unit) {
            relation[date][unit](from_relation[date][unit]());
        });
    });
}

function removeDate(relation) {
    ['begin_date', 'end_date'].forEach(function(date) {
        ['day', 'month', 'year'].forEach(function(unit) {
            relation[date][unit]('');
        });
    });
    relation.ended(false);
}

function referenceDate(relations) {
    // look for one recording link with a date
    // give priority to the most precise one (day > month > year)
    for (const unit of ['day', 'month', 'year']) {
        for (const [idx, rel] of relations.entries()) {
            if (rel.end_date[unit]() > 0
                && Object.values(server.recordingLinkType).includes(
                    parseInt(rel.linkTypeID()))) {
                return idx;
            }
        }
    }
    return -1;
}

function propagateDates() {
    const recordings = MB.relationshipEditor.UI.checkedRecordings();
    recordings.forEach(function(recording) {
        const relations = recording.relationships();
        const idx = referenceDate(relations);
        if (idx !== -1) {
            relations.forEach(function(rel) {
                const linkType = parseInt(rel.linkTypeID());
                if (!rel.removed() && Object.values(server.recordingLinkType).includes(linkType)) {
                    copyDate(relations[idx], rel);
                }
            });
        }
    });
}

function removeDates() {
    const recordings = MB.relationshipEditor.UI.checkedRecordings();
    recordings.forEach(function(recording) {
        const relations = recording.relationships();
        relations.forEach(function(relation) {
            if (!relation.removed()) {
                removeDate(relation);
            }
        });
    });
}

(function displayToolbar() {
    relEditor.container(document.querySelector('div.tabs'))
    .insertAdjacentHTML('beforeend', `
        <h3>Dates</h3>
        <input type="button" id="copyDates" value="Copy dates">
        <input type="button" id="removeDates" value="Removes dates">
    `);
})();


$(document).ready(function() {
    let appliedNote = false;
    document.getElementById('removeDates').addEventListener('click', () => {
        removeDates();
        relEditor.editNote(GM_info.script);
    });
    document.getElementById('copyDates').addEventListener('click', () => {
        propagateDates();
        if (!appliedNote) {
            relEditor.editNote(
                GM_info.script,
                'Propagate recording dates from other relationships'
            );
            appliedNote = true;
        }
    });
    return false;
});
