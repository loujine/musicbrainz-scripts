// ==UserScript==
// @name         MusicBrainz: Show performers
// @author       loujine
// @version      2015.11.04
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-showperformers.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-showperformers.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Show performers on a Work page (for when the Artist credit is the composer)
// @compatible   firefox+greasemonkey  quickly tested
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @require      mbz-loujine-sidebar.js
// @require      mbz-loujine-common.js
// @include      http*://*musicbrainz.org/work/*
// @exclude      http*://*musicbrainz.org/work/*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

'use strict';

// imported from mbz-loujine-common.js: requestGET, mbzTimeout
// imported from mbz-loujine-sidebar.js: container

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
    var recordings = $('table a[href*="/recording/"]'),
        composer_node = $('th:contains("composer:")')[0].parentElement.children[1].children[0],
        composer_mbid = composer_node.href.split('/')[4];

    recordings.each(function (idx, recording) {
        setTimeout(function () {
            var mbid = recording.href.split('/')[4],
                url = '/ws/2/recording/' + encodeURIComponent(mbid) + '?fmt=json&inc=artist-rels',
                tr_node = $(recording).parents('tr')[0],
                td_node = tr_node.insertCell(-1),
                callback = function (resp) {
                    if (resp.relations.length > 0) {
                        td_node.textContent = formatPerformers(resp.relations);
                    } else {
                        td_node.textContent = '✗';
                        td_node.style.color = 'red';
                    }
                };
            if (idx === 0) {
                var tbody_node = tr_node.parentElement.parentElement;
                var head = tbody_node.tHead.children[0].insertCell(-1);
                head.textContent = 'Performers';
                tbody_node.tBodies[0].children[0].children[1].colSpan += 1;
            }
            if (tr_node.children[3].children[0].href.split('/')[4] === composer_mbid) {
                requestGET(url, function (resp) {
                    callback(JSON.parse(resp));
                });
            }
        }, idx * mbzTimeout);
    });
}

// container defined in mbz-loujine-sidebar.js
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
