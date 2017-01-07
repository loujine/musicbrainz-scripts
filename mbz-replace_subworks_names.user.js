/* global $ _ relEditor requests edits server sidebar */
'use strict';
var meta = function() {
// ==UserScript==
// @name         MusicBrainz: Replace subwork titles in Work edit page
// @namespace    mbz-loujine
// @author       loujine
// @version      2017.1.7
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-replace_subworks_names.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-replace_subworks_names.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: replace subwork titles in Work edit page
// @compatible   firefox+greasemonkey
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @require      https://greasyfork.org/scripts/13747-mbz-loujine-common/code/mbz-loujine-common.js?version=165739
// @include      http*://*musicbrainz.org/work/*/edit
// @include      http*://*mbsandbox.org/work/*/edit
// @grant        none
// @run-at       document-end
// ==/UserScript==
};
if (meta && meta.toString && (meta = meta.toString())) {
    var meta = {'name': meta.match(/@name\s+(.+)/)[1],
                'version': meta.match(/@version\s+(.+)/)[1]};
}
// var val = searchrep[0].match(/^\/.+\/[gi]*$/) ? tracks[t].value.replace(eval(searchrep[0]), searchrep[1]) : tracks[t].value.split(searchrep[0]).join(searchrep[1]);
// var searchrep = localStorage.getItem(userjs + "search-replace");
// localStorage.setItem(userjs + "search-replace", JSON.stringify(searchrep))
// if (
//     (searchrep[0] = prompt("search\n\neither regex (case *i*nsensitive and *g*lobal are optional flags): /\"([^\"]+)\"/g\n\nor normal (case sensitive and global): My String", searchrep[0]))
//     && (searchrep[1] = prompt("replace\n\nif it was a regex, you can use those $1 $2 $3 etc.: “$1”", searchrep[1])) != null
// ) {

function parseEditData(editData) {
    var data = {};
    data['name'] = edits.encodeName(editData.name);
    data['comment'] = editData.comment ? editData.comment : null;
    data['type_id'] = editData.typeID ? editData.typeID : null;
    data['language_id'] = editData.language ? editData.language : '486';
    if (editData.iswcs === undefined || !editData.iswcs.length) {
        data['iswcs.0'] = null;
    } else {
        editData.iswcs.forEach(function (iswc, idx) {
            data['iswcs.' + idx] = iswc;
        });
    }
    // attributes (key)
    if (!editData.attributes || !editData.attributes.length) {
        data['attributes.0.type_id'] = null;
        data['attributes.0.value'] = null;
    } else {
        editData.attributes.forEach(function (attr, idx) {
            data['attributes.' + idx + '.type_id'] = attr.typeID;
            data['attributes.' + idx + '.value'] = attr.value;
        });
    }
    data['edit_note'] = sidebar.editNote(meta);
    return data
}


function replaceSubworksTitles() {
    $('table label:contains("parts:")').parents('tr')
            .find('a[href*="/work/"]').each(function (idx, node) {
        var searchExp = document.getElementById('search').value;
        var replaceExp = document.getElementById('replace').value;
        if (!searchExp || searchExp === replaceExp) {
            return;
        }
        var url = node.href + '/edit';
        function success(xhr) {
            var $status = $('#replace' + idx);
            $status.parent().css('color', 'green');
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
            $('#replace' + idx).text(
                'Error (code ' + xhr.status + ')'
            ).parent().css('color', 'red');
        }
        function callback(editData) {
            $('#replace' + idx).text('Sending edit data');
            var postData = parseEditData(editData);
            var name = decodeURIComponent(postData.name).replace(/\+/g, ' ');
            name = searchExp.match(/^\/.+\/[gi]*$/) ?
                    name.replace(eval(searchExp), replaceExp) :
                    name.split(searchExp).join(replaceExp);
            $('#replace' + idx).text(' replaced by ' + name);
            postData.name = encodeURIComponent(name).replace(/%20/g, '+');
            console.info('Data ready to be posted: ', postData);
            requests.POST(url, edits.formatEdit('edit-work', postData),
                          success, fail);
        }
        setTimeout(function () {
            $(node).after('<span id="replace' + idx + '">Fetching required data</span>');
            edits.getEditParams(url, callback);
        }, 2 * idx * server.timeout);
    });
}


(function displayToolbar(relEditor) {
    $('div.half-width').after(
        $('<div>', {float: 'right'})).after(
        relEditor.container().append(
            $('<h3>Replace subworks titles</h3>')
        ).append(
            $('<p>Search for a string or regular expression (e.g. /sonata Op.(.+)/i). Replace with a string that can call groups from the search regexp ($1, $2...).</p>')
        ).append(
            $('<input>', {
                'id': 'search',
                'type': 'text',
                'placeholder': 'Searched string or regexp',
                'value': ''
            })
        ).append(
            $('<input>', {
                'id': 'replace',
                'type': 'text',
                'value': '',
                'placeholder': 'Replacing string'
            })
        ).append(
            $('<input>', {
                'id': 'batch-replace-titles',
                'type': 'button',
                'value': 'Apply',
                'disabled': true
            })
        )
    );
    $('div#loujine-menu').css('margin-left', '550px');
})(relEditor);


$(document).ready(function () {
    $('#search').keydown(function () {
        $('#batch-replace-titles').prop('disabled', false);
    });
    $('#batch-replace-titles').click(function () {
        replaceSubworksTitles();
    });
    return false;
});
