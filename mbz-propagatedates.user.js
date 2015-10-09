// ==UserScript==
// @name         MusicBrainz: Batch-propagate recording dates
// @author       loujine
// @version      2015.6.22
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
        if (idx === -1) {
            // continue;
        } else {
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

var elm = document.createElement('input');
elm.id = 'propagatedates';
elm.type = 'button';
elm.value = 'Batch-copy dates';

var tabdiv = document.getElementsByClassName('tabs')[0];
tabdiv.parentNode.insertBefore(elm, tabdiv.nextSibling);

document.getElementById('propagatedates').addEventListener('click', function(event) {
    propagateDates();
    var vm = MB.releaseRelationshipEditor;
    vm.editNote('Propagate recording dates from other advanced relationships');
}, false);
