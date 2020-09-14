/* global $ requests server helper sidebar edits GM_info */
'use strict';
// ==UserScript==
// @name         MusicBrainz edit: Replace recording artists from an Artist or Work page
// @namespace    mbz-loujine
// @author       loujine
// @version      2020.9.14
// @downloadURL  https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-edit-replace_rec_artist_from_work_page.user.js
// @updateURL    https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-edit-replace_rec_artist_from_work_page.user.js
// @supportURL   https://github.com/loujine/musicbrainz-scripts
// @icon         https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/icon.png
// @description  musicbrainz.org: Replace recording artists from an Artist or Work page
// @compatible   firefox+tampermonkey
// @license      MIT
// @require      https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mbz-loujine-common.js
// @include      http*://*musicbrainz.org/artist/*/relationships
// @include      http*://*musicbrainz.org/work/*
// @exclude      http*://*musicbrainz.org/work/create
// @exclude      http*://*musicbrainz.org/work/*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

const editNoteMsg = 'CSG: Set performer(s) as recording artist\n';

function formatPerformers(relations) {
    const performers = [];
    relations.forEach(function (rel) {
        let type;
        const creditedName = rel['target-credit']
            ? rel['target-credit']
            : rel.artist.name;
        if (
            rel.type === 'instrument' ||
            rel.type === 'vocal' ||
            rel.type === 'conductor' ||
            rel.type === 'performing orchestra' ||
            rel.type === 'performer'
        ) {
            if (rel.type === 'performing orchestra') {
                type = 'orchestra';
            } else if (!rel.attributes.length) {
                type = rel.type;
            } else {
                type = rel.attributes[0];
            }
            performers.push(type + ': ' + creditedName);
        }
    });
    return performers.sort().join(', ');
}

function showPerformers(start, maxcount) {
    let $rows;
    if (helper.isArtistURL()) {
        const performer = helper.mbidFromURL();
        const $allRows = $('table.tbl a[href*="/artist/"]').parents('tr');
        const $performerRows = $('table.tbl a[href*="/artist/' + performer + '"]').parents('tr');
        $rows = $allRows.not($performerRows);
    } else if (helper.isWorkURL()) {
        const composer = $('th:contains("composer:")').parent()
                                                      .find('a').attr('href').split('/')[2];
        $rows = $('table.tbl a[href*="/artist/' + composer + '"]').parents('tr');
    }
    $rows = $($rows.get().reverse().splice(start, maxcount));
    if (!$('#ARperformerColumn').length) {
        $('thead > tr').append('<th id="ARperformerColumn">Performer rels</th>');
        $('.subh > th')[1].colSpan += 1;
        $('table.tbl > tbody > tr:not(".subh")').append('<td>');
    }

    $rows.each(function (idx, tr) {
        setTimeout(function () {
            const mbid = $(tr).find('a[href*="/recording/"]').attr('href').split('/')[2];
            const url = helper.wsUrl('recording', ['artist-rels'], mbid);
            requests.GET(url, function (response) {
                const resp = JSON.parse(response);
                const $node = $(tr).find('td:last');
                let $button;
                if (resp.relations.length) {
                    $node.text(formatPerformers(resp.relations));
                    $button = $('<input>', {
                        'id': 'replace-' + mbid,
                        'class': 'replace',
                        'type': 'checkbox',
                        'value': 'Replace artist',
                    });
                    $node.append($button);
                } else {
                    $node.text('✗').css('color', 'red');
                }
                $(tr).append($node);
            });
        }, 1.5 * idx * server.timeout);
    });
}

// Replace composer -> performer as recording artist (CSG)
function parseArtistEditData(data, performers) {
    performers.sort(helper.comparefct).forEach(function (performer, idx) {
        let creditedName = performer.name;
        if (performer.creditedName) {
            creditedName = performer.creditedName;
        }
        data['artist_credit.names.' + idx + '.name'] = edits.encodeName(creditedName);
        data['artist_credit.names.' + idx + '.join_phrase'] = (idx === performers.length - 1)
            ? null : ',+';
        data['artist_credit.names.' + idx + '.artist.name'] = edits.encodeName(performer.name);
        data['artist_credit.names.' + idx + '.artist.id'] = performer.id;
    });
}

function parseEditData(editData) {
    const data = {};
    const performers = [];
    data['name'] = edits.encodeName(editData.name);
    data['comment'] = editData.comment ? editData.comment : null;
    if (!editData.isrcs.length) {
        data['isrcs.0'] = null;
    } else {
        editData.isrcs.forEach(function (isrc, idx) {
            data['isrcs.' + idx] = isrc;
        });
    }
    editData.relationships.forEach(function (rel) {
        const linkType = rel.linkTypeID;
        const uniqueIds = [];
        if (
            server.performingLinkTypes().includes(linkType) &&
            !uniqueIds.includes(rel.target.id)
        ) {
            uniqueIds.push(rel.target.id); // filter duplicates
            performers.push({
                'name': rel.target.name,
                'creditedName': rel.entity0_credit,
                'id': rel.target.id,
                'link': linkType,
                'mbid': rel.target.gid,
            });
        }
    });
    parseArtistEditData(data, performers.sort(helper.comparefct));
    data['edit_note'] = $('#batch_replace_edit_note')[0].value;
    data['make_votable'] = document.getElementById('votable').checked ? '1' : '0';
    return data;
}

function replaceArtist() {
    $('.replace:input:checked:enabled').each(function (idx, node) {
        const mbid = node.id.replace('replace-', '');
        const url = edits.urlFromMbid('recording', mbid);
        function success(xhr) {
            const $status = $('#' + node.id + '-text');
            node.disabled = true;
            $status.text(
                'Success (code ' + xhr.status + ')'
            ).parent().css('color', 'green');
            const editId = new RegExp(
                '/edit/(\\d+)">edit</a>'
            ).exec(xhr.responseText)[1];
            $status.after(
                $('<p>').append(
                    '<a href="/edit/' + editId + '" target="_blank">edit ' + editId + '</a>'
                )
            );
        }
        function fail(xhr) {
            $('#' + node.id + '-text').text(
                'Error (code ' + xhr.status + ')'
            ).parent().css('color', 'red');
        }
        function callback(editData) {
            $('#' + node.id + '-text').text('Sending edit data');
            const postData = parseEditData(editData);
            console.info('Data ready to be posted: ', postData);
            requests.POST(
                url,
                edits.formatEdit('edit-recording', postData),
                success,
                fail
            );
        }
        setTimeout(function () {
            $('#' + node.id + '-text').empty();
            $(node).after('<span id="' + node.id + '-text">Fetching required data</span>');
            edits.getEditParams(url, callback);
        }, 2 * idx * server.timeout);
    });
}

(function displaySidebar() {
    sidebar.container().insertAdjacentHTML('beforeend', `
        <h3><span id="replace_script_toggle">▶ Show performers</span></h3>
        <div id="replace_script_block" style="display:none;">
        <p>Show performers present in recording rels, for recordings not respecting the CSG</p>
        <div>First row:
          <input type="number" id="offset" value="1" style="width: 50px;">
        </div>
        <div>Rows to query:
          <input type="number" id="max" value="10" style="width: 50px;">
        </div>
        <input type="button" id="showPerformers" value="Show performer rels">
        <h3>Replace artists</h3>
        <p>First click "Show performer rels" then check boxes to select artists</p>
        <input type="button" id="batch_select" value="Select all" disabled="true">
        <div class="auto-editor">
          <label>Make all edits votable</label>
          <input type="checkbox" id="votable">
        </div>
        <p>Edit note:</p>
        <textarea id="batch_replace_edit_note"
                  disabled="true">${sidebar.editNote(GM_info.script, editNoteMsg)}</textarea>
        <input type="button" id="batch_replace" value="Replace selected artists" disabled="true">
        </div>
    `);
})();

$(document).ready(function () {
    document.getElementById('replace_script_toggle').addEventListener('click', () => {
        const header = document.getElementById('replace_script_toggle');
        const block = document.getElementById('replace_script_block');
        const display = block.style.display;
        header.textContent = header.textContent.replace(/./, display == "block" ? "▶" : "▼");
        block.style.display = display == "block" ? "none" : "block";
    });
    document.getElementById('showPerformers').addEventListener('click', () => {
        const start = $('#offset')[0].value;
        const maxcount = $('#max')[0].value;
        showPerformers(parseInt(start - 1), parseInt(maxcount));
        $('#batch_select').prop('disabled', false);
        $('#batch_replace_edit_note').prop('disabled', false);
        $('#batch_replace').prop('disabled', false);
    });
    document.getElementById('batch_replace').addEventListener('click', replaceArtist);
    document.getElementById('batch_select').addEventListener('click', () => {
        $('.replace:input').attr('checked', true);
    });
    return false;
});
