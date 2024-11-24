#!/usr/bin/env python3

import os
import unittest

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

# from selenium.webdriver.common.keys import Keys


MBSERVER = 'https://test.musicbrainz.org'
LOGIN_URL = f'{MBSERVER}/login'
LOGOUT_URL = f'{MBSERVER}/logout'
WORK_URL = f'{MBSERVER}/work/cc6eba78-85ef-3834-a400-a34e0d8856d9'
# ARTIST_URL = f'{MBSERVER}/artist/1f9df192-a621-4f54-8850-2c5373b7eac9'
# RECORDING_URL = f'{MBSERVER}/recording/53f4894e-cd34-4333-966e-3b728b70260f'
# PLACE_URL = f'{MBSERVER}/place/6213398f-b062-4e59-b88e-9eb2809838a0'


class UserscriptsTC(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        options = Options()
        options.add_argument('--disable-gpu')
        if os.environ.get('SHOW', '0') != '1':
            options.add_argument("--headless")
        cls.driver = webdriver.Chrome(options=options)

    def setUp(self):
        self.driver = self.__class__.driver

    def login(self, *args):
        url = LOGIN_URL
        if args:
            url += '?returnto=%2F' + '%2F'.join(args)
        self.driver.get(url)
        elem = self.driver.find_element(By.ID, 'id-username')
        elem.send_keys('loujin')
        elem = self.driver.find_element(By.ID, 'id-password')
        elem.send_keys('mb')
        elem.submit()

#     def test_login(self):
#         self.login()
#         assert 'loujin' in self.driver.find_element(By.CLASS_NAME, 'account').text
#         assert self.driver.current_url == 'https://test.musicbrainz.org/user/loujin'

    def load_userscript(self, filepath):
        gm = 'const GM_info = {script: {name: "name", version: 1}};'
        with open('mbz-loujine-common.js') as fd:
            common = fd.read()
        with open(filepath) as fd:
            script = fd.read()
        self.driver.execute_script('\n'.join([gm, common, script]))

#     def test_work(self):
#         self.driver.get(WORK_URL)

    def tearDown(self):
        self.driver.get(LOGOUT_URL)

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()


if __name__ == "__main__":
    unittest.main()
