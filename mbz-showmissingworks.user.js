// ==UserScript==
// @name         MusicBrainz: Show missing works
// @author       loujine
// @version      2015.11.04
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-showmissingworks.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-showmissingworks.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Mark recordings not linked to any work on a performer page
// @compatible   firefox+greasemonkey  quickly tested
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @require      mbz-loujine-sidebar.js
// @require      mbz-loujine-common.js
// @include      http*://*musicbrainz.org/artist/*/relationships
// @grant        none
// @run-at       document-end
// ==/UserScript==

'use strict';

// imported from mbz-loujine-common.js: requestGET, mbzTimeout
// imported from mbz-loujine-sidebar.js: container

function showMissingWorks() {
    var recordings = $('table a[href*="/recording/"]');

    recordings.each(function (idx, recording) {
        setTimeout(function () {
            var mbid = recording.href.split('/')[4],
                url = '/ws/2/recording/' + encodeURIComponent(mbid) + '?fmt=json&inc=work-rels',
                tr_node = $(recording).parents('tr')[0],
                td_node = tr_node.insertCell(-1),
                callback = function (resp) {
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
            if (idx === 0) {
                var tbody_node = tr_node.parentElement.parentElement;
                tbody_node.tHead.children[0].insertCell(-1);
                tbody_node.tBodies[0].children[0].children[1].colSpan += 1;
            }
            requestGET(url, function (resp) {
                callback(JSON.parse(resp));
            })
        }, idx * mbzTimeout);
    });
}

// container defined in mbz-loujine-sidebar.js
$('.artist-information').before(
    container
    .append(
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
