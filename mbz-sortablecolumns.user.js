/* global $ sidebar */
'use strict';
// ==UserScript==
// @name         MusicBrainz: Make table columns sortable (on Work pages)
// @namespace    mbz-loujine
// @author       loujine
// @version      2017.1.22
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-sortablecolumns.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-sortablecolumns.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Make table columns sortable (on Work pages)
// @compatible   firefox+greasemonkey
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @require      https://greasyfork.org/scripts/13747-mbz-loujine-common/code/mbz-loujine-common.js?version=125991
// @include      http*://*musicbrainz.org/work/*
// @include      http*://*musicbrainz.org/artist/*/relationships
// @exclude      http*://*musicbrainz.org/work/*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

function comparefct(index) {
    return function(row1, row2) {
        var cell1 = $(row1).children('td')[index],
            cell2 = $(row2).children('td')[index];
        if (index === 0) {
            var d1 = new Date(cell1.textContent.split(' – ')[0]),
                d2 = new Date(cell2.textContent.split(' – ')[0]);
            return d2 - d1;
        }
        var href1 = $(cell1).find('a');
        if (href1.length) {
            cell1 = href1[0];
        }
        var href2 = $(cell2).find('a');
        if (href2.length) {
            cell2 = href2[0];
        }
        return cell1.textContent.localeCompare(cell2.textContent);
    };
}

function sortByClickedColumn() {
    var table = $(this).parents('table'),
        rowclass,
        rows = table.find('tr:gt(1)').toArray().sort(
            comparefct($(this).index())
        );
    // reverse order if clicked several times
    this.asc = !this.asc;
    if (!this.asc) {
        rows = rows.reverse();
    }
    rows.forEach(function (row, idx) {
        $(row).removeClass();
        rowclass = idx % 2 ? 'even' : 'odd';
        $(row).addClass(rowclass);
        table.append(row);
    });
}

// display sidebar
(function displaySidebar(sidebar) {
    sidebar.container().append(
        $('<h3>Sortable columns<h3>')
    ).append(
        $('<input>', {
            'id': 'makesortable',
            'type': 'button',
            'value': 'Make columns sortable'
        })
    );
})(sidebar);

$(document).ready(function() {
    $('#makesortable').click(function () {
        $('table.tbl thead th:not(.sortable)').append(
            '<span>↕</span>'
        ).click(sortByClickedColumn);
        $('table.tbl thead th').addClass('sortable');
    });
    return false;
});
