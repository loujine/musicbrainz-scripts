/* global $ MBImport */
'use strict';
// ==UserScript==
// @name         Import Hyperion/Helios releases to MusicBrainz
// @namespace    mbz-loujine
// @author       loujine
// @version      2021.4.10
// @downloadURL  https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-importer-hyperion.user.js
// @updateURL    https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-importer-hyperion.user.js
// @supportURL   https://github.com/loujine/musicbrainz-scripts
// @icon         https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/icon.png
// @description  Add a button to import Hyperion/Helios releases to MusicBrainz
// @compatible   firefox+tampermonkey
// @license      MIT
// @require      https://raw.githubusercontent.com/murdos/musicbrainz-userscripts/master/lib/mbimport.js
// @include      http*://www.hyperion-records.co.uk/dc.asp?dc=D_*
// @include      http*://www.hyperion-records.co.uk/al.asp?al=*
// @grant        none
// @run-at       document-end
// ==/UserScript==

const catno = document.URL.split('/')[3].replace('dc.asp?dc=D_', '')
                                        .replace('al.asp?al=', '');

const months = {
    'January': 1, 'February': 2, 'March': 3, 'April': 4,
    'May': 5, 'June': 6, 'July': 7, 'August': 8,
    'September': 9, 'October': 10, 'November': 11, 'December': 12
};

const labels = {
    'SAC': {
        'name': 'hyperion',
        'mbid': '08e6c3c8-81ab-405f-9cff-10f6b8db064c',
        'catno': catno,
    },
    'CDA': {
        'name': 'hyperion',
        'mbid': '08e6c3c8-81ab-405f-9cff-10f6b8db064c',
        'catno': catno,
    },
    'CDH': {
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

const editNote = `Imported from ${document.URL}\n—\n` +
    `GM script: "${GM_info.script.name}" (${GM_info.script.version})\n\n`;

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
    const work = node.querySelector('.hyp-worktitle a');
    if (work !== null) {
        title = work.textContent;
    } else {
        title = $(node).prevAll('tr:has(.hyp-work)').first().find('.hyp-worktitle a').text();
        title += ': ';
        title += node.querySelector('.hyp-subworktitle a').textContent;
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
        composer = composer ? composer.textContent.split(' (')[0] : '';
        const list = [{
            'credited_name': composer,
            'artist_name': composer,
            'artist_mbid': '',
            'joinphrase': '; '
        }];
        return list.concat(_setReleasePerformers());
    }

    let discsNb = document.querySelector('.hyp-notice-album') && new RegExp(
        /(\d*)CDs/
    ).exec(document.querySelector('.hyp-notice-album').textContent);
    discsNb = discsNb === null ? 1 : parseInt(discsNb[1]);

    const trackNodes = Array.prototype.filter.call(
        document.querySelectorAll(`.dc-d_${catno.toLowerCase()},
                                   .dc-d_${catno.toLowerCase()}_${discsNb}`),
        node => node.classList.length > 2
    );

    const discTracks = [];
    if (discsNb === 1) {
        discTracks.push(trackNodes);
    } else {
        for (const node of trackNodes) {
            if (node.children[0].children[0].textContent.startsWith('CD')) {
                discTracks.push([]);
            }
            discTracks[discTracks.length - 1].push(node);
        }
    }

    const discs = discTracks.map(tracks => ({
        'title': '',
        'format': 'CD',
        'tracks': tracks.map(extract_track_data),
    }));

    let year;
    let month;
    let day;
    const release_info = document.querySelector('div.panel-body.hyp-anorak').textContent;
    const release_date = new RegExp(/Release date: (\d*) *(\w*) (\d*)\n/).exec(release_info);
    if (release_date) {
        year = release_date[3];
        month = months[release_date[2]];
        day = release_date[1];
    }

    return {
        'title': document.querySelector('h3.hyp-title').textContent,
        'artist_credit': _setReleaseArtists(),
        'type': 'Album',
        'status': 'Official',
        'language': 'eng',
        'script': 'Latn',
        'packaging': '',
        'country': 'GB',
        'year': year,
        'month': month,
        'day': day,
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
    const mbUI = $('<div class="section musicbrainz"></div>');
    const mbContentBlock = $('<div class="section_content"></div>');
    mbUI.append(mbContentBlock);

    // Form parameters
    const parameters = MBImport.buildFormParameters(release, editNote);

    // Build form + search button
    const innerHTML = '<div id="mb_buttons">'
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
        const release = extract_release_data();
        console.info(release);
        insertMBSection(release);
    }, 1000);
} catch (e) {
    console.log(e);
    throw e;
}
