#!/usr/bin/env python3

import time
import unittest

from tests import UserscriptsTC

ARTIST_MBID = 'cea4a3b8-c26c-4b61-a243-cf72555e2c71'
RELEASE_MBID = '0381e8bd-29d3-4fa1-bf8a-e8b1d87ff531'
RECORDING_MBID = '4b86f0bf-be35-4c78-a554-80f795c020aa'
WIKIDATA_LINK = 'https://www.wikidata.org/wiki/Q27916341'


class EditUserscriptsTC(UserscriptsTC):

    def test_script_seed_event(self):
        self.login('recording', RECORDING_MBID)
        self.load_userscript('mb-edit-seed_event_from_recording.user.js')
        self.driver.find_element_by_id('createConcert').click()
        time.sleep(8)
        self.driver.switch_to.window(self.driver.window_handles[-1])
        assert 'event/create' in self.driver.current_url
        assert self.driver.find_element_by_id('id-edit-event.setlist').text
        assert 'held at:' in self.driver.page_source
        assert 'main performers:' in self.driver.page_source
        assert 'recording location for:' in self.driver.page_source

    def test_script_set_video(self):
        self.login('release', RELEASE_MBID)
        self.load_userscript('mb-edit-set_video_recordings.user.js')
        self.driver.find_element_by_id('video_script_toggle').click()
        time.sleep(2)
        assert len(self.driver.find_elements_by_class_name('replacevideo')) > 1
        self.driver.find_element_by_id('video-68eec263-13e4-4a5f-8042-23117714cdce').click()
        # self.driver.set_network_conditions(offline=True, latency=1000, throughput=500 * 1024)
        # self.driver.find_element_by_id('batch_video').click()
        # time.sleep(1)
        # assert 'Fetching required data' in self.driver.page_source

    def test_script_wikidata(self):
        self.login('artist', ARTIST_MBID + '/edit')
        self.load_userscript('mb-edit-create_from_wikidata.user.js')
        assert 'Add external link' in self.driver.page_source
        assert len(self.driver.find_elements_by_class_name('url')) > 18
        self.driver.find_element_by_id('linkParser').send_keys(WIKIDATA_LINK)
        time.sleep(1)
        assert '<dt>Field "Name":</dt>' in self.driver.page_source
        assert '<dd>Kept "Víkingur Ólafsson"</dd>' in self.driver.page_source
        assert 'New external link added' in self.driver.page_source
        assert 'teacher suggestion' in self.driver.page_source


if __name__ == "__main__":
    unittest.main()
