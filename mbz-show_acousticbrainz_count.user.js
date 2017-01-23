/* global $ requests helper sidebar */
'use strict';
// ==UserScript==
// @name         MusicBrainz: Show acousticbrainz count
// @namespace    mbz-loujine
// @author       loujine
// @version      2017.3.8
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-show_acousticbrainz_count.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-shhowacousticbrainz_count.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Show acousticbrainz count on Work page
// @compatible   firefox+greasemonkey
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @require      https://greasyfork.org/scripts/13747-mbz-loujine-common/code/mbz-loujine-common.js?version=170785
// @include      http*://*musicbrainz.org/work/*
// @exclude      http*://*musicbrainz.org/work/*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

var abzIconURL = "//acousticbrainz.org/static/images/favicon-16.png";

function showABids() {
    var $recordings = $('table a[href*="/recording/"]');
    var recording_mbids = $recordings.map(function() {
        return this.href.split('/')[4];
    }).get();
    if (recording_mbids.length > 125) {
        console.info('Warning: sending only the first 125 recordings '
                     + 'to AcousticBrainz');
        recording_mbids.splice(125);
    }
    var url = ('//acousticbrainz.org/api/v1/count?recording_ids='
               + recording_mbids.join(';'));
    $('thead > tr').append('<th>ABrainz</th>');
    $('.subh > th')[1].colSpan += 1;
    $('table.tbl > tbody > tr:not(".subh")').append('<td>');

    requests.GET(url, function (data) {
        data = JSON.parse(data);
        $recordings.each(function (idx, recording) {
            var mbid = helper.mbidFromURL(recording.href);
            if (data[mbid] === undefined || data[mbid].count === 0) {
                return;
            }
            $(recording).parents('tr').find('td:last').append(
                $('<a>', {
                    'href': '//acousticbrainz.org/' + mbid,
                    'target': '_blank',
                    'text': data[mbid].count
                }).append($('<img src="' + abzIconURL + '" class="abz" />'))
            );
        });
    });
}


// display sidebar
(function displaySidebar(sidebar) {
    sidebar.container().append(
        $('<h3>Show AcousticBrainz IDs<h3>')
    ).append(
        $('<input>', {
            'id': 'showABids',
            'type': 'button',
            'value': 'Show AcousticBrainz IDs'
        })
    );
})(sidebar);

$(document).ready(function() {
    $('#showABids').click(function() {showABids();});
    return false;
});
