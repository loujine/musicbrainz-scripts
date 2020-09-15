/* global $ helper edits sidebar */
'use strict';
// ==UserScript==
// @name         MusicBrainz edit: Set recording names as work aliases
// @namespace    mbz-loujine
// @author       loujine
// @version      2020.9.14
// @downloadURL  https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-edit-set_work_aliases.user.js
// @updateURL    https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-edit-set_work_aliases.user.js
// @supportURL   https://github.com/loujine/musicbrainz-scripts
// @icon         https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/icon.png
// @description  musicbrainz.org: Set recording names as work aliases
// @compatible   firefox+tampermonkey
// @license      MIT
// @require      https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mbz-loujine-common.js
// @include      http*://*musicbrainz.org/work/*/aliases
// @grant        none
// @run-at       document-end
// ==/UserScript==

function loadRecordings() {
    fetch(
        `/ws/2/work/${helper.mbidFromURL()}?fmt=json&inc=recording-rels`
    ).then(resp => resp.json()).then(
        data => {
            const existingAliases = Array.prototype.map.call(
                document.querySelectorAll('tbody tr bdi'),
                node => node.textContent
            );
            const names = Array.from(
                new Set(data.relations.map(rel => rel.recording.title).filter(
                    name => !existingAliases.includes(name))
                )
            ).sort();
            for (const name of new Set(names)) {
                document.getElementById('recordingAliases').insertAdjacentHTML('beforeend', `
                    <div>
                      <input type="checkbox" data-name="${encodeURIComponent(name)}">
                      <span>${name}</span>
                    </div>
                `)
            }
        }
    );
}


function submitRecordingsAliases() {
    document.querySelectorAll('#recordingAliases input:checked').forEach(node => {
        const postData = {
            name: node.dataset.name,
            sort_name: node.dataset.name,
            type_id: 1,
            edit_note: sidebar.editNote(GM_info.script)
        };
        node.parentElement.insertAdjacentHTML('beforeend', '<span></span>');
        const editNode = node.parentElement.children[2];
        editNode.textContent = ' → Sending edit data';
        console.info('Data ready to be posted: ', postData);

        fetch(document.URL.replace('aliases', 'add-alias'), {
            method: 'post',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: edits.formatEdit('edit-alias', postData),
        }).then(resp => {
            if (!resp.ok) {
                throw Error(resp.statusText);
            }
            node.disabled = true;
            editNode.textContent = ` → Success (code ${resp.status})`;
            node.parentElement.style.color = 'green';
        }).catch(error => {
            editNode.textContent = ` → Error (code ${error.status})`;
            node.parentElement.style.color = 'red';
        });
    });
}


$(document).ready(function () {
    document.getElementsByTagName('table')[0].insertAdjacentHTML('afterend', `
        <h3>Add aliases from recordings</h3>
        <div id="recordingAliases"></div>
        <input type="button" id="submitRecordingsAliases"
               value="Submit recording names as new aliases">
    `);
    loadRecordings();
    document.getElementById('submitRecordingsAliases').addEventListener(
        'click', submitRecordingsAliases);
    return false;
});
