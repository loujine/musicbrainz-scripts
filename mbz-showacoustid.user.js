/* global $ _ requests sidebar */
'use strict';
// ==UserScript==
// @name         MusicBrainz: Show acoustids
// @namespace    mbz-loujine
// @author       loujine
// @version      2016.12.13
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-showacoustid.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-showacoustid.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Show acoustids on a Work page
// @compatible   firefox+greasemonkey
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @require      https://greasyfork.org/scripts/13747-mbz-loujine-common/code/mbz-loujine-common.js?version=128923
// @include      http*://*musicbrainz.org/work/*
// @exclude      http*://*musicbrainz.org/work/*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

// imported from mbz-loujine-common.js: requests, sidebar

function showAcoustids() {
    var $recordings = $('table a[href*="/recording/"]');
    var recording_mbids = $recordings.map(function() {
        return this.href.split('/')[4];
    }).get();
    var url = '//api.acoustid.org/v2/track/list_by_mbid';
    var application_api_key = 'P9e1TIJs7g';
    var params = 'client=' + application_api_key;
    params += '&mbid=' + recording_mbids.join('&mbid=');
    params += '&batch=1&disabled=0';

    $('thead > tr').append('<th>AcoustID</th>');
    $('thead > tr').append('<th>ABrainz</th>');
    $('.subh > th')[1].colSpan += 2;

    requests.POST(url, params, function success(xhr) {
        var resp_mbids = JSON.parse(xhr.responseText).mbids;
        $recordings.each(function (idx, recording) {
            var acids = resp_mbids[idx].tracks.map(function (track) {
                return track.id;
            });
            $(recording).parents('tr').append(
                $('<td>').append(
                    acids.map(function (acid) {
                        return $('<a>', {
                            'href': '//acoustid.org/track/' + acid,
                            'target': '_blank'
                        }).append(
                            $('<code>', {
                                'text': acid.slice(0, 6),
                                'data-acid': acid,
                                'class': 'acoustID'
                            })
                        ).prepend($('<br />'))
                    })
                )
            ).append(
                $('<td>').append(
                    $('<a>', {
                        'href': '//acousticbrainz.org/' + recording_mbids[idx],
                        'target': '_blank',
                        'text': 'link'
                    })
                )
            );
        });
        var nodes = document.getElementsByClassName('acoustID');
        var ids = _.map(nodes, function (node) {
            return node.getAttribute('data-acid');
        });
        var duplicate_ids = _.uniq(_.filter(ids, function (refId, idx) {
            return _.filter(ids.slice(idx), function (id) {
                return id === refId;
            }).length > 1;
        }));
        $(nodes).each(function (idx, node) {
            if (_.includes(duplicate_ids, node.textContent)) {
                $(node).css('background-color', '#' + node.textContent);
            }
        });
    });
}

// display sidebar
(function displaySidebar(sidebar) {
    sidebar.container().append(
        $('<h3>Show acoustIDs<h3>')
    ).append(
        $('<input>', {
            'id': 'showacoustids',
            'type': 'button',
            'value': 'Show acoustIDs'
        })
    );
})(sidebar);

$(document).ready(function() {
    $('#showacoustids').click(function() {showAcoustids();});
    return false;
});
