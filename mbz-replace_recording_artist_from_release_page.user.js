/* global $ _ requests server helper sidebar edits */
'use strict';
var meta = function() {
// ==UserScript==
// @name         MusicBrainz: Replace recording artists from a release page
// @namespace    mbz-loujine
// @author       loujine
// @version      2016.6.22
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-replace_recording_artist_from_release_page.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-replace_recording_artist_from_release_page.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Replace associated recording artist from a Release page
// @compatible   firefox+greasemonkey
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @require      https://greasyfork.org/scripts/13747-mbz-loujine-common/code/mbz-loujine-common.js?version=133551
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
        $('.subh').append('<th id="selectorColumn">AR</th>');
    }

    $rows.each(function (idx, tr) {
        var mbid = $(tr).find('a[href*="/recording/"]').attr('href').split('/')[2];
        $(tr).append(
            $('<td>').append(
                $('<input>', {
                    'id': 'replace-' + mbid,
                    'class': 'replace',
                    'type': 'checkbox',
                    'value': 'Replace artist'
                })
            )
        );
    });
}

// Replace composer -> performer as recording artist (CSG)
function parseArtistEditData(data, performers) {
    performers.forEach(function (performer, idx) {
        var creditedName = performer.name;
        if (performer.creditedName) {
            creditedName = performer.creditedName;
        }
        data['artist_credit.names.' + idx + '.name'] = edits.encodeName(creditedName);
        data['artist_credit.names.' + idx + '.join_phrase'] = (idx === performers.length - 1) ? null : ',+';
        data['artist_credit.names.' + idx + '.artist.name'] = edits.encodeName(performer.name);
        data['artist_credit.names.' + idx + '.artist.id'] = performer.id;
    });
};

function parseEditData(editData) {
    var data = {},
        performers = [];
    data['name'] = edits.encodeName(editData.name);
    data['comment'] = editData.comment ? editData.comment : null;
    if (!editData.isrcs.length) {
        data['isrcs.0'] = null;
    } else {
        editData.isrcs.forEach(function (isrc, idx) {
            data['isrcs.' + idx] = isrc;
        });
    }
    editData.relationships.forEach(function (rel) {
        var linkType = rel.linkTypeID,
            uniqueIds = [];
        if (_.includes(server.performingLinkTypes(), linkType) &&
                !_.includes(uniqueIds, rel.target.id)) {
            uniqueIds.push(rel.target.id); // filter duplicates
            performers.push({'name': rel.target.name,
                             'creditedName': rel.entity0_credit,
                             'id': rel.target.id,
                             'link': linkType,
                             'mbid': rel.target.gid
            });
        }
    });
    parseArtistEditData(data, performers.sort(helper.comparefct));
    data['edit_note'] = $('#batch_replace_edit_note')[0].value;
    data['make_votable'] = document.getElementById('votable').checked ? '1' : '0';
    return data;
}

function replaceArtist() {
    $('.replace:input:checked:enabled').each(function (idx, node) {
        var mbid = node.id.replace('replace-', ''),
            url = edits.urlFromMbid('recording', mbid);
        function success(xhr) {
            var $status = $('#' + node.id + '-text');
            node.disabled = true;
            $status.text(
                'Success (code ' + xhr.status + ')'
            ).parent().css('color', 'green');
            var editId = new RegExp(
                '/edit/(.*)">edit</a>'
            ).exec(xhr.responseText)[1];
            $status.after(
                $('<p>').append(
                    '<a href="/edit/' + editId + '" target="_blank">edit ' + editId + '</a>'
                )
            )
        }
        function fail(xhr) {
            $('#' + node.id + '-text').text(
                'Error (code ' + xhr.status + ')'
            ).parent().css('color', 'red');
        }
        function callback(editData) {
            $('#' + node.id + '-text').text('Sending edit data');
            var postData = parseEditData(editData);
            console.info('Data ready to be posted: ', postData);
            requests.POST(url, edits.formatEdit('edit-recording', postData),
                          success, fail);
        }
        setTimeout(function () {
            $('#' + node.id + '-text').empty();
            $(node).after('<span id="' + node.id + '-text">Fetching required data</span>');
            edits.getEditParams(url, callback);
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
