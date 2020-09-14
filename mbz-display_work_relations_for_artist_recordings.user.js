'use strict';
// ==UserScript==
// @name         (moved) MusicBrainz: Display (missing) work relations for an artist recordings
// @namespace    mbz-loujine
// @author       loujine
// @version      2020.9.12
// @downloadURL  https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-display_work_relations_for_artist_recordings.user.js
// @updateURL    https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-display_work_relations_for_artist_recordings.user.js
// @supportURL   https://github.com/loujine/musicbrainz-scripts
// @icon         https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/icon.png
// @description  musicbrainz.org: Mark recordings not linked to any work on an artist recordings or relationships page
// @compatible   firefox+tampermonkey
// @license      MIT
// @require      https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mbz-loujine-common.js
// @include      http*://*musicbrainz.org/artist/*/relationships
// @include      http*://*musicbrainz.org/artist/*/recordings*
// @grant        none
// @run-at       document-end
// ==/UserScript==

// renamed mb-display_work_relations_for_artist_recordings.user.js
