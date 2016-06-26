/* global $ MBImport */
'use strict';
var meta = function() {
// ==UserScript==
// @name         Import DG/Decca releases to MusicBrainz
// @namespace    mbz-loujine
// @author       loujine
// @version      2016.6.26
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-dgdecca_importer.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-dgdecca_importer.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  Add a button to import DG/Decca releases to MusicBrainz
// @compatible   firefox+greasemonkey
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @include      http*://www.deutschegrammophon.com/*/cat/*
// @include      http*://www.deccaclassics.com/*/cat/*
// @require      https://greasyfork.org/scripts/20955-mbimport/code/mbimport.js?version=133752
// @grant        none
// @run-at       document-end
// ==/UserScript==
};
if (meta && meta.toString && (meta = meta.toString())) {
    var meta = {'name': meta.match(/@name\s+(.+)/)[1],
                'version': meta.match(/@version\s+(.+)/)[1]};
}

var siteURL = document.URL.split('/')[2];
var months = {
    'Jan.': 1, 'Feb.': 2, 'Mar.': 3, 'Apr.': 4,
    'May': 5, 'Jun.': 6, 'Jul.': 7, 'Aug.': 8,
    'Sep.': 9, 'Oct.': 10, 'Nov.': 11, 'Dec.': 12
};
var labels = {
    'www.deutschegrammophon.com': {
        'name': 'Deutsche Grammophon',
        'mbid': '5a584032-dcef-41bb-9f8b-19540116fb1c',
        'catno': document.URL.split('/')[5]
    },
    'www.deccaclassics.com': {
        'name': 'Decca Classics',
        'mbid': '89a9993d-1dad-4445-a3d7-1d8df04f7e7b',
        'catno': document.URL.split('/')[5]
    }
}

var editNote = ('Imported from '
                + document.URL
                + '\n —\n'
                + 'GM script: "' + meta.name + '" (' + meta.version + ')\n\n');

function extract_release_data() {
    function _setTitle() {
        return $('div.works')[0].innerHTML.replace('<br><br>', ' / ');
    }
    function _setReleasePerformers() {
        var list = $('div.artists')[0].innerHTML.split('<br>').map(function (artist) {
            return {
                'credited_name': artist,
                'artist_name': artist,
                'artist_mbid': '',
                'joinphrase': ', '
            };
        });
        list[list.length - 1]['joinphrase'] = '';
        return list;
    }

    function _setReleaseArtists() {
        var composer = document.getElementsByTagName('h4')[0].textContent;
        var list = [{
            'credited_name': composer,
            'artist_name': composer,
            'artist_mbid': '',
            'joinphrase': '; '
        }];
        return list.concat(_setReleasePerformers());
    }

    function _indices(array, element) {
        var indices = [];
        var idx = array.indexOf(element);
        while (idx != -1) {
            indices.push(idx);
            idx = array.indexOf(element, idx + 1);
        }
        return indices;
    }

    var date = document.getElementsByClassName('date')[0].textContent;
    date = date.replace('Int. Release ', '').split(' ');
    var discs = [],
        tracks = [];
    var tracklist_node = document.getElementById('tracklist');

    if (tracklist_node.querySelectorAll('div.track-container').length) {
        console.info('track-container available');
        for (var track of tracklist_node.querySelectorAll('div.track-container')) {
            tracks.push(extract_track_data(track));
        }
    } else {
        console.info('track-container not available');
        console.warn('not ready yet');
    }
    console.log('tracks', tracks);
    if ($('div.item').length) {
        var nb_discs = $('div.item').length;
        console.info(nb_discs + ' media');
        var tracks_no = $('.track-no').map(function (idx, node) {
            return parseInt(node.textContent.trim());
        }).toArray();
        // find first tracks on each medium
        var first_tracks_idx = _indices(tracks_no, 1);
        first_tracks_idx.forEach(function (val, idx) {
            if (idx !== first_tracks_idx.length - 1) {
                discs.push(extract_medium_data(
                    tracklist_node,
                    tracks.slice(val, first_tracks_idx[idx+1]),
                    idx
                ));
            } else {
                discs.push(extract_medium_data(
                    tracklist_node, tracks.slice(val), idx
                ));
            }
        });
    } else {
        console.info('1 medium');
        discs.push(extract_medium_data(tracklist_node, tracks));
    }

    return {
        'title': _setTitle(),
        'artist_credit': _setReleaseArtists(),
        'type': 'Album',
        'status': 'Official',
        // 'language': 'English',
        // 'script': 'Latin',
        'packaging': '',
        'country': 'XW',
        'year': date[2],
        'month': months[date[1]],
        'day': date[0],
        'labels': [labels[siteURL]],
        'barcode': document.getElementById('upc').value, // FIXME too many 0s?
        'urls': [{
            // 'link_type': 'discography',
            'url': document.URL
        }],
        'discs': discs
    };
}



function extract_medium_data(node, tracks, idx) {
    var title;
    console.log('track list', tracks);
    if (node.querySelectorAll('div.item').length) {
        title = node.querySelectorAll('div.item')[idx].textContent
    } else {
        title = ''
    }
    return {
        'title': title,
        'format': 'CD',
        'tracks': tracks
    };
}

function extract_track_data(node) {
    function _clean(s) {
        return s
            .replace(' In ', ' in ')
            .replace('Minor', 'minor')
            .replace('Major', 'major')
            .replace('Op.', 'op. ')
            .replace('No.', 'no. ')
            .replace(' Flat', '-flat')
            .replace(' Sharp', '-sharp')
            .replace(' - ', ': ')
            .replace(' | ', ': ');
    }
    function _setTrackArtists(artistString) {
        var list = artistString.split(' | ').map(function (artist) {
            return {
                'credited_name': artist.split(',')[0],
                'artist_name': artist.split(',')[0],
                'artist_mbid': '',
                'joinphrase': ', '
            };
        });
        list[list.length - 1]['joinphrase'] = '';
        return list
    }

    if (node.querySelectorAll('meta').length) {
        // https://schema.org/MusicRecording info available
        var schema = {};
        for (var item of node.querySelectorAll('meta')) {
            var attrs = item.attributes;
            schema[attrs.itemprop.value] = attrs.content.value;
        }
        // console.info('schema', schema);
        return {
            'number': parseInt(node.querySelectorAll('div.track-no')[0].textContent),
            'title': _clean(schema.name),
            'duration': node.querySelectorAll('div.track-time')[0].textContent,
            'artist_credit': _setTrackArtists(schema.byArtist),
            'performer': schema.byArtist,
            'composer': schema.creator,
            'url': node.querySelectorAll('div.track-text > a.fancy')[0].href
        };
    }
    console.log('no meta data on ', node);
    return;
}


// Insert links in page
function insertMBSection(release) {
    var mbUI = $('<div class="section musicbrainz"><h3>MusicBrainz</h3></div>');
    var mbContentBlock = $('<div class="section_content"></div>');
    mbUI.append(mbContentBlock);

    // Form parameters
    var parameters = MBImport.buildFormParameters(release, editNote);

    // Build form + search button
    var innerHTML = '<div id="mb_buttons">'
      + MBImport.buildFormHTML(parameters)
      + MBImport.buildSearchButton(release)
      + '</div>';
    mbContentBlock.append(innerHTML);

    $('#related').prepend(mbUI[0]);

    $('#mb_buttons').css({
      display: 'inline-block',
      width: '100%'
    });
    $('form.musicbrainz_import').css({width: '49%', display: 'inline-block'});
    $('form.musicbrainz_import_search').css({'float': 'right'})
    $('form.musicbrainz_import > button').css(
        {width: '100%', 'box-sizing': 'border-box'}
    );

    mbUI.slideDown();
}

var release = extract_release_data();
insertMBSection(release);
