'use strict';
// ==UserScript==
// @name         MusicBrainz: Show performers
// @namespace    mbz-loujine
// @author       loujine
// @version      2015.11.05
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-showperformers.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-showperformers.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Show performers on a Work page (for when the Artist credit is the composer)
// @compatible   firefox+greasemonkey
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @require      mbz-loujine-sidebar.js
// @require      mbz-loujine-common.js
// @include      http*://*musicbrainz.org/work/*
// @exclude      http*://*musicbrainz.org/work/*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

// imported from mbz-loujine-common.js: requestGET, mbzTimeout

function formatPerformers(relations) {
    var performers = [];
    relations.forEach(function(rel) {
        var type;
        if (rel.type === 'instrument' || rel.type === 'vocal' ||
            rel.type === 'conductor' || rel.type === 'performing orchestra' ||
            rel.type === 'performer') {
            if (rel.type === 'performing orchestra') {
                type = 'orchestra';
            } else if (!rel.attributes.length) {
                type = rel.type;
            } else {
                type = rel.attributes[0];
            }
            performers.push(type + ': ' + rel.artist.name);
        }
    });
    return performers.sort().join(', ');
}

function showPerformers() {
    var $recordings = $('table a[href*="/recording/"]');
    $('thead > tr').append('<th>Performer AR</th>');
    $('.subh > th')[1].colSpan += 1;

    $recordings.each(function (idx, recording) {
        setTimeout(function () {
            var mbid = recording.href.split('/')[4],
                url = '/ws/2/recording/' + encodeURIComponent(mbid) + '?fmt=json&inc=artist-rels';
            requestGET(url, function (response) {
                var resp = JSON.parse(response),
                    $node;
                if (resp.relations.length) {
                    $node = $('<td>' + formatPerformers(resp.relations) + '</td>');
                } else {
                    $node = $('<td>✗</td>').css('background-color', 'red');
                }
                $(recording).parents('tr').append($node);
            });
        }, idx * mbzTimeout);
    });
}

// imported from mbz-loujine-sidebar.js: container
$('.work-information').before(
    $container
    .append(
        $('<input></input>', {
          'id': 'showperformers',
          'type': 'button',
          'value': 'Show performers'
        })
    )
);

$(document).ready(function() {
    $('#showperformers').click(function() {showPerformers()});
    return false;
});
