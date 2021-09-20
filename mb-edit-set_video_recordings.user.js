/* global $ requests server sidebar edits helper */
'use strict';
// ==UserScript==
// @name         MusicBrainz edit: Mark recordings as video
// @namespace    mbz-loujine
// @author       loujine
// @version      2021.9.19
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

const editNoteMsg = `
    From release ${document.URL}
`;

function showSelectors() {
    Array.from(document.getElementsByClassName('subh')).map(
        el => el.insertAdjacentHTML('beforeend',
            '<th class="videoSelectorColumn">video</th>')
    );

    const rows = document.querySelectorAll('table.tbl tr.odd,tr.even');
    Array.from(rows).map(row => {
        const mbid = helper.mbidFromURL(
            row.querySelector('a[href*="/recording/"]').href
        );
        row.insertAdjacentHTML('beforeend', `
            <td>
              <input id="video-${mbid}" class="replacevideo" type="checkbox" value="Set video">
            </td>
        `);
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
    data.name = edits.encodeName(editData.name);
    data.video = "1";
    if (!editData.isrcs.length) {
        data['isrcs.0'] = null;
    } else {
        editData.isrcs.forEach(function (isrc, idx) {
            data['isrcs.' + idx] = isrc.isrc;
        });
    }
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
            if (editData.video) {
                $('#' + node.id + '-text').text('Already video recording');
                node.disabled = true;
                return;
            }
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
            $(node).after(
                `<span id="${node.id}-text">Fetching required data</span>`
            );
            edits.getEditParams(url, callback);
        }, 2 * idx * server.timeout);
    });
}

(function displaySidebar() {
    if (!helper.isUserLoggedIn()) {
        return;
    }
    sidebar.container().insertAdjacentHTML('beforeend', `
      <details id="video_script_toggle">
        <summary style="display: block;margin-left: 8px;cursor: pointer;">
          <h3 style="display: list-item;">
            Set video
          </h3>
        </summary>
        <div>
          <input type="button" id="batch_video_select" value="Select all">
          <table>
            <tr>
              <td><label for="votable">Make all edits votable</label></td>
              <td><input type="checkbox" id="votable"></td>
            </tr>
          </table>
          <br />Edit note:
          <textarea id="batch_video_edit_note">
            ${sidebar.editNote(GM_info.script, editNoteMsg)}
          </textarea>
          <input type="button" id="batch_video" value="Set video attribute">
        </div>
      </details>
    `);
})();

$(document).ready(function () {
    if (!helper.isUserLoggedIn()) {
        return false;
    }
    document.getElementById('video_script_toggle').addEventListener('click', () => {
        if (!document.getElementsByClassName('videoSelectorColumn').length) {
            showSelectors();
        }
    });
    document.getElementById('batch_video_select').addEventListener('click', () => {
        $('.replacevideo:input').filter(':visible').prop('checked', true);
    });
    document.getElementById('batch_video').addEventListener('click', setVideo);
    return false;
});
