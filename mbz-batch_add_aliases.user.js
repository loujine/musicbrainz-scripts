/* global $ _ */
'use strict';
// ==UserScript==
// @name         MusicBrainz: Batch-add artist aliases
// @namespace    mbz-loujine
// @author       loujine
// @version      2017.3.7
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-batch_add_aliases.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-batch_add_aliases.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Batch-add artist aliases
// @compatible   firefox+greasemonkey
// @license      MIT
// @require      https://greasyfork.org/scripts/13747-mbz-loujine-common/code/mbz-loujine-common.js?version=179395
// @include      http*://*musicbrainz.org/artist/*/aliases
// @grant        none
// @run-at       document-end
// ==/UserScript==

function addRow() {
    $($('tbody')[0]).find('tr:last').before($('<tr>').append(
        $('<td><input value="" type="text"></td>')
    ).append(
        $('<td><input value="" type="text"></td>')
    ).append(
        $('<td></td>')
    ).append(
        $('<td></td>')
    ).append(
        $('<td>').append($(aliases.type).clone())
    ).append(
        $('<td>').append($(aliases.locale).clone())
    ).append(
        $('<td><input class="submitRow" value="Add alias" type="button"></td>')
    ));
    $('.submitRow').click(function () {
        var cols = $(this).parents('tr').children();
        var postData = {
            name: edits.encodeName(cols[0].children[0].value),
            sort_name: edits.encodeName(cols[1].children[0].value),
            type_id: cols[4].children[0].value,
            locale: cols[5].children[0].value,
            edit_note: sidebar.editNote(GM_info.script)
        };
        $(cols[6]).text('Sending edit data');
        console.info('Data ready to be posted: ', postData);
        function success(xhr) {
            $(cols[6]).text(
                'Success (code ' + xhr.status + ')'
            ).parent().css('color', 'green');
        }
        function fail(xhr) {
            $(cols[6]).text(
                'Error (code ' + xhr.status + ')'
            ).parent().css('color', 'red');
        }
        requests.POST(document.URL.replace('aliases', 'add-alias'),
                      edits.formatEdit('edit-alias', postData),
                      success, fail);
    });
}

$(document).ready(function () {
    $($('tbody')[0]).append($('<tr>').append($('<td>').append(
        $('<input>', {
            class: 'addRow',
            type: 'button',
            value: 'Add row'
        })
    )));
    $('.addRow').click(addRow);
    return false;
});
