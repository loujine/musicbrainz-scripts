// ==UserScript==
// @name         MusicBrainz: Batch-set guessed works
// @author       loujine
// @version      2015.6.3
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/src/default/mbz-setguessedworks.user.js
// @description  musicbrainz.org: Set best-guess related works
// @compatible   firefox+greasemonkey  quickly tested
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @include      http*://*musicbrainz.org/release/*/edit-relationships
// @grant        none
// @run-at       document-end
// ==/UserScript==

'use strict';

function guessWork(recording) {
    var url = 'https://musicbrainz.org/ws/js/work/?q=' +
              encodeURIComponent(recording.name) +
              '&artist=' + encodeURIComponent(recording.artist) +
              '&fmt=json&limit=1',
        req = new XMLHttpRequest(),
        resp;
    req.open('GET', url, false);
    req.onload = function() {
        if (req.status === 200 && req.responseText != null) {
            resp = JSON.parse(req.responseText);
        } else {
            console.log(req.status);
        }
    };
    req.send(null);
    return resp[0];
}

function setGuessedWork() {
    var recordings = MB.relationshipEditor.UI.checkedRecordings(),
        vm = MB.releaseRelationshipEditor,
        work;
    recordings.forEach(function(recording) {
            if (recording.performances().length === 0) {
                work = guessWork(recording);
                MB.relationshipEditor.UI.AddDialog({
                    source: recording,
                    target: work,
                    viewModel: vm,
                }).accept();
            }
    });
}

var elm = document.createElement('input');
elm.id = 'batchguesswork';
elm.type = 'button';
elm.value = 'Batch-guess work';

var tabdiv = document.getElementsByClassName('tabs')[0];
tabdiv.parentNode.insertBefore(elm, tabdiv.nextSibling);

document.getElementById('batchguesswork').addEventListener('click', function(event) {
    setGuessedWork();
}, false);
