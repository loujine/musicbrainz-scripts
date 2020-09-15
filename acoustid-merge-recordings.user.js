/* globals $ */
'use strict';
// ==UserScript==
// @name         MusicBrainz: merge recordings from acoustID page
// @namespace    mbz-loujine
// @author       loujine
// @version      2020.9.14
// @downloadURL  https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/acoustid-merge-recordings.user.js
// @updateURL    https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/acoustid-merge-recordings.user.js
// @supportURL   https://github.com/loujine/musicbrainz-scripts
// @icon         https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/icon.png
// @description  musicbrainz.org: merge recordings from acoustID page
// @compatible   firefox+tampermonkey
// @license      MIT
// @include      http*://acoustid.org/track/*
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// ==/UserScript==

function checkAll() {
    document.querySelectorAll('.mbmerge').forEach(function (node) {
        node.checked = true;
    });
}

function launchMerge() {
    const ids = [];
    if (document.querySelectorAll('.mbmerge:checked').length < 2) {
        document.getElementById('merge-text')
                .textContent = 'You must merge at least two recordings';
        return;
    }
    document.querySelectorAll('.mbmerge:checked').forEach((node, idx) => {
        setTimeout(() => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: `https://musicbrainz.org/ws/js/entity/${node.value}`,
                timeout: 1000,
                onload: resp => {
                    document.getElementById(
                        'merge-text'
                    ).textContent = `Fetched internal id for recording ${idx}`;
                    ids.push(JSON.parse(resp.responseText).id);
                },
            });
        }, 1000 * idx);
    });
    setTimeout(function () {
        const url =
            'https://musicbrainz.org/recording/merge_queue?add-to-merge=' +
            ids.join('&add-to-merge=');
        document.getElementById('merge-text').textContent =
            'Opening merge page';
        console.log('Merge URL is ' + url);
        window.open(url);
    }, document.querySelectorAll('.mbmerge:checked').length * 1000 + 1000);
}

(function displayButtons () {
    document.getElementsByTagName('table')[1].children[0].children[0].insertAdjacentHTML(
        'beforeend', `
        <th>Merge selection
          <input id="checkAll" value="Select all" type="button">
        </th>
    `);
    document.querySelectorAll('table a[href*="/recording/"]').forEach(node => {
        const mbid = node.href.split('/')[4];
        const tr = node.parentElement.parentElement;
        if (
            node.parentElement.tagName != 'I' &&
            !tr.classList.contains('mbid-disabled')
        ) {
            tr.insertAdjacentHTML(
                'beforeend',
                `<td><input class="mbmerge" value="${mbid}" type="checkbox"></td>`
            );
        }
    });
    document.getElementsByTagName('table')[1].insertAdjacentHTML('afterend', `
        <input id="merge" value="Launch merge in MusicBrainz" type="button">
        <span id="merge-text"></span>
    `);
})();

$(document).ready(function () {
    document.getElementById('checkAll').addEventListener('click', checkAll);
    document.getElementById('merge').addEventListener('click', launchMerge);
    return false;
});
