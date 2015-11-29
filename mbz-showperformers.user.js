'use strict';
var meta = function() {
// ==UserScript==
// @name         MusicBrainz: Replace recording artists from a Work page
// @namespace    mbz-loujine
// @author       loujine
// @version      2015.11.25
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-showperformers.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-showperformers.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Show performers & replace associated recording artst from a Work page
// @compatible   firefox+greasemonkey
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @include      http*://*musicbrainz.org/work/*
// @exclude      http*://*musicbrainz.org/work/*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==
};
if (meta && meta.toString && (meta = meta.toString())) {
    var meta = {'name': meta.match(/@name\s+(.+)/)[1],
                'version': meta.match(/@version\s+(.+)/)[1]};
}



