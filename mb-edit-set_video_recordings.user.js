/* global $ requests server sidebar edits */
'use strict';
// ==UserScript==
// @name         MusicBrainz edit: Mark recordings as video
// @namespace    mbz-loujine
// @author       loujine
// @version      2020.6.1
// @downloadURL  https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-edit-set_video_recordings.user.js
// @updateURL    https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-edit-set_video_recordings.user.js
// @supportURL   https://github.com/loujine/musicbrainz-scripts
// @icon         https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/icon.png
// @description  musicbrainz.org: Mark recordings as video
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
                    'id': 'video-' + mbid,
                    'class': 'replacevideo',
                    'type': 'checkbox',
                    'value': 'Set video'
                })
            )
        );
    });

    let lastChecked;
    $('.replacevideo').click(function (evt) {
        let currentChecked = $('.replacevideo').index(evt.target);
        if (evt.shiftKey && lastChecked !== undefined) {
            if (lastChecked > currentChecked) {
                // es6 syntax
                [lastChecked, currentChecked] = [currentChecked, lastChecked];
            }
            $('.replacevideo').slice(lastChecked,
                currentChecked).prop('checked', evt.target.checked);
        }
        lastChecked = $('.replacevideo').index(evt.target);
    });
}

function parseEditData(editData) {
    const data = {};
    data['name'] = edits.encodeName(editData.name);
    data['comment'] = editData.comment ? editData.comment : null;
    data['video'] = "1";
    if (!editData.isrcs.length) {
        data['isrcs.0'] = null;
    } else {
        editData.isrcs.forEach(function (isrc, idx) {
            data['isrcs.' + idx] = isrc.isrc;
        });
    }
    editData.artistCredit.names.forEach(function (performer, idx) {
        data['artist_credit.names.' + idx + '.name'] = edits.encodeName(performer.name);
        data['artist_credit.names.' + idx + '.join_phrase'] = performer.joinPhrase,
        data['artist_credit.names.' + idx + '.artist.name'] = edits.encodeName(
            performer.artist.name
        );
        data['artist_credit.names.' + idx + '.artist.id'] = performer.artist.id;
    });
    data['edit_note'] = sidebar.editNote(GM_info.script);
    data.make_votable = document.getElementById('votable').checked ? '1' : '0';
    return data;
}

function setVideo() {
    $('.replacevideo:input:checked:enabled').each(function (idx, node) {
        const mbid = node.id.replace('video-', '');
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
            requests.POST(url, edits.formatEdit('edit-recording', postData),
                          success, fail);
        }
        setTimeout(function () {
            $('#' + node.id + '-text').empty();
            $(node).after(
                `<span id="${node.id}-text">Fetching required data</span>`);
            edits.getEditParams(url, callback);
        }, 2 * idx * server.timeout);
    });
}

(function displaySidebar() {
    sidebar.container().insertAdjacentHTML('beforeend', `
        <h3><span id="video_script_toggle">▶ Set video</span></h3>
        <div id="video_script_block" style="display:none;">
          <p>First click "Show checkboxes" then select recordings to update</p>
          <input type="button" id="video_selectors" value="Show checkboxes">

          <table>
          <tr>
            <td><label for="votable">Make all edits votable</label></td>
            <td><input type="checkbox" id="votable"></td>
          </tr>
          </table>
          <input type="button" id="batch_video" value="Set video attribute" disabled="true">
        </div>
    `);
})();

$(document).ready(function () {
    document.getElementById('video_script_toggle').addEventListener('click', () => {
        const header = document.getElementById('video_script_toggle');
        const block = document.getElementById('video_script_block');
        const display = block.style.display;
        header.textContent = header.textContent.replace(/./, display == "block" ? "▶" : "▼");
        block.style.display = display == "block" ? "none" : "block";
    });
    document.getElementById('video_selectors').addEventListener('click', () => {
        showSelectors();
        $('#batch_video').prop('disabled', false);
        $('#video_selectors').prop('disabled', true);
    });
    document.getElementById('batch_video').addEventListener('click', setVideo);
    return false;
});
