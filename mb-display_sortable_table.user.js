/* global $ sidebar */
'use strict';
// ==UserScript==
// @name         MusicBrainz: Display sort button on table columns
// @namespace    mbz-loujine
// @author       loujine
// @version      2019.9.22
// @downloadURL  https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-display_sortable_table.user.js
// @updateURL    https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-display_sortable_table.user.js
// @supportURL   https://github.com/loujine/musicbrainz-scripts
// @icon         https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/icon.png
// @description  musicbrainz.org: Make table columns sortable
// @compatible   firefox+tampermonkey
// @license      MIT
// @require      https://greasyfork.org/scripts/13747-mbz-loujine-common/code/mbz-loujine-common.js?version=241520
// @include      http*://*musicbrainz.org/work/*
// @include      http*://*musicbrainz.org/instrument/*/recordings
// @include      http*://*musicbrainz.org/instrument/*/recordings?page=*
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
        rows = table.find('tbody tr').not('.subh').get().sort(
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

(function displaySidebar() {
    sidebar.container().insertAdjacentHTML('beforeend', `
        <h3>Sortable columns<h3>
        <input type="button" id="makeSortable" value="Make columns sortable">
    `);
})();

$(document).ready(function() {
    document.getElementById('makeSortable').addEventListener('click', () => {
        $('table.tbl thead th:not(.sortable)').append(
            '<span>↕</span>'
        ).click(sortByClickedColumn);
        $('table.tbl thead th').addClass('sortable');
    });
    return false;
});
