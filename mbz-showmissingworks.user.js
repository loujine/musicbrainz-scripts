'use strict';
// ==UserScript==
// @name         MusicBrainz: Show missing works
// @namespace    mbz-loujine
// @author       loujine
// @version      2016.01.25
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-showmissingworks.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-showmissingworks.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Mark recordings not linked to any work on a performer page
// @compatible   firefox+greasemonkey
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @require      https://greasyfork.org/scripts/13747-musicbrainz-common-files/code/MusicBrainz:%20common%20files.js?version=85994
// @include      http*://*musicbrainz.org/artist/*/relationships
// @grant        none
// @run-at       document-end
// ==/UserScript==

// imported from mbz-loujine-common.js: requests, server, sidebar

function showMissingWorks() {
    var $recordings = $('table a[href*="/recording/"]');
    $('thead > tr').append('<th>Related work</th>');
    $('.subh').append('<th>with date</th>');

    $recordings.each(function (idx, recording) {
        setTimeout(function () {
            var mbid = recording.href.split('/')[4],
                url = '/ws/2/recording/' + encodeURIComponent(mbid) + '?fmt=json&inc=work-rels';
            requests.GET(url, function (response) {
                var resp = JSON.parse(response),
                    $node;
                if (resp.relations.length) {
                    if (resp.relations[0].begin) {
                        $node = $('<td>✓</td>').css('background-color', 'green');
                    } else {
                        $node = $('<td>⚠</td>').css('background-color', 'orange');
                    }
                } else {
                    $node = $('<td>✗</td>').css('background-color', 'red');
                }
                $(recording).parents('tr').append($node.css({'text-align': 'center',
                                                             'font-size': '100%'}));
            });
        }, idx * server.timeout);
    });
}

// display sidebar
sidebar.container().append(
    $('<h3>Linked works</h3>')
).append(
    $('<input></input>', {
        'id': 'showmissingworks',
        'type': 'button',
        'value': 'Show missing works'
    })
).append(
    $('<p>Display:</p>')
).append(
    $('<ul><li>✓: linked work with date</li><li>⚠: linked work without date</li><li>✗: no work linked</li></ul>')
);

$(document).ready(function () {
    $('#showmissingworks').click(function () {showMissingWorks();});
    return false;
});
