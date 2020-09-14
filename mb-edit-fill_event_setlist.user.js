/* global $ GM_info sidebar relEditor */
'use strict';
// ==UserScript==
// @name         MusicBrainz event editor: Fill event setlist
// @namespace    mbz-loujine
// @author       loujine
// @version      2020.9.8
// @downloadURL  https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-edit-fill_event_setlist.user.js
// @updateURL    https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-edit-fill_event_setlist.user.js
// @supportURL   https://github.com/loujine/musicbrainz-scripts
// @icon         https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/icon.png
// @description  musicbrainz.org event editor: Fill event setlist
// @compatible   firefox+tampermonkey
// @license      MIT
// @require      https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mbz-loujine-common.js
// @include      http*://*musicbrainz.org/event/*/edit
// @include      http*://*musicbrainz.org/event/create*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function displayToolbar() {
    document.getElementsByClassName('half-width')[0].insertAdjacentHTML(
        'afterend', '<div id="side-col" style="float: right;"></div>');
    relEditor.container(document.getElementById('side-col')).insertAdjacentHTML(
        'beforeend', `
        <h3>Complete entity in setlist</h3>
        <p>Select text in the setlist box and click one of the buttons
           to add the right symbol and MBID</p>
        <input type="button" id="fillArtist" value="Fill artist MBID">
        <input type="button" id="fillWork" value="Fill work MBID">
    `);
    document.getElementById('loujine-menu').style.marginLeft = '550px';
})();

function fillEventSetlist(entityType) {
    const area = document.getElementById('id-edit-event.setlist');
    // document.getSelection() does not work on textarea
    const entity = area.value.substring(area.selectionStart, area.selectionEnd);
    fetch(`/ws/2/${entityType}?query=${entityType}:${entity}&limit=1&fmt=json`).then(
        resp => resp.json()
    ).then(
        resp => {
            const filledEntity = entityType === 'artist' ?
                `@ [${resp.artists[0].id}|${resp.artists[0].name}]` :
                `* [${resp.works[0].id}|${resp.works[0].title}]`;
            area.value = area.value.replace(`/${entity}/g`, filledEntity);
        }
    )
}

$(document).ready(function () {
    let appliedNote = false;
    document.getElementById('fillArtist').addEventListener('click',
        () => {
            fillEventSetlist('artist')
            if (!appliedNote) {
                document.getElementById('id-edit-event.edit_note')
                    .value = sidebar.editNote(GM_info.script);
                appliedNote = true;
            }
        }
    );
    document.getElementById('fillWork').addEventListener('click',
        () => {
            fillEventSetlist('work')
            if (!appliedNote) {
                document.getElementById('id-edit-event.edit_note')
                    .value = sidebar.editNote(GM_info.script);
                appliedNote = true;
            }
        }
    );
    return false;
});
