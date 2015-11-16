'use strict';
// ==UserScript==
// @name         MusicBrainz: Make table columns sortable
// @namespace    mbz-loujine
// @author       loujine
// @version      2015.11.15
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-sortablecolumns.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-sortablecolumns.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Show performers & replace associated recording artst from a Work page
// @compatible   firefox+greasemonkey
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @include      http*://*musicbrainz.org/work/*
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

function makeSortable() {
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

$('table.tbl thead th').append('↕').click(makeSortable);

