'use strict';
// ==UserScript==
// @name         MusicBrainz: Replace recording artists from performer pages
// @namespace    mbz-loujine
// @author       loujine
// @version      2015.11.07
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-replacerecordingartist.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-replacerecordingartist.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Replace associated recording artist from an Artist page
// @compatible   firefox+greasemonkey
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @require      mbz-loujine-sidebar.js
// @require      mbz-loujine-common.js
// @include      http*://*musicbrainz.org/artist/*/relationships
// @grant        none
// @run-at       document-end
// ==/UserScript==

// imported from mbz-loujine-common.js: requestGET, mbzTimeout,
// formatPerformers, replaceArtist

function showPerformers() {
    var performer = document.URL.split('/')[4],
        $rows = $('table.tbl a[href*="/artist/"]').not('[href*="' + performer + '"]').parents('tr');
    $rows = $($rows.get().reverse()); // FIXME whyis jquery reversing the list?
    $('thead > tr').append('<th>Performer AR</th>');
    $('.subh > th')[1].colSpan += 1;

    $rows.each(function (idx, tr) {
        setTimeout(function () {
            var mbid = $(tr).find('a[href*="/recording/"]').attr('href').split('/')[4],
                artist = $(tr).find('a[href*="/artist/"]').attr('href').split('/')[4],
                url = '/ws/2/recording/' + encodeURIComponent(mbid) + '?fmt=json&inc=artist-rels';
            requestGET(url, function (response) {
                var resp = JSON.parse(response),
                    $node,
                    $button;
                if (resp.relations.length) {
                    $node = $('<td>' + formatPerformers(resp.relations) + '</td>');
                    $button = $('<input></input>', {
                        'id': 'replace-' + mbid,
                        'class': 'replace',
                        'type': 'checkbox',
                        'value': 'Replace artist'
                    });
                    $node.append($button);
                } else {
                    $node = $('<td>✗</td>').css('background-color', 'red');
                }
                $(tr).append($node);
            });
        }, idx * mbzTimeout);
    });
}

// imported from mbz-loujine-sidebar.js: container
$container
    .append(
        $('<h3></h3>', {'text': 'Replace artists'})
    )
    .append(
        $('<input></input>', {
          'id': 'showperformers',
          'type': 'button',
          'value': 'Show performers'
        })
    )
    .append(
        $('<p></p>', {'text': 'First click "Show performers" then check boxes to select artists'})
    )
    .append(
        $('<p></p>', {'text': 'Edit note:'})
    )
    .append(
        $('<textarea></textarea>', {'id': 'batch_replace_edit_note'})
    )
    .append(
        $('<input></input>', {
          'id': 'batch_replace',
          'type': 'button',
          'disabled': true,
          'value': 'Replace selected artists'
          })
    )
    .append(
        $('<p></p>', {'text': 'Checkbox becomes grey when the request has been sent'})
    );

$(document).ready(function() {
    $('#batch_replace_edit_note')[0].value = 'CSG';
    $('#showperformers').click(function() {
        showPerformers();
        $('#batch_replace').prop('disabled', false);
    });
    $('#batch_replace').click(function() {replaceArtist();});
    return false;
});
