/* global $ requests helper sidebar */
'use strict';
// ==UserScript==
// @name         MusicBrainz: Display AcousticBrainz datasets count for work
// @namespace    mbz-loujine
// @author       loujine
// @version      2020.9.26
// @downloadURL  https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-display_acousticbrainz_dataset_for_work.user.js
// @updateURL    https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-display_acousticbrainz_dataset_for_work.user.js
// @supportURL   https://github.com/loujine/musicbrainz-scripts
// @icon         https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/icon.png
// @description  musicbrainz.org: Display AcousticBrainz count on Work page
// @compatible   firefox+tampermonkey
// @license      MIT
// @require      https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mbz-loujine-common.js
// @include      http*://*musicbrainz.org/work/*
// @exclude      http*://*musicbrainz.org/work/create
// @exclude      http*://*musicbrainz.org/work/*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

const abzIconURL = '//acousticbrainz.org/static/images/favicon-16.png';
const MAX_ITEMS_PER_BULK_REQUEST = 25;

function showABids() {
    if (!$('thead > tr').length) {
        return;
    }
    const $recordings = $('table a[href*="/recording/"]');
    const recording_mbids = Array.from($recordings).map(
        node => node.href.split('/')[4]
    );
    $('thead > tr').append('<th>ABrainz</th>');
    $('.subh > th')[1].colSpan += 1;
    $('table.tbl > tbody > tr:not(".subh")').append('<td>');

    let mbid_batch;
    let idx = 0;
    while (recording_mbids.length) {
        mbid_batch = recording_mbids.splice(0, MAX_ITEMS_PER_BULK_REQUEST);
        const url =
            '//acousticbrainz.org/api/v1/count?recording_ids=' +
            mbid_batch.join(';');
        setTimeout(() => {
            requests.GET(url, (data) => {
                data = JSON.parse(data);
                console.log(`Fetching data for ${Object.keys(data).length - 1} MBIDs`);
                $recordings.each((_, recording) => {
                    const mbid = helper.mbidFromURL(recording.href);
                    if (data[mbid] === undefined || data[mbid].count === 0) {
                        return;
                    }
                    $(recording).parents('tr').find('td:last').append(
                        $('<a>', {
                            'href': '//acousticbrainz.org/' + mbid,
                            'target': '_blank',
                            'text': data[mbid].count,
                        }
                    ).append($('<img src="' + abzIconURL + '" class="abz" />')));
                });
            });
        }, 1500 * idx);
        idx += 1;
    }
}

(function displaySidebar() {
    sidebar.container().insertAdjacentHTML('beforeend', `
        <h3>Show AcousticBrainz IDs</h3>
        <input type="button" id="showABids" value="Show AcousticBrainz IDs">
    `);
})();

$(document).ready(function () {
    document.getElementById('showABids').addEventListener('click', showABids);
    return false;
});
