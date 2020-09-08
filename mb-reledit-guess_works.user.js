/* global $ MB requests helper server relEditor GM_info */
'use strict';
// ==UserScript==
// @name         MusicBrainz relation editor: Guess related works in batch
// @namespace    mbz-loujine
// @author       loujine
// @version      2020.9.8.1
// @downloadURL  https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-reledit-guess_works.user.js
// @updateURL    https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-reledit-guess_works.user.js
// @supportURL   https://github.com/loujine/musicbrainz-scripts
// @icon         https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/icon.png
// @description  musicbrainz.org relation editor: Guess related works in batch
// @compatible   firefox+tampermonkey
// @license      MIT
// @require      https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mbz-loujine-common.js
// @include      http*://*musicbrainz.org/release/*/edit-relationships
// @grant        none
// @run-at       document-end
// ==/UserScript==

var MBID_REGEX = /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/;

function setWork(recording, work) {
    requests.GET(`/ws/js/entity/${work.gid}?inc=rels`, function (resp) {
        var target = JSON.parse(resp);
        var dialog = new MB.relationshipEditor.UI.AddDialog({
            source: recording,
            target: target,
            viewModel: MB.releaseRelationshipEditor
        });
        target.relationships.forEach(function (rel) {
            // apparently necessary to fill MB.entityCache with rels
            MB.getRelationship(rel, target);
        });
        dialog.accept();
    });
}

function guessWork() {
    let idx = 0;
    MB.relationshipEditor.UI.checkedRecordings().forEach(function (recording) {
        var url = '/ws/js/work/?q=' +
                  encodeURIComponent(document.getElementById('prefix').value) + ' ' +
                  encodeURIComponent(recording.name) +
                  '&artist=' + encodeURIComponent(recording.artist) +
                  '&fmt=json&limit=1';
        if (!recording.performances().length) {
            idx += 1;
            setTimeout(function () {
                requests.GET(url, function (resp) {
                    setWork(recording, JSON.parse(resp)[0]);
                });
            }, idx * server.timeout);
        }
    });
}

function autoComplete() {
    var $input = $('input#mainWork');
    var match = $input.val().match(MBID_REGEX);
    if (match) {
        var mbid = match[0];
        requests.GET(`/ws/2/work/${mbid}?fmt=json`, function (data) {
            data = JSON.parse(data);
            $input.data('mbid', mbid);
            $input.val(data.title || data.name);
            $input.css('background', '#bbffbb');
        });
    } else {
        $input.css('background', '#ffaaaa');
    }
}

function guessSubWorks(workMbid) {
    if (workMbid.split('/').length > 1) {
        workMbid = workMbid.split('/')[4];
    }
    requests.GET(`/ws/js/entity/${workMbid}?inc=rels`, function (resp) {
        let repeats = document.getElementById('repeats').value.trim();
        const subWorks = helper.sortSubworks(JSON.parse(resp));
        let total = subWorks.length;
        if (repeats) {
            repeats = repeats.split(/[,; ]+/).map(s => Number.parseInt(s));
            total = repeats.reduce((n,m) => n+m, 0);
        } else {
            repeats = subWorks.map(() => 1);
        }
        const repeatedSubWorks = Array(total);
        let start = 0;
        subWorks.forEach((sb, sbIdx) => {
            repeatedSubWorks.fill(sb, start, start + repeats[sbIdx]);
            start += repeats[sbIdx];
        })

        MB.relationshipEditor.UI.checkedRecordings().forEach((recording, recIdx) => {
            if (recIdx >= repeatedSubWorks.length) {
                return;
            }
            if (!recording.performances().length) {
                setWork(recording, repeatedSubWorks[recIdx]);
            }
        });
    });
}


(function displayToolbar() {
    relEditor.container(document.querySelector('div.tabs'))
             .insertAdjacentHTML('beforeend', `
        <h3><span id="guess_works_script_toggle">▼ Search for works</span></h3>
        <div id="guess_works_script_block" style="display:block;">
        <p>
          You can add an optional prefix (e.g. the misssing parent work name)
          to help guessing the right work
        </p>
        <span>prefix:&nbsp;</span>
        <input type="text" id="prefix" value="" placeholder="optional">
        <input type="button" id="searchWork" value="Guess works">
        <br />
        <h3>Link to parts of a main Work</h3>
        <p>
          Fill the main work mbid to link selected recordings to (ordered) parts
          of the work.  Use the repeats fields to use the same subwork on
          successive recordings (e.g. for opera acts)
        </p>
        <span>Main work name:&nbsp;</span>
        <input type="text" id="mainWork" placeholder="main work mbid">
        <input type="button" id="searchSubworks" value="Guess subworks">
        <br />
        <span>Repeats:&nbsp;</span>
        <input type="text" id="repeats" placeholder="n1,n2,n3... (optional)">
        </div>
    `);
})();


$(document).ready(function() {
    document.getElementById('guess_works_script_toggle').addEventListener('click', () => {
        const header = document.getElementById('guess_works_script_toggle'),
            block = document.getElementById('guess_works_script_block'),
            display = block.style.display;
        header.textContent = header.textContent.replace(/./, display == "block" ? "▶" : "▼");
        block.style.display = display == "block" ? "none" : "block";
    });
    let appliedNote = false;
    document.getElementById('searchWork').addEventListener('click', () => {
        guessWork();
        if (!appliedNote) {
            relEditor.editNote(GM_info.script, 'Set guessed works');
            appliedNote = true;
        }
    });
    $('input#mainWork').on('input', autoComplete);
    document.querySelector('input#searchSubworks').addEventListener('click', () => {
        guessSubWorks($('input#mainWork').data('mbid'));
        if (!appliedNote) {
            relEditor.editNote(GM_info.script, 'Set guessed subworks');
            appliedNote = true;
        }
    });
    return false;
});
