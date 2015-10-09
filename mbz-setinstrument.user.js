// ==UserScript==
// @name         MusicBrainz: Batch-set recording-artist instrument
// @author       loujine
// @version      2015.10.09
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-setinstrument.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-setinstrument.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Convert to "string" instrument AR on selected recordings
// @compatible   firefox+greasemonkey  quickly tested
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @include      http*://*musicbrainz.org/release/*/edit-relationships
// @grant        none
// @run-at       document-end
// ==/UserScript==

'use strict';

// from musicbrainz-server/root/static/scripts/tests/typeInfo.js
var linkTypeInstrument = 148,
    linkTypeOrchestra = 150,
    linkTypePerformer = 156,
    attrIdPiano = 180,
    attrIdViolin = 86,
    attrIdCello = 84,
    attrIdStrings = 69;

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
            console.log(attrs);
            relation.setAttributes(attrs);
            attrIds.forEach(function(attrId, idx) {
                relation.attributes()[idx].creditedAs(credit);
            });
         });
    });
}

if ($('div#loujine-menu').length) {
    var container = $('div#loujine-menu');
} else {
    var container = $('<div></div>', {
        'id': 'loujine-menu',
        'css': {'background-color': 'white',
                'padding': '8px',
                'margin': '0px -6px 6px',
                'border': '5px dotted #736DAB'
            }
        }
    ).append(
        $('<h2></h2>', {'text': 'loujine GM tools'})
    );
}

$('div.tabs').after(
    container
    .append(
        $('<h3></h3>', {'text': 'Recording-performer instrument attributes'})
    ).append(
        $('<input></input>', {
            'id': 'batch-unset-orchestra',
            'type': 'button',
            'value': 'Batch-unset "Orchestra"'
            })
    ).append(
        $('<input></input>', {
            'id': 'batch-set-string-quartet',
            'type': 'button',
            'value': 'Batch-set "String Quartet"'
            })
    ).append(
        $('<input></input>', {
            'id': 'batch-set-piano-trio',
            'type': 'button',
            'value': 'Batch-set "Piano Trio"'
            })
    ).append(
        $('<input></input>', {
            'id': 'batch-set-piano',
            'type': 'button',
            'value': 'Batch-set "Piano"'
            })
    )
);

function signEditNote(msg) {
    var vm = MB.releaseRelationshipEditor,
        oldmsg = vm.editNote(),
        signature = '\n\n--\n' + 'Using "MusicBrainz: Batch-set instruments" GM script\n';
    vm.editNote(oldmsg + msg + signature);
}

$(document).ready(function() {
    $('#batch-unset-orchestra').click(function() {
        setInstrument(linkTypeOrchestra, linkTypePerformer);
        signEditNote();
    });
    $('#batch-set-string-quartet').click(function() {
        setInstrument(linkTypePerformer, linkTypeInstrument,
                      [attrIdStrings], 'string quartet');
        signEditNote('Use "strings" instrument AR for a String Quartet artist');
    });
    $('#batch-set-piano-trio').click(function() {
        setInstrument(linkTypePerformer, linkTypeInstrument,
                      [attrIdPiano, attrIdViolin, attrIdCello]);
        signEditNote('Use instruments AR for a Piano Trio artist');
    });
    $('#batch-set-piano').click(function() {
        setInstrument(linkTypePerformer, linkTypeInstrument,
                      [attrIdPiano]);
        signEditNote();
    });
    return false;
});

