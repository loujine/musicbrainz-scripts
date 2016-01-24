'use strict';
// ==UserScript==
// @name         MusicBrainz: relationship editor lib
// @namespace    mbz-loujine
// @author       loujine
// @version      2016.01.24
// @description  musicbrainz.org: common functions for relationship editor scripts
// @compatible   firefox+greasemonkey
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @grant        none
// @run-at       document-end
// ==/UserScript==

// edit notes
var relEditor = function (MB, $) {
    var self = {};

    // edit note
    self.editNote = function (meta, msg) {
        msg = msg || '';
        var vm = MB.releaseRelationshipEditor,
            existingMsg = vm.editNote(),
            signature = '\n —\n' +
                        `GM script: "${meta.name}" (${meta.version})\n\n`;
        vm.editNote(existingMsg + msg + signature);
    };

    self.container = function () {
        var $container;
        if ($('div#loujine-menu').length) {
            $container = $('div#loujine-menu');
        } else {
            $container = $('<div></div>', {
                'id': 'loujine-menu',
                'css': {
                    'background-color': 'white',
                    'padding': '8px',
                    'margin': '0px -6px 6px',
                    'border': '5px dotted #736DAB'
                }
            }).append(
                $('<h2></h2>', {'text': 'loujine GM tools'})
            );
        }
        return $container;
    };

    return self;
}(MB, $);
