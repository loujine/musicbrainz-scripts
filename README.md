Musicbrainz scripts
===================

Collection of greasemonkey scripts for MusicBrainz editing.


Content
-------

### Relationship editor

The first scripts concern batch-editing in the relationship editor in order to
modify all selected recordings at once:

* mbz-propagatedates: for each recording, copy the most accurate date (i.e.
dates with explicit day have priority over dates with only the month and so on)
to all relevant advanced relationships (performers, works, areas, places).

* mbz-setattributes: add attributes to the recording-work relationships. For
the moment only the "live" attribute is set.

* mbz-setinstrument: replace all "performer" or "orchestra" recording-artist
relationships with specific instruments relationships. The main objective is to
replace incorrect "performing orchestra" used for chamber music groups (string
quartets, etc.)

* mbz-setguessedworks: add related work suggested by the search server if the
recording has no linked work. Search is done using the recording title.


### Artist relationships tab

* mbz-showmissingwork: check for each recording whether a linked work exists.
  Mark with:

  - a green ✓ if at least one work exists and a date is set on the
  relationship
  - an orange ⚠ if at least one work exists with no date
  - a red ✗ if no work is linked to the recording

Queries are set 1 second apart to avoid hitting the rate limit on musicbrainz
server.


### Release main tab

* mbz-showcountdiscid: display the number of linked discids in the discid tab
header


TODO
----

* improve 'guessed work': use the track artist to limit the search to the correct
composer

* improve 'set instrument': switch to drop down menu

* ideas for future scripts:

  - select work tonality (key) from artist works tab
  - show subworks on a work series page (catalog)
  - show track durations on artist relationship page
  - show discid counter on relase tab headers


Notes
-----

Warning: those scripts are developed for my own use! I expect them to be
useless for other people, except as an example to adapt to your own goals.
Contributions and feedback are welcome.


Installation
------------

For installation, follow the [Greasemonkey manual](http://wiki.greasespot.net/Greasemonkey_Manual:Installing_Scripts)


License
-------

[CC BY-NC-SA 3.0](https://creativecommons.org/licenses/by-nc-sa/3.0/)


Reporting bugs & Contributing
-----------------------------

Please submit all patches to [bitbucket](https://bitbucket.org/loujine/musicbrainz-scripts/pull-request) for review.

