/* global $ requests server works sidebar edits helper */
'use strict';
var meta = function() {
// ==UserScript==
// @name         MusicBrainz: Set work attributes from the composer page
// @namespace    mbz-loujine
// @author       loujine
// @version      2017.1.21
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-setworkattributes.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-setworkattributes.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Set attributes (lang, key) from the composer Work page
// @compatible   firefox+greasemonkey
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @require      https://greasyfork.org/scripts/13747-mbz-loujine-common/code/mbz-loujine-common.js?version=170785
// @include      http*://*musicbrainz.org/artist/*/works
// @include      http*://*musicbrainz.org/artist/*/works?page=*
// @grant        none
// @run-at       document-end
// ==/UserScript==
};
if (meta && meta.toString && (meta = meta.toString())) {
    var meta = {'name': meta.match(/@name\s+(.+)/)[1],
                'version': meta.match(/@version\s+(.+)/)[1]};
}

// imported from mbz-loujine-common.js: requests, server, works, sidebar
var $rows = $('table.tbl tr:gt(0)'),
    idxType = $('table.tbl th:contains("Type")').index(),
    idxLang = $('table.tbl th:contains("Language")').index(),
    idxKey = $('table.tbl th:contains("Attributes")').index();

$rows.each(function (idx, row) {
    var mbid = $(row).find('a[href*="/work/"]').attr('href').split('/')[2],
        title = $(row).find('a[href*="/work/"]')[0].text;
    if (!row.children[idxType].textContent.trim()) {
        $(row.children[idxType]).append($('<form>').append($(works.type).clone()));
    }
    if (!row.children[idxLang].textContent.trim()) {
        $(row.children[idxLang]).append($('<form>').append($(works.lang).clone()));
    }
    if (!row.children[idxKey].textContent.trim()) {
        $(row.children[idxKey]).append($('<form>').append($(works.key).clone()));
        if (title.toLowerCase().includes('major') ||
            title.toLowerCase().includes('minor')) {
            var cell = row.children[idxKey];
            $(cell).find('option').each(function (idx, option) {
                if (title.toLowerCase().includes(option.text.toLowerCase())) {
                    option.selected = true;
                }
            });
        }
    }
    var $button = $('<input>', {
        'id': 'edit-' + mbid,
        'class': 'commit',
        'type': 'checkbox'
    });
    var $td = $('<td></td>').append($button);
    $(row).append($td);
});


function updateFromPage(editData, node) {
    var row = $(node).parents('tr')[0];

    var type = $(row.children[idxType]).find('select');
    var optionType = type.length ? type[0].value : null;
    if (optionType) {
        editData.type_id = optionType;
    }

    var lang = $(row.children[idxLang]).find('select');
    var optionLang = lang.length ? lang[0].value : null;
    if (optionLang) {
        editData.language_id = optionLang;
    }

    var key = $(row.children[idxKey]).find('select');
    var optionKey = key.length ? key[0].value : null;
    if (optionKey) {
        var keyAttribute = {'type_id': 1, 'value': parseInt(optionKey)};
        editData.attributes.push(keyAttribute);
    }
    return editData;
}


function editWork() {
    $('.commit:input:checked:enabled').each(function (idx, node) {
        var mbid = node.id.replace('edit-', '');
        function success(xhr) {
            var $status = $('#' + node.id + '-text');
            node.disabled = true;
            $status.text(
                'Success (code ' + xhr.status + ')'
            ).parent().css('color', 'green');
            var editId = new RegExp(
                '/edit/(.*)">edit</a>'
            ).exec(xhr.responseText)[1];
            $status.after(
                $('<p>').append(
                    '<a href="/edit/' + editId + '" target="_blank">edit ' + editId + '</a>'
                )
            )
        }
        function fail(xhr) {
            $('#' + node.id + '-text').text(
                'Error (code ' + xhr.status + ')'
            ).parent().css('color', 'red');
        }
        function callback(editData) {
            $('#' + node.id + '-text').text('Sending edit data');
            var postData = edits.prepareEdit(updateFromPage(editData, node));
            postData.edit_note = $('#batch_replace_edit_note')[0].value;
            console.info('Data ready to be posted: ', postData);
            requests.POST(edits.urlFromMbid('work', mbid),
                          edits.formatEdit('edit-work', postData),
                          success, fail);
        }
        setTimeout(function () {
            $('#' + node.id + '-text').empty();
            $(node).after('<span id="' + node.id + '-text">' +
                          'Fetching required data</span>');
            edits.getWorkEditParams(helper.wsUrl('work', [], mbid),
                                    callback);
        }, 2 * idx * server.timeout);
    });
}


(function displaySidebar(sidebar) {
    $('h2.rating').before(
        sidebar.container().append(
            $('<h3>Edit works</h3>')
        ).append(
            $('<p>Warning: this is experimental! Bogus data could be sent in the edit. Please check carefully your edit history after use, and help by reporting bugs</p>')
        ).append(
            $('<p>Edit note:</p>')
        ).append(
            $('<textarea>', {
                'id': 'batch_replace_edit_note',
                'text': sidebar.editNote(meta),
                'cols': 20,
                'rows': 7
            })
        ).append(
            $('<input>', {
                'id': 'batch_edit',
                'type': 'button',
                'value': 'Edit selected works'
            })
        )
    );
})(sidebar);

$(document).ready(function () {
    $('#batch_edit').click(function () {editWork();});
    return false;
});
