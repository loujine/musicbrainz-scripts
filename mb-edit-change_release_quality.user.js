/* global $ requests edits helper */
'use strict';
// ==UserScript==
// @name         MusicBrainz edit: Change release quality
// @namespace    mbz-loujine
// @author       loujine
// @version      2023.3.10
// @downloadURL  https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-edit-change_release_quality.user.js
// @updateURL    https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-edit-change_release_quality.user.js
// @supportURL   https://github.com/loujine/musicbrainz-scripts
// @icon         https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/icon.png
// @description  musicbrainz.org: Change release quality
// @compatible   firefox+tampermonkey
// @license      MIT
// @require      https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mbz-loujine-common.js
// @match        *://*.musicbrainz.org/release/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

const editNote = `GM script: "${GM_info.script.name}" (${GM_info.script.version})\n`;

const qualities = {
    normal: 1,
    low: 0,
    high: 2,
};

function success(xhr) {
    document.getElementById('text_quality').textContent = 'Success (code ' + xhr.status + ')'
    document.getElementById('text_quality').style.color = 'green';
    document.getElementById('upgrade_quality').style.color = 'gray';
    document.getElementById('downgrade_quality').style.color = 'gray';
}

function fail(xhr) {
    document.getElementById('text_quality').textContent = 'Error (code ' + xhr.status + ')'
    document.getElementById('text_quality').style.color = 'red';
    document.getElementById('upgrade_quality').style.color = 'gray';
    document.getElementById('downgrade_quality').style.color = 'gray';
}

function _changeQuality(offsetQuality) {
    const url = helper.wsUrl('release', []);
    requests.GET(url, resp => {
        const quality = qualities[JSON.parse(resp).quality];
        if (quality + offsetQuality > 2 || quality + offsetQuality < 0) {
            console.log(`Quality is already set to ${quality}`);
            return;
        }
        const mbid = helper.mbidFromURL();
        requests.POST(
            `/release/${mbid}/change-quality`,
            edits.formatEdit('change-release-quality', {
                'quality': quality + offsetQuality,
                'edit_note': editNote,
            }),
            success,
            fail
        );
    });
}

(function displayArrows() {
    if (!document.querySelector('a[href*="/change-quality"]')) {
        return;
    }
    document.querySelector('a[href*="/change-quality"]').insertAdjacentHTML('afterend', `
        <span id="upgrade_quality">&#9650;</span>
        <span id="downgrade_quality">&#9660;</span>
        <span id="text_quality"></span>
    `);
    document.getElementById('upgrade_quality').style.color = 'green';
    document.getElementById('upgrade_quality').style.cursor = 'pointer';
    document.getElementById('downgrade_quality').style.color = 'red';
    document.getElementById('downgrade_quality').style.cursor = 'pointer';
})();

$(document).ready(function () {
    if (!helper.isUserLoggedIn()) {
        return false;
    }
    document.getElementById('upgrade_quality')?.addEventListener('click', () => {
        _changeQuality(1);
    });
    document.getElementById('downgrade_quality')?.addEventListener('click', () => {
        _changeQuality(-1);
    });
    return false;
});
