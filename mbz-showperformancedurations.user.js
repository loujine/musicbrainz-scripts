'use strict';
// ==UserScript==
// @name         MusicBrainz: Show performance durations
// @namespace    mbz-loujine
// @author       loujine
// @version      2016.1.29
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-showperformancedurations.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-showperformancedurations.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Show performance durations on a Work page
// @compatible   firefox+greasemonkey
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @require      https://greasyfork.org/scripts/13747-mbz-loujine-common/code/mbz-loujine-common.js?version=104306
// @include      http*://*musicbrainz.org/work/*
// @exclude      http*://*musicbrainz.org/work/*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

// imported from mbz-loujine-common.js: requests, helper, sidebar
var $ = jQuery,
    requests = requests,
    helper = helper,
    sidebar = sidebar;

function showPerformanceDurations() {
    var mbid = document.URL.split('/')[4],
        url = '/ws/2/work/' + encodeURIComponent(mbid) + '?inc=recording-rels&fmt=json',
        $recordings = $('table a[href*="/recording/"]');
    $('thead > tr').append('<th>Time</th>');
    $('.subh > th')[1].colSpan += 1;

    requests.GET(url, function (resp) {
        var durations = {};
        JSON.parse(resp).relations.forEach(function(rel) {
            durations[rel.recording.id] = rel.recording.length;
        });
        $recordings.each(function (idx, recording) {
            var mbid = recording.href.split('/')[4],
                duration = helper.formatTrackLength(durations[mbid]);
            $(recording).parents('tr').append('<td>' + duration + '</td>');
        });
    });
}

// display sidebar
(function displaySidebar(sidebar) {
    sidebar.container().append(
        $('<h3>Show durations<h3>')
    ).append(
        $('<input></input>', {
            'id': 'showdurations',
            'type': 'button',
            'value': 'Show performance durations'
        })
    );
})(sidebar);

$(document).ready(function() {
    $('#showdurations').click(function() {showPerformanceDurations();});
    return false;
});
