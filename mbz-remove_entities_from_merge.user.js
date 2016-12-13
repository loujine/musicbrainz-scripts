/* global $ */
'use strict';
var meta = function() {
// ==UserScript==
// @name         MusicBrainz: Remove entities from ongoing merge
// @namespace    mbz-loujine
// @author       loujine
// @version      2016.12.13
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-remove_entities_from_merge.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-remove_entities_from_merge.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Filter entities to remove during ongoing merge
// @compatible   firefox+greasemonkey
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @include      http*://*musicbrainz.org/*/merge
// @include      http*://*mbsandbox.org/*/merge
// @grant        none
// @run-at       document-end
// ==/UserScript==
};
if (meta && meta.toString && (meta = meta.toString())) {
    var meta = {'name': meta.match(/@name\s+(.+)/)[1],
                'version': meta.match(/@version\s+(.+)/)[1]};
}


function displayCheckboxes() {
    $('thead > tr').append('<th><b>Filter</b></th>');
    $('tbody > tr').append($('<td>'));
    $('tbody > tr > td:last-child').append($('<input>', {
        'type': 'checkbox'
    }).prop('checked', true));

    $('table').after($('<input>', {
        'id': 'select',
        'type': 'button',
        'value': 'Remove unselected entities from merge',
        'style': 'position: absolute; right: 0px;'
    }));
}


function removeEntities () {
    var ids = [];
    $('tbody > tr').each(function(idx, tr) {
        if (tr.querySelector('input[type=checkbox]').checked) {
            ids.push(tr.querySelector('input[type=radio]').value);
        }
    });

    var win = window.open('/recording/merge?submit=cancel');
    setTimeout(function () {
        win.close();
        var url = '/recording/merge_queue?add-to-merge=' +
                  ids.join('&add-to-merge=');
        window.location.replace(url);
    }, 1000);
}


$(document).ready(function () {
    displayCheckboxes();
    $('#select').click(function () {
        removeEntities();
    });
    return false;
});
