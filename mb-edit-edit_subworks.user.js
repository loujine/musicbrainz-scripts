/* global $ relEditor requests edits server sidebar helper GM_info */
'use strict';
// ==UserScript==
// @name         MusicBrainz edit: Replace subwork titles and attributes in Work edit page
// @namespace    mbz-loujine
// @author       loujine
// @version      2019.9.22
// @downloadURL  https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-edit-edit_subworks.user.js
// @updateURL    https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-edit-edit_subworks.user.js
// @supportURL   https://github.com/loujine/musicbrainz-scripts
// @icon         https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/icon.png
// @description  musicbrainz.org edit: replace subwork titles/attributes in Work edit page
// @compatible   firefox+tampermonkey
// @license      MIT
// @require      https://greasyfork.org/scripts/13747-mbz-loujine-common/code/mbz-loujine-common.js?version=241520
// @include      http*://*musicbrainz.org/work/*/edit
// @exclude      http*://*musicbrainz.org/work/*/alias/*/edit
// @grant        none
// @run-at       document-end
// ==/UserScript==

function replaceSubworksTitles() {
    var idx = 0;
    $('table label:contains("parts:")').parents('tr')
            .find('a[href*="/work/"]').each(function (_idx, node) {
        var searchExp = document.getElementById('search').value;
        var replaceExp = document.getElementById('replace').value;
        if (!searchExp || searchExp === replaceExp) {
            return;
        }
        var name = searchExp.match(/^\/.+\/[gi]*$/) ?
            node.textContent.replace(eval(searchExp), replaceExp) :
            node.textContent.split(searchExp).join(replaceExp);
        if (name === node.textContent) {
            $(node).after('<span>nothing to replace</span>');
            return;
        }
        var mbid = helper.mbidFromURL(node.href);

        function success(xhr) {
            var $status = $('#replace' + _idx);
            $status.parent().css('color', 'green');
            var editId = new RegExp(
                '/edit/(\\d+)">edit</a>'
            ).exec(xhr.responseText)[1];
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
            var postData = edits.prepareEdit(editData);
            postData.edit_note = sidebar.editNote(GM_info.script);
            console.info('Data ready to be posted: ', postData);
            requests.POST(edits.urlFromMbid('work', mbid),
                          edits.formatEdit('edit-work', postData),
                          success, fail);
        }
        setTimeout(function () {
            $(node).after('<span id="replace' + _idx + '">' +
                          'Fetching required data</span>');
            edits.getWorkEditParams(helper.wsUrl('work', [], mbid), callback);
        }, 2 * idx * server.timeout);
        idx += 1;
    });
}


function setSubworksAttributes(attrIdx) {
    $('table label:contains("parts:")').parents('tr').find('button[class*="edit-item"]').each(function (_idx, node) {
        node.click();
        $('.attribute-container input')[attrIdx].click();
        $('.rel-editor-dialog button.positive').click();
    });
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
        <input type="text" id="search" value="" placeholder="Searched string or regexp">
        <input type="text" id="replace" value="" placeholder="Replacing string">
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
    $('#search').keydown(function () {
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
