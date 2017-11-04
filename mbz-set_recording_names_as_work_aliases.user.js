/* global $ helper edits sidebar GM_info */
'use strict';
// ==UserScript==
// @name         MusicBrainz: Set recording names as work aliases
// @namespace    mbz-loujine
// @author       loujine
// @version      2017.10.26
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-set_recording_names_as_work_aliases.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-set_recording_names_as_work_aliases.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Set recording names as work aliases
// @compatible   firefox+greasemonkey
// @license      MIT
// @require      https://greasyfork.org/scripts/13747-mbz-loujine-common/code/mbz-loujine-common.js?version=226403
// @include      http*://*musicbrainz.org/work/*/aliases
// @grant        none
// @run-at       document-end
// ==/UserScript==

function loadRecordings() {
    fetch(
        `/ws/2/work/${helper.mbidFromURL()}?fmt=json&inc=recording-rels`
    ).then(
        resp => resp.json()
    ).then(
        json => {
            const existingAliases = $('tbody tr').find('td:first bdi')
                .toArray().map(node => node.textContent);
            const names = new Set(json.relations.map(
                rel => rel.recording.title));
            for (const name of names) {
                if (!existingAliases.includes(name)) {
                    $('#recordingAliases').append(
                        $('<div>').append(
                            $(`<input type="checkbox" data-name="${name}">`)
                        ).append(
                            $(`<span>${name}</span>`)
                        )
                    )
                }
            }
        }
    );
}


function submitRecordingsAliases() {
    $('#recordingAliases input:checked').each(function (idx, node) {
        const postData = {
            name: node.dataset.name,
            sort_name: node.dataset.name,
            type_id: 1,
            edit_note: sidebar.editNote(GM_info.script)
        };
        $(node.parentElement).append('<span>');
        const $editNode = $(node.parentElement).find(':last');
        $editNode.text(' → Sending edit data');
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
            $editNode.text(
                ` → Success (code ${resp.status})`
            ).parent().css('color', 'green');
        }).catch(error => {
            $editNode.text(
                ` → Error (code ${error.status})`
            ).parent().css('color', 'red');
        });
    });
}


$(document).ready(function () {
    $('table:nth(0)').after(
        $('<input>', {
            id: 'submitRecordingsAliases',
            type: 'button',
            value: 'submit recording names as new aliases'
        })
    ).after(
        $('<div id="recordingAliases"></div>')
    ).after(
        $('<h3>Add aliases from recordings</h3>')
    );
    loadRecordings();
    $('#submitRecordingsAliases').click(submitRecordingsAliases);
    return false;
});
