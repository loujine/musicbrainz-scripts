/* global $ */
'use strict';
// ==UserScript==
// @name         MusicBrainz: Lean display
// @namespace    mbz-loujine
// @author       loujine
// @version      2021.9.17
// @downloadURL  https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mbz-display_lean_ui.user.js
// @updateURL    https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mbz-display_lean_ui.user.js
// @supportURL   https://github.com/loujine/musicbrainz-scripts
// @icon         https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/icon.png
// @description  musicbrainz.org: hide unused elements in MB pages
// @compatible   firefox+tampermonkey
// @license      MIT
// @include      http*://*musicbrainz.org/artist/*
// @include      http*://*musicbrainz.org/collection/*
// @include      http*://*musicbrainz.org/recording/*
// @include      http*://*musicbrainz.org/release/*
// @exclude      http*://*musicbrainz.org/*/merge
// @exclude      http*://*musicbrainz.org/*/*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==


function removeTabHeadersUI() {
    const mbid = document.URL.split('/')[4].slice(0,36);
    $(`li > a[href$='${mbid}/details']`).parent().remove();
    $(`li > a[href$='${mbid}/tags']`).parent().remove();
}

function removeRatingsUI() {
    // document.querySelectorAll("div#content table.tbl > * > tr > th.rating, div#content table.tbl > tbody > tr > td.rating, div#sidebar > h2.rating, div#sidebar > h2.rating + p, div#page > div.tabs > ul.tabs > li:not(.sel) > a[href$='/ratings'], div.header ul.menu li.data a[href$='/ratings']");
    $('th.rating').empty();
    $('th.rating').css('width', '1px');
    // $('td.rating').empty();
    $('td.rating span').removeClass(); // needed for mass merge recordings script
    $('td.rating a').empty(); // needed for mass merge recordings script
    $('td.rating').css('width', '1px');
    $('h2.rating + p').empty();
    $('h2.rating').empty();
}


function collapseReleaseSidebar() {
    // would prevent "expand/collapse all mediums" script
    // $('h2.tracklist').empty();

    const summaryTag = '<summary style="display: block;margin-left: 8px;cursor: pointer;"></summary>';

    const $infoheader = $('#sidebar h2.release-information');
    if ($infoheader.length) {
        const $infodl = $('#sidebar h2.release-information + dl');
        $infoheader.before('<details id="toggle-release-information"></details>');
        $('details#toggle-release-information').append(
            $(summaryTag).append($infoheader)
        );
        $infoheader.css({display: 'list-item'});
        $('details#toggle-release-information').append($infodl);
    }

    const $detailsheader = $('#sidebar h2.additional-details');
    if ($detailsheader.length) {
        const $detailsdl = $('#sidebar h2.additional-details + dl');
        $detailsheader.before('<details id="toggle-additional-details"></details>');
        $('details#toggle-additional-details').append(
            $(summaryTag).append($detailsheader)
        );
        $detailsheader.css({display: 'list-item'});
        $('details#toggle-additional-details').append($detailsdl);
    }

    const $labelheader = $('#sidebar h2.labels');
    if ($labelheader.length) {
        const $labelul = $('#sidebar h2.labels + ul.links');
        $labelheader.before('<details id="toggle-labels"></details>');
        $('details#toggle-labels').append(
            $(summaryTag).append($labelheader)
        );
        $labelheader.css({display: 'list-item'});
        $('details#toggle-labels').append($labelul);
    }

    const $eventsheader = $('#sidebar h2.release-events');
    if ($eventsheader.length) {
        const $eventsblock = $('#sidebar h2.release-events + script + div');
        $eventsheader.before('<details id="toggle-release-events"></details>');
        $('details#toggle-release-events').append(
            $(summaryTag).append($eventsheader)
        );
        $eventsheader.css({display: 'list-item'});
        $('details#toggle-release-events').append($eventsblock);
    }

    $('h2.reviews + p').empty();
    $('h2.reviews').empty();

    $('div#sidebar-tags').empty();

    let $linksheader = $('#sidebar h2.external-links');
    if ($linksheader.length) {
        $linksheader = $linksheader.first();
        const $linksul = $(
            '#sidebar h2.external-links,#sidebar h2.external-links + ul.external_links'
        ).not(':first');
        $linksheader.before('<details id="toggle-external-links"></details>');
        $('details#toggle-external-links').append(
            $(summaryTag).append($linksheader)
        );
        $linksheader.css({display: 'list-item'});
        $('details#toggle-external-links').append($linksul);
    }

    if ($('dd span.high-data-quality,dd span.low-data-quality').length) {
        $('span.prefix').after($('dd span.high-data-quality,dd span.low-data-quality')[0]);
    }
}

$(document).ready(function () {
    removeTabHeadersUI();
    removeRatingsUI();
    if (document.URL.split('/')[3] === 'release') {
        collapseReleaseSidebar();
    }
    return false;
});
