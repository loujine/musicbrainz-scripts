/* global $ MB server relEditor GM_info */
'use strict';
// ==UserScript==
// @name         MusicBrainz: Set relation attributes in relationships editor
// @namespace    mbz-loujine
// @author       loujine
// @version      2017.12.29
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-setattributes.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mbz-setattributes.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org: Set attributes (live, partial, solo) in relationships editor
// @compatible   firefox+tampermonkey
// @license      MIT
// @require      https://greasyfork.org/scripts/13747-mbz-loujine-common/code/mbz-loujine-common.js?version=228700
// @include      http*://*musicbrainz.org/release/*/edit-relationships
// @grant        none
// @run-at       document-end
// ==/UserScript==

function setAttributes(relationType, attrId, toggle) {
    const recordings = MB.relationshipEditor.UI.checkedRecordings();
    recordings.forEach(function(recording) {
        recording.relationships().forEach(function(relation) {
            if (relation.entityTypes !== relationType) {
                return;
            }
            var attrs = relation.attributes(),
                attr = attrs.filter(
                    // attrId already in relation attributes
                    el => el.type.id === attrId
                );
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
        relEditor.container().append(`
            <h3>Recording-Work relation attributes</h3>
            <input type="button" id="setLive" value="Set live">
            <input type="button" id="setPartial" value="Set partial">
            <input type="button" id="setInstrumental" value="Set instrumental">
            <input type="button" id="toggleLive" value="Toggle live">
            <input type="button" id="togglePartial" value="Toggle partial">
            <input type="button" id="toggleInstrumental" value="Toggle instrumental">
            <h3>Recording-Artist relation attributes</h3>
            <input type="button" id="toggleSolo" value="Toggle solo">
        `)
    );
})(relEditor);

$(document).ready(function() {
    for (let attr of ['Live', 'Partial', 'Instrumental']) {
        document.getElementById(`set${attr}`).addEventListener('click', () => {
            setAttributes('recording-work', server.attr[attr.toLowerCase()], false);
            relEditor.editNote(GM_info.script);
        });
        document.getElementById(`toggle${attr}`).addEventListener('click', () => {
            setAttributes('recording-work', server.attr[attr.toLowerCase()], true);
            relEditor.editNote(GM_info.script);
        });
    }
    document.getElementById(`toggleSolo`).addEventListener('click', () => {
        setAttributes('artist-recording', server.attr.solo, true);
        relEditor.editNote(GM_info.script);
    });
    return false;
});
