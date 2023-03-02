/* global $ MB requests helper server relEditor */
'use strict';
// ==UserScript==
// @name         MusicBrainz relation editor: Guess related works in batch
// @namespace    mbz-loujine
// @author       loujine
// @version      2023.2.28
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

const MBID_REGEX = /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/;
const repeatHelp = `Ways to associate subworks SW1, SW2, SW3... with selected tracks T1, T2, T3...
    1,1,1 (or empty) -> SW1 on T1, SW2 on T2, SW3 on T3...
    1,0,1 -> SW1 on T1, SW2 skipped, SW3 on T2...
    1,2,1 -> SW1 on T1, SW2 on T2 and T3 (as partial); SW3 on T4...
    1,-1,1 -> SW1 and SW2 on T1, SW3 on T2...
`;

const setWork = async (recording, work, partial) => {
    const medium = MB.relationshipEditor.state.mediumsByRecordingId.get(recording.id)[0];
    const mediumIdx = medium.position - 1;
    const trackIdx = medium.tracks.filter(t => t.recording.id === recording.id)[0].position -1;

    await helper.waitFor(() => !MB.relationshipEditor.relationshipDialogDispatch, 1);
    MB.relationshipEditor.dispatch({
        type: 'update-dialog-location',
        location: {
            batchSelection: false,
            source: recording,
            targetType: 'work',
            track: MB.relationshipEditor.state.entity.mediums[mediumIdx].tracks[trackIdx],
        },
    });
    await helper.waitFor(() => !!MB.relationshipEditor.relationshipDialogDispatch, 1);

    MB.relationshipEditor.relationshipDialogDispatch({
        type: 'update-target-entity',
        source: recording,
        action: {
            type: 'update-autocomplete',
            source: recording,
            action: {
                type: 'select-item',
                item: {
                    type: 'option',
                    entity: work,
                    id: work.id,
                    name: work.name,
                },
            },
        },
    });

    if (partial) {
        const attrType = MB.linkedEntities.link_attribute_type[server.attr.partial];
        MB.relationshipEditor.relationshipDialogDispatch({
            type: 'set-attributes',
            attributes: [{
                type: {gid: attrType.gid},
                typeID: attrType.id,
                typeName: attrType.name,
            }],
        });
    }
    await helper.delay(1);

    if (document.querySelector('.dialog-content p.error')) {
        console.error('Dialog error, probably an identical relation already exists');
        document.querySelector('.dialog-content button.negative').click();
    } else {
        document.querySelector('.dialog-content button.positive').click();
    }
};

const replaceWork = async (recording, work) => {
    const rel = recording.relationships.filter(rel => rel.target_type === 'work')[0];

    await helper.waitFor(() => !MB.relationshipEditor.relationshipDialogDispatch, 1);

    document.getElementById(`edit-relationship-recording-work-${rel.id}`).click();
    await helper.waitFor(() => !!MB.relationshipEditor.relationshipDialogDispatch, 1);

    MB.relationshipEditor.relationshipDialogDispatch({
        type: 'update-target-entity',
        source: recording,
        action: {
            type: 'update-autocomplete',
            source: recording,
            action: {
                type: 'select-item',
                item: {
                    type: 'option',
                    entity: work,
                    id: work.id,
                    name: work.name,
                },
            },
        },
    });
    await helper.delay(1);

    if (document.querySelector('.dialog-content p.error')) {
        console.error('Dialog error, probably an identical relation already exists');
        document.querySelector('.dialog-content button.negative').click();
    } else {
        document.querySelector('.dialog-content button.positive').click();
    }
};

const guessWork = () => {
    const recordings = MB.tree.toArray(MB.relationshipEditor.state.selectedRecordings);
    if (!recordings.length) {
        alert('No relation selected');
        return;
    }

    // sort recordings by order in tracklist to avoid having the dialog jump everywhere
    const recOrder = MB.getSourceEntityInstance().mediums.flatMap(
        m => m.tracks
    ).map(t => t.recording.id);
    recordings.sort((r1, r2) => recOrder.indexOf(r1.id) - recOrder.indexOf(r2.id));

    let idx = 0;
    recordings.forEach(recording => {
        const url =
            '/ws/js/work/?q=' +
            encodeURIComponent(document.getElementById('prefix').value) +
            ' ' +
            encodeURIComponent(recording.name) +
            '&artist=' +
            encodeURIComponent(recording.artist) +
            '&fmt=json&limit=1';
        if (!recording.related_works.length) {
            idx += 1;
            setTimeout(function () {
                requests.GET(url, function (resp) {
                    setWork(recording, JSON.parse(resp)[0]);
                });
            }, idx * server.timeout);
        }
    });
};

const autoComplete = () => {
    const $input = $('input#mainWork');
    const match = $input.val().match(MBID_REGEX);
    if (match) {
        const mbid = match[0];
        requests.GET(`/ws/2/work/${mbid}?fmt=json`, function (data) {
            data = JSON.parse(data);
            $input.data('mbid', mbid);
            $input.val(data.title || data.name);
            $input.css('background', '#bbffbb');
        });
    } else {
        $input.css('background', '#ffaaaa');
    }
};

const fetchSubWorks = (workMbid, replace) => {
    replace = replace || false;
    if (workMbid.split('/').length > 1) {
        workMbid = workMbid.split('/')[4];
    }
    requests.GET(`/ws/js/entity/${workMbid}?inc=rels`, function (resp) {
        let repeats = document.getElementById('repeats').value.trim();
        const subWorks = helper.sortSubworks(JSON.parse(resp));
        let total = subWorks.length;
        if (repeats) {
            repeats = repeats.split(/[,; ]+/).map(s => Number.parseInt(s));
            total = repeats.reduce((n, m) => Math.max(n,0) + Math.max(m,0), 0);
        } else {
            repeats = subWorks.map(() => 1);
        }
        const repeatedSubWorks = Array(total);
        const partialSubWorks = Array(total);
        let start = 0;
        subWorks.forEach((sb, sbIdx) => {
            if (repeats[sbIdx] < 0) {
                repeatedSubWorks[start-1].push(sb);
                partialSubWorks.fill(false, start-1, start);
            } else {
                repeatedSubWorks.fill([sb], start, start + repeats[sbIdx]);
                partialSubWorks.fill(
                    repeats[sbIdx] > 1 ? true : false, start, start + repeats[sbIdx]);
                start += repeats[sbIdx];
            }
        });

        const recordings = MB.tree.toArray(MB.relationshipEditor.state.selectedRecordings);
        if (!recordings.length) {
            alert('No relation selected');
            return;
        }

        // sort recordings by order in tracklist to avoid having the dialog jump everywhere
        const recOrder = MB.getSourceEntityInstance().mediums.flatMap(
            m => m.tracks
        ).map(t => t.recording.id);
        recordings.sort((r1, r2) => recOrder.indexOf(r1.id) - recOrder.indexOf(r2.id));

        recordings.forEach(async (recording, recIdx) => {
            await helper.delay(recIdx * 200);
            if (recIdx >= repeatedSubWorks.length) {
                return;
            }
            repeatedSubWorks[recIdx].forEach(async (subw, subwIdx) => {
                await helper.delay(subwIdx * 60);
                if (replace && recording.related_works.length) {
                    replaceWork(recording, subw);
                } else if (!recording.related_works.length) {
                    setWork(recording, subw, partialSubWorks[recIdx]);
                }
            });
        });
    });
};

(function displayToolbar() {
    relEditor.container(document.querySelector('div.tabs'))
             .insertAdjacentHTML('beforeend', `
      <details open="">
        <summary style="display: block;margin-left: 8px;cursor: pointer;">
          <h3 style="display: list-item;">
            Search for works
          </h3>
        </summary>
        <div>
          <span>
            <abbr title="You can add an optional prefix (e.g. the misssing parent
            work name) to help guessing the right work">prefix</abbr>:&nbsp;
          </span>
          <input type="text" id="prefix" value="" placeholder="optional">
          <br />
          <input type="button" id="searchWork" value="Guess works">
          <br />
          <h3>Link to parts of a main Work</h3>
          <p>
            Fill the main work mbid to link selected recordings to (ordered) parts of the work.
          </p>
          <span>
            Repeats:&nbsp;
          </span>
          <input type="text" id="repeats" placeholder="n1,n2,n3... (optional)">
          <span title="${repeatHelp}">🛈</span>
          <br />
          <label for="replaceSubworks">Replace work if pre-existing:&nbsp;</label>
          <input type="checkbox" id="replaceSubworks">
          <br />
          <span>Main work name:&nbsp;</span>
          <input type="text" id="mainWork" placeholder="main work mbid">
          <input type="button" id="fetchSubworks" value="Load subworks">
        </div>
      </details>
    `);
})();


$(document).ready(function() {
    let appliedNote = false;
    document.getElementById('searchWork').addEventListener('click', () => {
        guessWork();
        if (!appliedNote) {
            relEditor.editNote(GM_info.script, 'Set guessed works');
            appliedNote = true;
        }
    });
    $('input#mainWork').on('input', autoComplete);
    document.querySelector('input#fetchSubworks').addEventListener('click', () => {
        fetchSubWorks(
            $('input#mainWork').data('mbid'),
            document.querySelector('input#replaceSubworks').checked
        );
        if (!appliedNote) {
            relEditor.editNote(GM_info.script, 'Set guessed subworks');
            appliedNote = true;
        }
    });
    return false;
});
