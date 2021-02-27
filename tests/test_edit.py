#!/usr/bin/env python3

import time
import unittest

from tests import UserscriptsTC

RECORDING_MBID = '4b86f0bf-be35-4c78-a554-80f795c020aa'


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


if __name__ == "__main__":
    unittest.main()
