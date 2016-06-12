/* global $ _ */
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
var months = {'Apr.': 4}
var labels = {
    'www.deutschegrammophon.com' : {
        'name': 'Deutsche Grammophon',
        'mbid': '5a584032-dcef-41bb-9f8b-19540116fb1c',
        'catno': document.URL.split('/')[5]
    },
    'www.deccaclassics.com' : {
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

    function _setReleaseArtists() {
        var composer = document.getElementsByTagName('h4')[0].textContent;
        var performers = $('div.artists')[0].textContent; // FIXME not artists.hier*
        return [{
            'credited_name': composer,
            'artist_name': composer,
            'artist_mbid': '',
            'joinphrase': '; '
        }, {
            'credited_name': performers,
            'artist_name':  performers,
            'artist_mbid': '',
            'joinphrase': ''
        }]
    }

    var date = document.getElementsByClassName('date')[0].textContent;
    date = date.replace('Int. Release ', '').split(' ');
    var discs = [];
    var tracklist_nodes = document.getElementById('tracklist');

    if ($('div.item').length) {
        var nb_discs = $('div.item').length;
        console.info(nb_discs + ' media');
        console.warn('not ready yet');

    } else {
        console.info('1 medium');
        discs.push(extract_medium_data(tracklist_nodes));
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



function extract_medium_data(node) {
    var tracks = [],
        title;
    if (node.querySelectorAll('div.track-container').length) {
        console.info('track-container available');
        for (var track of node.querySelectorAll('div.track-container')) {
            tracks.push(extract_track_data(track));
        };
    } else {
        console.info('track-container not available');
        console.warn('not ready yet');
    }
    console.log('track list', tracks);
    if (node.querySelectorAll('div.item').length) {
        title = node.querySelectorAll('div.item')[0].textContent
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
            'artist_credit': [{
                'credited_name': schema.byArtist,
                'artist_name': schema.byArtist,
                'artist_mbid': '',
                'joinphrase': ''
            }],
            'performer': schema.byArtist,
            'composer': schema.creator,
            'url': node.querySelectorAll('div.track-text > a.fancy')[0].href
        };
    } else {
        console.log('no meta data on ', node);
        return;
    }
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
    $('form.musicbrainz_import').css({width: '49%', display:'inline-block'});
    $('form.musicbrainz_import_search').css({'float': 'right'})
    $('form.musicbrainz_import > button').css({width: '100%', 'box-sizing': 'border-box'});

    mbUI.slideDown();
}

var release = extract_release_data();
insertMBSection(release);
