'use strict';
// ==UserScript==
// @name         MusicBrainz: Show performance durations
// @namespace    mbz-loujine
// @author       loujine
// @version      2015.11.05
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-showperformancedurations.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-showperformancedurations.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Show performance durations on a Work page
// @compatible   firefox+greasemonkey
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @require      mbz-loujine-sidebar.js
// @require      mbz-loujine-common.js
// @include      http*://*musicbrainz.org/work/*
// @exclude      http*://*musicbrainz.org/work/*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

// imported from mbz-loujine-common.js: requestGET, mbzTimeout, formatTrackLength
function showPerformanceDurations() {
    var $recordings = $('table a[href*="/recording/"]');
    $('thead > tr').append('<th>Time</th>');
    $('.subh > th')[1].colSpan += 1;

    $recordings.each(function (idx, recording) {
        setTimeout(function () {
            var mbid = recording.href.split('/')[4],
                url = '/ws/2/recording/' + encodeURIComponent(mbid) + '?fmt=json';
            requestGET(url, function (resp) {
                var duration = formatTrackLength(JSON.parse(resp).length);
                $(recording).parents('tr').append('<td>' + duration + '</td>');
            });
        }, idx * mbzTimeout);
    });
}

// imported from mbz-loujine-sidebar.js: container
$('.work-information').before(
    $container
    .append(
        $('<input></input>', {
          'id': 'showdurations',
          'type': 'button',
          'value': 'Show performance durations'
          })
    )
);

$(document).ready(function() {
    $('#showdurations').click(function() {showPerformanceDurations()});
    return false;
});
