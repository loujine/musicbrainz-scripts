// ==UserScript==
// @name         MusicBrainz: Batch-set guessed works
// @author       loujine
// @version      2015.10.29
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-setguessedworks.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-setguessedworks.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Set best-guess related works
// @compatible   firefox+greasemonkey  quickly tested
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @require      mbz-loujine-releditor.js
// @include      http*://*musicbrainz.org/release/*/edit-relationships
// @grant        none
// @run-at       document-end
// ==/UserScript==

'use strict';

// https://musicbrainz.org/doc/XML_Web_Service/Rate_Limiting
// we wait for `mbz_timeout` milliseconds between two queries
var mbz_timeout = 1000;

function guessWork(recording, callback) {
    var url = '/ws/js/work/?q=' +
              encodeURIComponent(recording.name) +
              '&artist=' + encodeURIComponent(recording.artist) +
              '&fmt=json&limit=1',
        xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 && xhr.responseText != null) {
                callback(JSON.parse(xhr.responseText)[0]);
            } else {
                console.log('Error: ', xhr.status);
            }
        }
    };
    xhr.open('GET', url, true);
    xhr.timeout = 5000;
    xhr.ontimeout = function() {
        console.error('The request for ' + url + ' timed out.');
        };
    xhr.send(null);
}

function setGuessedWork() {
    var recordings = MB.relationshipEditor.UI.checkedRecordings(),
        vm = MB.releaseRelationshipEditor,
        idx = 0;
    recordings.forEach(function(recording) {
        if (recording.performances().length === 0) {
            idx += 1;
            setTimeout(function() {
                var callback = function(work) {
                    MB.relationshipEditor.UI.AddDialog({
                        source: recording,
                        target: work,
                        viewModel: vm
                    }).accept();
                };
                guessWork(recording, callback);
            }, idx * mbz_timeout);
        }
    });
}

// container defined in mbz-loujine-releditor.js
$('div.tabs').after(
    container
    .append(
        $('<h3></h3>', {'text': 'Search for works'})
    ).append(
        $('<input></input>', {
            'id': 'searchwork',
            'type': 'button',
            'value': 'Guess works'
            })
    )
);

function signEditNote() {
    var vm = MB.releaseRelationshipEditor,
        msg = vm.editNote(),
        signature = '\n\n--\n' + 'Using "MusicBrainz: Batch-set guessed works" GM script\n';
    vm.editNote(msg + 'Set guessed works' + signature);
}

$(document).ready(function() {
    $('#searchwork').click(function() {
        setGuessedWork();
        signEditNote();
    });
    return false;
});

