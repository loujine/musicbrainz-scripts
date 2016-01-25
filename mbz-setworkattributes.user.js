'use strict';
var meta = function() {
// ==UserScript==
// @name         MusicBrainz: Set work attributes from the composer page
// @namespace    mbz-loujine
// @author       loujine
// @version      2016.01.24
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-setworkattributes.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-setworkattributes.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Set attributes (lang, key) from the composer Work page
// @compatible   firefox+greasemonkey
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @require      https://greasyfork.org/scripts/13707-musicbrainz-common-files-for-the-sidebar/code/MusicBrainz:%20common%20files%20for%20the%20sidebar.js?version=85769
// @require      https://greasyfork.org/scripts/13747-musicbrainz-common-files/code/MusicBrainz:%20common%20files.js?version=88427
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

var $rows = $('table.tbl tr:gt(0)');
var idxWork = $('table.tbl th:contains("Work")').index();
var idxType = $('table.tbl th:contains("Type")').index();
var idxLang = $('table.tbl th:contains("Language")').index();
var idxKey = $('table.tbl th:contains("Attributes")').index();

$rows.each(function (idx, row) {
    var mbid = $(row).find('a[href*="/work/"]').attr('href').split('/')[4],
        title = $(row).find('a[href*="/work/"]')[0].text;
    if (!row.children[idxType].textContent.trim()) {
        $(row.children[idxType]).append($('<form></form>').append($(works.type).clone()));
    }
    if (!row.children[idxLang].textContent.trim()) {
        $(row.children[idxLang]).append($('<form></form>').append($(works.lang).clone()));
    }
    // if (!row.children[idxKey].textContent.trim()) {
    if (true) {
        $(row.children[idxKey]).append($('<form></form>').append($(works.key).clone()));
        if (title.toLowerCase().contains('major') ||
            title.toLowerCase().contains('minor')) {
            var cell = row.children[idxKey];
            var min = title.length;
            $(cell).find('option').each(function (idx, option) {
                if (title.toLowerCase().contains(option.text.toLowerCase())) {
                    option.selected = true;
                }
            });
        }
    }
    var $button = $('<input></input>', {
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
    var optionType = type ? type[0].value : null;
    var lang = $(row.children[idxLang]).find('select');
    var optionLang = lang ? lang[0].value : null;
    var key = $(row.children[idxKey]).find('select');
    var optionKey = key ? key[0].value : null;
    if (optionType) {
        json.typeID = optionType;
    }
    if (optionLang) {
        json.language = optionLang;
    }
    if (optionKey) {
        var keyAttribute = {'typeID': 1, 'value': parseInt(optionKey)};
        if (json.attributes !== undefined) {
            json.attributes.push(keyAttribute);
        } else {
            json.attributes = [keyAttribute];
        }
    }
    return json;
}

function formatEditInfo(json) {
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


function editWork($, server, requests) {
    // in order to determine the edit parameters required by POST
    // we first load the /edit page and parse the JSON data
    // in the sourceData block
    $('.commit:input:checked:enabled').each(function (idx, node) {
        setTimeout(function () {
            var mbid = node.id.replace('edit-', ''),
                url = '/work/' + encodeURIComponent(mbid) + '/edit',
                callback = function (info) {
                    var info2 = updateJSON(info, node);
                    requests.POST(url, formatEditInfo(info2), function (status) {
                        if (status === 200) {
                            node.disabled = true;
                            $(node).parent().css('background-color', 'green');
                        } else {
                            $(node).parent().css('background-color', 'red');
                        }
                    });
                };

            requests.GET(url, function (resp) {
                var info = new RegExp('sourceData: (.*),\n').exec(resp)[1];
                callback(JSON.parse(info));
            });
        }, 2 * idx * server.timeout);
    });
}


// imported from mbz-loujine-sidebar.js: sidebar
$('h2.rating').before(
    sidebar.container()
    .append(
        $('<h3>Edit works</h3>')
    ).append(
        $('<p>Warning: this is experimental! Bogus data could be sent in the edit. Please check carefully your edit history after use, and help by reporting bugs</p>')
    ).append(
        $('<p>Edit note:</p>')
    ).append(
        $('<textarea></textarea>', {
            'id': 'batch_replace_edit_note',
            'text': sidebar.editNote(meta),
            'cols': 20,
            'rows': 7
        })
    ).append(
        $('<input></input>', {
            'id': 'batch_edit',
            'type': 'button',
            'value': 'Edit selected works'
        })
    )
);

$(document).ready(function () {
    $('#batch_edit').click(function () {editWork($, server, requests);});
    return false;
});

