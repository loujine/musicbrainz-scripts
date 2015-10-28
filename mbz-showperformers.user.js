// ==UserScript==
// @name         MusicBrainz: Show performers
// @author       loujine
// @version      2015.10.28
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-showperformers.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-showperformers.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Show performers on a Work page (for when the Artist credit is the composer)
// @compatible   firefox+greasemonkey  quickly tested
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @include      http*://*musicbrainz.org/work/*
// @exclude      http*://*musicbrainz.org/work/*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

'use strict';

// https://musicbrainz.org/doc/XML_Web_Service/Rate_Limiting
// we wait for `mbz_timeout` milliseconds between two queries
var mbz_timeout = 1000;


function findPerformer(mbid, callback) {
    var url = '/ws/2/recording/' +
              encodeURIComponent(mbid) +
              '?fmt=json&inc=artist-rels',
        xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 && xhr.responseText != null) {
                callback(JSON.parse(xhr.responseText));
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

function formatPerformers(relations) {
    var performers = [];
    relations.forEach(function(rel) {
        var type;
        if (rel.type === 'instrument' || rel.type === 'vocal' ||
            rel.type === 'conductor' || rel.type === 'performing orchestra' ||
            rel.type === 'performer') {
            if (rel.type === 'performing orchestra') {
                type = 'orchestra';
            } else if (rel.attributes.length === 0) {
                type = rel.type;
            } else {
                type = rel.attributes[0];
            }
            performers.push(type + ': ' + rel.artist.name);
        }
    });
    return performers.sort().join(', ');
}

function showPerformers() {
    var recordings = $('a[href*="/recording/"]').toArray(),
        composer = $('th:contains("composer:")')[0].parentElement.children[1].children[0].textContent
    recordings.shift(); // drop the "Editing > Add Standalone recording" menu item

    recordings.forEach(function(recording, idx) {
        setTimeout(function() {
            var recording_mbid = recording.href.split('/')[4],
                tr_node = recording.parentElement.parentElement,
                td_node = tr_node.insertCell(-1);
            if (idx === 0) {
                var tbody_node = tr_node.parentElement.parentElement;
                var head = tbody_node.tHead.children[0].insertCell(-1);
                head.textContent = 'Performers';
                tbody_node.tBodies[0].children[0].children[1].colSpan += 1;
            }
            var callback = function(resp) {
                if (resp.relations.length > 0) {
                    td_node.textContent = formatPerformers(resp.relations);
                } else {
                    td_node.textContent = '✗';
                    td_node.style.color = 'red';
                }
            };
            if (tr_node.children[3].children[0].textContent === composer) {
                findPerformer(recording_mbid, callback);
            }
        }, idx * mbz_timeout);
    });
}

if ($('div#loujine-sidebar').length) {
    var container = $('div#loujine-sidebar');
} else {
    var container = $('<div></div>', {
        'id': 'loujine-sidebar',
        'css': {'background-color': 'white',
                'padding': '8px',
                'margin': '0px -6px 6px',
                'border': '2px dotted #736DAB'
            }
        }
    ).append(
        $('<h2></h2>', {'text': 'loujine GM tools'})
    );
}

$('.work-information').before(
    container
    .append(
        $('<input></input>', {
          'id': 'showperformers',
          'type': 'button',
          'value': 'Show performers'
          })
    )
);

$(document).ready(function() {
    $('#showperformers').click(function() {showPerformers()});
    return false;
});
