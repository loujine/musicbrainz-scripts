/* global $ _ helper requests sidebar */
'use strict';
// ==UserScript==
// @name         MusicBrainz: Show acoustids
// @namespace    mbz-loujine
// @author       loujine
// @version      2017.3.7
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-showacoustid.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-showacoustid.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Show acoustids on a Work page
// @compatible   firefox+greasemonkey
// @license      MIT
// @require      https://greasyfork.org/scripts/13747-mbz-loujine-common/code/mbz-loujine-common.js?version=174522
// @include      http*://*musicbrainz.org/work/*
// @include      http*://*musicbrainz.org/artist/*/relationships
// @exclude      http*://*musicbrainz.org/work/*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

// imported from mbz-loujine-common.js: requests, sidebar

function showAcoustids() {
    var $recordings = $('table a[href*="/recording/"]');
    var recording_mbids = $recordings.map(function() {
        return this.href.split('/')[4]; // eslint-disable-line no-invalid-this
    }).get();
    var url = '//api.acoustid.org/v2/track/list_by_mbid';
    var application_api_key = 'P9e1TIJs7g';
    var params = 'client=' + application_api_key;
    params += '&mbid=' + recording_mbids.join('&mbid=');
    params += '&batch=1&disabled=0';

    $('thead > tr').append('<th>AcoustID</th>');
    $('thead > tr').append('<th>ABrainz</th>');
    $('.subh > th')[1].colSpan += 2;
    $('table.tbl > tbody > tr:not(".subh")').append('<td>');

    requests.POST(url, params, function success(xhr) {
        var resp_mbids = JSON.parse(xhr.responseText).mbids;
        $recordings.each(function (idx, recording) {
            var acids = resp_mbids[idx].tracks.map(function (track) {
                return track.id;
            });
            $(recording).parents('tr').find('td:last').append(
                acids.map(function (acid) {
                    return $('<a>', {
                        'href': '//acoustid.org/track/' + acid,
                        'target': '_blank'
                    }).append(
                        $('<code>', {
                            'text': acid.slice(0, 6),
                            'data-acid': acid,
                            'data-recid': helper.mbidFromURL(recording.href),
                            'class': 'acoustID'
                        })
                    ).prepend($('<br />'))
                })
            ).after(
                $('<td>').append(
                    $('<a>', {
                        'href': '//acousticbrainz.org/' + recording_mbids[idx],
                        'target': '_blank',
                        'text': 'link'
                    })
                )
            );
        });
        var nodes = document.getElementsByClassName('acoustID');
        var ids = {};
        for (var node of nodes) {
            var acid = node.getAttribute('data-acid');
            if (!_.includes(Object.keys(ids), acid)) {
                ids[acid] = [];
            }
            ids[acid].push(node.getAttribute('data-recid'));
        }
        var duplicate_ids = _.filter(Object.keys(ids), function (acid) {
            // true if distinct recordings use the same acoustID
            return _.uniq(ids[acid]).length > 1
        });
        duplicate_ids.forEach(function (acid) {
            $('#acidForMerge').append(
                '<option value="' + acid + '">' + acid.slice(0, 6) +
                '</option>'
            );
        });
        duplicate_ids = duplicate_ids.map(function (acid) {
            return acid.slice(0, 6);
        });
        $(nodes).each(function (idx, node) {
            if (_.includes(duplicate_ids, node.textContent)) {
                $(node).css('background-color', '#' + node.textContent);
            }
        });
    });
}


function mergeFromAcoustID() {
    var acid = $('#acidForMerge')[0].value;
    var url = '//api.acoustid.org/v2/lookup';
    var application_api_key = 'P9e1TIJs7g';
    var params = 'client=' + application_api_key;
    params += '&meta=recordingids';
    params += '&trackid=' + acid;
    requests.POST(url, params, function success(xhr) {
        var recordings = JSON.parse(xhr.responseText).results[0].recordings;
        var ids = [];
        recordings.forEach(function (recording) {
            var url = '/ws/js/entity/' + recording.id;
            requests.GET(url, function (resp) {
                ids.push(JSON.parse(resp).id);
            });
        });
        setTimeout(function () {
            var url = '/recording/merge_queue?add-to-merge=' +
                      ids.join('&add-to-merge=');
            console.log('Merge URL is ' + url);
            window.open(url);
        }, 1000);
    });
}


// display sidebar
(function displaySidebar(sidebar) {
    sidebar.container().append(
        $('<h3>Show acoustIDs<h3>')
    ).append(
        $('<input>', {
            'id': 'showacoustids',
            'type': 'button',
            'value': 'Show acoustIDs'
        })
    ).append(
        $('<h3>Merge from acoustID<h3>')
    ).append(
        $('<select id="acidForMerge">'
          + '<option value="">acoustID</option>'
          + '</select>')
    ).append(
        $('<input>', {
            'id': 'merge',
            'type': 'button',
            'value': 'Merge'
        })
    );
})(sidebar);

$(document).ready(function() {
    $('#showacoustids').click(function() {showAcoustids();});
    $('#merge').click(function() {mergeFromAcoustID();});
    return false;
});
