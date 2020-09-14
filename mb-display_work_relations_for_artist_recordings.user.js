/* global $ requests server sidebar helper */
'use strict';
// ==UserScript==
// @name         MusicBrainz: Display (missing) work relations for an artist recordings
// @namespace    mbz-loujine
// @author       loujine
// @version      2020.9.13
// @downloadURL  https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-display_work_relations_for_artist_recordings.user.js
// @updateURL    https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-display_work_relations_for_artist_recordings.user.js
// @supportURL   https://github.com/loujine/musicbrainz-scripts
// @icon         https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/icon.png
// @description  musicbrainz.org: Mark recordings not linked to any work on an artist recordings or relationships page
// @compatible   firefox+tampermonkey
// @license      MIT
// @require      https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mbz-loujine-common.js
// @include      http*://*musicbrainz.org/artist/*/relationships
// @include      http*://*musicbrainz.org/artist/*/recordings*
// @grant        none
// @run-at       document-end
// ==/UserScript==

function showMissingWorks() {
    var $recordings = $('table a[href*="/recording/"]');
    if (!$('#workColumn').length) {
        $('thead > tr').append('<th id="workColumn">Related work</th>');
        $('.subh').append('<th>with date</th>');
    }

    $recordings.each(function (idx, recording) {
        setTimeout(function () {
            var mbid = recording.href.split('/')[4],
                url = helper.wsUrl('recording', ['work-rels'], mbid);
            requests.GET(url, function (response) {
                var resp = JSON.parse(response),
                    $node;
                if (resp.relations.length) {
                    if (resp.relations[0].begin) {
                        $node = $('<td>✓</td>').css('background-color',
                                                    'green');
                    } else {
                        $node = $('<td>⚠</td>').css('background-color',
                                                    'orange');
                    }
                } else {
                    $node = $('<td>✗</td>').css('background-color', 'red');
                }
                $(recording).parents('tr').append(
                    $node.css({'text-align': 'center',
                               'font-size': '100%'})
                );
            });
        }, 1.5 * idx * server.timeout);
    });
}

(function displaySidebar() {
    sidebar.container().insertAdjacentHTML('beforeend', `
        <h3>Linked works</h3>
        <input type="button" id="showMissingWorks" value="Show missing works">
        <p>Display:</p>
        <ul>
          <li>✓: linked work with date</li>
          <li>⚠: linked work without date</li>
          <li>✗: no work linked</li>
        </ul>
    `);
})();

$(document).ready(function () {
    document.getElementById('showMissingWorks').addEventListener('click', showMissingWorks);
    return false;
});
