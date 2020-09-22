'use strict';
// ==UserScript==
// @name         (obsolete) MusicBrainz: Display discid count
// @namespace    mbz-loujine
// @author       loujine
// @version      2020.9.15
// @downloadURL  https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-display_count_discid.user.js
// @updateURL    https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-display_count_discid.user.js
// @supportURL   https://github.com/loujine/musicbrainz-scripts
// @icon         https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/icon.png
// @description  musicbrainz.org: Display discid count on main release pages
// @compatible   firefox+tampermonkey
// @license      MIT
// @include      http*://*musicbrainz.org/release/*
// @exclude      http*://*musicbrainz.org/release/add*
// @exclude      http*://*musicbrainz.org/release/*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

// the info is now displayed directly in MusicBrainz server (MBS-10568)
