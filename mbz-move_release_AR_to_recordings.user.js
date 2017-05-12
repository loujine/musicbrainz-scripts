/* global $ _ MB requests server relEditor */
'use strict';
// ==UserScript==
// @name         MusicBrainz: Move performer AR on release to recordings AR
// @namespace    mbz-loujine
// @author       loujine
// @version      2017.5.12
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
    var ids = [MB.typeInfo['artist-release'][0].id];
    MB.typeInfo['artist-release'][0].children.forEach(function (rel) {
        ids.push(rel.id);
        if (rel.children && rel.children.length) {
            rel.children.forEach(function (subrel) {
                ids.push(subrel.id);
            });
        }
    });
    return ids;
}

function moveAR(ids) {
    var vm = MB.releaseRelationshipEditor;
    vm.source.relationships().forEach(function (rel, idx) {
        if (rel.entityTypes === "artist-release"
                && _.contains(ids, rel.linkTypeID())) {
            var performer = rel.entities()[0];
            var releaseLinkType = rel.linkTypeID();
            var releaseLinkAttributes = rel.attributes();

            var recordings = MB.relationshipEditor.UI.checkedRecordings();
            recordings.forEach(function (recording) {
                if (_.includes(_.filter(
                    recording.relationships(), function (rel) {
                        return rel.entityTypes === "artist-recording"
                    }
                ).map(function (rel) {
                    return rel.entities()[0].id
                }), performer.id)) {
                    return;
                }
                var dialog = MB.relationshipEditor.UI.AddDialog({
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
            });
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
    var ids = fetchLinkIds();
    $('#moveAR').click(function() {
        moveAR(ids);
        relEditor.editNote(GM_info.script, 'Move performers in release AR to individual recordings');
    });
    return false;
});
