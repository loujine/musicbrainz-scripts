/* global $ requests relEditor GM_info sidebar */
'use strict';
// ==UserScript==
// @name         MusicBrainz event editor: Fill event setlist
// @namespace    mbz-loujine
// @author       loujine
// @version      2018.4.9
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mb-edit-create_event.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mb-edit-create_event.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org event editor: Fill event setlist
// @compatible   firefox+tampermonkey
// @license      MIT
// @require      https://greasyfork.org/scripts/13747-mbz-loujine-common/code/mbz-loujine-common.js?version=260222
// @include      http*://*musicbrainz.org/event/*/edit
// @grant        none
// @run-at       document-end
// ==/UserScript==

const MBID_REGEX = /\/(\w+)\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/;

function autoComplete() {
    var $input = $('input#lookupEntity');
    var match = $input.val().match(MBID_REGEX);
    if (match) {
        const entityType = match[1];
        const mbid = match[2];
        requests.GET(`/ws/2/${entityType}/${mbid}?fmt=json`, function (data) {
            data = JSON.parse(data);
            $input.data('entityType', entityType);
            $input.data('mbid', mbid);
            $input.val(data.title || data.name);
            $input.css('background', '#bbffbb');
        });
    } else {
        $input.css('background', '#ffaaaa');
    }
}


(function displayToolbar() {
    document.getElementsByClassName('half-width')[0].insertAdjacentHTML(
        'afterend', '<div id="side-col" style="float: right;"></div>');
    relEditor.container(document.getElementById('side-col')).insertAdjacentHTML(
        'beforeend', `
        <h3>Copy entity in setlist</h3>
        <input type="text" id="lookupEntity" placeholder="artist or work mbid">
        <input type="button" id="copyEntity" value="Copy entity">
    `);
})();


$(document).ready(function() {
    let appliedNote = false;
    $('input#lookupEntity').on('input', autoComplete);
    document.getElementById('copyEntity').addEventListener('click', () => {
        const entityType = $('input#lookupEntity').data('entityType');
        const mbid = $('input#lookupEntity').data('mbid');
        const name = document.getElementById('lookupEntity').value;
        let setlist = document.getElementById('id-edit-event.setlist').value;
        console.log(setlist);
        if (entityType === 'artist') {
            setlist += `\n@ [${mbid}|${name}]\n`;
        } else if (entityType === 'work') {
            setlist += `\n* [${mbid}|${name}]\n`;
        }
        document.getElementById('id-edit-event.setlist').value = setlist;
        if (!appliedNote) {
            document.getElementById('id-edit-event.edit_note')
                .value = sidebar.editNote(GM_info.script);
            appliedNote = true;
        }
    });
    return false;
});

