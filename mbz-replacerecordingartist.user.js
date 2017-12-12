/* global $ requests server helper sidebar edits GM_info */
'use strict';
// ==UserScript==
// @name         MusicBrainz: Replace recording artists from an artist or work page
// @namespace    mbz-loujine
// @author       loujine
// @version      2017.12.9
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-replacerecordingartist.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-replacerecordingartist.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Replace associated recording artist from an Artist or Work page
// @compatible   firefox+tampermonkey
// @license      MIT
// @require      https://greasyfork.org/scripts/13747-mbz-loujine-common/code/mbz-loujine-common.js?version=231192
// @include      http*://*musicbrainz.org/artist/*/relationships
// @include      http*://*musicbrainz.org/work/*
// @exclude      http*://*musicbrainz.org/work/*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

var editNoteMsg = 'CSG: Set performer(s) as recording artist\n';

function formatPerformers(relations) {
    var performers = [];
    relations.forEach(function (rel) {
        var type;
        var creditedName = rel['target-credit'] ? rel['target-credit'] : rel.artist.name;
        if (rel.type === 'instrument' || rel.type === 'vocal' ||
            rel.type === 'conductor' || rel.type === 'performing orchestra' ||
            rel.type === 'performer') {
            if (rel.type === 'performing orchestra') {
                type = 'orchestra';
            } else if (!rel.attributes.length) {
                type = rel.type;
            } else {
                type = rel.attributes[0];
            }
            performers.push(type + ': ' + creditedName);
        }
    });
    return performers.sort().join(', ');
}

function showPerformers(start, maxcount) {
    var $rows;
    if (helper.isArtistURL()) {
        var performer = helper.mbidFromURL(),
            $allRows = $('table.tbl a[href*="/artist/"]').parents('tr'),
            $performerRows = $('table.tbl a[href*="/artist/' + performer + '"]').parents('tr');
        $rows = $allRows.not($performerRows);
    } else if (helper.isWorkURL()) {
        var composer = $('th:contains("composer:")').parent().find('a').attr('href').split('/')[2];
        $rows = $('table.tbl a[href*="/artist/' + composer + '"]').parents('tr');
    }
    $rows = $($rows.get().reverse().splice(start, maxcount));
    if (!$('#ARperformerColumn').length) {
        $('thead > tr').append('<th id="ARperformerColumn">Performer AR</th>');
        $('.subh > th')[1].colSpan += 1;
        $('table.tbl > tbody > tr:not(".subh")').append('<td>');
    }

    $rows.each(function (idx, tr) {
        setTimeout(function () {
            var mbid = $(tr).find('a[href*="/recording/"]').attr('href').split('/')[2],
                url = helper.wsUrl('recording', ['artist-rels'], mbid);
            requests.GET(url, function (response) {
                var resp = JSON.parse(response),
                    $node = $(tr).find('td:last'),
                    $button;
                if (resp.relations.length) {
                    $node.text(formatPerformers(resp.relations));
                    $button = $('<input>', {
                        'id': 'replace-' + mbid,
                        'class': 'replace',
                        'type': 'checkbox',
                        'value': 'Replace artist'
                    });
                    $node.append($button);
                } else {
                    $node.text('✗').css('color', 'red');
                }
                $(tr).append($node);
            });
        }, 1.5 * idx * server.timeout);
    });
}

// Replace composer -> performer as recording artist (CSG)
function parseArtistEditData(data, performers) {
    performers.sort(helper.comparefct).forEach(function (performer, idx) {
        var creditedName = performer.name;
        if (performer.creditedName) {
            creditedName = performer.creditedName;
        }
        data['artist_credit.names.' + idx + '.name'] = edits.encodeName(creditedName);
        data['artist_credit.names.' + idx + '.join_phrase'] = (idx === performers.length - 1) ? null : ',+';
        data['artist_credit.names.' + idx + '.artist.name'] = edits.encodeName(performer.name);
        data['artist_credit.names.' + idx + '.artist.id'] = performer.id;
    });
}

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
        if (server.performingLinkTypes().includes(linkType) &&
                !uniqueIds.includes(rel.target.id)) {
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
        $('<h3>Show performers</h3>')
    ).append(
        $('<p>Show performers present in recording AR, for recordings not respecting the CSG</p>')
    ).append(
        $('<div>')
        .append('First row:')
        .append(
            $('<input>', {
                'id': 'offset',
                'type': 'number',
                'style': 'width: 50px',
                'value': '1'
            })
        )
    ).append(
        $('<div>')
        .append('Rows to query:')
        .append(
            $('<input>', {
                'id': 'max',
                'type': 'number',
                'style': 'width: 50px',
                'value': '10'
            })
        )
    ).append(
        $('<input>', {
            'id': 'showperformers',
            'type': 'button',
            'value': 'Show performer AR'
        })
    ).append(
        $('<h3>Replace artists</h3>')
    ).append(
        $('<p>First click "Show performer AR" then check boxes to select artists</p>')
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
    $('#showperformers').click(function () {
        var start = $('#offset')[0].value,
            maxcount = $('#max')[0].value;
        showPerformers(parseInt(start - 1), parseInt(maxcount));
        $('#batch_select').prop('disabled', false);
        $('#batch_replace_edit_note').prop('disabled', false);
        $('#batch_replace').prop('disabled', false);
    });
    $('#batch_replace').click(function () {replaceArtist();});
    $('#batch_select').click(function () {
        $('.replace:input').attr('checked', true);
    });
    return false;
});
