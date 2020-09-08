/* global $ helper aliases edits sidebar requests GM_info */
'use strict';
// ==UserScript==
// @name         MusicBrainz edit: Add entity aliases in batch
// @namespace    mbz-loujine
// @author       loujine
// @version      2020.9.8
// @downloadURL  https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-edit-add_aliases.user.js
// @updateURL    https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-edit-add_aliases.user.js
// @supportURL   https://github.com/loujine/musicbrainz-scripts
// @icon         https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/icon.png
// @description  musicbrainz.org edit: Add entity aliases in batch
// @compatible   firefox+tampermonkey
// @license      MIT
// @require      https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mbz-loujine-common.js
// @include      http*://*musicbrainz.org/*/*/aliases*
// @exclude      http*://*musicbrainz.org/doc/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

const aliasType = helper.isArtistURL() ? aliases.artistType :
                  helper.isInstrumentURL() ? aliases.instrumentType : aliases.type;

function addRow() {
    document.querySelector('tbody tr:last-child').insertAdjacentHTML('afterend', `
        <tr class="newAlias">
          <td><input type="text" value=""></td>
          <td><input type="text" value=""
                     placeholder="leave empty to use the name"></td>
          <td></td>
          <td></td>
          <td>${aliasType}</td>
          <td>
            ${aliases.locale}
            <input type="checkbox">
            <span>primary</span>
          </td>
          <td><a href="#" class="deleteRow" style="color:red;">×</a></td>
    `);
    document.querySelector('a.deleteRow').addEventListener('click', evt => {
        evt.target.parentElement.parentElement.remove();
    });
}

function submitAliases() {
    for (const node of document.getElementsByClassName('newAlias')) {
        const cols = node.children,
            postData = {
                name: edits.encodeName(cols[0].children[0].value),
                sort_name: edits.encodeName(cols[1].children[0].value),
                type_id: cols[4].children[0].value,
                locale: cols[5].children[0].value,
                primary_for_locale: cols[5].children[1].checked ? 1 : 0,
                edit_note: sidebar.editNote(GM_info.script)
            };
        if (postData.sort_name === '') {
            postData.sort_name = postData.name;
        }
        cols[6].textContent = 'Sending edit data';
        console.info('Data ready to be posted: ', postData);
        function success(xhr) {
            cols[6].textContent = `Success (code ${xhr.status})`;
            cols[6].parentElement.style.color = 'green';
        }
        function fail(xhr) {
            cols[6].textContent = `Error (code ${xhr.status})`;
            cols[6].parentElement.style.color = 'red';
        }
        requests.POST(document.URL.replace('aliases', 'add-alias'),
                      edits.formatEdit('edit-alias', postData),
                      success, fail);
        node.classList.remove('newAlias');
    }
}

$(document).ready(function () {
    // doesn't work on translated pages
    for (const node of document.getElementById('content').getElementsByTagName('p')) {
        if (node.innerHTML.includes('has no aliases')) {
            node.innerHTML = `
                <table class="tbl">
                  <thead>
                    <tr>
                      <th>Alias</th>
                      <th>Sort name</th>
                      <th>Begin Date</th>
                      <th>End Date</th>
                      <th>Type</th>
                      <th>Locale</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr></tr>
                  </tbody>
                </table>`;
        }
    }
    document.getElementsByTagName('table')[0].insertAdjacentHTML('beforebegin', `
        <h3>Add aliases manually</h3>
        <input type="button" id="addRow" value="+ Add a new row">
        <input type="button" id="submitAliases" value="Submit new aliases">
    `);
    document.getElementById('addRow').addEventListener('click', addRow);
    document.getElementById('submitAliases').addEventListener('click', submitAliases);
    return false;
});
