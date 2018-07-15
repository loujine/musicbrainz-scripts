/* global $  */
'use strict';
// ==UserScript==
// @name         MusicBrainz event editor: Fill event setlist
// @namespace    mbz-loujine
// @author       loujine
// @version      2018.7.15
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mb-edit-fill_event_setlist.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mb-edit-fill_event_setlist.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org event editor: Fill event setlist
// @compatible   firefox+tampermonkey
// @license      MIT
// @include      http*://*musicbrainz.org/event/*/edit
// @include      https://musicbrainz.org/event/create
// @grant        none
// @run-at       document-end
// ==/UserScript==

$(document).ready(function() {
    const area = document.getElementById("id-edit-event.setlist");
    area.setAttribute('contextmenu', "popup-menu")
    area.insertAdjacentHTML('afterend', `
      <menu type="context" id="popup-menu">
        <menuitem label="Replace by artist MBID"></menuitem>
        <menuitem label="Replace by work MBID"></menuitem>
      </menu>
    `)

    area.contextMenu.children[0].addEventListener(
        'click',
        () => {
            const str = area.value.substring(area.selectionStart, area.selectionEnd);
            fetch(`/ws/2/artist?query=artist:${str}&limit=1&fmt=json`).then(
                resp => resp.json()
            ).then(
                resp => {
                    area.value = area.value.replace(
                        str, `@ [${resp.artists[0].id}|${resp.artists[0].name}]`
                    );
                }
            )
        }
    );

    area.contextMenu.children[1].addEventListener(
        'click',
        () => {
            const str = area.value.substring(area.selectionStart, area.selectionEnd);
            fetch(`/ws/2/work?query=work:${str}&limit=1&fmt=json`).then(
                resp => resp.json()
            ).then(
                resp => {
                    console.log(resp.works[0]);
                    area.value = area.value.replace(
                        str, `* [${resp.works[0].id}|${resp.works[0].title}]`
                    );
                }
            )
        }
    );
});
