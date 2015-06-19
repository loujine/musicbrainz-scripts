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
    attrIdViolin = 86,
    attrIdCello = 84,
    attrIdStrings = 69;

function setInstrument(fromType, toType, attrIds, credit) {
    var recordings = MB.relationshipEditor.UI.checkedRecordings(),
        vm = MB.releaseRelationshipEditor,
        attrIds = attrIds || [];
    recordings.forEach(function(rec) {
        var relationships = rec.getRelationshipGroup(fromType, vm);
        relationships.forEach(function(rel) {
            var attrs = rel.attributes();
            rel.linkTypeID(toType);
            attrIds.forEach(function(attrId) {
                attrs.push({ type: MB.attrInfoByID[attrId] });
            });
            console.log(attrs);
            rel.setAttributes(attrs);
            attrIds.forEach(function(attrId, idx) {
                rel.attributes()[idx].creditedAs(credit);
            });
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
elmSQ.value = 'Batch-set "String Quartet"';

var elmTrio = document.createElement('input');
elmTrio.id = 'batch-set-piano-trio';
elmTrio.type = 'button';
elmTrio.value = 'Batch-set "Piano Trio"';

var tabdiv = document.getElementsByClassName('tabs')[0];
tabdiv.parentNode.insertBefore(elmOrchestra, tabdiv.nextSibling);
tabdiv.parentNode.insertBefore(elmSQ, tabdiv.nextSibling);
tabdiv.parentNode.insertBefore(elmTrio, tabdiv.nextSibling);

document.getElementById('batch-unset-orchestra').addEventListener('click', function(event) {
    setInstrument(linkTypeOrchestra, linkTypePerformer);
}, false);

document.getElementById('batch-set-string-quartet').addEventListener('click', function(event) {
    var vm = MB.releaseRelationshipEditor;
    setInstrument(linkTypePerformer, linkTypeInstrument,
                  [attrIdStrings], 'string quartet');
    vm.editNote('Use "strings" instrument AR for a String Quartet artist');
}, false);

document.getElementById('batch-set-piano-trio').addEventListener('click', function(event) {
    var vm = MB.releaseRelationshipEditor;
    setInstrument(linkTypePerformer, linkTypeInstrument,
                  [attrIdPiano, attrIdViolin, attrIdCello]);
    vm.editNote('Use instruments AR for a Piano Trio artist');
}, false);


