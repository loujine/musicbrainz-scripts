/* global $ MB server relEditor GM_info */
'use strict';
// ==UserScript==
// @name         MusicBrainz: Move performer AR on release to recordings AR
// @namespace    mbz-loujine
// @author       loujine
// @version      2017.11.1
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-move_release_AR_to_recordings.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-move_release_AR_to_recordings.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Move performer AR on release to recordings AR
// @compatible   firefox+greasemonkey
// @license      MIT
// @require      https://greasyfork.org/scripts/13747-mbz-loujine-common/code/mbz-loujine-common.js?version=195378
// @include      http*://*musicbrainz.org/release/*/edit-relationships
// @include      http*://*mbsandbox.org/release/*/edit-relationships
// @grant        none
// @run-at       document-end
// ==/UserScript==

function fetchLinkIds() {
    const ids = [MB.typeInfo['artist-release'][0].id];
    for (const rel of MB.typeInfo['artist-release'][0].children) {
        ids.push(rel.id);
        if (rel.children && rel.children.length) {
            for (const subrel of rel.children) {
                ids.push(subrel.id);
            }
        }
    }
    return ids;
}

function moveAR(ids) {
    const vm = MB.releaseRelationshipEditor;
    vm.source.relationships().forEach((rel, idx) => {
        if (rel.entityTypes === "artist-release"
                && ids.includes(rel.linkTypeID())) {
            const performer = rel.entities()[0],
                releaseLinkType = rel.linkTypeID(),
                releaseLinkAttributes = rel.attributes(),
                recordings = MB.relationshipEditor.UI.checkedRecordings();
            for (const recording of recordings) {
                if (recording.relationships().filter(
                    rel => rel.entityTypes === "artist-recording"
                ).map(
                    rel => rel.entities()[0].id
                ).includes(performer.id)) {
                    return;
                }
                const dialog = new MB.relationshipEditor.UI.AddDialog({
                    source: recording,
                    target: performer,
                    viewModel: vm
                });
                dialog.relationship().linkTypeID(
                    server.releaseToRecordingLink(releaseLinkType)
                );
                dialog.accept();
                if (releaseLinkAttributes.length) {
                    dialog.relationship().setAttributes(releaseLinkAttributes);
                }
            }
            if (recordings.length) {
                $('#release-rels .remove-button')[idx].click();
            }

        }
    });
}

(function displayToolbar(relEditor) {
    $('div.tabs').after(
        relEditor.container().append(
            $('<h3>Move AR to recordings</h3>')
        ).append(
            $('<input>', {
                'id': 'moveAR',
                'type': 'button',
                'value': 'Move AR to selected recordings'
            })
        )
    );
})(relEditor);


$(document).ready(function() {
    const ids = fetchLinkIds();
    $('#moveAR').click(() => {
        moveAR(ids);
        relEditor.editNote(
            GM_info.script,
            'Move performers in release AR to individual recordings'
        );
    });
    return false;
});
