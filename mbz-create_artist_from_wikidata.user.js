'use strict';
// ==UserScript==
// @name         MusicBrainz edit: Create entity or fill data from wikidata / VIAF / ISNI
// @namespace    mbz-loujine
// @author       loujine
// @version      2018.1.7
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mb-edit-create_from_wikidata.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mb-edit-create_from_wikidata.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org edit: create entity or fill data from wikidata / VIAF / ISNI
// @compatible   firefox+tampermonkey
// @license      MIT
// @require      https://greasyfork.org/scripts/13747-mbz-loujine-common/code/mbz-loujine-common.js?version=241520
// @include      http*://*musicbrainz.org/artist/create*
// @include      http*://*musicbrainz.org/artist/*/edit
// @exclude      http*://*musicbrainz.org/artist/*/alias/*/edit
// @include      http*://*musicbrainz.org/place/create*
// @include      http*://*musicbrainz.org/place/*/edit
// @exclude      http*://*musicbrainz.org/place/*/alias/*/edit
// @include      http*://*musicbrainz.org/work/create*
// @include      http*://*musicbrainz.org/work/*/edit
// @exclude      http*://*musicbrainz.org/work/*/alias/*/edit
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// ==/UserScript==

// legacy file, replaced by mb-edit-create_from_wikidata.user.js
