/* global $ jQuery GM_info MBImport */
'use strict';
// ==UserScript==
// @name         Import Naxos Music Library releases to MusicBrainz
// @namespace    mbz-loujine
// @author       loujine
// @version      2017.11.1
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/mbz-naxos_library_importer.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/mbz-naxos_library_importer.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  Add a button to import Naxos Music Library releases to MusicBrainz
// @compatible   firefox+greasemonkey
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @include      http*://*.naxosmusiclibrary.com/catalogue/item.asp*
// @require      https://greasyfork.org/scripts/20955-mbimport/code/mbimport.js?version=228700
// @grant        none
// @run-at       document-end
// ==/UserScript==

// seems that $ is predefined but does not work
$ = jQuery;

var url = document.URL.split('.');
url.splice(0, 1, 'https://www');
var editNote = ('Imported from ' + url + '\n'
                + 'Warning: Track durations from Naxos Music Library can seldom be incorrect\n'
                + '\n —\n'
                + 'GM script: "' + GM_info.script.name + '" (' + GM_info.script.version + ')\n\n');

var months = {
    'January': 1, 'February': 2, 'March': 3, 'April': 4,
    'May': 5, 'June': 6, 'July': 7, 'August': 8,
    'September': 9, 'October': 10, 'November': 11, 'December': 12
};

function _clean(s) {
    return s
        .replace(' In ', ' in ')
        .replace('Minor', 'minor')
        .replace('Major', 'major')
        .replace('Op.', 'op. ')
        .replace(/No\. /g, 'no. ')
        .replace(/No\./g, 'no. ')
        .replace('-Flat', '-flat')
        .replace(' Flat', '-flat')
        .replace(' flat', '-flat')
        .replace('-Sharp', '-sharp')
        .replace(' Sharp', '-sharp')
        .replace(' sharp', '-sharp')
        .replace('1. ', 'I. ')
        .replace('2. ', 'II. ')
        .replace('3. ', 'III. ')
        .replace('4. ', 'IV. ')
        .replace('5. ', 'V. ')
        .replace('6. ', 'VI. ')
        .replace('7. ', 'VII. ')
        .replace('8. ', 'VIII. ')
        .replace('9. ', 'IX. ')
        .replace('10. ', 'X. ')
        .replace(' - ', ': ')
        .replace(' | ', ': ')
        .replace('K.', 'K. ') // Mozart
        .replace('S.', 'S. ') // Liszt
    ;
}

function extract_release_data() {
    console.log('extract_release_data');

    function _setTitle() {
        return $('h2').text();
    }

    function _setReleasePerformers() {
        var artists = $('td#left-sidebar a[href*="/artist"]').toArray();
        var list = artists.map(function (artist) {
            return {
                'credited_name': artist.textContent,
                'artist_name': artist.textContent,
                'artist_mbid': '',
                'joinphrase': ', '
            };
        });
        list[list.length - 1].joinphrase = '';
        return list;
    }

    function _setReleaseArtists() {
        var composers = $('td#left-sidebar a[href*="/composer/"]').toArray();
        var list = composers.map(function (composer) {
            return {
                'credited_name': composer.textContent,
                'artist_name': composer.textContent,
                'artist_mbid': '',
                'joinphrase': ', '
            };
        });
        list[list.length - 1].joinphrase = '; ';
        return list.concat(_setReleasePerformers());
    }

    var date = $('td#left-sidebar b:contains("Release Date")').parent().text().trim();
    if (date) {
        date = date.split(': ')[1].split(' ').filter(function (i) {return i !== ""});
    }
    var label = $('td#left-sidebar b:contains("Label")').parent().text().trim();
    label = label.split(': ')[1];

    var $tracklist_node = $('td#mainbodycontent > table > tbody');

    var discs = [],
        tracks = [],
        medium_title = '';

    function extract_track_data(node, parentWork) {
        var numberfield = node.children[1].textContent;
        if (parseInt(numberfield) == 1) {
            // flush finished medium
            discs.push({
                'title': '', // nodes[0].title,
                'format': 'CD',
                'tracks': tracks
            });
            tracks = [];
        }
        var title = node.children[3].childNodes[0].textContent.trim();
        if (title === '') {
            title = node.children[3].childNodes[1].textContent.trim();
        }
        if (parentWork && title.trim().startsWith('»')) {
            title = parentWork + ': ' + title.replace('»', '');
        }
        return {
            'number': parseInt(numberfield),
            'title': _clean(title),
            'duration': node.children[5].textContent,
            'artist_credit': ''
        };
    }

    var parentWork;
    $tracklist_node.find('tbody > tr').each(function (idx, trnode) {
        if (trnode.children.length > 1) {
            if (trnode.children[1].innerHTML.replace('&nbsp;', '').trim() == '') {
                // work header
                parentWork = trnode.children[3].childNodes[1].textContent.trim();
            } else {
                var track = extract_track_data(trnode, parentWork);
                tracks.push(track);
            }
        }
    });

    // last medium
    discs.push({
        'title': '', // nodes[0].title,
        'format': 'CD',
        'tracks': tracks
    });
    // remove empty medium 0
    discs = discs.splice(1);

    return {
        'title': _setTitle(),
        'artist_credit': _setReleaseArtists(),
        'type': 'Album',
        'status': 'Official',
        'language': 'eng', // 'English',
        'script': 'Latn', // 'Latin',
        'packaging': '',
        'country': '',
        'year': date[2],
        'month': months[date[1]],
        'day': date[0],
        'labels': [{
            'name': label,
            'catno': document.URL.split('?cid=')[1]
        }],
        // 'barcode': document.URL.split('?cid=')[1],
        'urls': [],
        // 'urls': [{
        //     'link_type': 288, // 'discography'
        //     'url': document.URL
        // }],
        'discs': discs
    };
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

    $('td#left-sidebar').append(mbUI[0]);

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

try {
    var release = extract_release_data();
    // console.log(release);
    // console.log(JSON.stringify(release));
    insertMBSection(release);
} catch (e) {
    console.log(e);
    throw e;
}
