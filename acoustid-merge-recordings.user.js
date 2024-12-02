/* globals $ */
'use strict';
// ==UserScript==
// @name         MusicBrainz: merge recordings from acoustID page
// @namespace    mbz-loujine
// @author       loujine
// @version      2024.12.1
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

function checkRecordings(undefined_recordings) {
    // fetch info and change buttons for MBID only recordings
    undefined_recordings.forEach((undefined_recording, idx) => {
        setTimeout(() => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: `https://musicbrainz.org/recording/${undefined_recording.mbid}`,
                onreadystatechange: resp => {
                    const mbid = resp.finalUrl.split('/')[4];
                    var obsolete_elements = '';
                    if (resp.status == '404') {
                        if (resp.readyState === 2) {
                            // recording was deleted
                            obsolete_elements += '.mbmerge, form, .loading';
                            undefined_recording.tr.style.setProperty('background-color', '#fee');
                            undefined_recording.tr.cells[0].insertAdjacentHTML('afterbegin', 'deleted: ');
                        }
                    } else if (
                        mbid != undefined_recording.mbid
                        && undefined_recording.tr.parentNode.querySelector(`tr[id='${mbid}']`)
                    ) {
                        if (resp.readyState === 2) {
                            // recording was merged into a recording visible in this page
                            obsolete_elements += '.mbmerge, form, .loading';
                            Array.from(undefined_recording.tr.cells).forEach(cell => {
                                cell.style.setProperty('border', 'none');
                            });
                            undefined_recording.tr.style.setProperty('opacity', '.6');
                            undefined_recording.tr.cells[0].insertAdjacentHTML('afterbegin', '&nbsp;&nbsp;└ merged: ');
                            undefined_recording.tr.parentNode.querySelector(`tr[id='${mbid}']`).insertAdjacentElement(
                                'afterend',
                                undefined_recording.tr.parentNode.removeChild(undefined_recording.tr)
                            );
                        }
                    } else {
                        if (resp.readyState == 4) {
                            // recording was merged into a recording not visible in this page
                            obsolete_elements += '.loading';
                            undefined_recording.tr.querySelector('a[href]').textContent = resp.responseXML.title.replace(/ - MusicBrainz$/, '');
                        }
                    }
                    if (obsolete_elements) {
                        undefined_recording.tr.querySelectorAll(obsolete_elements).forEach(element => {
                            element.parentNode.removeChild(element);
                        });
                    }
                },
            });
        }, 1000 * idx);
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
    var undefined_recordings = [];
    document.querySelectorAll('table a[href*="/recording/"]').forEach(node => {
        const mbid = node.href.split('/')[4];
        const tr = node.closest('tr');
        tr.insertAdjacentHTML(
            'beforeend',
            `<td><input class="mbmerge" value="${mbid}" type="checkbox"></td>`
        );
        if (node.parentElement.tagName == 'I') {
            undefined_recordings.push({tr: tr, mbid: mbid});
            tr.cells[0].insertAdjacentHTML(
                'afterbegin',
                '<span class="loading"><img src="https://musicbrainz.org/static/images/icons/loading.gif"> </span>'
            );
        }
    });
    checkRecordings(undefined_recordings);
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
