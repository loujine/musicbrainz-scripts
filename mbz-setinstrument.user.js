// ==UserScript==
// @name         MusicBrainz: Batch-set recording-artist instrument
// @author       loujine
// @version      2015.6.8
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/src/default/mbz-setinstrument.user.js
// @description  musicbrainz.org: Convert to "string" instrument AR on selected recordings
// @compatible   firefox+greasemonkey  quickly tested
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @include      http*://*musicbrainz.org/release/*/edit-relationships
// @grant        none
// @run-at       document-end
// ==/UserScript==

'use strict';

// from musicbrainz-server/root/static/scripts/tests/typeInfo.js
var linkTypeInstrument = '148',
    linkTypeOrchestra = '150',
    linkTypePerformer = '156',
    attrIdPiano = 180,
    attrIdStrings = 69;

function unsetOrchestra() {
    var recordings = MB.relationshipEditor.UI.checkedRecordings(),
        vm = MB.releaseRelationshipEditor;
    recordings.forEach(function(rec) {
        var relationships = rec.getRelationshipGroup(linkTypeOrchestra, vm);
        if (relationships.length > 0) {
            relationships[0].linkTypeID(linkTypePerformer);
        }
    });
}

function setCreditedInstrument(attrId, credit) {
    var recordings = MB.relationshipEditor.UI.checkedRecordings(),
        attr = { type: MB.attrInfoByID[attrId] };
    recordings.forEach(function(recording) {
        recording.relationships().forEach(function(rel) {
            var linkType = rel.linkTypeID().toString();
            if (linkType === linkTypeOrchestra ||
                linkType === linkTypePerformer) {
                rel.linkTypeID(linkTypeInstrument);
                rel.setAttributes([attr]);
                if (rel.attributes().length > 0) {
                    rel.attributes()[0].creditedAs(credit);
                }
            }
        });
    });
}

var elmOrchestra = document.createElement('input');
elmOrchestra.id = 'batch-unset-orchestra';
elmOrchestra.type = 'button';
elmOrchestra.value = 'Batch-unset "Orchestra"';

var elmSQ = document.createElement('input');
elmSQ.id = 'batch-set-string-quartet';
elmSQ.type = 'button';
elmSQ.value = 'Batch-set "String Quartet" instrument';

var tabdiv = document.getElementsByClassName('tabs')[0];
tabdiv.parentNode.insertBefore(elmOrchestra, tabdiv.nextSibling);
tabdiv.parentNode.insertBefore(elmSQ, tabdiv.nextSibling);

document.getElementById('batch-unset-orchestra').addEventListener('click', function(event) {
    unsetOrchestra();
}, false);

document.getElementById('batch-set-string-quartet').addEventListener('click', function(event) {
    var vm = MB.releaseRelationshipEditor;
    setCreditedInstrument(attrIdStrings, 'string quartet');
    vm.editNote('Use "strings" instrument AR for a String Quartet artist');
}, false);

