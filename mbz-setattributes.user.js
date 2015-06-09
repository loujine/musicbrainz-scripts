// ==UserScript==
// @name         MusicBrainz: Batch-set recording-work attributes
// @author       loujine
// @version      2015.6.8
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/src/default/mbz-setattributes.user.js
// @description  musicbrainz.org: Set "live" attribute on selected recordings
// @compatible   firefox+greasemonkey  quickly tested
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @include      http*://*musicbrainz.org/release/*/edit-relationships
// @grant        none
// @run-at       document-end
// ==/UserScript==

// from musicbrainz-server/root/static/scripts/tests/typeInfo.js
var attrIdLive = 578,
    attrIdPartial = 278;

function setLive(attrId) {
    var recordings = MB.relationshipEditor.UI.checkedRecordings(),
        attr = { type: MB.attrInfoByID[attrIdLive] };
    recordings.forEach(function(recording) {
        recording.performances().forEach(function(rel) {
            rel.setAttributes([attr]);
        });
    });
}

var elm = document.createElement('input');
elm.id = 'batchsetlive';
elm.type = 'button';
elm.value = 'Batch-set live';

var tabdiv = document.getElementsByClassName('tabs')[0];
tabdiv.parentNode.insertBefore(elm, tabdiv.nextSibling);

document.getElementById('batchsetlive').addEventListener('click', function(event) {
    setLive(attrIdLive);
}, false);
