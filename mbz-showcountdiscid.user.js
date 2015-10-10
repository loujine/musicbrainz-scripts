// ==UserScript==
// @name         MusicBrainz: Show discid count
// @author       loujine
// @version      2015.10.10
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-showcountdiscid.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-showcountdiscid.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Show discid number on main release pages
// @compatible   firefox+greasemonkey  quickly tested
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @include      http*://*musicbrainz.org/release/*
// @exclude      http*://*musicbrainz.org/release/add
// @exclude      http*://*musicbrainz.org/release/add?artist*
// @exclude      http*://*musicbrainz.org/release/add?release-group*
// @exclude      http*://*musicbrainz.org/release/*annotation*
// @exclude      http*://*musicbrainz.org/release/*cover-art*
// @exclude      http*://*musicbrainz.org/release/*/relationships
// @exclude      http*://*musicbrainz.org/release/*/discids
// @exclude      http*://*musicbrainz.org/release/*/tags
// @exclude      http*://*musicbrainz.org/release/*/details
// @exclude      http*://*musicbrainz.org/release/*/edit
// @grant        none
// @run-at       document-end
// ==/UserScript==

'use strict';

// adapted from jesus2099  mb. INLINE STUFF

function fetchDiscids(mbid, tab, callback) {
    var url = '/ws/2/release/' + encodeURIComponent(mbid) + '/?inc=discids',
        xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 && xhr.responseText != null) {
                callback(xhr.responseXML, tab);
            } else {
                console.log('Error: ', xhr.status);
            }
        }
    };
    xhr.open('GET', url, true);
    xhr.timeout = 5000;
    xhr.ontimeout = function() {
        console.error('The request for ' + url + ' timed out.');
        };
    xhr.send(null);
}

function showCountDiscid() {
    var tab = document.querySelector("div.tabs > ul.tabs > li > a[href$='/discids']"),
        mbid = document.URL.split('/')[4];
    var callback = function(xml, tab) {
        var cnt = xml.documentElement.querySelector('disc-list');
        cnt = parseInt(cnt.attributes.count.textContent, 10);
        if (cnt > 0) {
            tab.style.setProperty('background-color', '#6f9');
        }
        tab.textContent += ' (' + cnt + ')';
    };
    fetchDiscids(mbid, tab, callback);
}

showCountDiscid();
