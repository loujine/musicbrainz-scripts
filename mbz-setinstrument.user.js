'use strict';
var meta = function() {
// ==UserScript==
// @name         MusicBrainz: Batch-set recording-artist instrument
// @namespace    mbz-loujine
// @author       loujine
// @version      2015.11.08
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-setinstrument.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-setinstrument.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Convert to "string" instrument AR on selected recordings
// @compatible   firefox+greasemonkey
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @require      https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-loujine-releditor.js
// @require      https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-loujine-common.js
// @include      http*://*musicbrainz.org/release/*/edit-relationships
// @grant        none
// @run-at       document-end
// ==/UserScript==
};
if (meta && meta.toString && (meta = meta.toString())) {
    var meta = {'name': meta.match(/@name\s+(.+)/)[1],
                'version': meta.match(/@version\s+(.+)/)[1]};
}

function setInstrument(fromType, toType, attrIds, credit) {
    var recordings = MB.relationshipEditor.UI.checkedRecordings(),
        vm = MB.releaseRelationshipEditor,
        attrIds = attrIds || [];
    recordings.forEach(function(recording) {
        var relationships = recording.getRelationshipGroup(fromType, vm);
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

// container defined in mbz-loujine-releditor.js
$('div.tabs').after(
    $container
    .append(
        $('<h3></h3>', {'text': 'Recording-performer instrument attributes'})
    )
    .append(
        $('<input></input>', {
            'id': 'batch-unset-orchestra',
            'type': 'button',
            'value': 'Unset "Orchestra"'
            })
    )
    .append(
        $('<input></input>', {
            'id': 'batch-unset-instrument',
            'type': 'button',
            'value': 'Unset instrument'
            })
    )
    .append(
        $('<input></input>', {
            'id': 'batch-set-string-quartet',
            'type': 'button',
            'value': 'Set "String Quartet"'
            })
    )
    .append(
        $('<input></input>', {
            'id': 'batch-set-piano-trio',
            'type': 'button',
            'value': 'Set "Piano Trio"'
            })
    )
    .append(
        $('<input></input>', {
            'id': 'batch-set-piano',
            'type': 'button',
            'value': 'Set "Piano"'
            })
    )
);

// imported from mbz-loujine-common.js: linkTypeXXX, ttrIdXXX
$(document).ready(function () {
    $('#batch-unset-orchestra').click(function () {
        setInstrument(linkTypeOrchestra, linkTypePerformer);
        releditorEditNote(meta);
    });
    $('#batch-unset-instrument').click(function () {
        setInstrument(linkTypeInstrument, linkTypePerformer);
        releditorEditNote(meta);
    });
    $('#batch-set-string-quartet').click(function () {
        setInstrument(linkTypePerformer, linkTypeInstrument,
                      [attrIdStrings], 'string quartet');
        releditorEditNote(meta, 'Use "strings" instrument AR for a String Quartet artist');
    });
    $('#batch-set-piano-trio').click(function () {
        setInstrument(linkTypePerformer, linkTypeInstrument,
                      [attrIdPiano, attrIdViolin, attrIdCello]);
        releditorEditNote(meta, 'Use instruments AR for a Piano Trio artist');
    });
    $('#batch-set-piano').click(function () {
        setInstrument(linkTypePerformer, linkTypeInstrument,
                      [attrIdPiano]);
        releditorEditNote(meta);
    });
    return false;
});

