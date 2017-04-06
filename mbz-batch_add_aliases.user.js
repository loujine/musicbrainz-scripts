/* global $ helper aliases edits sidebar requests GM_info */
'use strict';
// ==UserScript==
// @name         MusicBrainz: Batch-add artist aliases
// @namespace    mbz-loujine
// @author       loujine
// @version      2017.4.6
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-batch_add_aliases.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-batch_add_aliases.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Batch-add artist aliases
// @compatible   firefox+greasemonkey
// @license      MIT
// @require      https://greasyfork.org/scripts/13747-mbz-loujine-common/code/mbz-loujine-common.js?version=186415
// @include      http*://*musicbrainz.org/*/*/aliases*
// @grant        none
// @run-at       document-end
// ==/UserScript==

var aliasType;
if (helper.isArtistURL) {
    aliasType = aliases.artistType;
} else {
    aliasType = aliases.type;
}

function addRow() {
    $('tbody:nth(0)').find('tr:last').after($('<tr class="newAlias">').append(
        $('<td><input value="" type="text"></td>')
    ).append(
        $('<td><input value="" type="text" placeholder="leave empty to use the name"></td>')
    ).append(
        $('<td></td>')
    ).append(
        $('<td></td>')
    ).append(
        $('<td>').append($(aliasType).clone())
    ).append(
        $('<td>').append(
            $(aliases.locale).clone()
        ).append(
            $('<input type="checkbox">')
        ).append(
            $('<span>primary</span>')
        )
    ).append(
        $('<td><a href="#" class="deleteRow" style="color:red">×</a></td>')
    ));
    $('.newAlias:last() a.deleteRow').click(function (node) {
        $(node.target).parents('tr').remove();
    });
}

function submitAliases() {
    $('.newAlias').each(function (idx, node) {
        var cols = node.children;
        var postData = {
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
        $(node).removeClass('newAlias');
    });
}

$(document).ready(function () {
    // doesn't work on translated pages
    for (var node of document.getElementById('content').getElementsByTagName('p')) {
        if (node.innerHTML.includes('has no aliases')) {
            node.innerHTML = '<table class="tbl"><thead><tr><th>Alias</th><th>Sort name</th><th>Begin Date</th><th>End Date</th><th>Type</th><th>Locale</th></tr></thead><tbody><tr></tr></tbody></table>';
        }
    }
    $('table:nth(0)').after(
        $('<input>', {
            id: 'submitAliases',
            type: 'button',
            value: 'submit new aliases'
        })
    ).after(
        $('<input>', {
            class: 'addRow',
            type: 'button',
            value: 'Add a new row'
        })
    );
    $('.addRow').click(addRow);
    $('#submitAliases').click(submitAliases);
    return false;
});
