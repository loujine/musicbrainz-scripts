/* global $ MB server relEditor */
'use strict';
var meta = function() {
// ==UserScript==
// @name         MusicBrainz: Batch-set recording-work attributes
// @namespace    mbz-loujine
// @author       loujine
// @version      2017.2.11
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-setattributes.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-setattributes.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Set attributes (live, partial) on selected recordings
// @compatible   firefox+greasemonkey
// @license      MIT
// @require      https://greasyfork.org/scripts/13747-mbz-loujine-common/code/mbz-loujine-common.js?version=174522
// @include      http*://*musicbrainz.org/release/*/edit-relationships
// @grant        none
// @run-at       document-end
// ==/UserScript==
};
if (meta && meta.toString && (meta = meta.toString())) {
    var meta = {'name': meta.match(/@name\s+(.+)/)[1],
                'version': meta.match(/@version\s+(.+)/)[1]};
}

// imported from mbz-loujine-common.js: server, relEditor

function setAttributes(attrId, toggle) {
    var recordings = MB.relationshipEditor.UI.checkedRecordings();
    recordings.forEach(function(recording) {
        recording.performances().forEach(function(relation) {
            var attrs = relation.attributes(),
                attr = attrs.filter(function(el) {
                    // attrId already in relation attributes
                    return el.type.id === attrId;
                });
            if (!attr.length) {
                attrs.push({type: MB.attrInfoByID[attrId]});
            } else if (toggle) {
                attrs.splice(attrs.indexOf(attr), 1);
            }
            relation.setAttributes(attrs);
        });
    });
}

(function displayToolbar(relEditor) {
    $('div.tabs').after(
        relEditor.container().append(
            $('<h3>', {'text': 'Recording-Work relation attributes'})
        ).append(
            $('<input>', {
                'id': 'setlive',
                'type': 'button',
                'value': 'Set live'
            })
        ).append(
            $('<input>', {
                'id': 'setpartial',
                'type': 'button',
                'value': 'Set partial'
            })
        ).append(
            $('<input>', {
                'id': 'togglelive',
                'type': 'button',
                'value': 'Toggle live'
            })
        ).append(
            $('<input>', {
                'id': 'togglepartial',
                'type': 'button',
                'value': 'Toggle partial'
            })
        )
    );
})(relEditor);

$(document).ready(function() {
    $('#setlive').click(function() {
        setAttributes(server.attr.live, false);
        relEditor.editNote(meta);
    });
    $('#setpartial').click(function() {
        setAttributes(server.attr.partial, false);
        relEditor.editNote(meta);
    });
    $('#togglelive').click(function() {
        setAttributes(server.attr.live, true);
        relEditor.editNote(meta);
    });
    $('#togglepartial').click(function() {
        setAttributes(server.attr.partial, true);
        relEditor.editNote(meta);
    });
    return false;
});

