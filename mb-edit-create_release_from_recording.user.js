/* global GM_info MBImport helper requests sidebar */
'use strict';
// ==UserScript==
// @name         MusicBrainz recording: Create broadcast release from the current recording
// @namespace    mbz-loujine
// @author       loujine
// @version      2020.9.14
// @downloadURL  https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-edit-create_release_from_recording.user.js
// @updateURL    https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-edit-create_release_from_recording.user.js
// @supportURL   https://github.com/loujine/musicbrainz-scripts
// @icon         https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/icon.png
// @description  musicbrainz recording: Create a "Broadcast" release containing the current recording
// @compatible   firefox+tampermonkey
// @license      MIT
// @require      https://greasyfork.org/scripts/20955-mbimport/code/mbimport.js?version=794744
// @require      https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mbz-loujine-common.js
// @include      http*://*musicbrainz.org/recording/*
// @exclude      http*://*musicbrainz.org/recording/merge
// @exclude      http*://*musicbrainz.org/recording/*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

const editNote = `
 —
GM script: "${GM_info.script.name}" (${GM_info.script.version})

`;

const recordingMBID = helper.mbidFromURL();
const recordingTitle = document.querySelector('div.recordingheader h1').textContent;
const recordingLength = document.querySelector('#sidebar dd.length').textContent;
const dateInTitle = new RegExp('([0-9]{4})-([0-9]{2})-([0-9]{2})').exec(recordingTitle);
const date = dateInTitle === null ? ['', '', ''] : dateInTitle.splice(1);

// let artistCredit = document.querySelector('p.subheader a').textContent;

function prepareReleaseForm(resp) {
    const artistCredit = JSON.parse(resp).artistCredit.names.map(credit => ({
        'credited_name': credit.name,
        'mbid': credit.artist.gid,
        'joinphrase': credit.joinPhrase,
    }));
    const broadcastURLs = JSON.parse(resp).relationships.filter(
        rel => rel.linkTypeID === 268
    );
    const urls = broadcastURLs.map(url => ({
        'link_type': 85,
        'url': url.target.href_url,
    }));

    const release = {
        'title': recordingTitle,
        'artist_credit': artistCredit,
        'type': 'Broadcast',
        'status': 'Official',
        'language': 'eng',
        'script': 'Latn',
        'packaging': 'None',
        'country': 'xw',
        'year': date[0],
        'month': date[1],
        'day': date[2],
        'labels': [
            {
                'name': '[no label]',
                'mbid': '157afde4-4bf5-4039-8ad2-5a15acc85176',
            },
        ],
        'barcode': 'none',
        'urls': urls,
        'discs': [
            {
                'format': 'Digital Media',
                'tracks': [
                    {
                        'number': 1,
                        'title': recordingTitle,
                        'recording': recordingMBID,
                        'duration': recordingLength,
                        'artist_credit': artistCredit,
                    },
                ],
            },
        ],
    };
    document.getElementById('add_release_script').insertAdjacentHTML(
        'beforeend',
        MBImport.buildFormHTML(MBImport.buildFormParameters(release, editNote))
    );
    document.querySelector('#add_release_script button').textContent = "Create";
}

(function main() {
    sidebar.container().insertAdjacentHTML('beforeend', `
        <h3>Create broadcast release</h3>
        <div id="add_release_script"></div>
    `);
    requests.GET(
        `/ws/js/entity/${recordingMBID}?inc=rels`,
        prepareReleaseForm
    );
})();
