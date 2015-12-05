'use strict';
var meta = function() {
// ==UserScript==
// @name         MusicBrainz: Replace recording artists from an artist or work page
// @namespace    mbz-loujine
// @author       loujine
// @version      2015.12.05
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-replacerecordingartist.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-replacerecordingartist.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Replace associated recording artist from an Artist or Work page
// @compatible   firefox+greasemonkey
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @require      https://greasyfork.org/scripts/13707-musicbrainz-common-files-for-the-sidebar/code/MusicBrainz:%20common%20files%20for%20the%20sidebar.js?version=93039
// @require      https://greasyfork.org/scripts/13747-musicbrainz-common-files/code/MusicBrainz:%20common%20files.js?version=93034
// @include      http*://*musicbrainz.org/artist/*/relationships
// @include      http*://*musicbrainz.org/work/*
// @exclude      http*://*musicbrainz.org/work/*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==
};
if (meta && meta.toString && (meta = meta.toString())) {
    var meta = {'name': meta.match(/@name\s+(.+)/)[1],
                'version': meta.match(/@version\s+(.+)/)[1]};
}

// imported from mbz-loujine-common.js: requestGET, mbzTimeout,

var editNoteMsg = 'CSG: Set performer(s) as recording artist\n';

function formatPerformers(relations) {
    var performers = [];
    relations.forEach(function(rel) {
        var type;
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
            performers.push(type + ': ' + rel.artist.name);
        }
    });
    return performers.sort().join(', ');
}

function showPerformers(start, maxcount) {
    if (document.URL.split('/')[3] === 'artist') {
        var performer = document.URL.split('/')[4],
            $allRows = $('table.tbl a[href*="/artist/"]').parents('tr'),
            $performerRows = $('table.tbl a[href*="/artist/' + performer + '"]').parents('tr'),
            $rows = $allRows.not($performerRows);
    } else if (document.URL.split('/')[3] === 'work') {
        var composer = $('th:contains("composer:")').parent().find('a').attr('href').split('/')[4],
            $rows = $('table.tbl a[href*="/artist/' + composer + '"]').parents('tr');
    }
    $rows = $($rows.get().reverse().splice(start, maxcount)); // FIXME why is jquery reversing the list?
    $('thead > tr').append('<th>Performer AR</th>');
    $('.subh > th')[1].colSpan += 1;

    $rows.each(function (idx, tr) {
        setTimeout(function () {
            var mbid = $(tr).find('a[href*="/recording/"]').attr('href').split('/')[4],
                artist = $(tr).find('a[href*="/artist/"]').attr('href').split('/')[4],
                url = '/ws/2/recording/' + encodeURIComponent(mbid) + '?fmt=json&inc=artist-rels';
            requestGET(url, function (response) {
                var resp = JSON.parse(response),
                    $node,
                    $button;
                if (resp.relations.length) {
                    $node = $('<td>' + formatPerformers(resp.relations) + '</td>');
                    $button = $('<input></input>', {
                        'id': 'replace-' + mbid,
                        'class': 'replace',
                        'type': 'checkbox',
                        'value': 'Replace artist'
                    });
                    $node.append($button);
                } else {
                    $node = $('<td>✗</td>').css('color', 'red');
                }
                $(tr).append($node);
            });
        }, idx * mbzTimeout);
    });
}

// Replace composer -> performer as recording artist (CSG)
function formatEditInfo(json) {
    var data = [],
        performers = [],
        editNote,
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
            data.push('edit-recording.isrcs.' + idx + '=' + json.isrc);
        });
    }
    json.relationships.forEach(function(rel, idx) {
        var linkType = rel.linkTypeID;
        if (linkType === linkTypePerformer ||
            linkType === linkTypeInstrument || linkType === linkTypeVocals ||
            linkType === linkTypeOrchestra || linkType === linkTypeConductor) {
            performers.push({'name': rel.target.name, 'id': rel.target.id, 'link': linkType});
        }
    });
    editNote = $('#batch_replace_edit_note')[0].value;
    data.push('edit-recording.edit_note=' + editNote);
    performers.sort(comparefct).forEach(function(performer, idx) {
        data.push('edit-recording.artist_credit.names.' + idx + '.name=' + encodeName(performer.name));
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
    // in order to determine the edit parameters required by POST
    // we first load the /edit page and parse the JSON data
    // in the sourceData block
    $('.replace:input:checked:enabled').each(function (idx, node) {
        setTimeout(function () {
            var mbid = node.id.replace('replace-', ''),
                url = '/recording/' + encodeURIComponent(mbid) + '/edit',
                callback = function (info) {
                    console.log('Sending POST ' + mbid + ' edit info');
                    requestPOST(url, formatEditInfo(info), function (status) {
                        if (status === 200 || status === 0) {
                            node.disabled = true;
                            $(node).after(status).parent().css('color', 'green');
                        } else {
                            $(node).after(status).parent().css('color', 'red');
                        }
                    });
                };
            console.log('Fetching ' + mbid + ' edit info');

            requestGET(url, function (resp) {
                var info = new RegExp('sourceData: (.*),\n').exec(resp)[1];
                callback(JSON.parse(info));
            });
        }, 2 * idx * mbzTimeout);
    });
}

// imported from mbz-loujine-sidebar.js: container
$container
    .append(
        $('<h3>Show performers</h3>')
    )
    .append(
        $('<span>Start at:</span>')
    )
    .append(
        $('<input></input>', {
            'id': 'offset',
            'type': 'text',
            'value': '1'
        })
    )
    .append(
        $('<span>Max count:</span>')
    )
    .append(
        $('<input></input>', {
            'id': 'max',
            'type': 'text',
            'value': '10'
        })
    )
    .append(
        $('<input></input>', {
          'id': 'showperformers',
          'type': 'button',
          'value': 'Show performer AR'
        })
    )
    .append(
        $('<h3>Replace artists</h3>')
    )
    .append(
        $('<p>Warning: this is experimental! Bogus data could be sent in the edit. Please check carefully your edit history after use, and help by reporting bugs</p>')
    )
    .append(
        $('<p>First click "Show performer AR" then check boxes to select artists</p>')
    )
    .append(
        $('<input></input>', {
          'id': 'batch_select',
          'type': 'button',
          'value': 'Select all'
          })
    )
    .append(
        $('<p>Edit note:</p>')
    )
    .append(
        $('<textarea></textarea>', {'id': 'batch_replace_edit_note',
                                    'text': sidebarEditNote(meta, editNoteMsg)})
    )
    .append(
        $('<input></input>', {
          'id': 'batch_replace',
          'type': 'button',
          'disabled': true,
          'value': 'Replace selected artists'
          })
    );

$(document).ready(function () {
    $('#showperformers').click(function () {
        var start = $('#offset')[0].value,
            maxcount = $('#max')[0].value;
        showPerformers(parseInt(start - 1), parseInt(maxcount));
        $('#batch_replace').prop('disabled', false);
    });
    $('#batch_replace').click(function () {replaceArtist();});
    $('#batch_select').click(function () {
        $('.replace:input').attr('checked', true);
    });
    return false;
});
