/* global $ requests server works sidebar edits */
'use strict';
var meta = function() {
// ==UserScript==
// @name         MusicBrainz: Set work attributes from the composer page
// @namespace    mbz-loujine
// @author       loujine
// @version      2016.6.1
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-setworkattributes.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-setworkattributes.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Set attributes (lang, key) from the composer Work page
// @compatible   firefox+greasemonkey
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @require      https://greasyfork.org/scripts/13747-mbz-loujine-common/code/mbz-loujine-common.js?version=128923
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
    if (true) {
        $(row.children[idxKey]).append($('<form>').append($(works.key).clone()));
        if (title.toLowerCase().contains('major') ||
            title.toLowerCase().contains('minor')) {
            var cell = row.children[idxKey];
            $(cell).find('option').each(function (idx, option) {
                if (title.toLowerCase().contains(option.text.toLowerCase())) {
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


function updateJSON(json, node) {
    var row = $(node).parents('tr')[0];
    var type = $(row.children[idxType]).find('select');
    var optionType = type.length ? type[0].value : null;
    var lang = $(row.children[idxLang]).find('select');
    var optionLang = lang.length ? lang[0].value : null;
    var key = $(row.children[idxKey]).find('select');
    var optionKey = key.length ? key[0].value : null;
    if (optionType) {
        json.typeID = optionType;
    }
    if (optionLang) {
        json.language = optionLang;
    }
    if (optionKey) {
        var keyAttribute = {'typeID': 1, 'value': parseInt(optionKey)};
        if (json.attributes === undefined) {
            json.attributes = [];
        }
        json.attributes.push(keyAttribute);
    }
    return json;
}

function formatEditData(json) {
    var data = [],
        editNote,
        encodeName = function (name) {
            return encodeURIComponent(name).replace(/%20/g, '+');
        };
    data.push('edit-work.name=' + encodeName(json.name));
    data.push('edit-work.comment' + (json.comment ? '=' + json.comment : ''));
    data.push('edit-work.type_id' + (json.typeID ? '=' + json.typeID : ''));
    data.push('edit-work.language_id=' + (json.language ? json.language : '486'));
    if (!json.iswcs) {
        data.push('edit-work.iswcs.0');
    } else {
        json.iswcs.forEach(function (iswc, idx) {
            data.push('edit-work.iswcs.' + idx + '=' + iswc);
        });
    }
    // attributes (key)
    if (!json.attributes) {
        data.push('edit-work.attributes.0.type_id');
        data.push('edit-work.attributes.0.value');
    } else {
        json.attributes.forEach(function (attr, idx) {
            data.push('edit-work.attributes.' + idx + '.type_id=' + attr.typeID);
            data.push('edit-work.attributes.' + idx + '.value=' + attr.value);
        });
    }
    editNote = $('#batch_replace_edit_note')[0].value;
    data.push('edit-work.edit_note=' + editNote);
    return data.join('&');
}


function editWork() {
    $('.commit:input:checked:enabled').each(function (idx, node) {
        var mbid = node.id.replace('edit-', ''),
            url = edits.urlFromMbid('work', mbid);
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
        function callback(data) {
            console.log(data);
            $('#' + node.id + '-text').text('Sending edit data');
            var editData = formatEditData(updateJSON(data, node));
            console.log(editData);
            requests.POST(url, editData, success, fail);
        }
        setTimeout(function () {
            $('#' + node.id + '-text').empty();
            $(node).after('<span id="' + node.id + '-text">Fetching required data</span>');
            edits.getEditParams(url, callback);
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

