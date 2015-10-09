// ==UserScript==
// @name         MusicBrainz: Show missing works
// @author       loujine
// @version      2015.10.09
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-showmissingworks.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-showmissingworks.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Mark recordings not linked to any work on a performer page
// @compatible   firefox+greasemonkey  quickly tested
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @include      http*://*musicbrainz.org/artist/*/relationships
// @grant        none
// @run-at       document-end
// ==/UserScript==

'use strict';

// https://musicbrainz.org/doc/XML_Web_Service/Rate_Limiting
// we wait for `mbz_timeout` milliseconds between two queries
var mbz_timeout = 1000;


function findLinkedWork(td_node, mbid, callback) {
    var url = '/ws/2/recording/' +
              encodeURIComponent(mbid) +
              '?fmt=json&limit=1&inc=work-rels',
        xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 && xhr.responseText != null) {
                callback(JSON.parse(xhr.responseText), td_node);
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

function showMissingWorks() {
    var recordings = $('a[href*="/recording/"]').toArray();
    recordings.shift(); // remove first element /recording/create
    recordings.splice(-1); // remove last element /recording/create

    recordings.forEach(function(recording, idx) {
        setTimeout(function() {
            var recording_mbid = recording.href.split('/')[4],
                tr_node = recording.parentElement.parentElement,
                td_node = tr_node.insertCell(-1);
            if (idx === 0) {
                var tbody_node = tr_node.parentElement.parentElement;
                tbody_node.tHead.children[0].insertCell(-1);
                tbody_node.tBodies[0].children[0].children[1].colSpan += 1;
            }
            var callback = function(resp, td_node) {
                if (resp.relations.length > 0) {
                    if (resp.relations[0].begin) {
                        td_node.textContent = '✓';
                        td_node.style.color = 'green';
                    } else {
                        td_node.textContent = '⚠';
                        td_node.style.color = 'orange';
                        recording.style.color = 'orange';
                    }
                } else {
                    td_node.textContent = '✗';
                    td_node.style.color = 'red';
                    recording.style.color = 'red';
                }
            };
            findLinkedWork(td_node, recording_mbid, callback);
        }, idx * mbz_timeout);
    });
}


$('#sidebar').prepend(
    $('<div></div>', {
      'id': 'loujine-sidebar',
      'css': {'background-color': 'white',
              'padding': '8px',
              'margin': '0px -6px 6px',
              'border': '2px dotted #736DAB'
          }
      }
    ).append(
        $('<h2></h2>', {'text': 'loujine GM tools'})
    ).append(
        $('<input></input>', {
          'id': 'showmissingworks',
          'type': 'button',
          'value': 'Show missing works'
          })
    )
);

$(document).ready(function() {
    $('#showmissingworks').click(function() {showMissingWorks()});
    return false;
});
