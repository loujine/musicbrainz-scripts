/* global $ helper MB relEditor server */
'use strict';
// ==UserScript==
// @name         MusicBrainz relation editor: Copy dates on recording relations
// @namespace    mbz-loujine
// @author       loujine
// @version      2024.11.25
// @downloadURL  https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-reledit-copy_dates.user.js
// @updateURL    https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mb-reledit-copy_dates.user.js
// @supportURL   https://github.com/loujine/musicbrainz-scripts
// @icon         https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/icon.png
// @description  musicbrainz.org relation editor: Copy/remove dates on recording relations
// @compatible   firefox+tampermonkey
// @license      MIT
// @require      https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mbz-loujine-common.js
// @include      http*://*musicbrainz.org/release/*/edit-relationships
// @grant        none
// @run-at       document-end
// ==/UserScript==

/** look for one recording relation with a date
 * give priority to the most precise one (day > month > year)
 */
const referenceDate = relations => {
    for (const rel of relations) {
        if (Object.values(server.recordingLinkType).includes(parseInt(rel.linkTypeID))) {
            for (const prop of ['end_date', 'begin_date']) {
                if (rel[prop] !== null) {
                    for (const unit of ['day', 'month', 'year']) {
                        if (rel[prop][unit] !== null) {
                            return rel;
                        }
                    }
                }
            }
        }
    }
    return -1;
};

async function applyNewDate(rel, dateProps) {
    const relType = rel.backward
        ? `${rel.target_type}-${rel.source_type}`
        : `${rel.source_type}-${rel.target_type}`;

    await helper.waitFor(() => !MB.relationshipEditor.relationshipDialogDispatch, 1);

    document.getElementById(`edit-relationship-${relType}-${rel.id}`).click();
    await helper.waitFor(() => !!MB.relationshipEditor.relationshipDialogDispatch, 1);

    MB.relationshipEditor.relationshipDialogDispatch({
        type: 'update-date-period',
        action: {
            type: 'update-begin-date',
            action: {
                type: 'set-date',
                date: relEditor.parseDate(dateProps.begin_date),
            },
        },
    });

    MB.relationshipEditor.relationshipDialogDispatch({
        type: 'update-date-period',
        action: {
            type: 'update-end-date',
            action: {
                type: 'set-date',
                date: relEditor.parseDate(dateProps.end_date),
            },
        },
    });

    MB.relationshipEditor.relationshipDialogDispatch({
        type: 'update-date-period',
        action: {
            type: 'set-ended',
            enabled: dateProps.ended,
        },
    });
    await helper.delay(1);

    document.querySelector('.relationship-dialog button.positive').click();
}

const propagateDates = (replace) => {
    relEditor.orderedSelectedRecordings().forEach(async (recording, recIdx) => {
        await helper.delay(recIdx * 100);
        let relIdx = 0;

        const refRel = referenceDate(recording.relationships);
        if (refRel === -1) {
            return;
        }
        recording.relationships.map(async rel => {
            // TODO do not touch relations pending removal
            if (!Object.values(server.recordingLinkType).includes(parseInt(rel.linkTypeID))) {
                return;
            }
            if (!replace && (rel.begin_date || rel.end_date)) {
                return;
            }
            relIdx += 1;
            await helper.delay(relIdx * 10);

            await applyNewDate(rel, refRel);
        });
    });
};

const removeDates = () => {
    relEditor.orderedSelectedRecordings().forEach(async (recording, recIdx) => {
        await helper.delay(recIdx * 100);
        recording.relationships.forEach(async (rel, relIdx) => {
            await helper.delay(relIdx * 10);
            if (rel.begin_date === null && rel.end_date === null && !rel.ended) {
                return;
            }

            await applyNewDate(rel, {begin_date: null, end_date: null, ended: false});
        });
    });
};

(function displayToolbar() {
    relEditor.container(document.querySelector('div.tabs'))
    .insertAdjacentHTML('beforeend', `
        <h3>Dates</h3>
        <label for="replaceDates">Replace dates if pre-existing:&nbsp;</label>
        <input type="checkbox" id="replaceDates">
        <br />
        <input type="button" id="copyDates" value="Copy dates">
        <input type="button" id="removeDates" value="Removes dates">
    `);
})();

$(document).ready(function () {
    let appliedNote = false;
    document.getElementById('removeDates').addEventListener('click', () => {
        removeDates();
        if (!appliedNote) {
            relEditor.editNote(GM_info.script);
            appliedNote = true;
        }
    });
    document.getElementById('copyDates').addEventListener('click', () => {
        propagateDates(
            document.querySelector('input#replaceDates').checked
        );
        if (!appliedNote) {
            relEditor.editNote(
                GM_info.script,
                'Propagate recording dates from other relationships'
            );
            appliedNote = true;
        }
    });
    return false;
});
