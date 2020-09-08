/* global sidebar helper */
'use strict';
// ==UserScript==
// @name         MusicBrainz: Display AcousticBrainz data on recording page
// @namespace    mbz-loujine
// @author       loujine
// @version      2020.9.8
// @downloadURL  https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mbz-display_acousticbrainz_data_for_recording.user.js
// @updateURL    https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mbz-display_acousticbrainz_data_for_recording.user.js
// @supportURL   https://github.com/loujine/musicbrainz-scripts
// @icon         https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/icon.png
// @description  musicbrainz.org: display AcousticBrainz data on recording page
// @compatible   firefox+tampermonkey
// @license      MIT
// @require      https://greasyfork.org/scripts/13747-mbz-loujine-common/code/mbz-loujine-common.js?version=241520
// @include      http*://*musicbrainz.org/recording/*
// @exclude      http*://*musicbrainz.org/recording/merge
// @exclude      http*://*musicbrainz.org/recording/*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

const round = (num, precision) => {
  const modifier = 10 ** precision
  return Math.round(num * modifier) / modifier
}

function showAcousticBrainzData() {
    const mbid = helper.mbidFromURL();
    fetch(`//acousticbrainz.org/api/v1/${mbid}/count`).then(
        resp => resp.json()
    ).then(json => {
        const count = json.count;
        document.getElementById('ABcount').append(count);
        if (count > 0) {
            fetch(`//acousticbrainz.org/api/v1/${mbid}/low-level`).then(
                resp => resp.json()
            ).then(data => {
                document.getElementById('ABkey').append(
                    `${data.tonal.key_key} ${data.tonal.key_scale} (${round(
                        100 * data.tonal.key_strength, 1)}%)`
                );
                document.getElementById('ABfreq').append(round(data.tonal.tuning_frequency, 2));
                document.getElementById('ABbpm').append(round(data.rhythm.bpm, 1));
                document.getElementById('ABbeatcount').append(data.rhythm.beats_count);
            });
        }
    });
}

(function main() {
    const mbid = helper.mbidFromURL();
    sidebar.container().insertAdjacentHTML('beforeend', `
        <h3>Show statistics</h3>
        <a href="//acousticbrainz.org/${mbid}" target="_blank">AcousticBrainz entry</a>
        <dl>
          <dt>Number of submissions:</dt><dd id="ABcount"></dd>
          <dt>Key:</dt><dd id="ABkey"></dd>
          <dt>Tuning frequency:</dt><dd id="ABfreq"></dd>
          <dt>BPM:</dt><dd id="ABbpm"></dd>
          <dt>Beats count:</dt><dd id="ABbeatcount"></dd>
        </dl>
    `);
    showAcousticBrainzData();
})();
