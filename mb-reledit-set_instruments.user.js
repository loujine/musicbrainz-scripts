/* global $ MB server relEditor GM_info */
'use strict';
// ==UserScript==
// @name         MusicBrainz relation editor: set instrument in recording-artist relation
// @namespace    mbz-loujine
// @author       loujine
// @version      2018.1.8
// @downloadURL  https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mb-reledit-set_instruments.user.js
// @updateURL    https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/mb-reledit-set_instruments.user.js
// @supportURL   https://bitbucket.org/loujine/musicbrainz-scripts
// @icon         https://bitbucket.org/loujine/musicbrainz-scripts/raw/default/icon.png
// @description  musicbrainz.org relation editor: set/unset instrument relations on selected recordings
// @compatible   firefox+tampermonkey
// @license      MIT
// @require      https://greasyfork.org/scripts/13747-mbz-loujine-common/code/mbz-loujine-common.js?version=241520
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


(function displayToolbar() {
    relEditor.container(document.querySelector('div.tabs'))
             .insertAdjacentHTML('beforeend', `
        <h3>Recording-performer instrument attributes</h3>
        <input type="button" id="unsetOrchestra" value='Unset "orchestra"'>
        <input type="button" id="unsetInstrument" value='Unset "instrument"'>
        <input type="button" id="setSQ" value='Set "String Quartet"'>
        <input type="button" id="setPianoTrio" value='Set "Piano Trio"'>
        <input type="button" id="setPiano" value='Set "Piano"'>
    `);
})();


$(document).ready(function () {
    const link = server.recordingLinkType;
    document.getElementById('unsetOrchestra').addEventListener('click', () => {
        setInstrument(link.orchestra, link.performer);
        relEditor.editNote(GM_info.script);
    });
    document.getElementById('unsetInstrument').addEventListener('click', () => {
        setInstrument(link.instrument, link.performer);
        relEditor.editNote(GM_info.script);
    });
    document.getElementById('setSQ').addEventListener('click', () => {
        setInstrument(link.performer, link.instrument,
                      [server.attr.strings], 'string quartet');
        relEditor.editNote(GM_info.script, 'Use "strings" instrument AR for a String Quartet artist');
    });
    document.getElementById('setPianoTrio').addEventListener('click', () => {
        setInstrument(link.performer, link.instrument,
                      [server.attr.piano, server.attr.violin, server.attr.cello]);
        relEditor.editNote(GM_info.script, 'Use instruments AR for a Piano Trio artist');
    });
    document.getElementById('setPiano').addEventListener('click', () => {
        setInstrument(link.performer, link.instrument,
                      [server.attr.piano]);
        relEditor.editNote(GM_info.script);
    });
    return false;
});
