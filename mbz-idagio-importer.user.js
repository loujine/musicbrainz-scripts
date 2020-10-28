/* global MBImport */
'use strict';
// ==UserScript==
// @name         Import Idagio releases to MusicBrainz
// @namespace    mbz-loujine
// @author       loujine
// @version      2020.10.27
// @supportURL   https://github.com/loujine/musicbrainz-scripts
// @icon         https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/icon.png
// @description  Add a button to import Idagio releases to MusicBrainz
// @compatible   firefox+tampermonkey
// @license      MIT
// @include      http*://app.idagio.com/albums/*
// @require      https://greasyfork.org/scripts/20955-mbimport/code/mbimport.js?version=863220
// @grant        none
// @run-at       document-end
// ==/UserScript==

const editNote = `Imported from ${document.URL}
Importer script in beta testing, please check carefully and report bugs
—
GM script: "${GM_info.script.name}" (${GM_info.script.version})
`;

/* Sort function for performers in the relesase artist list */
function comparefct(a, b) {
    const order = [
        'composer',
        'soloist',
        'ensemble',
        'conductor',
    ];
    if (a.type === b.type) { return 0; }
    if (!order.includes(a.type)) { return 1; }
    if (!order.includes(b.type)) { return -1; }
    return order.indexOf(a.type) > order.indexOf(b.type) ? 1 : -1;
}

function _clean(s) {
    return s
        // .replace(' In ', ' in ')
        // .replace('Minor', 'minor')
        // .replace('Major', 'major')
        // .replace('Op.', 'op. ')
        .replace(' op. ', ', op. ')
        .replace(/No\. /g, 'no. ')
        // .replace(/No\./g, 'no. ')
        // .replace('-Flat', '-flat')
        // .replace(' Flat', '-flat')
        .replace(' flat', '-flat')
        // .replace('-Sharp', '-sharp')
        // .replace(' Sharp', '-sharp')
        .replace(' sharp', '-sharp')
        // .replace('1. ', 'I. ')
        // .replace('2. ', 'II. ')
        // .replace('3. ', 'III. ')
        // .replace('4. ', 'IV. ')
        // .replace('5. ', 'V. ')
        // .replace('6. ', 'VI. ')
        // .replace('7. ', 'VII. ')
        // .replace('8. ', 'VIII. ')
        // .replace('9. ', 'IX. ')
        // .replace('10. ', 'X. ')
        // .replace(' - ', ': ')
        // .replace(' | ', ': ')
        .replace(' K ', ', K ')
        .replace(' KV ', ', K. ')
        .replace(' FWV ', ', FWV ')
        .replace(' Hob. ', ', Hob. ')
        .replace(' BWV ', ', BWV ')
        .replace(' S ', ', S. ');
}

function extract_release_data() {
    const albumMetadata = Object.values(window.__data__.entities.albums)[0];

    const labelCredit = albumMetadata.copyright;
    const labelCreditSplit = new RegExp(/\d+ (.*)/).exec(labelCredit);
    const releaseArtists = albumMetadata.participants.sort(comparefct).map(p => (
        {
            artist_name: p.name,
            joinphrase: p.type === 'composer' ? '; ' : ', ',
        }
    ));
    releaseArtists[releaseArtists.length -1].joinphrase = '';

    function _setAnnotation() {
        const tracks = albumMetadata.tracks.map(
            id => window.__data__.entities.tracks[id]
        ).map(track =>
            `
    title: ${window.__data__.entities.pieces[track.piece].title}
    performers: ${window.__data__.entities.recordings[track.recording].summary}
    place: ${JSON.stringify(window.__data__.entities.recordings[track.recording].location)}
    date: ${JSON.stringify(window.__data__.entities.recordings[track.recording].recordingDate)}`
        );

        return `From Idagio:
copyright: ${albumMetadata.copyright}
album cover: ${albumMetadata.imageUrl}
track metadata: ${tracks.join('\n')}
        `;
    }

    function _setTrackData(track) {
        const piece = window.__data__.entities.pieces[track.piece];
        const recording = window.__data__.entities.recordings[track.recording];
        let title = _clean(piece.title);
        if (piece.workpart) {
            const workpart = window.__data__.entities.workparts[piece.workpart];
            const mainTitle = window.__data__.entities.works[workpart.work].title;
            title = `${_clean(mainTitle)}: ${title}`;
        }
        const artistCredit = [];
        if (recording.soloists.length) {
            recording.soloists.map(
                soloist => window.__data__.entities.persons[soloist.person]
            ).map(
                person => artistCredit.push({
                    artist_name: person.name,
                    joinphrase: ', ',
                })
            );
        }
        if (recording.ensembles.length) {
            recording.ensembles.map(
                id => window.__data__.entities.ensembles[id]
            ).map(
                ensemble => artistCredit.push({
                    artist_name: ensemble.name,
                    joinphrase: ', ',
                })
            );
        }
        if (recording.conductor) {
            artistCredit.push({
                artist_name: window.__data__.entities.persons[recording.conductor].name,
                joinphrase: ', ',
            });
        }
        artistCredit[artistCredit.length -1].joinphrase = '';

        return ({
            number: track.position,
            title: title,
            duration: track.duration * 1000,
            artist_credit: artistCredit,
        });
    }

    const tracks = albumMetadata.tracks.map(
        id => window.__data__.entities.tracks[id]
    ).map(_setTrackData);

    return {
        title: albumMetadata.title,
        barcode: albumMetadata.upc,
        artist_credit: releaseArtists,
        type: 'Album',
        status: 'Official',
        script: 'Latn',
        year: albumMetadata.publishDate.split('-')[0],
        month: albumMetadata.publishDate.split('-')[1],
        day: albumMetadata.publishDate.split('-')[2],
        labels: [{
            name: labelCreditSplit[1],
        }],
        urls: [{
            url: document.URL,
            link_type: 980,
        }],
        discs: [{
            format: 'Digital Media',
            tracks: tracks,
        }],
        packaging: 'None',
        annotation: _setAnnotation(),
    };
}

// Insert links in page
function insertMBSection(release) {
    // Form parameters
    const parameters = MBImport.buildFormParameters(release, editNote);

    document.querySelector('#app-content').insertAdjacentHTML('afterbegin', `
      <div class="section musicbrainz">MusicBrainz
        <div class="section_content">
          <div id="mb_buttons">
          ${MBImport.buildFormHTML(parameters)}
          ${MBImport.buildSearchButton(release)}
          </div>
        </div>
      </div>
    `);
}

try {
    setTimeout(() => {
        const release = extract_release_data();
        console.log(release);
        insertMBSection(release);
    }, 3000);
} catch (e) {
    console.log(e);
    throw e;
}
