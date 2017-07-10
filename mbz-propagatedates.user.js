/* global $ _ MB server relEditor GM_info */
'use strict';
// ==UserScript==
// @name         MusicBrainz: Batch-propagate recording dates
// @namespace    mbz-loujine
// @author       loujine
// @version      2017.7.10
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-propagatedates.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-propagatedates.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Copy dates on relevant recording AR fields
// @compatible   firefox+greasemonkey
// @license      MIT
// @require      https://greasyfork.org/scripts/13747-mbz-loujine-common/code/mbz-loujine-common.js?version=195378
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
    var idx_ref = -1;
    // look for one recording link with a date
    // give priority to the most precise one (day > month > year)
    for (const unit of ['day', 'month', 'year']) {
        for (const [idx, rel] of relations.entries()) {
            if (rel.end_date[unit]() > 0
                && _.includes(_.values(server.recordingLinkType),
                              parseInt(rel.linkTypeID()))) {
                return idx;
            }
        }
    }
    return -1;
}

function propagateDates() {
    var recordings = MB.relationshipEditor.UI.checkedRecordings();
    recordings.forEach(function(recording) {
        var relations = recording.relationships(),
            idx = referenceDate(relations);
        if (idx !== -1) {
            relations.forEach(function(rel) {
                var linkType = parseInt(rel.linkTypeID());
                if (_.includes(_.values(server.recordingLinkType), linkType)) {
                    copyDate(relations[idx], rel);
                }
            });
        }
    });
}

function removeDates() {
    var recordings = MB.relationshipEditor.UI.checkedRecordings();
    recordings.forEach(function(recording) {
        var relations = recording.relationships();
        relations.forEach(function(relation) {
            removeDate(relation);
        });
    });
}

(function displayToolbar(relEditor) {
    $('div.tabs').after(
        relEditor.container()
        .append(
            $('<h3>Dates</h3>')
        ).append(
            $('<input>', {
                'id': 'copydates',
                'type': 'button',
                'value': 'Copy dates'
            })
        ).append(
            $('<input>', {
                'id': 'removedates',
                'type': 'button',
                'value': 'Remove dates'
            })
        )
    );
})(relEditor);

$(document).ready(function() {
    var appliedNote = false;
    $('#removedates').click(function() {
        removeDates();
        relEditor.editNote(GM_info.script);
    });
    $('#copydates').click(function() {
        propagateDates();
        if (!appliedNote) {
            relEditor.editNote(GM_info.script,
                'Propagate recording dates from other advanced relationships');
            appliedNote = true;
        }
    });
    return false;
});
