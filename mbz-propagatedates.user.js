/* global $ MB server relEditor */
'use strict';
var meta = function() {
// ==UserScript==
// @name         MusicBrainz: Batch-propagate recording dates
// @namespace    mbz-loujine
// @author       loujine
// @version      2017.2.11
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-propagatedates.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-propagatedates.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Copy dates on relevant recording AR fields
// @compatible   firefox+greasemonkey
// @license      MIT
// @require      https://greasyfork.org/scripts/13747-mbz-loujine-common/code/mbz-loujine-common.js?version=174522
// @include      http*://*musicbrainz.org/release/*/edit-relationships
// @grant        none
// @run-at       document-end
// ==/UserScript==
};
if (meta && meta.toString && (meta = meta.toString())) {
    var meta = {'name': meta.match(/@name\s+(.+)/)[1],
                'version': meta.match(/@version\s+(.+)/)[1]};
}

// imported from mbz-loujine-common.js: server, relEditor

function copyDate(from_date, relation) {
    ['beginDate', 'endDate'].forEach(function(date) {
        ['day', 'month', 'year'].forEach(function(unit) {
            relation.period[date][unit](from_date[date][unit]());
        });
    });
}

function removeDate(relation) {
    ['beginDate', 'endDate'].forEach(function(date) {
        ['day', 'month', 'year'].forEach(function(unit) {
            relation.period[date][unit]('');
        });
    });
    relation.period.ended(false);
}

function referenceDate(relations) {
    var idx_ref = -1;
    // look for one recording link with a date
    // give priority to the most precise one (day > month > year)
    ['day', 'month', 'year'].forEach(function(unit) {
        relations.forEach(function(rel, idx) {
            if (idx_ref === -1 && rel.period.endDate[unit]() > 0) {
                idx_ref = idx;
            }
        });
    });
    return idx_ref;
}

function propagateDates() {
    var recordings = MB.relationshipEditor.UI.checkedRecordings();
    recordings.forEach(function(recording) {
        var relations = recording.relationships(),
            idx = referenceDate(relations);
        if (idx !== -1) {
            var from_period = relations[idx].period;
            relations.forEach(function(rel) {
                var linkType = parseInt(rel.linkTypeID());
                if (_.includes(_.values(server.recordingLinkType), linkType)) {
                    copyDate(from_period, rel);
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
        relEditor.editNote(meta);
    });
    $('#copydates').click(function() {
        propagateDates();
        if (!appliedNote) {
            relEditor.editNote(meta, 'Propagate recording dates from other advanced relationships');
            appliedNote = true;
        }
    });
    return false;
});

