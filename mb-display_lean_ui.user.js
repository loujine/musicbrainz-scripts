/* global $ */
'use strict';
// ==UserScript==
// @name         MusicBrainz: Lean display
// @namespace    mbz-loujine
// @author       loujine
// @version      2020.9.24
// @downloadURL  https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mbz-display_lean_ui.user.js
// @updateURL    https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/mbz-display_lean_ui.user.js
// @supportURL   https://github.com/loujine/musicbrainz-scripts
// @icon         https://raw.githubusercontent.com/loujine/musicbrainz-scripts/master/icon.png
// @description  musicbrainz.org: hide unused elements in MB pages
// @compatible   firefox+tampermonkey
// @license      MIT
// @include      http*://*musicbrainz.org/artist/*
// @include      http*://*musicbrainz.org/recording/*
// @include      http*://*musicbrainz.org/release/*
// @exclude      http*://*musicbrainz.org/*/merge
// @exclude      http*://*musicbrainz.org/*/*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

const mbid = document.URL.split('/')[4].slice(0,36);

$(`li > a[href$='${mbid}/details']`).parent().remove();
$(`li > a[href$='${mbid}/tags']`).parent().remove();

// Ratings
$('th.rating').empty();
$('th.rating').css('width', '1px');
// $('td.rating').empty();
$("td.rating span").removeClass(); // needed for mass merge recordings script
$("td.rating a").empty(); // needed for mass merge recordings script
$('td.rating').css('width', '1px');
$('h2.rating + p').empty();
$('h2.rating').empty();

// document.querySelectorAll("div#content table.tbl > * > tr > th.rating, div#content table.tbl > tbody > tr > td.rating, div#sidebar > h2.rating, div#sidebar > h2.rating + p, div#page > div.tabs > ul.tabs > li:not(.sel) > a[href$='/ratings'], div.header ul.menu li.data a[href$='/ratings']");

if (document.URL.split('/')[3] === 'release') {
    // would prevent "expand/collapse all mediums" script
    // $('h2.tracklist').empty();

    const $infoheader = $('#sidebar h2.release-information');
    if ($infoheader.length) {
        const $infodl = $('#sidebar h2.release-information + dl');
        $infoheader.before('<span id="toggle-release-information"></span>');
        $('span#toggle-release-information').append($infoheader);
        $infodl.before('<div id="block-release-information"></div>');
        $('div#block-release-information').append($infodl);
        $('div#block-release-information')[0].style.display = 'none';
        document.getElementById('toggle-release-information').addEventListener('click', () => {
            const block = document.getElementById('block-release-information');
            const display = block.style.display;
            block.style.display = display == "block" ? "none" : "block";
        });
    }

    const $detailsheader = $('#sidebar h2.additional-details');
    if ($detailsheader.length) {
        const $detailsdl = $('#sidebar h2.additional-details + dl');
        $detailsheader.before('<span id="toggle-additional-details"></span>');
        $('span#toggle-additional-details').append($detailsheader);
        $detailsdl.before('<div id="block-additional-details"></div>');
        $('div#block-additional-details').append($detailsdl);
        $('div#block-additional-details')[0].style.display = 'none';
        document.getElementById('toggle-additional-details').addEventListener('click', () => {
            const block = document.getElementById('block-additional-details');
            const display = block.style.display;
            block.style.display = display == "block" ? "none" : "block";
        });
    }

    const $labelheader = $('#sidebar h2.labels');
    if ($labelheader.length) {
        const $labelul = $('#sidebar h2.labels + ul.links');
        $labelheader.before('<span id="toggle-labels"></span>');
        $('span#toggle-labels').append($labelheader);
        $labelul.before('<div id="block-labels"></div>');
        $('div#block-labels').append($labelul);
        $('div#block-labels')[0].style.display = 'none';
        document.getElementById('toggle-labels').addEventListener('click', () => {
            const block = document.getElementById('block-labels');
            const display = block.style.display;
            block.style.display = display == "block" ? "none" : "block";
        });
    }

    const $eventsheader = $('#sidebar h2.release-events');
    if ($eventsheader.length) {
        const $eventsblock = $('#sidebar h2.release-events + script + div');
        $eventsheader.before('<span id="toggle-release-events"></span>');
        $('span#toggle-release-events').append($eventsheader);
        $eventsblock.before('<div id="block-release-events"></div>');
        $('div#block-release-events').append($eventsblock);
        $('div#block-release-events')[0].style.display = 'none';
        document.getElementById('toggle-release-events').addEventListener('click', () => {
            const block = document.getElementById('block-release-events');
            const display = block.style.display;
            block.style.display = display == "block" ? "none" : "block";
        });
    }

    $('h2.reviews + p').empty();

    $('div.sidebar-tags').empty();

    const $linksheader = $('#sidebar h2.external-links');
    if ($linksheader.length) {
        const $linksul = $('#sidebar h2.external-links + ul.external_links');
        $linksheader.before('<span id="toggle-external-links"></span>');
        $('span#toggle-external-links').append($linksheader);
        $linksul.before('<div id="block-external-links"></div>');
        $('div#block-external-links').append($linksul);
        $('div#block-external-links')[0].style.display = 'block';
        document.getElementById('toggle-external-links').addEventListener('click', () => {
            const block = document.getElementById('block-external-links');
            const display = block.style.display;
            block.style.display = display == "block" ? "none" : "block";
        });
    }
}
