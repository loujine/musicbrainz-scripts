/* global $ MB server relEditor GM_info */
'use strict';
// ==UserScript==
// @name         MusicBrainz: Batch-set recording-artist instrument
// @namespace    mbz-loujine
// @author       loujine
// @version      2017.11.1
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-setinstrument.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-setinstrument.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Convert to "string" instrument AR on selected recordings
// @compatible   firefox+greasemonkey
// @license      MIT
// @require      https://greasyfork.org/scripts/13747-mbz-loujine-common/code/mbz-loujine-common.js?version=228700
// @include      http*://*musicbrainz.org/release/*/edit-relationships
// @grant        none
// @run-at       document-end
// ==/UserScript==

function setInstrument(fromType, toType, attrIds, credit) {
    function _relationships(recording, type) {
        var relations = [];
        recording.relationships().forEach(function(relation) {
            if (relation.linkTypeID() === type) {relations.push(relation);}
        })
        return relations;
    }

    attrIds = attrIds || [];
    var recordings = MB.relationshipEditor.UI.checkedRecordings();
    recordings.forEach(function(recording) {
        var relationships = _relationships(recording, fromType);
        relationships.forEach(function(relation) {
            var attrs = relation.attributes();
            const offset = attrs.length;
            relation.linkTypeID(toType);
            attrIds.forEach(function (attrId) {
                attrs.push({type: MB.attrInfoByID[attrId]});
            });
            relation.setAttributes(attrs);
            attrIds.forEach(function (attrId, idx) {
                relation.attributes()[idx + offset].creditedAs(credit);
            });
         });
    });
}

(function displayToolbar(relEditor) {
    $('div.tabs').after(
        relEditor.container().append(
            $('<h3>Recording-performer instrument attributes</h3>')
        ).append(
            $('<input>', {
                'id': 'batch-unset-orchestra',
                'type': 'button',
                'value': 'Unset "Orchestra"'
            })
        ).append(
            $('<input>', {
                'id': 'batch-unset-instrument',
                'type': 'button',
                'value': 'Unset instrument'
            })
        ).append(
            $('<input>', {
                'id': 'batch-set-string-quartet',
                'type': 'button',
                'value': 'Set "String Quartet"'
            })
        ).append(
            $('<input>', {
                'id': 'batch-set-piano-trio',
                'type': 'button',
                'value': 'Set "Piano Trio"'
            })
        ).append(
            $('<input>', {
                'id': 'batch-set-piano',
                'type': 'button',
                'value': 'Set "Piano"'
            })
        )
    );
})(relEditor);

// imported from mbz-loujine-common.js: server
$(document).ready(function () {
    var link = server.recordingLinkType;
    $('#batch-unset-orchestra').click(function () {
        setInstrument(link.orchestra, link.performer);
        relEditor.editNote(GM_info.script);
    });
    $('#batch-unset-instrument').click(function () {
        setInstrument(link.instrument, link.performer);
        relEditor.editNote(GM_info.script);
    });
    $('#batch-set-string-quartet').click(function () {
        setInstrument(link.performer, link.instrument,
                      [server.attr.strings], 'string quartet');
        relEditor.editNote(GM_info.script, 'Use "strings" instrument AR for a String Quartet artist');
    });
    $('#batch-set-piano-trio').click(function () {
        setInstrument(link.performer, link.instrument,
                      [server.attr.piano, server.attr.violin, server.attr.cello]);
        relEditor.editNote(GM_info.script, 'Use instruments AR for a Piano Trio artist');
    });
    $('#batch-set-piano').click(function () {
        setInstrument(link.performer, link.instrument,
                      [server.attr.piano]);
        relEditor.editNote(GM_info.script);
    });
    return false;
});
