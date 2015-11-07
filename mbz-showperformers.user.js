'use strict';
// ==UserScript==
// @name         MusicBrainz: Replace recording artists from a Work page
// @namespace    mbz-loujine
// @author       loujine
// @version      2015.11.05
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-showperformers.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-showperformers.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Show performers & replace associated recording artst from a Work page
// @compatible   firefox+greasemonkey
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @require      mbz-loujine-sidebar.js
// @require      mbz-loujine-common.js
// @include      http*://*musicbrainz.org/work/*
// @exclude      http*://*musicbrainz.org/work/*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

// imported from mbz-loujine-common.js: requestGET, mbzTimeout

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

function formatEditInfo(json) {
    var data = [],
        performers = [],
        editNote;
    data.push('edit-recording.name=' + json.name);
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
            performers.push({'name': rel.target.name, 'id': rel.target.id});
        }
        data.push('edit-recording.rel.' + idx + '.relationship_id=' + rel.id);
        data.push('edit-recording.rel.' + idx + '.target=' + rel.target.gid);
        data.push('edit-recording.rel.' + idx + '.link_type_id=' + linkType);
        if (linkType === 278) {
            data.push('edit-recording.rel.' + idx + '.backward=1');
        }
    });
    editNote = $('#batch_replace_edit_note')[0].value;
    data.push('edit-recording.edit_note=' + editNote);
    performers.forEach(function(performer, idx) {
        data.push('edit-recording.artist_credit.names.' + idx + '.name=' + performer.name);
        if (idx === performers.length - 1) {
            data.push('edit-recording.artist_credit.names.' + idx + '.join_phrase');
        } else {
            data.push('edit-recording.artist_credit.names.' + idx + '.join_phrase=,+');
        }
        data.push('edit-recording.artist_credit.names.' + idx + '.artist.name=' + performer.name);
        data.push('edit-recording.artist_credit.names.' + idx + '.artist.id=' + performer.id);
    });
    return data.join('&').replace(/ /g, '+');
}

function showPerformers() {
    var composer = $('th:contains("composer:")').parent().find('a').attr('href').split('/')[4],
        $rows = $('table.tbl a[href*="/artist/' + composer + '"]').parents('tr');
    $rows = $($rows.get().reverse()); // FIXME whyis jquery reversing the list?
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
                    $node = $('<td>✗</td>').css('background-color', 'red');
                }
                $(tr).append($node);
            });
        }, idx * mbzTimeout);
    });
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
                        node.disabled = true;
                        if (status === 200) {
                            $(node).parent().css('color', 'green');
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
        $('<h3></h3>', {'text': 'Replace artists'})
    )
    .append(
        $('<input></input>', {
          'id': 'showperformers',
          'type': 'button',
          'value': 'Show performers'
        })
    )
    .append(
        $('<p></p>', {'text': 'First click "Show performers" then check boxes to select artists'})
    )
    .append(
        $('<p></p>', {'text': 'Edit note:'})
    )
    .append(
        $('<textarea></textarea>', {'id': 'batch_replace_edit_note'})
    )
    .append(
        $('<input></input>', {
          'id': 'batch_replace',
          'type': 'button',
          'disabled': true,
          'value': 'Replace selected artists'
          })
    )
    .append(
        $('<p></p>', {'text': 'Checkbox becomes grey when the request has been sent'})
    );

$(document).ready(function() {
    $('#batch_replace_edit_note')[0].value = 'CSG';
    $('#showperformers').click(function() {
        showPerformers();
        $('#batch_replace').prop('disabled', false);
    });
    $('#batch_replace').click(function() {replaceArtist();});
    return false;
});
