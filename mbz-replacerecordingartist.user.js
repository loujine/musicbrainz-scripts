'use strict';
var meta = function() {
// ==UserScript==
// @name         MusicBrainz: Replace recording artists from an artist or work page
// @namespace    mbz-loujine
// @author       loujine
// @version      2016.2.5
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-replacerecordingartist.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-replacerecordingartist.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Replace associated recording artist from an Artist or Work page
// @compatible   firefox+greasemonkey
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @require      https://greasyfork.org/scripts/13747-mbz-loujine-common/code/mbz-loujine-common.js?version=104306
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

// imported from mbz-loujine-common.js: requests, server, sidebar
var requests = requests,
    server = server,
    helper = helper,
    sidebar = sidebar,
    editNoteMsg = 'CSG: Set performer(s) as recording artist\n';

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
    var $rows;
    if (document.URL.split('/')[3] === 'artist') {
        var performer = document.URL.split('/')[4],
            $allRows = $('table.tbl a[href*="/artist/"]').parents('tr'),
            $performerRows = $('table.tbl a[href*="/artist/' + performer + '"]').parents('tr');
        $rows = $allRows.not($performerRows);
    } else if (document.URL.split('/')[3] === 'work') {
        var composer = $('th:contains("composer:")').parent().find('a').attr('href').split('/')[4];
        $rows = $('table.tbl a[href*="/artist/' + composer + '"]').parents('tr');
    }
    $rows = $($rows.get().reverse().splice(start, maxcount)); // FIXME why is jquery reversing the list?
    if (!$('#ARperformerColumn').length) {
        $('thead > tr').append('<th id="ARperformerColumn">Performer AR</th>');
        $('.subh > th')[1].colSpan += 1;
    }

    $rows.each(function (idx, tr) {
        setTimeout(function () {
            var mbid = $(tr).find('a[href*="/recording/"]').attr('href').split('/')[4],
                url = '/ws/2/recording/' + encodeURIComponent(mbid) + '?fmt=json&inc=artist-rels';
            requests.GET(url, function (response) {
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
        }, idx * server.timeout);
    });
}

// Replace composer -> performer as recording artist (CSG)
function formatEditInfo(json) {
    var data = [],
        performers = [],
        mbid = document.URL.split('/')[4],
        editNote,
        performerName,
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
    json.relationships.forEach(function(rel) {
        var linkType = rel.linkTypeID;
        if (linkType === server.link.performer ||
            linkType === server.link.instrument || linkType === server.link.vocals ||
            linkType === server.link.orchestra || linkType === server.link.conductor) {
            performers.push({'name': rel.target.name,
                             'id': rel.target.id,
                             'link': linkType,
                             'mbid': rel.target.gid
            });
        }
    });
    editNote = $('#batch_replace_edit_note')[0].value;
    data.push('edit-recording.edit_note=' + editNote);
    performers.sort(helper.comparefct).forEach(function(performer, idx) {
        if (document.URL.split('/')[3] === 'artist' && performer.mbid === mbid) {
            performerName = $('#performerAlias')[0].selectedOptions[0].text;
        } else {
            performerName = performer.name;
        }
        data.push('edit-recording.artist_credit.names.' + idx + '.name=' + encodeName(performerName));
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
        $('<h3>').append('Show performers')
    ).append(
        $('<div>')
        .append('Start at:')
        .append(
            $('<input></input>', {
                'id': 'offset',
                'type': 'text',
                'value': '1'
            })
        )
    ).append(
        $('<div>')
        .append('Max count:')
        .append(
            $('<input></input>', {
                'id': 'max',
                'type': 'text',
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
        $('<h3>').append('Replace artists')
    ).append(
        $('<p>Warning: this is experimental! Bogus data could be sent in the edit. Please check carefully your edit history after use, and help by reporting bugs</p>')
    ).append(
        $('<p>First click "Show performer AR" then check boxes to select artists</p>')
    ).append(
        $('<input></input>', {
            'id': 'batch_select',
            'type': 'button',
            'value': 'Select all'
        })
    ).append(
        $('<p>').append('Primary locale alias to use:')
        .append($('<select>', {'id': 'performerAlias'}))
    ).append(
        $('<p>').append('Edit note:')
        .append(
            $('<textarea></textarea>', {'id': 'batch_replace_edit_note',
                                        'text': sidebar.editNote(meta, editNoteMsg)})
        )
    ).append(
        $('<input></input>', {
            'id': 'batch_replace',
            'type': 'button',
            'disabled': true,
            'value': 'Replace selected artists'
        })
    );
})(sidebar);

function parseAliases() {
    if (document.URL.split('/')[3] === 'artist') {
        var mbid = document.URL.split('/')[4],
            url = '/ws/2/artist/' + encodeURIComponent(mbid) + '?fmt=json&inc=aliases',
            callback = function (aliasObject) {
                $.each(aliasObject, function(locale, name) {
                    $('#performerAlias').append(
                        $('<option>', {'value': locale}).append(name)
                    );
                });
            };

        requests.GET(url, function (response) {
            var resp = JSON.parse(response),
                aliases = {'default': resp.name};
            $('#performerAlias').append( $('<option>', {'value': 'default'}).append(resp.name));
            if (resp.aliases.length) {
                resp.aliases.forEach(function (alias) {
                    if (alias.locale && alias.primary) {
                        aliases[alias.locale] = alias.name;
                    }
                });
                callback(aliases);
            }
        });
    }
}

parseAliases();

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
