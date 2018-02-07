/* global $ MBImport GM_info */
'use strict';
// ==UserScript==
// @name         Import Hyperion/Helios releases to MusicBrainz
// @namespace    mbz-loujine
// @author       loujine
// @version      2018.2.5
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mb-importer-hyperion.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mb-importer-hyperion.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  Add a button to import Hyperion/Helios releases to MusicBrainz
// @compatible   firefox+tampermonkey
// @license      MIT
// @require      https://greasyfork.org/scripts/20955-mbimport/code/mbimport.js?version=133752
// @include      http*://www.hyperion-records.co.uk/dc.asp?dc=D_*
// @grant        none
// @run-at       document-end
// ==/UserScript==

const catno = document.URL.split('/')[3].replace('dc.asp?dc=D_', '');

const labels = {
    'CDH': {
        'name': 'hyperion',
        'mbid': '08e6c3c8-81ab-405f-9cff-10f6b8db064c',
        'catno': catno,
    },
    'CDA': {
        'name': 'helios',
        'mbid': '0a94e96a-9219-4dd7-a529-18d34e77f50f',
        'catno': catno,
    },
    'SIG': {
        'name': 'Signum Classics',
        'mbid': '79c26ea5-2313-4d53-84d9-b04219620c5f',
        'catno': catno,
    },
}

var editNote = ('Imported from '
                + document.URL
                + '\n —\n'
                + 'GM script: "' + GM_info.script.name
                + '" (' + GM_info.script.version + ')\n\n');

function _clean(s) {
    return s
        .replace(' In ', ' in ')
        .replace('Minor', 'minor')
        .replace('Major', 'major')
        .replace('Op ', 'op. ')
        .replace('No ', 'no. ')
        .replace(' Flat', '-flat')
        .replace(' flat', '-flat')
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

function extract_track_data(node) {
    let title;
    let work = node.querySelector('.hyp-worktitle a');
    if (work != null) {
        title = work.textContent;
    } else {
        // title = $(node).prev('.hyp-worktitle a')
        title = node.querySelector('.hyp-subworktitle a').textContent;
    }
    return {
        'number': parseInt(node.querySelector('.hyp-td-trackno a').textContent),
        'title': _clean(title),
        'duration': node.querySelector('.hyp-tracktime').textContent.slice(1,-1).replace("'", ':'),
    };
}

function extract_release_data() {
    function _setReleasePerformers() {
        const list = Array.prototype.map.call(
            document.querySelectorAll('h5.hyp-headlineartists a'),
            node => ({
                'credited_name': node.textContent,
                'artist_name': node.textContent,
                'artist_mbid': '',
                'joinphrase': ', '
            })
        );
        list[list.length - 1].joinphrase = '';
        return list;
    }

    function _setReleaseArtists() {
        let composer = document.querySelector('div.hyp-albumdetail h4');
        composer = composer ? composer.textContent : '';
        const list = [{
            'credited_name': composer,
            'artist_name': composer,
            'artist_mbid': '',
            'joinphrase': '; '
        }];
        return list.concat(_setReleasePerformers());
    }

    const tracks = Array.prototype.map.call(
        Array.prototype.filter.call(
            document.querySelectorAll(`.dc-d_${catno.toLowerCase()}`),
            node => node.classList.length > 2),
        extract_track_data
    );

    // push last medium
    const discs = [{
        'title': '',
        'format': 'CD',
        'tracks': tracks,
    }];

    return {
        'title': document.querySelector('h3.hyp-title').textContent,
        'artist_credit': _setReleaseArtists(),
        'type': 'Album',
        'status': 'Official',
        'language': 'eng',
        'script': 'Latn',
        'packaging': '',
        'country': '',
        'labels': [labels[catno.slice(0,3)]],
        'urls': [{
            'link_type': 288, // 'discography'
            'url': document.URL
        }],
        'discs': discs
    };
}

// Insert links in page
function insertMBSection(release) {
    var mbUI = $('<div class="section musicbrainz"></div>');
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

    $('div.hyp-buttongridcontainer').append(mbUI[0]);

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
    setTimeout(() => {
        var release = extract_release_data();
        console.info(release);
        insertMBSection(release);
    }, 1000);
} catch (e) {
    console.log(e);
    throw e;
}
