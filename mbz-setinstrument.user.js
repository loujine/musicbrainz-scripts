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

// from musicbrainz-server/root/static/scripts/tests/typeInfo.js
var linkTypeInstrument = '148',
    linkTypeOrchestra = '150',
    linkTypePerformer = '156',
    attrIdPiano = 180,
    attrIdStrings = 69;

function setInstrument(attrId) {
    var recordings = MB.relationshipEditor.UI.checkedRecordings(),
        attr = { type: MB.attrInfoByID[attrId] };
    recordings.forEach(function(recording) {
        recording.relationships().forEach(function(rel) {
            var linkType = rel.linkTypeID().toString();
            if (linkType === linkTypeOrchestra
                || linkType === linkTypePerformer) {
                rel.linkTypeID(linkTypeInstrument);
                rel.setAttributes([attr]);
                rel.attributes()[0].creditedAs('string quartet');
            }
        });
    });
}

var elm = document.createElement('input');
elm.id = 'batchsetinstrument';
elm.type = 'button';
elm.value = 'Batch-set "String Quartet" instrument';

var tabdiv = document.getElementsByClassName('tabs')[0];
tabdiv.parentNode.insertBefore(elm, tabdiv.nextSibling);

document.getElementById('batchsetinstrument').addEventListener('click', function(event) {
    setInstrument(attrIdStrings);
    var vm = MB.releaseRelationshipEditor;
    vm.editNote('Use "strings" instrument AR for a String Quartet artist');
}, false);

