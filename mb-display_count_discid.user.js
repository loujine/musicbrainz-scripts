/* global helper */
'use strict';
// ==UserScript==
// @name         MusicBrainz: Display discid count
// @namespace    mbz-loujine
// @author       loujine
// @version      2018.1.6
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mb-display_count_discid.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mb-display_count_discid.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Display discid count on main release pages
// @compatible   firefox+tampermonkey
// @license      MIT
// @require      https://greasyfork.org/scripts/13747-mbz-loujine-common/code/mbz-loujine-common.js?version=241520
// @include      http*://*musicbrainz.org/release/*
// @exclude      http*://*musicbrainz.org/release/add*
// @exclude      http*://*musicbrainz.org/release/*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

// adapted from jesus2099  mb. INLINE STUFF

function parseCount(data, tab) {
    const cnt = data.media.reduce((cnt, medium) => cnt + medium.discs.length, 0);
    if (cnt > 0) {
        tab.style.backgroundColor = '#6f9';
    }
    tab.append(` (${cnt})`);
}

(function showCountDiscid() {
    const tab = document.querySelector("a[href$='/discids']"),
        url = helper.wsUrl('release', ['discids']);
    fetch(url).then(resp => resp.json()).then(data => parseCount(data, tab));
})();
