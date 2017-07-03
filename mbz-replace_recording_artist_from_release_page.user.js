/* global $ _ requests server helper sidebar edits */
'use strict';
// ==UserScript==
// @name         MusicBrainz: Replace recording artists from a release page
// @namespace    mbz-loujine
// @author       loujine
// @version      2017.6.3
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-replace_recording_artist_from_release_page.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-replace_recording_artist_from_release_page.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Replace associated recording artist from a Release page
// @compatible   firefox+greasemonkey
// @license      MIT
// @require      https://greasyfork.org/scripts/13747-mbz-loujine-common/code/mbz-loujine-common.js?version=204016
// @include      http*://*musicbrainz.org/release/*
// @include      http*://*mbsandbox.org/release/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

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

    var lastChecked;
    $('.replace').click(function (evt) {
        var currentChecked = $('.replace').index(evt.target);
        if (evt.shiftKey && lastChecked !== undefined) {
            if (lastChecked > currentChecked) {
                // es6 syntax
                [lastChecked, currentChecked] = [currentChecked, lastChecked];
            }
            $('.replace').slice(lastChecked,
                currentChecked).prop('checked', evt.target.checked);
        }
        lastChecked = $('.replace').index(evt.target);
    });
}

// Replace composer -> performer as recording artist (CSG)
function parseArtistEditData(data, performers) {
    if (performers.length === 0
        && !document.getElementById('set-unknown').checked) {
        // erase completely data to prevent the POST request
        return null;
    } else if (performers.length === 0) {
        // set [unknown] artist credit
        data['artist_credit.names.0.name'] = '[unknown]';
        data['artist_credit.names.0.join_phrase'] = '';
        data['artist_credit.names.0.artist.name'] = '[unknown]';
        data['artist_credit.names.0.artist.id'] = server.unknownArtistId;
        return data;
    }
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
    return data;
};

function parseEditData(editData) {
    var data = {},
        performers = [],
        uniqueIds = [];
    data['name'] = edits.encodeName(editData.name);
    data['comment'] = editData.comment ? editData.comment : null;
    if (editData.video === true) {
        data['video'] = "1";
    }
    if (!editData.isrcs.length) {
        data['isrcs.0'] = null;
    } else {
        editData.isrcs.forEach(function (isrc, idx) {
            data['isrcs.' + idx] = isrc;
        });
    }
    editData.relationships.forEach(function (rel) {
        var linkType = rel.linkTypeID;
        var filterPending = document.getElementById('pending').checked ?
            !rel.editsPending : true;
        if (_.includes(server.performingLinkTypes(), linkType) &&
                !_.includes(uniqueIds, rel.target.id) && filterPending &&
                rel.target.name !== '[unknown]') {
            uniqueIds.push(rel.target.id); // filter duplicates
            performers.push({'name': rel.target.name,
                             'creditedName': rel.entity0_credit,
                             'id': rel.target.id,
                             'link': linkType,
                             'mbid': rel.target.gid
            });
        }
    });
    data['edit_note'] = $('#batch_replace_edit_note')[0].value;
    data['make_votable'] = document.getElementById('votable').checked ? '1' : '0';
    return parseArtistEditData(data, performers.sort(helper.comparefct));
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
            if (postData === null) {
                $('#' + node.id + '-text').text('No artist data to send');
                return;
            }
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
        $('<div>')
        .append(
            $('<label>Exclude AR with pending edits</label>')
            .append($('<input>',
                      {'type': 'checkbox',
                       'id': 'pending'})
            )
        )
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
        $('<div>')
        .append(
            $('<label>Set [unknown] artist if no AR</label>')
            .append($('<input>',
                      {'type': 'checkbox',
                       'id': 'set-unknown'})
            )
        )
    ).append(
        $('<p>').append('Edit note:')
        .append(
            $('<textarea></textarea>', {
                'id': 'batch_replace_edit_note',
                'disabled': true,
                'text': sidebar.editNote(GM_info.script, editNoteMsg)
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
        $('.replace:input').prop('checked', true);
    });
    return false;
});
