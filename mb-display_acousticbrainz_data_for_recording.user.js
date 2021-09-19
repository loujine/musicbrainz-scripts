/* global sidebar helper */
'use strict';
// ==UserScript==
// @name         MusicBrainz: Display (more) AcousticBrainz data on recording page
// @namespace    mbz-loujine
// @author       loujine
// @version      2021.9.19
// @downloadURL  https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-display_acousticbrainz_data_for_recording.user.js
// @updateURL    https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-display_acousticbrainz_data_for_recording.user.js
// @supportURL   https://github.com/loujine/musicbrainz-scripts
// @icon         https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/icon.png
// @description  musicbrainz.org: Display (more) AcousticBrainz data on recording page
// @compatible   firefox+tampermonkey
// @license      MIT
// @require      https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mbz-loujine-common.js
// @include      http*://*musicbrainz.org/recording/*
// @exclude      http*://*musicbrainz.org/recording/merge*
// @exclude      http*://*musicbrainz.org/recording/*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

function round(num, precision) {
    const modifier = Math.pow(10, precision);
    return Math.round(num * modifier) / modifier;
}

function showAcousticBrainzData() {
    const mbid = helper.mbidFromURL();
    fetch(`//acousticbrainz.org/api/v1/${mbid}/count`).then(
        resp => resp.json()
    ).then(json => {
        const count = json.count;
        if (count > 0) {
            fetch(`//acousticbrainz.org/api/v1/${mbid}/low-level`).then(
                resp => resp.json()
            ).then(data => {
                document.getElementById('ABfreq').append(round(data.tonal.tuning_frequency, 2));
                document.getElementById('ABbeatcount').append(data.rhythm.beats_count);
            });
        }
    });
}

(function main() {
    sidebar.container().insertAdjacentHTML('beforeend', `
        <h3>More acoustic analysis</h3>
        <dl>
          <dt>Tuning frequency:</dt><dd id="ABfreq"></dd>
          <dt>Beats count:</dt><dd id="ABbeatcount"></dd>
        </dl>
    `);
    showAcousticBrainzData();
})();
