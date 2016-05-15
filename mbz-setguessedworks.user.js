/* global $ MB requests server relEditor */
'use strict';
var meta = function() {
// ==UserScript==
// @name         MusicBrainz: Batch-set guessed works
// @namespace    mbz-loujine
// @author       loujine
// @version      2016.5.15
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-setguessedworks.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-setguessedworks.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Set best-guess related works
// @compatible   firefox+greasemonkey
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @require      https://greasyfork.org/scripts/13747-mbz-loujine-common/code/mbz-loujine-common.js?version=104306
// @include      http*://*musicbrainz.org/release/*/edit-relationships
// @grant        none
// @run-at       document-end
// ==/UserScript==
};
if (meta && meta.toString && (meta = meta.toString())) {
    var meta = {'name': meta.match(/@name\s+(.+)/)[1],
                'version': meta.match(/@version\s+(.+)/)[1]};
}

// imported from mbz-loujine-common.js: requests, server, relEditor

function setWork(recording, work) {
    var vm = MB.releaseRelationshipEditor;
    MB.relationshipEditor.UI.AddDialog({
        source: recording,
        target: work,
        viewModel: vm
    }).accept();
}

function guessWork() {
    var recordings = MB.relationshipEditor.UI.checkedRecordings(),
        idx = 0;
    recordings.forEach(function (recording) {
        var url = '/ws/js/work/?q=' +
                  encodeURIComponent($('#prefix')[0].value) + ' ' +
                  encodeURIComponent(recording.name) +
                  '&artist=' + encodeURIComponent(recording.artist) +
                  '&fmt=json&limit=1';
        if (!recording.performances().length) {
            idx += 1;
            setTimeout(function () {
                requests.GET(url, function (resp) {
                    setWork(recording, JSON.parse(resp)[0]);
                });
            }, idx * server.timeout);
        }
    });
}

(function displayToolbar(relEditor) {
    $('div.tabs').after(
        relEditor.container().append(
            $('<h3>Search for works</h3>')
        ).append(
            $('<p>You can add an optional prefix (e.g. the misssing parent work name) to help guessing the right work</p>')
        ).append(
            $('<span>Prefix:</span>')
        ).append(
            $('<input>', {
                'id': 'prefix',
                'type': 'text',
                'value': ''
            })
        ).append(
            $('<input>', {
                'id': 'searchwork',
                'type': 'button',
                'value': 'Guess works'
            })
        )
    );
})(relEditor);

$(document).ready(function() {
    var appliedNote = false;
    $('#searchwork').click(function() {
        guessWork();
        if (!appliedNote) {
            relEditor.editNote(meta, 'Set guessed works');
            appliedNote = true;
        }
    });
    return false;
});

