/* global $ relEditor requests edits server sidebar helper */
'use strict';
// ==UserScript==
// @name         MusicBrainz edit: Replace subwork titles and attributes in Work edit page
// @namespace    mbz-loujine
// @author       loujine
// @version      2023.2.4
// @downloadURL  https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-edit-edit_subworks.user.js
// @updateURL    https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-edit-edit_subworks.user.js
// @supportURL   https://github.com/loujine/musicbrainz-scripts
// @icon         https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/icon.png
// @description  musicbrainz.org edit: Replace subwork titles/attributes in Work edit page
// @compatible   firefox+tampermonkey
// @license      MIT
// @require      https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mbz-loujine-common.js
// @include      http*://*musicbrainz.org/work/*/edit
// @exclude      http*://*musicbrainz.org/work/*/alias/*/edit
// @grant        none
// @run-at       document-end
// ==/UserScript==

function replaceSubworksTitles() {
    let idx = 0;
    $('table label:contains("parts:")').parents('tr')
            .find('a[href*="/work/"]').each(function (_idx, node) {
        const searchExp = document.getElementById('subwork-regexp-search').value;
        const replaceExp = document.getElementById('subwork-regexp-replace').value;
        if (!searchExp || searchExp === replaceExp) {
            return;
        }
        const name = searchExp.match(/^\/.+\/[gi]*$/) ?
            node.textContent.replace(eval(searchExp), replaceExp) : // eslint-disable-line no-eval
            node.textContent.split(searchExp).join(replaceExp);
        if (name === node.textContent) {
            $(node).after('<span>nothing to replace</span>');
            return;
        }
        const mbid = helper.mbidFromURL(node.href);
        const url = edits.urlFromMbid('work', mbid);

        function success(xhr) {
            const $status = $('#replace' + _idx);
            const rx = new RegExp(
                '/edit/(\\d+)">edit</a>'
            ).exec(xhr.responseText);
            if (rx === null) {
                // usually means the POST was accepted but nothing was changed
                // i.e. the attributes names are wrong
                $status.text(
                    'Edit was probably not applied, please check'
                ).parent().css('color', 'red');
                return;
            }
            const editId = rx[1];
            $status.parent().css('color', 'green');
            $status.after(
                $('<p>').append(
                    '<a href="/edit/' + editId + '" target="_blank">edit ' + editId + '</a>'
                )
            )
        }
        function fail(xhr) {
            $('#replace' + _idx).text(
                'Error (code ' + xhr.status + ')'
            ).parent().css('color', 'red');
        }
        function callback(editData) {
            $('#replace' + _idx).text('Sending edit data');
            editData.name = name;
            $('#replace' + _idx).text(' replaced by ' + name);
            const postData = edits.prepareEdit(editData);
            postData.edit_note = sidebar.editNote(GM_info.script);
            console.info('Data ready to be posted: ', postData);
            requests.POST(
                url,
                edits.formatEdit('edit-work', postData),
                success,
                fail
            );
        }
        setTimeout(function () {
            $(node).after('<span id="replace' + _idx + '">' +
                          'Fetching required data</span>');
            edits.getWorkEditParams(url, callback);
        }, 2 * idx * server.timeout);
        idx += 1;
    });
}


function setSubworksAttributes(attrIdx) {
    $('table label:contains("parts:")').parents('tr').find('button[class*="edit-item"]').each(
        function (_idx, node) {
            node.click();
            $('.attribute-container input')[attrIdx].click();
            $('.rel-editor-dialog button.positive').click();
        }
    );
}


(function displayToolbar() {
    document.getElementsByClassName('half-width')[0].insertAdjacentHTML(
        'afterend', '<div id="side-col" style="float: right;"></div>');
    relEditor.container(document.getElementById('side-col')).insertAdjacentHTML(
        'beforeend', `
        <h3>Replace subworks titles</h3>
        <p>
          Search for a string or regular expression (e.g. /sonata Op.(.+)/i).
          Replace with a string that can call groups from the search regexp ($1, $2...).
        </p>
        <input type="text" id="subwork-regexp-search" value=""
               placeholder="Searched string or regexp">
        <input type="text" id="subwork-regexp-replace" value="" placeholder="Replacing string">
        <input type="button" id="replaceTitles" value="Apply" disabled="True">

        <h3>Set subworks attributes</h3>
        <select id="subwork_attribute">
          <option value=""></option>
          <option value=0>act</option>
          <option value=1>movement</option>
          <option value=2>number</option>
          <option value=3>part of collection</option>
        </select>
        <input type="button" id="setSubworksAttributes" value="Set attribute on all subworks">

    `);
    document.getElementById('loujine-menu').style.marginLeft = '550px';
})();


$(document).ready(function () {
    $('#subwork-regexp-search').keydown(function () {
        $('#replaceTitles').prop('disabled', false);
    });
    document.getElementById('replaceTitles').addEventListener('click', () => {
        replaceSubworksTitles();
    });
    document.getElementById('setSubworksAttributes').addEventListener('click', () => {
        setSubworksAttributes($('select#subwork_attribute')[0].value);
        document.getElementById('id-edit-work.edit_note')
            .value = sidebar.editNote(GM_info.script, 'Set subworks attributes');
    });
    return false;
});
