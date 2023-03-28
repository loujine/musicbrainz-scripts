/* global $ helper MB relEditor requests server */
'use strict';
// ==UserScript==
// @name         MusicBrainz relation editor: Set writer relation from recording artist
// @namespace    mbz-loujine
// @author       loujine
// @version      2023.3.28
// @downloadURL  https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-reledit-set_rec_artist_as_writer.user.js
// @updateURL    https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-reledit-set_rec_artist_as_writer.user.js
// @supportURL   https://github.com/loujine/musicbrainz-scripts
// @icon         https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/icon.png
// @description  musicbrainz.org relation editor: Set writer relation from recording artist
// @compatible   firefox+tampermonkey
// @license      MIT
// @require      https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mbz-loujine-common.js
// @include      http*://*musicbrainz.org/release/*/edit-relationships
// @grant        none
// @run-at       document-end
// ==/UserScript==

const fillWriterDialog = async (work, track, artistCredit) => {
  const writerLinkType = MB.linkedEntities.link_type[server.workLinkType.composer];

  MB.relationshipEditor.dispatch({
    type: 'update-dialog-location',
    location: {
      batchSelection: false,
      source: work,
      track: track,
    },
  });
  await helper.waitFor(() => !!MB.relationshipEditor.relationshipDialogDispatch, 1);
  MB.relationshipEditor.relationshipDialogDispatch({
    type: 'update-link-type',
    source: work,
    action: {
      type: 'update-autocomplete',
      source: work,
      action: {
        type: 'select-item',
        item: {
          id: writerLinkType.id,
          name: writerLinkType.name,
          type: 'option',
          entity: writerLinkType,
        }
      },
    },
  });
  await helper.delay(10);

  MB.relationshipEditor.relationshipDialogDispatch({
    type: 'update-target-entity',
    source: work,
    action: {
      type: 'update-autocomplete',
      source: work,
      action: {
        type: 'select-item',
        item: {
          type: 'option',
          entity: artistCredit.artist,
          id: artistCredit.artist.id,
          name: artistCredit.name,
        },
      },
    },
  });
  await helper.delay(10);

  MB.relationshipEditor.relationshipDialogDispatch({
    type: 'update-target-entity',
    source: work,
    action: {
      type: 'update-credit',
      action: {
        type: 'set-credit',
        creditedAs: artistCredit.name,
      },
    },
  });
  await helper.delay(10);

  if (document.querySelector('.dialog-content p.error')) {
    console.error('Dialog error, probably an identical relation already exists');
    document.querySelector('.dialog-content button.negative').click();
  } else {
    document.querySelector('.dialog-content button.positive').click();
  }
};

const applyWriter = () => {
  relEditor.orderedSelectedRecordings().forEach(async (recording, recIdx) => {
    const medium = MB.relationshipEditor.state.mediumsByRecordingId.get(recording.id)[0];
    const mediumIdx = medium.position - 1;
    const trackIdx = medium.tracks.filter(t => t.recording.id === recording.id)[0].position -1;
    const track = MB.relationshipEditor.state.entity.mediums[mediumIdx].tracks[trackIdx];

    await helper.delay(recIdx * 1000);
    requests.GET(`/ws/js/entity/${recording.gid}`, resp => {
      const artistCredits = JSON.parse(resp).artistCredit.names;
      recording.relationships.filter(
        rel => rel.target_type === 'work'
      ).map(async (rel, relIdx) => {
        await helper.delay(relIdx * 400);
        const work = rel.target;
        artistCredits.forEach(async (credit, creditIdx) => {
          await helper.delay(creditIdx * 300);
          fillWriterDialog(work, track, credit);
        });
      });
    });
  });
};

(function displayToolbar() {
  relEditor.container(
    document.querySelector('div.tabs')
  ).insertAdjacentHTML('beforeend', `
    <h3>
      <span>
        Set writer on selected recordings
      </span>
    </h3>
    <div>
      <input type="button" id="setWriter" value="Apply">
    </div>
  `);
})();

$(document).ready(function () {
  let appliedNote = false;
  document.getElementById('setWriter').addEventListener('click', () => {
    applyWriter();
    if (!appliedNote) {
      relEditor.editNote(GM_info.script);
      appliedNote = true;
    }
  });
  return false;
});
