Musicbrainz scripts
===================

Collection of greasemonkey scripts for MusicBrainz editing.


Content
-------

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


Notes
-----

Warning: those scripts are developped for my own use! I expect them to be
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

