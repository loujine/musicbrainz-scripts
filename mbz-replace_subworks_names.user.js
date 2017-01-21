/* global $ _ relEditor requests edits server sidebar helper */
'use strict';
var meta = function() {
// ==UserScript==
// @name         MusicBrainz: Replace subwork titles in Work edit page
// @namespace    mbz-loujine
// @author       loujine
// @version      2017.1.21
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-replace_subworks_names.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-replace_subworks_names.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: replace subwork titles in Work edit page
// @compatible   firefox+greasemonkey
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @require      https://greasyfork.org/scripts/13747-mbz-loujine-common/code/mbz-loujine-common.js?version=170785
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


function replaceSubworksTitles() {
    $('table label:contains("parts:")').parents('tr')
            .find('a[href*="/work/"]').each(function (idx, node) {
        var searchExp = document.getElementById('search').value;
        var replaceExp = document.getElementById('replace').value;
        if (!searchExp || searchExp === replaceExp) {
            return;
        }
        var mbid = helper.mbidFromURL(node.href);

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
            var name = searchExp.match(/^\/.+\/[gi]*$/) ?
                editData.name.replace(eval(searchExp), replaceExp) :
                editData.name.split(searchExp).join(replaceExp);
            editData.name = encodeURIComponent(name);
            $('#replace' + idx).text(' replaced by ' + name);
            var postData = edits.prepareEdit(editData);
            postData.edit_note = sidebar.editNote(meta);
            console.info('Data ready to be posted: ', postData);
            requests.POST(edits.urlFromMbid('work', mbid),
                          edits.formatEdit('edit-work', postData),
                          success, fail);
        }
        setTimeout(function () {
            $(node).after('<span id="replace' + idx + '">Fetching required data</span>');
            edits.getWorkEditParams(helper.wsUrl('work', [], mbid), callback);
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
