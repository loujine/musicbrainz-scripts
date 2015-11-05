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


function findPerformanceDuration(mbid, callback) {
    var url = '/ws/2/recording/' + encodeURIComponent(mbid) + '?fmt=json';
    requestGET(url, function (resp) {
        callback(JSON.parse(resp));
    })
}

function showPerformanceDurations() {
    var recordings = $('table a[href*="/recording/"]');

    recordings.each(function (idx, recording) {
        setTimeout(function () {
            var recording_mbid = recording.href.split('/')[4],
                tr_node = recording.parentElement.parentElement,
                td_node = tr_node.insertCell(-1),
                callback = function (resp) {
                    td_node.textContent = formatTrackLength(resp.length);
                };
            if (idx === 0) {
                var tbody_node = tr_node.parentElement.parentElement,
                    head = tbody_node.tHead.children[0].insertCell(-1);
                head.textContent = 'Time';
                tbody_node.tBodies[0].children[0].children[1].colSpan += 1;
            }
            findPerformanceDuration(recording_mbid, callback);
        }, idx * mbzTimeout);
    });
}

// imported from mbz-loujine-sidebar.js: container
$('.work-information').before(
    container
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
