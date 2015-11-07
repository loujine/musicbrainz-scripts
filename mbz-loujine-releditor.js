'use strict';
// ==UserScript==
// @name         MusicBrainz: common files
// @namespace    mbz-loujine
// @author       loujine
// @version      2015.11.05
// @description  musicbrainz.org: common functions for relationship editor scripts
// @compatible   firefox+greasemonkey
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @grant        none
// @run-at       document-end
// ==/UserScript==

if ($('div#loujine-menu').length) {
    var $container = $('div#loujine-menu');
} else {
    var $container = $('<div></div>', {
        'id': 'loujine-menu',
        'css': {'background-color': 'white',
                'padding': '8px',
                'margin': '0px -6px 6px',
                'border': '5px dotted #736DAB'
            }
        })
    .append(
        $('<h2></h2>', {'text': 'loujine GM tools'})
    );
}

