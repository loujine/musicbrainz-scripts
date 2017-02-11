/* global $ _ requests sidebar helper */
'use strict';
// ==UserScript==
// @name         MusicBrainz: Show stats from AcousticBrainz
// @namespace    mbz-loujine
// @author       loujine
// @version      2017.2.11
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-show_stats_from_acousticbrainz.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-show_stats_from_acousticbrainz.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Show stats from AcousticBrainz
// @compatible   firefox+greasemonkey
// @license      MIT
// @require      https://greasyfork.org/scripts/13747-mbz-loujine-common/code/mbz-loujine-common.js?version=174522
// @include      http*://*musicbrainz.org/recording/*
// @exclude      http*://*musicbrainz.org/recording/merge
// @exclude      http*://*musicbrainz.org/recording/*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

// imported from mbz-loujine-common.js: requests, sidebar

function showAcousticBrainzCount() {
    var mbid = helper.mbidFromURL();
    var countUrl = '//acousticbrainz.org/api/v1/' + mbid + '/count';
    var dataUrl = '//acousticbrainz.org/api/v1/' + mbid + '/low-level';

    requests.GET(countUrl, function (resp) {
        var count = JSON.parse(resp).count;
        $('#count').append(count);
        if (count > 0) {
            requests.GET(dataUrl, function (resp) {
                var data = JSON.parse(resp);
                var key = data.tonal.key_key + ' ' + data.tonal.key_scale;
                key += ' (' + 100 * _.round(data.tonal.key_strength, 3) + '%)';
                $('#key').append(key);
                var bpm = _.round(data.rhythm.bpm, 1);
                $('#bpm').append(bpm);
            });
        }
    });
}

// display sidebar
(function displaySidebar(sidebar) {
    var mbid = helper.mbidFromURL();
    sidebar.container().append(
        $('<h3>Show statistics<h3>')
    ).append(
        $('<a>', {
            'href': '//acousticbrainz.org/' + mbid,
            'target': '_blank',
            'text': 'AcousticBrainz entry'
        })
    ).append(
        $('<p>', {
            'text': 'Number of submissions: ',
            'id': 'count'
        })
    ).append(
        $('<p>', {
            'text': 'Key: ',
            'id': 'key'
        })
    ).append(
        $('<p>', {
            'text': 'BPM: ',
            'id': 'bpm'
        })
    );
})(sidebar);

$(document).ready(function() {
    showAcousticBrainzCount();
    return false;
});
