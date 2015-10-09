// ==UserScript==
// @name         MusicBrainz: Batch-propagate recording dates
// @author       loujine
// @version      2015.10.09
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-propagatedates.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-propagatedates.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Copy dates on relevant recording AR fields
// @compatible   firefox+greasemonkey  quickly tested
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @include      http*://*musicbrainz.org/release/*/edit-relationships
// @grant        none
// @run-at       document-end
// ==/UserScript==

'use strict';

// from musicbrainz-server/root/static/scripts/tests/typeInfo.js
var linkTypeInstrument = '148',
    linkTypeVocals = '149',
    linkTypeOrchestra = '150',
    linkTypeConductor = '151',
    linkTypePerformer = '156',
    linkTypeWork = '278',
    linkTypePlace = '693',
    linkTypeArea = '698';

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
                var linkType = rel.linkTypeID().toString();
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

if ($('div#loujine-menu').length) {
    var container = $('div#loujine-menu');
} else {
    var container = $('<div></div>', {
        'id': 'loujine-menu',
        'css': {'background-color': 'white',
                'padding': '8px',
                'margin': '0px -6px 6px',
                'border': '5px dotted #736DAB'
            }
        }
    ).append(
        $('<h2></h2>', {'text': 'loujine GM tools'})
    );
}

$('div.tabs').after(
    container
    .append(
        $('<h3></h3>', {'text': 'Dates'})
    ).append(
        $('<input></input>', {
            'id': 'copydates',
            'type': 'button',
            'value': 'Batch-copy dates'
            })
    ).append(
        $('<input></input>', {
            'id': 'removedates',
            'type': 'button',
            'value': 'Batch-remove dates'
            })
    )
);

function signEditNote() {
    var vm = MB.releaseRelationshipEditor,
        msg = vm.editNote(),
        signature = '\n\n--\n' + 'Using "MusicBrainz: Batch-propagate recording dates" GM script\n';
    vm.editNote(msg + 'Propagate recording dates from other advanced relationships' + signature);
}

$(document).ready(function() {
    $('#removedates').click(function() {
        removeDates();
        signEditNote();
    });
    $('#copydates').click(function() {
        propagateDates();
        signEditNote();
    });
    return false;
});


