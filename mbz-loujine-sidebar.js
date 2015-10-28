'use strict';
// ==UserScript==
// @name         MusicBrainz: common files for the sidebar
// @author       loujine
// @version      2015.10.29
// @description  musicbrainz.org: common functions for addign boxes in the sidebar
// @compatible   firefox+greasemonkey  quickly tested
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @grant        none
// @run-at       document-end
// ==/UserScript==

if ($('div#loujine-sidebar').length) {
    var container = $('div#loujine-sidebar');
} else {
    var container = $('<div></div>', {
        'id': 'loujine-sidebar',
        'css': {'background-color': 'white',
                'padding': '8px',
                'margin': '0px -6px 6px',
                'border': '2px dotted #736DAB'
            }
        }
    ).append(
        $('<h2></h2>', {'text': 'loujine GM tools'})
    );
}

