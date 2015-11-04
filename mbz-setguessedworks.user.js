// ==UserScript==
// @name         MusicBrainz: Batch-set guessed works
// @author       loujine
// @version      2015.11.04
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-setguessedworks.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-setguessedworks.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Set best-guess related works
// @compatible   firefox+greasemonkey  quickly tested
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @require      mbz-loujine-releditor.js
// @require      mbz-loujine-common.js
// @include      http*://*musicbrainz.org/release/*/edit-relationships
// @grant        none
// @run-at       document-end
// ==/UserScript==

'use strict';

// imported from mbz-loujine-common.js: requestGET, mbzTimeout
// imported from mbz-loujine-sidebar.js: container

function validateDialog(recording, work) {
    var vm = MB.releaseRelationshipEditor;
    MB.relationshipEditor.UI.AddDialog({
        source: recording,
        target: work,
        viewModel: vm
    }).accept();
}

function setGuessedWork() {
    var recordings = MB.relationshipEditor.UI.checkedRecordings(),
        idx = 0;
    recordings.forEach(function (recording) {
        var url = '/ws/js/work/?q=' +
                  encodeURIComponent(recording.name) +
                  '&artist=' + encodeURIComponent(recording.artist) +
                  '&fmt=json&limit=1';
        if (recording.performances().length === 0) {
            idx += 1;
            setTimeout(function () {
                requestGET(url, function (resp) {
                    validateDialog(recording, JSON.parse(resp)[0]);
                });
            }, idx * mbzTimeout);
        }
    });
}

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

