Musicbrainz scripts
===================

Collection of greasemonkey scripts for MusicBrainz editing.


Content
-------

### Common files

* mbz-loujine-common: constants (link and attributes types for MusicBrainz data
model) ,basic functionalities (XmlHttpRequest, data parsing)

* mbz-loujine-releditor: jquery definition of a container to store script
interfaces (buttons) impacting the release relationship editor

* mbz-loujine-sidebar: same for the sidebar appearing on artist and work pages

NB: XHR queries are set 1 second apart to avoid hitting the rate limit on musicbrainz
server.


### Relationship editor

The first scripts concern batch-editing in the relationship editor in order to
modify all selected recordings at once:

* mbz-propagatedates: for each recording, copy the most accurate date (i.e.
dates with explicit day have priority over dates with only the month and so on)
to all relevant advanced relationships (performers, works, areas, places).

* mbz-setattributes: add/toggle attributes to the recording-work relationships. For
the moment only the "live" and "partial" attributes are set.

* mbz-setinstrument: replace all "performer" or "orchestra" recording-artist
relationships with specific instruments relationships. The main objective is to
replace incorrect "performing orchestra" used for chamber music groups (string
quartets, etc.)

* mbz-setguessedworks: add related work suggested by the search server if the
recording has no linked work. Search is done using the recording title. An
optional prefix can be added for the search (useful to add full work info on
classical works)


### Artist relationships tab

* mbz-showmissingwork: check for each recording whether a linked work exists.
  Mark with:
  - a green ✓ if at least one work exists and a date is set on the
    relationship
  - an orange ⚠ if at least one work exists with no date
  - a red ✗ if no work is linked to the recording

* mbz-replacerecordingartist: add performers from the recording advanced
  relationships in a new column (with the instrument/vocal attribute if defined).
  Show:
  - the performer name(s) (from AR) if the recording artist is not the webpage artist
  - nothing if the recording artist is not the composer (we assume it is the
    right performers)
  - a red ✗ if no AR is found

* mbz-replacerecordingartist can set the selected performers above as recording
artist by checking the checkboxes and clicking "Replace selected artists"


### Release overview tab

* mbz-showcountdiscid: display the number of linked discids in the discid tab
header

* mbz-showcountalias: display the number of defined aliases and the list of
languages used (if any)


### Work overview tab

* mbz-showperformancedurations: add each performance duration in a new column

* mbz-showperformers: add performers from the recording advanced relationships in
  a new column (with the instrument/vocal attribute if defined). Show:
  - the performer name (from AR) if the recording artist is the composer
  - nothing if the recording artist is not the composer (we assume it is the
    right performers)
  - a red ✗ if no AR is found

* mbz-showperformers can set the selected performers above as recording
artist by checking the checkboxes and clicking "Replace selected artists"


TODO
----

* improve 'guessed work': use the track artist to limit the search to the correct
composer

* improve 'set instrument': switch to drop down menu

* ideas for future scripts:

  - select work tonality (key) from artist works tab
  - show subworks on a work series page (catalog)


Notes
-----

Warning: those scripts are developed for my own use! I expect them to be
useless for other people, except as an example to adapt to your own goals.
Contributions and feedback are welcome.


Installation
------------

For installation, follow the [Greasemonkey manual](https://wiki.greasespot.net/Greasemonkey_Manual:Installing_Scripts)


License
-------

[CC BY-NC-SA 3.0](https://creativecommons.org/licenses/by-nc-sa/3.0/)


Reporting bugs & Contributing
-----------------------------

Please submit all patches to [bitbucket](https://bitbucket.org/loujine/musicbrainz-scripts/pull-request) for review.

