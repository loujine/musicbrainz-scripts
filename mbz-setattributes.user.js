// ==UserScript==
// @name         MusicBrainz: Batch-set recording-work attributes
// @author       loujine
// @version      2015.10.09
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-setattributes.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-setattributes.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Set "live" attribute on selected recordings
// @compatible   firefox+greasemonkey  quickly tested
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @include      http*://*musicbrainz.org/release/*/edit-relationships
// @grant        none
// @run-at       document-end
// ==/UserScript==

'use strict';

// from musicbrainz-server/root/static/scripts/tests/typeInfo.js
var attrIdLive = 578,
    attrIdPartial = 579;

function setAttributes(attrId) {
    var recordings = MB.relationshipEditor.UI.checkedRecordings();
    recordings.forEach(function(recording) {
        recording.performances().forEach(function(relation) {
            var attrs = relation.attributes();
            var attr = attrs.filter(function(el) {
                // attrId already in relation attributes
                return el.type.id === attrId});
            if (attr.length) {
                attrs.splice(attrs.indexOf(attr), 1);
            } else {
                attrs.push({type: MB.attrInfoByID[attrId]});
            }
            relation.setAttributes(attrs);
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
        $('<h3></h3>', {'text': 'Recording-Work relation attributes'})
    ).append(
        $('<input></input>', {
            'id': 'setlive',
            'type': 'button',
            'value': 'Toggle live'
            })
    ).append(
        $('<input></input>', {
            'id': 'setpartial',
            'type': 'button',
            'value': 'Toggle partial'
            })
    )
);

function signEditNote() {
    var vm = MB.releaseRelationshipEditor,
        msg = vm.editNote(),
        signature = '\n\n--\n' + 'Using "MusicBrainz: Batch-set attributes" GM script\n';
    vm.editNote(msg + 'Set Recording-Work relation attributes' + signature);
}

$(document).ready(function() {
    $('#setlive').click(function() {
        setAttributes(attrIdLive);
        signEditNote();
    });
    $('#setpartial').click(function() {
        setAttributes(attrIdPartial);
        signEditNote();
    });
    return false;
});


