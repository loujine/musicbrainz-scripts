/* global $ helper sidebar */
'use strict';
// ==UserScript==
// @name         MusicBrainz recording: Seed concert event from recording
// @namespace    mbz-loujine
// @author       loujine
// @version      2020.9.22
// @downloadURL  https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-edit-seed_event_from_recording.user.js
// @updateURL    https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-edit-seed_event_from_recording.user.js
// @supportURL   https://github.com/loujine/musicbrainz-scripts
// @icon         https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/icon.png
// @description  musicbrainz recording: Seed a "Concert" event with the same content as the current recording
// @compatible   firefox+tampermonkey
// @license      MIT
// @require      https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mbz-loujine-common.js
// @include      http*://*musicbrainz.org/recording/*
// @exclude      http*://*musicbrainz.org/recording/merge*
// @exclude      http*://*musicbrainz.org/recording/*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

const editNote = `
 —
GM script: "${GM_info.script.name}" (${GM_info.script.version})

`;

const eventRelationships = {
    'place': 'e2c6f697-07dc-38b1-be0b-83d740165532',
    'performer': '936c7c95-3156-3889-a062-8a0cd57f8946',
    'recording': 'b06e6732-2603-47d3-8a49-9f589b430483',
}

function buildSetList() {
    const works = Array.from(
        document.querySelectorAll('div#content h2.related-works ~ h3 a[href*=work]')
    ).map(
        a => [a.href.split('/')[4], a.textContent]
    );
    const composers = Array.from(
        document.querySelectorAll('div#content h3 ~ table.details a[href*=artist]')
    ).filter(
        // ugly and works only on english pages
        el => el.closest('td').previousSibling.textContent == 'composer:'
    ).map(
        a => [a.href.split('/')[4], a.textContent]
    );

    const setList = [
        ...works.map(([mbid, name]) => `* [${mbid}|${name}]`),
        ...composers.map(([mbid, name]) => `@ [${mbid}|${name}]`),
    ].join('\n');
    return setList;
}

function buildEventData() {
    const eventData = {
        'name': document.querySelector('div#content h1 a').textContent,
        'type_id': 1,
        'setlist': buildSetList(),
        'edit_note': editNote,
    };
    const date = new RegExp(/\(on (.*)\)/).exec(
        document.querySelector('div#content table.details a[href*=place]').parentElement.textContent
    );
    if (date !== null) {
        const [year, month, day] = date[1].split('-');
        eventData['period.begin_date.year'] = eventData['period.end_date.year'] = year;
        eventData['period.begin_date.month'] = eventData['period.end_date.month'] = month;
        eventData['period.begin_date.day'] = eventData['period.end_date.day'] = day;
    }
    return eventData;
}

function buildRelData() {
    let idx = 0;
    const relData = {};
    const performers = Array.from(
        document.querySelectorAll('div#content h1+p.subheader a[href*=artist]')
    ).map(
        a => a.href.split('/')[4]
    );
    for (const performer of performers) {
        relData[`rels.${idx}.target`] = performer;
        relData[`rels.${idx}.type`] = eventRelationships.performer;
        idx += 1;
    }

    const places = Array.from(
        document.querySelectorAll('div#content table.details a[href*=place]')
    ).filter(
        el => el.closest('td').previousSibling.textContent == 'recorded at:'
    ).map(
        a => a.href.split('/')[4]
    );
    for (const place of places) {
        relData[`rels.${idx}.target`] = place;
        relData[`rels.${idx}.type`] = eventRelationships.place;
        idx += 1;
    }
    relData[`rels.${idx}.target`] = helper.mbidFromURL();
    relData[`rels.${idx}.type`] = eventRelationships.recording;
    return relData;
}

function seedConcert() {
    const eventData = buildEventData();
    const relData = buildRelData();
    const data = [
        ...Object.entries(eventData).map(
            ([prop, val]) => `edit-event.${prop}=${encodeURIComponent(val)}`
        ),
        ...Object.entries(relData).map(
            ([prop, val]) => `${prop}=${encodeURIComponent(val)}`
        ),
    ].join('&');
    window.open(`/event/create?${data}`);
}

(function main() {
    sidebar.container().insertAdjacentHTML('beforeend', `
        <h3>Seed concert</h3>
        <input type="button" id="createConcert" value="Create concert">
    `);
})();

$(document).ready(function () {
    document.getElementById('createConcert').addEventListener('click', () => {
        document.getElementById('createConcert').disabled = true;
        seedConcert();
    });
});
