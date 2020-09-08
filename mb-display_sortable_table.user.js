/* global $ sidebar */
'use strict';
// ==UserScript==
// @name         MusicBrainz: Display sort button on table columns
// @namespace    mbz-loujine
// @author       loujine
// @version      2020.5.14
// @downloadURL  https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-display_sortable_table.user.js
// @updateURL    https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-display_sortable_table.user.js
// @supportURL   https://github.com/loujine/musicbrainz-scripts
// @icon         https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/icon.png
// @description  musicbrainz.org: Make table columns sortable
// @compatible   firefox+tampermonkey
// @license      MIT
// @require      https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mbz-loujine-common.js
// @include      http*://*musicbrainz.org/work/*
// @include      http*://*musicbrainz.org/instrument/*/recordings
// @include      http*://*musicbrainz.org/instrument/*/recordings?page=*
// @include      http*://*musicbrainz.org/artist/*/relationships
// @exclude      http*://*musicbrainz.org/work/*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

function comparefct(index, title, asc) {
    return function(row1, row2) {
        const text1 = row1.querySelectorAll('td')[index].textContent,
            text2 = row2.querySelectorAll('td')[index].textContent;
        if (index === 0) {
            let d1 = new Date(text1.split(' – ')[0]),
                d2 = new Date(text2.split(' – ')[0]);
            // consider missing dates as year 3000 if ascending order
            // and year 1000 if descending
            if (isNaN(d1.getDate())) {d1 = new Date(asc ? 3000 : 1000,0);}
            if (isNaN(d2.getDate())) {d2 = new Date(asc ? 3000 : 1000,0);}
            return d2 - d1;
        }
        if (title.startsWith('Length')) {
            const regexp1 = new RegExp('(.*):(.*)').exec(text1),
                regexp2 = new RegExp('(.*):(.*)').exec(text2);
            let t1 = parseInt(regexp1[1]) * 60 + parseInt(regexp1[2]),
                t2 = parseInt(regexp2[1]) * 60 + parseInt(regexp2[2]);
            if (isNaN(t1)) {t1 = asc ? 36000 : -1;}
            if (isNaN(t2)) {t2 = asc ? 36000 : -1;}
            // consider missing durations as 10 hours if ascending order
            // and -1 second if descending
            return t2 - t1;
        }
        return text1.localeCompare(text2);
    };
}

function sortByClickedColumn(evt) {
    const table = $(evt.target).parents('table'),
        colidx = $(evt.target).index(),
        coltitle = evt.target.textContent;
    let rowclass,
        rows = table.find('tbody tr').not('.subh').get().sort(
            comparefct(colidx, coltitle, this.asc)
        );
    // reverse order if clicked several times
    this.asc = !this.asc;
    if (!this.asc) {
        rows = rows.reverse();
    }
    rows.forEach((row, idx) => {
        row.classList.remove('even', 'odd');
        rowclass = idx % 2 ? 'even' : 'odd';
        row.classList.add(rowclass);
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
        document.querySelectorAll('table.tbl thead th:not(.sortable)').forEach(
            node => {
                node.insertAdjacentHTML('beforeend', '<span>↕</span>');
                node.addEventListener('click', sortByClickedColumn);
                node.classList.add('sortable');
            }
        );
    });
    return false;
});
