/* global $ requests server helper sidebar */
'use strict';
var meta = function() {
// ==UserScript==
// @name         MusicBrainz: Replace recording artists from a release page
// @namespace    mbz-loujine
// @author       loujine
// @version      2016.5.14
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-replace_recording_artist_from_release_page.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-replace_recording_artist_from_release_page.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Replace associated recording artist from a Release page
// @compatible   firefox+greasemonkey
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @require      https://greasyfork.org/scripts/13747-mbz-loujine-common/code/mbz-loujine-common.js?version=125991
// @include      http*://*musicbrainz.org/release/*
// @include      http*://*mbsandbox.org/release/*
// @grant        none
// @run-at       document-end
// ==/UserScript==
};
if (meta && meta.toString && (meta = meta.toString())) {
    var meta = {'name': meta.match(/@name\s+(.+)/)[1],
                'version': meta.match(/@version\s+(.+)/)[1]};
}

// imported from mbz-loujine-common.js: requests, server, sidebar
var editNoteMsg = 'CSG: Set performer(s) in recording AR as recording artist\n';

function showSelectors() {
    var $rows = $(
        $('table.tbl a[href*="/artist/"]').parents('tr').get().reverse()
    );
    if (!$('#selectorColumn').length) {
        $('thead > tr').append('<th id="selectorColumn">AR</th>');
    }

    $rows.each(function (idx, tr) {
        var mbid = $(tr).find('a[href*="/recording/"]').attr('href').split('/')[2],
            $node = $('<td>'),
            $button = $('<input>', {
            'id': 'replace-' + mbid,
            'class': 'replace',
            'type': 'checkbox',
            'value': 'Replace artist'
        });
        $node.append($button);
        $(tr).append($node);
    });
}

// Replace composer -> performer as recording artist (CSG)
function formatEditInfo(json) {
    var data = [],
        performers = [],
        encodeName = function (name) {
            return encodeURIComponent(name).replace(/%20/g, '+');
        };
    data.push('edit-recording.name=' + encodeName(json.name));
    if (!json.comment.length) {
        data.push('edit-recording.comment');
    } else {
        data.push('edit-recording.comment=' + json.comment);
    }
    if (!json.isrcs.length) {
        data.push('edit-recording.isrcs.0');
    } else {
        json.isrcs.forEach(function(isrc, idx) {
            data.push('edit-recording.isrcs.' + idx + '=' + isrc);
        });
    }
    json.relationships.forEach(function(rel) {
        var linkType = rel.linkTypeID;
        if (linkType === server.link.performer || linkType === server.link.chorusmaster ||
            linkType === server.link.instrument || linkType === server.link.vocals ||
            linkType === server.link.orchestra || linkType === server.link.conductor) {
            performers.push({'name': rel.target.name,
                             'creditedName': rel.entity0_credit,
                             'id': rel.target.id,
                             'link': linkType,
                             'mbid': rel.target.gid
            });
        }
    });
    var editNote = $('#batch_replace_edit_note')[0].value;
    data.push('edit-recording.edit_note=' + editNote);
    if (document.getElementById('votable').checked) {
        data.push('edit-recording.make_votable=1');
    } else {
        data.push('edit-recording.make_votable=0');
    }
    performers.sort(helper.comparefct).forEach(function(performer, idx) {
        var creditedName = performer.name;
        if (performer.creditedName) {
            creditedName = performer.creditedName;
        }
        data.push('edit-recording.artist_credit.names.' + idx + '.name=' + encodeName(creditedName));
        if (idx === performers.length - 1) {
            data.push('edit-recording.artist_credit.names.' + idx + '.join_phrase');
        } else {
            data.push('edit-recording.artist_credit.names.' + idx + '.join_phrase=,+');
        }
        data.push('edit-recording.artist_credit.names.' + idx + '.artist.name=' + encodeName(performer.name));
        data.push('edit-recording.artist_credit.names.' + idx + '.artist.id=' + performer.id);
    });
    return data.join('&');
}

function replaceArtist() {
    // in the sourceData block
    $('.replace:input:checked:enabled').each(function (idx, node) {
        setTimeout(function () {
            var mbid = node.id.replace('replace-', ''),
                url = '/recording/' + encodeURIComponent(mbid) + '/edit',
                callback = function (info) {
                    // console.log('Sending POST ' + mbid + ' edit info');
                    requests.POST(url, formatEditInfo(info), function (status) {
                        if (status === 200 || status === 0) {
                            node.disabled = true;
                            $(node).after(status).parent().css('color', 'green');
                        } else {
                            $(node).after(status).parent().css('color', 'red');
                        }
                    });
                };
            // console.log('Fetching ' + mbid + ' edit info');

            requests.GET(url, function (resp) {
                var info = new RegExp('sourceData: (.*),\n').exec(resp)[1];
                callback(JSON.parse(info));
            });
        }, 2 * idx * server.timeout);
    });
}

(function displaySidebar(sidebar) {
    sidebar.container()
    .append(
        $('<input>', {
            'id': 'selectors',
            'type': 'button',
            'value': 'Show checkboxes'
        })
    ).append(
        $('<h3>Replace artists</h3>')
    ).append(
        $('<p>First click "Show checkboxes" then select recordings to update</p>')
    ).append(
        $('<input>', {
            'id': 'batch_select',
            'type': 'button',
            'disabled': true,
            'value': 'Select all'
        })
    ).append(
        $('<div>', {'class': 'auto-editor'})
        .append(
            $('<label>Make all edits votable</label>')
            .append($('<input>',
                      {'type': 'checkbox',
                       'id': 'votable'})
            )
        )
    ).append(
        $('<p>').append('Edit note:')
        .append(
            $('<textarea></textarea>', {
                'id': 'batch_replace_edit_note',
                'disabled': true,
                'text': sidebar.editNote(meta, editNoteMsg)
            })
        )
    ).append(
        $('<input>', {
            'id': 'batch_replace',
            'type': 'button',
            'disabled': true,
            'value': 'Replace selected artists'
        })
    );
})(sidebar);

$(document).ready(function () {
    $('#selectors').click(function () {
        showSelectors();
        $('#batch_select').prop('disabled', false);
        $('#batch_replace_edit_note').prop('disabled', false);
        $('#batch_replace').prop('disabled', false);
        $('#selectors').prop('disabled', true);
    });
    $('#batch_replace').click(function () {replaceArtist();});
    $('#batch_select').click(function () {
        $('.replace:input').attr('checked', true);
    });
    return false;
});
