#!/usr/bin/env python3

import time
import unittest

from selenium.webdriver.support.ui import Select
from selenium.common.exceptions import NoAlertPresentException

from tests import MBSERVER, UserscriptsTC

RELEASE_MBID = '57eac48b-da83-4be2-9328-4d350b255261'
RELEASE_WO_WORKS_MBID = '06cf52ff-747b-45b3-b928-2a987fa412c0'
RECORDING_URL = '{MBSERVER}/recording/91390a5d-317d-4012-80c9-314a139f4800'
# WORK_MBID = 'cc6eba78-85ef-3834-a400-a34e0d8856d9'
MAIN_WORK_MBID = 'db6400f0-6492-4c4a-9361-470be14d5bf2'
# RECORDING_MBID = '4044dfc7-e7d4-48ca-98b4-d11e0692a21d'
# CONDUCTOR_MBID = '642284f1-54ef-4d2c-b27e-a74bb02fe387'
RECORDING_RELS_URL = f'{MBSERVER}/recording/54029746-25ba-4f88-9885-387ac581e45f'


class ReleditUserscriptsTC(UserscriptsTC):

    def test_script_clone_ext_relations(self):
        self.login('release', RELEASE_MBID + '/edit-relationships')
        self.load_userscript('mb-reledit-clone_relations.user.js')
        time.sleep(1)
        assert len(self.driver.find_elements_by_class_name('rel-add')) == 1
        self.driver.find_element_by_id('clone_rels_script_toggle').click()
        self.driver.find_element_by_css_selector('td.recording input').click()
        self.driver.find_element_by_id('cloneExtRecording').send_keys(RECORDING_URL)
        time.sleep(3)
        self.driver.find_element_by_id('cloneAR').click()
        time.sleep(3)
        assert len(self.driver.find_elements_by_class_name('rel-add')) > 1

    def test_script_clone_GH_28(self):
        self.login('release', RELEASE_MBID + '/edit-relationships')
        self.load_userscript('mb-reledit-clone_relations.user.js')
        time.sleep(1)
        assert len(self.driver.find_elements_by_class_name('rel-add')) == 1
        assert not self.driver.page_source.count('samples of')
        count_backward = self.driver.page_source.count('sampled by')
        self.driver.find_element_by_id('clone_rels_script_toggle').click()
        self.driver.find_element_by_css_selector('td.recording input').click()
        self.driver.find_element_by_id('cloneExtRecording').send_keys(RECORDING_RELS_URL)
        time.sleep(3)
        self.driver.find_element_by_id('cloneAR').click()
        time.sleep(3)
        assert len(self.driver.find_elements_by_class_name('rel-add')) > 1
        assert not self.driver.page_source.count('samples of')
        assert self.driver.page_source.count('sampled by') == count_backward + 3

    def test_script_remove_dates(self):
        self.login('release', RELEASE_MBID + '/edit-relationships')
        self.load_userscript('mb-reledit-copy_dates.user.js')
        time.sleep(2)
        assert self.driver.page_source.count('>2016-04-07<') > 1
        assert len(self.driver.find_elements_by_class_name('rel-edit')) == 2
        self.driver.find_element_by_css_selector('td.recording input').click()
        self.driver.find_element_by_id('removeDates').click()
        assert '>2016-04-07<' not in self.driver.page_source
        assert len(self.driver.find_elements_by_class_name('rel-edit')) > 2

    def test_script_copy_dates(self):
        self.login('release', RELEASE_MBID + '/edit-relationships')
        self.load_userscript('mb-reledit-copy_dates.user.js')
        time.sleep(2)
        assert self.driver.page_source.count('>2016-04-07<') > 1
        assert len(self.driver.find_elements_by_class_name('rel-edit')) == 2
        self.driver.find_element_by_css_selector('td.recording input').click()
        self.driver.find_element_by_id('removeDates').click()
        self.driver.find_element_by_class_name('remove-button').click()
        self.driver.find_element_by_class_name('remove-button').click()
        assert self.driver.page_source.count('>2016-04-07<') == 1
        self.driver.find_element_by_id('copyDates').click()
        assert self.driver.page_source.count('>2016-04-07<') > 1

    def test_script_guess_works(self):
        self.login('release', RELEASE_WO_WORKS_MBID + '/edit-relationships')
        self.load_userscript('mb-reledit-guess_works.user.js')
        time.sleep(1)
        assert 'Search for works' in self.driver.page_source
        assert len(self.driver.find_elements_by_css_selector('td.works > div.ar')) == 0

        self.driver.find_element_by_css_selector('td.recording input').click()
        self.driver.find_element_by_id('searchWork').click()
        time.sleep(4)
        assert len(self.driver.find_elements_by_css_selector('td.works > div.ar')) == 1

    def test_script_guess_main_works(self):
        self.login('release', RELEASE_WO_WORKS_MBID + '/edit-relationships')
        self.load_userscript('mb-reledit-guess_works.user.js')
        time.sleep(1)

        # no repeats
        self.driver.find_element_by_css_selector('th.recordings input').click()
        self.driver.find_element_by_id('mainWork').send_keys(MAIN_WORK_MBID)
        time.sleep(1)
        self.driver.find_element_by_id('searchSubworks').click()
        time.sleep(5)
        assert len(self.driver.find_elements_by_css_selector('td.works > div.ar')) == 4

    def test_script_guess_repeated_subworks(self):
        self.login('release', RELEASE_WO_WORKS_MBID + '/edit-relationships')
        self.load_userscript('mb-reledit-guess_works.user.js')
        time.sleep(1)
        self.driver.find_element_by_css_selector('th.recordings input').click()
        self.driver.find_element_by_id('mainWork').send_keys(MAIN_WORK_MBID)
        time.sleep(1)

        # partial repeats
        assert len(self.driver.find_elements_by_css_selector('td.works > div.ar')) == 0
        self.driver.find_element_by_id('repeats').send_keys('1,1,2,1')
        time.sleep(1)
        self.driver.find_element_by_id('searchSubworks').click()
        time.sleep(4)
        assert len(self.driver.find_elements_by_css_selector('td.works > div.ar')) == 5
        assert ['partial' in node.text for node in self.driver.find_elements_by_css_selector(
            'td.works > div.ar > span.link-phrase')] == [False, False, True, True, False]
        for node in self.driver.find_elements_by_css_selector(
                'td.works > div.ar > span.remove-button'):
            node.click()
        time.sleep(2)

        # missing repeats
        self.driver.find_element_by_id('repeats').clear()
        self.driver.find_element_by_id('repeats').send_keys('1,1,0,1')
        time.sleep(1)
        self.driver.find_element_by_id('searchSubworks').click()
        time.sleep(3)
        assert len(self.driver.find_elements_by_css_selector('td.works > div.ar')) == 3
        for node in self.driver.find_elements_by_css_selector('td.works')[:3]:
            assert node.find_element_by_css_selector('div.ar').text
        for node in self.driver.find_elements_by_css_selector('td.works')[3:]:
            assert not node.find_elements_by_css_selector('div.ar')

    def test_script_guess_overlapping_subworks(self):
        self.login('release', RELEASE_WO_WORKS_MBID + '/edit-relationships')
        self.load_userscript('mb-reledit-guess_works.user.js')
        time.sleep(1)
        self.driver.find_element_by_css_selector('th.recordings input').click()
        self.driver.find_element_by_id('mainWork').send_keys(MAIN_WORK_MBID)
        time.sleep(1)

        # overlapping repeats
        self.driver.find_element_by_id('repeats').clear()
        self.driver.find_element_by_id('repeats').send_keys('1,1,-1,1')
        time.sleep(2)
        self.driver.find_element_by_id('searchSubworks').click()
        time.sleep(4)
        assert len(self.driver.find_elements_by_css_selector('td.works > div.ar')) == 4
        assert [len(node.find_elements_by_css_selector('td > div.ar'))
                for node in self.driver.find_elements_by_css_selector('td.works')[:3]] == [1, 2, 1]
        assert not any(
            ['partial' in node.text for node in self.driver.find_elements_by_css_selector(
                'td.works > div.ar > span.link-phrase')])
        for node in self.driver.find_elements_by_css_selector('td.works')[3:]:
            assert not node.find_elements_by_css_selector('div.ar')

    def test_script_release_rels(self):
        self.login('release', RELEASE_MBID + '/edit-relationships')
        self.load_userscript('mb-reledit-release_rel_to_recording_rel.user.js')
        time.sleep(1)
        # TODO

    def test_script_set_instruments(self):
        self.login('release', RELEASE_MBID + '/edit-relationships')
        self.load_userscript('mb-reledit-set_instruments.user.js')
        time.sleep(1)
        count_from = self.driver.page_source.count('orchestra')
        count_to = self.driver.page_source.count('remixer')
        self.driver.find_element_by_css_selector('td.recording input').click()
        self.driver.find_element_by_id('instrument_script_toggle').click()
        select = Select(self.driver.find_element_by_id('fromRole'))
        select.select_by_visible_text('  orchestra')
        select = Select(self.driver.find_element_by_id('toRole'))
        select.select_by_visible_text('  remixer')
        self.driver.find_element_by_id('setRole').click()
        assert self.driver.page_source.count('orchestra') < count_from
        assert self.driver.page_source.count('remixer') > count_to

    def test_script_relation_attrs(self):
        self.login('release', RELEASE_MBID + '/edit-relationships')
        self.load_userscript('mb-reledit-set_relation_attrs.user.js')
        time.sleep(1)
        assert '>live recording of</span>' not in self.driver.page_source
        self.driver.find_element_by_id('relattrs_script_toggle').click()

        # set live from recording checkbox
        self.driver.find_element_by_css_selector('td.recording input').click()
        self.driver.find_element_by_id('setLive').click()
        assert '>live recording of</span>' in self.driver.page_source

        # set partial from second work checkbox
        self.driver.find_elements_by_css_selector('td.works input')[1].click()
        self.driver.find_element_by_id('setPartial').click()
        assert '>live recording of</span>' in self.driver.page_source
        assert '>live partial recording of</span>' in self.driver.page_source
        assert '>partial recording of</span>' not in self.driver.page_source

        # unset live from second work checkbox
        self.driver.find_element_by_id('toggleLive').click()
        assert '>live recording of</span>' in self.driver.page_source
        assert '>partial recording of</span>' in self.driver.page_source
        assert '>live partial recording of</span>' not in self.driver.page_source

    def tearDown(self):
        super().tearDown()
        try:
            self.driver.switch_to.alert.accept()
        except NoAlertPresentException:
            pass


if __name__ == "__main__":
    unittest.main()
