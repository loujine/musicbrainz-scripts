/* global $ requests server helper sidebar edits */
'use strict';
// ==UserScript==
// @name         MusicBrainz edit: Replace recording artists from a Release page
// @namespace    mbz-loujine
// @author       loujine
// @version      2021.4.1
// @downloadURL  https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-edit-replace_rec_artist_from_release_page.user.js
// @updateURL    https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-edit-replace_rec_artist_from_release_page.user.js
// @supportURL   https://github.com/loujine/musicbrainz-scripts
// @icon         https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/icon.png
// @description  musicbrainz.org: Replace associated recording artist from a Release page
// @compatible   firefox+tampermonkey
// @license      MIT
// @require      https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mbz-loujine-common.js
// @include      http*://*musicbrainz.org/release/*
// @exclude      http*://*musicbrainz.org/release/add
// @exclude      http*://*musicbrainz.org/release/*/edit
// @exclude      http*://*musicbrainz.org/release/*/edit-relationships
// @grant        none
// @run-at       document-end
// ==/UserScript==

const editNoteMsg =
    'CSG: Set performer(s) in recording relations as recording artist\n';

function showSelectors() {
    const $rows = $(
        $('table.tbl a[href*="/artist/"]').parents('tr').get().reverse()
    );
    if (!$('#selectorColumn').length) {
        $('.subh').append('<th id="selectorColumn">rels</th>');
    }

    $rows.each(function (idx, tr) {
        const mbid = $(tr).find('a[href*="/recording/"]')
                          .attr('href').split('/')[2];
        $(tr).append(
            $('<td>').append(
                $('<input>', {
                    'id': 'replace-' + mbid,
                    'class': 'replace',
                    'type': 'checkbox',
                    'value': 'Replace artist',
                })
            )
        );
    });

    let lastChecked;
    $('.replace').click(function (evt) {
        let currentChecked = $('.replace').index(evt.target);
        if (evt.shiftKey && lastChecked !== undefined) {
            if (lastChecked > currentChecked) {
                // es6 syntax
                [lastChecked, currentChecked] = [currentChecked, lastChecked];
            }
            $('.replace').slice(lastChecked,
                currentChecked).prop('checked', evt.target.checked);
        }
        lastChecked = $('.replace').index(evt.target);
    });
}

// Replace composer -> performer as recording artist (CSG)
function parseArtistEditData(data, performers) {
    if (
        performers.length === 0 &&
        !document.getElementById('set-unknown').checked
    ) {
        // erase completely data to prevent the POST request
        return null;
    } else if (performers.length === 0) {
        // set [unknown] artist credit
        data['artist_credit.names.0.name'] = '[unknown]';
        data['artist_credit.names.0.join_phrase'] = '';
        data['artist_credit.names.0.artist.name'] = '[unknown]';
        data['artist_credit.names.0.artist.id'] = server.unknownArtistId;
        return data;
    }
    performers.forEach(function (performer, idx) {
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
    return data;
}

function parseEditData(editData) {
    const data = {};
    const performers = [];
    const uniqueIds = [];
    data['name'] = edits.encodeName(editData.name);
    data['comment'] = editData.comment ? editData.comment : null;
    if (editData.video === true) {
        data['video'] = '1';
    }
    if (!editData.isrcs.length) {
        data['isrcs.0'] = null;
    } else {
        editData.isrcs.forEach(function (isrc, idx) {
            data['isrcs.' + idx] = isrc.isrc;
        });
    }
    editData.relationships.forEach(function (rel) {
        const linkType = rel.linkTypeID;
        const filterPending = document.getElementById('pending').checked
            ? !rel.editsPending
            : true;
        if (
            server.performingLinkTypes().includes(linkType) &&
            !uniqueIds.includes(rel.target.id) &&
            filterPending &&
            rel.target.name !== '[unknown]'
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
    data['edit_note'] = $('#batch_replace_edit_note')[0].value;
    if (document.getElementById('set-unknown').checked) {
        data['edit_note'] = data['edit_note'].replace(
            editNoteMsg,
            'Set [unknown] performer when no rel'
        );
    }
    data.make_votable = document.getElementById('votable').checked ? '1' : '0';
    return parseArtistEditData(data, performers.sort(helper.comparefct));
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
                    `<a href="/edit/${editId}" target="_blank">` +
                    `edit ${editId}</a>`
                )
            )
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
            if (postData === null) {
                $('#' + node.id + '-text').text('No artist data to send');
                return;
            }
            requests.POST(
                url,
                edits.formatEdit('edit-recording', postData),
                success,
                fail
            );
        }
        setTimeout(function () {
            $('#' + node.id + '-text').empty();
            $(node).after(
                `<span id="${node.id}-text">Fetching required data</span>`
            );
            edits.getEditParams(url, callback);
        }, 2 * idx * server.timeout);
    });
}

(function displaySidebar() {
    sidebar.container().insertAdjacentHTML('beforeend', `
        <h3>
          <span id="replace_script_toggle" style="cursor: pointer;">▶ Replace artists</span>
        </h3>
        <div id="replace_script_block" style="display:none;">
          <p>First click "Show checkboxes" then select recordings to update</p>
          <input type="button" id="selectors" value="Show checkboxes">

          <input type="button" id="batch_select" value="Select all" disabled="true">

          <table>
          <tr>
            <td><label for="pending">Exclude rels with pending edits</label></td>
            <td><input type="checkbox" id="pending"></td>
          </tr>
          <tr>
            <td><label for="votable">Make all edits votable</label></td>
            <td><input type="checkbox" id="votable"></td>
          </tr>
          <tr>
            <td><label for="set-unknown">Set [unknown] artist if no rel</label></td>
            <td><input type="checkbox" id="set-unknown"></td>
          </tr>
          </table>

          <br />Edit note:
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
    document.getElementById('selectors').addEventListener('click', () => {
        showSelectors();
        $('#batch_select').prop('disabled', false);
        $('#batch_replace_edit_note').prop('disabled', false);
        $('#batch_replace').prop('disabled', false);
        $('#selectors').prop('disabled', true);
    });
    document.getElementById('batch_replace').addEventListener('click', replaceArtist);
    document.getElementById('batch_select').addEventListener('click', () => {
        $('.replace:input').prop('checked', true);
    });
    return false;
});
