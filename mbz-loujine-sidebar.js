'use strict';
// ==UserScript==
// @name         MusicBrainz: common files for the sidebar
// @namespace    mbz-loujine
// @author       loujine
// @version      2015.12.05
// @description  musicbrainz.org: common functions for adding boxes in the sidebar
// @compatible   firefox+greasemonkey
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @grant        none
// @run-at       document-end
// ==/UserScript==

// edit notes
function sidebarEditNote(meta, msg) {
    var msg = msg || '',
        signature = '\n —\n' + 'GM script: "' + meta.name + '" (' + meta.version + ')\n\n';
    return (msg + signature);
}

if ($('div#loujine-sidebar').length) {
    var $container = $('div#loujine-sidebar');
} else {
    var $container = $('<div></div>', {
        'id': 'loujine-sidebar',
        'css': {'background-color': 'white',
                'padding': '8px',
                'margin': '0px -6px 6px',
                'border': '2px dotted #736DAB'
            }
        })
    .append(
        $('<h2></h2>', {'text': 'loujine GM tools'})
    );
}

$('h2.rating').before(
    $container
)
