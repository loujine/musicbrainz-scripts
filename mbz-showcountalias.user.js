// ==UserScript==
// @name         MusicBrainz: Show alias count
// @author       loujine
// @version      2015.10.24
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-showcountalias.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-showcountalias.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Show alias number on main release pages
// @compatible   firefox+greasemonkey  quickly tested
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @include      http*://*musicbrainz.org/work/*
// @exclude      http*://*musicbrainz.org/work/add*
// @exclude      http*://*musicbrainz.org/work/*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

'use strict';

// adapted from jesus2099  mb. INLINE STUFF

function fetchAliases(mbid, tab, callback) {
    var url = '/ws/2/work/' + encodeURIComponent(mbid) + '/?inc=aliases&fmt=json',
        xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 && xhr.responseText != null) {
                callback(JSON.parse(xhr.responseText), tab);
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

function showCountAliases() {
    var tab = $("a[href$='/aliases']")[0],
        mbid = document.URL.split('/')[4];
    var callback = function(resp, tab) {
        var cnt = resp.aliases.length,
            locales = [];
        if (cnt > 0) {
            tab.style.setProperty('background-color', '#6f9');
        }
        tab.textContent += ' (' + cnt + ')';
        resp.aliases.forEach(function (alias) {
            if (alias.locale) {
                locales.push(alias.locale);
            }
        });
        if (locales.length > 0) {
            tab.textContent += ' ' + locales.sort().join(',');
        }
    };
    fetchAliases(mbid, tab, callback);
}

showCountAliases();
