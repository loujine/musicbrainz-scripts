'use strict';
var meta = function() {
// ==UserScript==
// @name         MusicBrainz: Batch-set recording-artist instrument
// @namespace    mbz-loujine
// @author       loujine
// @version      2016.1.29
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-setinstrument.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-setinstrument.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Convert to "string" instrument AR on selected recordings
// @compatible   firefox+greasemonkey
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @require      https://greasyfork.org/scripts/13747-mbz-loujine-common/code/mbz-loujine-common.js?version=104306
// @include      http*://*musicbrainz.org/release/*/edit-relationships
// @grant        none
// @run-at       document-end
// ==/UserScript==
};
if (meta && meta.toString && (meta = meta.toString())) {
    var meta = {'name': meta.match(/@name\s+(.+)/)[1],
                'version': meta.match(/@version\s+(.+)/)[1]};
}

// imported from mbz-loujine-releditor.js: server, relEditor
var $ = jQuery,
    server = server,
    relEditor = relEditor;

function setInstrument(fromType, toType, attrIds, credit) {
    function _relationships(recording, type) {
        var relations = [];
        recording.relationships().forEach(function(relation) {
            if (relation.linkTypeID() === type) {relations.push(relation);}
        })
        return relations;
    }

    attrIds = attrIds || [];
    var recordings = MB.relationshipEditor.UI.checkedRecordings(),
        vm = MB.releaseRelationshipEditor;
    recordings.forEach(function(recording) {
        var relationships = _relationships(recording, fromType);
        relationships.forEach(function(relation) {
            var attrs = relation.attributes();
            relation.linkTypeID(toType);
            attrIds.forEach(function(attrId) {
                attrs.push({ type: MB.attrInfoByID[attrId] });
            });
            relation.setAttributes(attrs);
            attrIds.forEach(function(attrId, idx) {
                relation.attributes()[idx].creditedAs(credit);
            });
         });
    });
}

(function displayToolbar(relEditor) {
    $('div.tabs').after(
        relEditor.container().append(
            $('<h3></h3>', {'text': 'Recording-performer instrument attributes'})
        ).append(
            $('<input></input>', {
                'id': 'batch-unset-orchestra',
                'type': 'button',
                'value': 'Unset "Orchestra"'
            })
        ).append(
            $('<input></input>', {
                'id': 'batch-unset-instrument',
                'type': 'button',
                'value': 'Unset instrument'
            })
        ).append(
            $('<input></input>', {
                'id': 'batch-set-string-quartet',
                'type': 'button',
                'value': 'Set "String Quartet"'
            })
        ).append(
            $('<input></input>', {
                'id': 'batch-set-piano-trio',
                'type': 'button',
                'value': 'Set "Piano Trio"'
            })
        ).append(
            $('<input></input>', {
                'id': 'batch-set-piano',
                'type': 'button',
                'value': 'Set "Piano"'
            })
        )
    );
})(relEditor);

// imported from mbz-loujine-common.js: server
$(document).ready(function () {
    $('#batch-unset-orchestra').click(function () {
        setInstrument(server.link.orchestra, server.link.performer);
        relEditor.editNote(meta);
    });
    $('#batch-unset-instrument').click(function () {
        setInstrument(server.link.instrument, server.link.performer);
        relEditor.editNote(meta);
    });
    $('#batch-set-string-quartet').click(function () {
        setInstrument(server.link.performer, server.link.instrument,
                      [server.attr.strings], 'string quartet');
        relEditor.editNote(meta, 'Use "strings" instrument AR for a String Quartet artist');
    });
    $('#batch-set-piano-trio').click(function () {
        setInstrument(server.link.performer, server.link.instrument,
                      [server.attr.piano, server.attr.violin, server.attr.cello]);
        relEditor.editNote(meta, 'Use instruments AR for a Piano Trio artist');
    });
    $('#batch-set-piano').click(function () {
        setInstrument(server.link.performer, server.link.instrument,
                      [server.attr.piano]);
        relEditor.editNote(meta);
    });
    return false;
});

