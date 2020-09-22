/* global $ helper requests sidebar */
'use strict';
// ==UserScript==
// @name         MusicBrainz edit: Display acoustIDs and merge recordings with common acoustID
// @namespace    mbz-loujine
// @author       loujine
// @version      2020.9.22
// @downloadURL  https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-edit-merge_from_acoustid.user.js
// @updateURL    https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-edit-merge_from_acoustid.user.js
// @supportURL   https://github.com/loujine/musicbrainz-scripts
// @icon         https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/icon.png
// @description  musicbrainz.org: Display acoustIDs and merge recordings with common acoustID
// @compatible   firefox+tampermonkey
// @license      MIT
// @require      https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mbz-loujine-common.js
// @include      http*://*musicbrainz.org/work/*
// @exclude      http*://*musicbrainz.org/work/create
// @exclude      http*://*musicbrainz.org/work/*/*
// @include      http*://*musicbrainz.org/artist/*/relationships
// @include      http*://*musicbrainz.org/artist/*/recordings
// @include      http*://*musicbrainz.org/artist/*/recordings?page=*
// @grant        none
// @run-at       document-end
// ==/UserScript==

function showAcoustids() {
    const $recordings = $('table a[href*="/recording/"]');
    const recording_mbids = $recordings.map(function() {
        return this.href.split('/')[4]; // eslint-disable-line no-invalid-this
    }).get();
    const url = '//api.acoustid.org/v2/track/list_by_mbid';
    const application_api_key = 'P9e1TIJs7g';
    let params = 'client=' + application_api_key;
    params += '&mbid=' + recording_mbids.join('&mbid=');
    params += '&batch=1&disabled=0';

    $('thead > tr').append('<th>AcoustID</th>');
    if ($('.subh > th').length > 1) {
        $('.subh > th')[1].colSpan += 1;
    }
    $('table.tbl > tbody > tr:not(".subh")').append('<td>');

    requests.POST(url, params, function success(xhr) {
        const resp_mbids = JSON.parse(xhr.responseText).mbids;
        $recordings.each(function (idx, recording) {
            const acids = resp_mbids[idx].tracks.map(function (track) {
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
            );
        });
        const nodes = document.getElementsByClassName('acoustID');
        const ids = {};
        for (const node of nodes) {
            const acid = node.getAttribute('data-acid');
            if (!Object.keys(ids).includes(acid)) {
                ids[acid] = [];
            }
            ids[acid].push(node.getAttribute('data-recid'));
        }
        let duplicate_ids = Object.keys(ids).filter(
            // true if distinct recordings use the same acoustID
            acid => new Set(ids[acid]).size > 1
        );
        duplicate_ids.sort().map(acid =>
            $('#acidForMerge').append(
                '<option value="' + acid + '">' + acid.slice(0, 6) + '</option>'
            )
        );
        duplicate_ids = duplicate_ids.map(acid => acid.slice(0, 6));
        $(nodes).each(function (idx, node) {
            if (duplicate_ids.includes(node.textContent)) {
                $(node).css('background-color', '#' + node.textContent);
            }
        });
    });
}


function mergeFromAcoustID() {
    const acid = $('#acidForMerge')[0].value;
    const url = '//api.acoustid.org/v2/lookup';
    const application_api_key = 'P9e1TIJs7g';
    let params = 'client=' + application_api_key;
    params += '&meta=recordingids';
    params += '&trackid=' + acid;
    requests.POST(url, params, function success(xhr) {
        const recordings = JSON.parse(xhr.responseText).results[0].recordings;
        const ids = [];
        recordings.forEach(function (recording) {
            const url = '/ws/js/entity/' + recording.id;
            requests.GET(url, function (resp) {
                ids.push(JSON.parse(resp).id);
            });
        });
        setTimeout(function () {
            const url =
                '/recording/merge_queue?add-to-merge=' +
                ids.join('&add-to-merge=');
            console.log('Merge URL is ' + url);
            window.open(url);
        }, 1000);
    });
}


(function displaySidebar() {
    sidebar.container().insertAdjacentHTML('beforeend', `
        <h3>Show acoustIDs</h3>
        <input type="button" id="showAcoustids" value="Show acoustIDs">
        <h3>Merge from acoustID</h3>
        <select id="acidForMerge"><option value="">acoustID</option></select>
        <input type="button" id="merge" value="Merge">
    `);
})();

$(document).ready(function() {
    document.getElementById('showAcoustids').addEventListener(
        'click', showAcoustids);
    document.getElementById('merge').addEventListener(
        'click', mergeFromAcoustID);
    return false;
});
