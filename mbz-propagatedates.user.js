'use strict';
var meta = function() {
// ==UserScript==
// @name         MusicBrainz: Batch-propagate recording dates
// @namespace    mbz-loujine
// @author       loujine
// @version      2015.11.08
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-propagatedates.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-propagatedates.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Copy dates on relevant recording AR fields
// @compatible   firefox+greasemonkey
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @require      https://greasyfork.org/scripts/13748-musicbrainz-common-files-for-the-relationships-editor/code/MusicBrainz:%20common%20files%20for%20the%20relationships%20editor.js?version=85768
// @require      https://greasyfork.org/scripts/13747-musicbrainz-common-files/code/MusicBrainz:%20common%20files.js?version=85770
// @include      http*://*musicbrainz.org/release/*/edit-relationships
// @grant        none
// @run-at       document-end
// ==/UserScript==
};
if (meta && meta.toString && (meta = meta.toString())) {
    var meta = {'name': meta.match(/@name\s+(.+)/)[1],
                'version': meta.match(/@version\s+(.+)/)[1]};
}

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

// imported from mbz-loujine-common.js: linkTypeXXX
function propagateDates() {
    var recordings = MB.relationshipEditor.UI.checkedRecordings();
    recordings.forEach(function(recording) {
        var relations = recording.relationships(),
            idx = referenceDate(relations);
        if (idx !== -1) {
            var from_period = relations[idx].period;
            relations.forEach(function(rel) {
                var linkType = parseInt(rel.linkTypeID());
                if (linkType === linkTypePerformer || linkType === linkTypeWork ||
                    linkType === linkTypeInstrument || linkType === linkTypeVocals ||
                    linkType === linkTypeOrchestra || linkType === linkTypeConductor ||
                    linkType === linkTypePlace || linkType === linkTypeArea) {
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

// imported from mbz-loujine-releditor.js: container
$('div.tabs').after(
    $container
    .append(
        $('<h3></h3>', {'text': 'Dates'})
    )
    .append(
        $('<input></input>', {
            'id': 'copydates',
            'type': 'button',
            'value': 'Copy dates'
            })
    )
    .append(
        $('<input></input>', {
            'id': 'removedates',
            'type': 'button',
            'value': 'Remove dates'
            })
    )
);

$(document).ready(function() {
    $('#removedates').click(function() {
        removeDates();
        releditorEditNote(meta);
    });
    $('#copydates').click(function() {
        propagateDates();
        releditorEditNote(meta, 'Propagate recording dates from other advanced relationships');
    });
    return false;
});


