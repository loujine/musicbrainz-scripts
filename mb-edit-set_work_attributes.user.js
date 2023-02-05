/* global $ requests server works sidebar edits helper */
'use strict';
// ==UserScript==
// @name         MusicBrainz edit: Set work attributes from the composer Work page
// @namespace    mbz-loujine
// @author       loujine
// @version      2023.2.4
// @downloadURL  https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-edit-set_work_attributes.user.js
// @updateURL    https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-edit-set_work_attributes.user.js
// @supportURL   https://github.com/loujine/musicbrainz-scripts
// @icon         https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/icon.png
// @description  musicbrainz.org: Set attributes (type, lang, key) from the composer Work page
// @compatible   firefox+tampermonkey
// @license      MIT
// @require      https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mbz-loujine-common.js
// @include      http*://*musicbrainz.org/artist/*/works
// @include      http*://*musicbrainz.org/artist/*/works?page=*
// @grant        none
// @run-at       document-end
// ==/UserScript==

const $rows = $('table.tbl tr:gt(0)');
const idxType = $('table.tbl th:contains("Type")').index();
const idxLang = $('table.tbl th:contains("Language")').index();
const idxKey = $('table.tbl th:contains("Attributes")').index();

$rows.each(function (idx, row) {
    const mbid = $(row).find('a[href*="/work/"]').attr('href').split('/')[2];
    const title = $(row).find('a[href*="/work/"]')[0].text;
    if (!row.children[idxType].textContent.trim()) {
        $(row.children[idxType]).append($('<form>')
                                .append($(works.type).clone()));
    }
    if (!row.children[idxLang].textContent.trim()) {
        $(row.children[idxLang]).append($('<form>')
                                .append($(works.lang).clone()));
    }
    if (!row.children[idxKey].textContent.trim()) {
        $(row.children[idxKey]).append($('<form>')
                               .append($(works.key).clone()));
        if (title.toLowerCase().includes('major') ||
            title.toLowerCase().includes('minor')) {
            const cell = row.children[idxKey];
            $(cell).find('option').each(function (idx, option) {
                if (title.toLowerCase().includes(option.text.toLowerCase())) {
                    option.selected = true;
                }
            });
        }
    }
    const $button = $('<input>', {
        'id': 'edit-' + mbid,
        'class': 'commit',
        'type': 'checkbox',
    });
    const $td = $('<td></td>').append($button);
    $(row).append($td);
});


function updateFromPage(editData, node) {
    const row = $(node).parents('tr')[0];

    const type = $(row.children[idxType]).find('select');
    const optionType = type.length ? type[0].value : null;
    if (optionType) {
        editData.type_id = optionType;
    }

    const lang = $(row.children[idxLang]).find('select');
    const optionLang = lang.length ? lang[0].selectedOptions[0].text : null;
    if (optionLang) {
        editData.languages = [optionLang];
    }

    const key = $(row.children[idxKey]).find('select');
    const optionKey = key.length ? key[0].value : null;
    if (optionKey) {
        const keyAttribute = {'type_id': 1, 'value': parseInt(optionKey)};
        editData.attributes.push(keyAttribute);
    }
    return editData;
}


function editWork() {
    $('.commit:input:checked:enabled').each(function (idx, node) {
        const mbid = node.id.replace('edit-', '');
        const url = edits.urlFromMbid('work', mbid);
        function success(xhr) {
            const $status = $('#' + node.id + '-text');
            node.disabled = true;
            $status.text(
                'Success (code ' + xhr.status + ')'
            ).parent().css('color', 'green');
            const editId = new RegExp(
                '/edit/(\\d+)">edit</a>'
            ).exec(xhr.responseText)[1];
            $status.after(
                $('<p>').append(
                    '<a href="/edit/' + editId + '" target="_blank">edit ' + editId + '</a>'
                )
            );
        }
        function fail(xhr) {
            $('#' + node.id + '-text').text(
                'Error (code ' + xhr.status + ')'
            ).parent().css('color', 'red');
        }
        function callback(editData) {
            $('#' + node.id + '-text').text('Sending edit data');
            const postData = edits.prepareEdit(updateFromPage(editData, node));
            postData.edit_note = $('#batch_replace_edit_note')[0].value;
            console.info('Data ready to be posted: ', postData);
            requests.POST(
                url,
                edits.formatEdit('edit-work', postData),
                success,
                fail
            );
        }
        setTimeout(function () {
            $('#' + node.id + '-text').empty();
            $(node).after('<span id="' + node.id + '-text">' +
                          'Fetching required data</span>');
            edits.getWorkEditParams(url, callback);
        }, 2 * idx * server.timeout);
    });
}


(function displaySidebar() {
    if (!helper.isUserLoggedIn()) {
        return;
    }
    sidebar.container().insertAdjacentHTML('beforeend', `
        <h3>Edit works</h3>
        <p>Edit note:</p>
        <textarea id="batch_replace_edit_note"
                  cols="20" rows="7">${sidebar.editNote(GM_info.script)}</textarea>
        <input type="button" id="batch_edit" value="Edit selected works">
    `);
})();

$(document).ready(function () {
    if (!helper.isUserLoggedIn()) {
        return false;
    }
    document.getElementById('batch_edit').addEventListener('click', editWork);
    return false;
});
