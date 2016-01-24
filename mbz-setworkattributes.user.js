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

var $selectWork = $('<select class="setwork">' +
'<option selected> </option>' +
'<option value="17">Song</option>' +
'<option value="1">Aria</option>' +
'<option value="25">Audio drama</option>' +
'<option value="2">Ballet</option>' +
'<option value="26">Beijing opera</option>' +
'<option value="3">Cantata</option>' +
'<option value="4">Concerto</option>' +
'<option value="20">Étude</option>' +
'<option value="30">Incidental music</option>' +
'<option value="7">Madrigal</option>' +
'<option value="8">Mass</option>' +
'<option value="9">Motet</option>' +
'<option value="29">Musical</option>' +
'<option value="10">Opera</option>' +
'<option value="24">Operetta</option>' +
'<option value="11">Oratorio</option>' +
'<option value="12">Overture</option>' +
'<option value="13">Partita</option>' +
'<option value="28">Play</option>' +
'<option value="21">Poem</option>' +
'<option value="23">Prose</option>' +
'<option value="14">Quartet</option>' +
'<option value="5">Sonata</option>' +
'<option value="15">Song-cycle</option>' +
'<option value="22">Soundtrack</option>' +
'<option value="6">Suite</option>' +
'<option value="18">Symphonic poem</option>' +
'<option value="16">Symphony</option>' +
'<option value="19">Zarzuela</option>' +
'</select>');

var $selectLang = $('<select class="setlang">' +
'<option> </option>' +
'<optgroup label="Frequently used">' +
'<option class="language" value="284">[Multiple languages]</option>' +
'<option class="language" value="486" selected="selected">[No lyrics]</option>' +
'<option class="language" value="18">Arabic</option>' +
'<option class="language" value="76">Chinese</option>' +
'<option class="language" value="98">Czech</option>' +
'<option class="language" value="100">Danish</option>' +
'<option class="language" value="113">Dutch</option>' +
'<option class="language" value="120">English</option>' +
'<option class="language" value="131">Finnish</option>' +
'<option class="language" value="134">French</option>' +
'<option class="language" value="145">German</option>' +
'<option class="language" value="159">Greek</option>' +
'<option class="language" value="195">Italian</option>' +
'<option class="language" value="198">Japanese</option>' +
'<option class="language" value="224">Korean</option>' +
'<option class="language" value="338">Polish</option>' +
'<option class="language" value="340">Portuguese</option>' +
'<option class="language" value="353">Russian</option>' +
'<option class="language" value="393">Spanish</option>' +
'<option class="language" value="403">Swedish</option>' +
'<option class="language" value="433">Turkish</option>' +
'</optgroup>' +
'</select>');

var $selectKey = $('<select class="setkey">' +
'<option selected> </option>' +
'<option value="2">C major</option>' +
'<option value="3">C minor</option>' +
'<option value="4">C-sharp major</option>' +
'<option value="5">C-sharp minor</option>' +
'<option value="6">D-flat major</option>' +
'<option value="7">D-flat minor</option>' +
'<option value="8">D major</option>' +
'<option value="9">D minor</option>' +
'<option value="10">D-sharp minor</option>' +
'<option value="11">E-flat major</option>' +
'<option value="12">E-flat minor</option>' +
'<option value="13">E major</option>' +
'<option value="14">E minor</option>' +
'<option value="15">E-sharp minor</option>' +
'<option value="16">F-flat major</option>' +
'<option value="17">F major</option>' +
'<option value="18">F minor</option>' +
'<option value="19">F-sharp major</option>' +
'<option value="20">F-sharp minor</option>' +
'<option value="21">G-flat major</option>' +
'<option value="22">G major</option>' +
'<option value="23">G minor</option>' +
'<option value="24">G-sharp major</option>' +
'<option value="25">G-sharp minor</option>' +
'<option value="26">A-flat major</option>' +
'<option value="27">A-flat minor</option>' +
'<option value="28">A major</option>' +
'<option value="29">A minor</option>' +
'<option value="30">A-sharp minor</option>' +
'<option value="31">B-flat major</option>' +
'<option value="32">B-flat minor</option>' +
'<option value="33">B major</option>' +
'<option value="34">B minor</option>' +
'<option value="789">C Dorian</option>' +
'<option value="790">D Dorian</option>' +
'<option value="791">E Dorian</option>' +
'<option value="792">F Dorian</option>' +
'<option value="793">G Dorian</option>' +
'<option value="794">A Dorian</option>' +
'<option value="795">B Dorian</option>' +
'</select>');

var $rows = $('table.tbl tr:gt(0)');

var idxWork = $('table.tbl th:contains("Work")').index();
var idxType = $('table.tbl th:contains("Type")').index();
var idxLang = $('table.tbl th:contains("Language")').index();
var idxKey = $('table.tbl th:contains("Attributes")').index();

$rows.each(function (idx, row) {
    var mbid = $(row).find('a[href*="/work/"]').attr('href').split('/')[4],
        title = $(row).find('a[href*="/work/"]')[0].text;
    if (!row.children[idxType].textContent.trim()) {
        $(row.children[idxType]).append($('<form></form>').append($selectWork.clone()));
    }
    if (!row.children[idxLang].textContent.trim()) {
        $(row.children[idxLang]).append($('<form></form>').append($selectLang.clone()));
    }
    // if (!row.children[idxKey].textContent.trim()) {
    if (true) {
        $(row.children[idxKey]).append($('<form></form>').append($selectKey.clone()));
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
    if (type.length) {
        var optionType = type[0].value;
    } else {
        var optionType = null;
    }
    var lang = $(row.children[idxLang]).find('select');
    if (lang.length) {
        var optionLang = lang[0].value;
    } else {
        var optionLang = null;
    }
    var key = $(row.children[idxKey]).find('select');
    if (key.length) {
        var optionKey = key[0].value;
    } else {
        var optionKey = null;
    }
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
    if (!json.comment.length) {
        data.push('edit-work.comment');
    } else {
        data.push('edit-work.comment=' + json.comment);
    }
    if (!json.typeID) {
        data.push('edit-work.type_id');
    } else {
        data.push('edit-work.type_id=' + json.typeID);
    }
    if (!json.language) {
        data.push('edit-work.language_id=486');
    } else {
        data.push('edit-work.language_id=' + json.language);
    }
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
    $('#batch_edit').click(function () {editWork();});
    return false;
});

