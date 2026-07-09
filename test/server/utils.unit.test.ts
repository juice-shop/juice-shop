/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import type { ChallengeModel } from '@juice-shop/models/challenge'
import * as utils from '../../lib/utils'

void describe('utils', () => {
  void describe('toSimpleIpAddress', () => {
    void it('returns ipv6 address unchanged', () => {
      assert.equal(utils.toSimpleIpAddress('2001:0db8:85a3:0000:0000:8a2e:0370:7334'), '2001:0db8:85a3:0000:0000:8a2e:0370:7334')
    })

    void it('returns ipv4 address fully specified as ipv6 unchanged', () => {
      assert.equal(utils.toSimpleIpAddress('0:0:0:0:0:ffff:7f00:1'), '0:0:0:0:0:ffff:7f00:1')
    })

    void it('returns ipv6 loopback address as ipv4 address', () => {
      assert.equal(utils.toSimpleIpAddress('::1'), '127.0.0.1')
    })

    void it('returns ipv4-mapped address as ipv4 address', () => {
      assert.equal(utils.toSimpleIpAddress('::ffff:192.0.2.128'), '192.0.2.128')
    })
  })

  void describe('extractFilename', () => {
    void it('returns standalone filename unchanged', () => {
      assert.equal(utils.extractFilename('test.exe'), 'test.exe')
    })

    void it('returns filename from http:// URL', () => {
      assert.equal(utils.extractFilename('http://bla.blubb/test.exe'), 'test.exe')
    })

    void it('ignores query part of http:// URL', () => {
      assert.equal(utils.extractFilename('http://bla.blubb/test.exe?bla=blubb&a=b'), 'test.exe')
    })

    void it('also works for file:// URLs', () => {
      assert.equal(utils.extractFilename('file:///C//Bla/Blubb/test.exe'), 'test.exe')
    })
  })

  void describe('matchesSystemIniFile', () => {
    void it('fails on plain input string', () => {
      assert.equal(utils.matchesSystemIniFile('Bla Blubb'), false)
    })

    void it('passes on Windows 10 system.ini file content', () => {
      assert.equal(utils.matchesSystemIniFile('; for 16-bit app support\n' +
          '[386Enh]\n' +
          'woafont=dosapp.fon\n' +
          'EGA80WOA.FON=EGA80WOA.FON\n' +
          'EGA40WOA.FON=EGA40WOA.FON\n' +
          'CGA80WOA.FON=CGA80WOA.FON\n' +
          'CGA40WOA.FON=CGA40WOA.FON\n' +
          '\n' +
          '[drivers]\n' +
          'wave=mmdrv.dll\n' +
          'timer=timer.drv\n' +
          '\n' +
          '[mci]\n'), true)
    })
  })

  void describe('matchesEtcPasswdFile', () => {
    void it('fails on plain input string', () => {
      assert.equal(utils.matchesEtcPasswdFile('Bla Blubb'), false)
    })

    void it('passes on Arch Linux passwd file content', () => {
      assert.equal(utils.matchesEtcPasswdFile('test:x:0:0:test:/test:/usr/bin/zsh\n' +
          'bin:x:1:1::/:/usr/bin/nologin\n' +
          'daemon:x:2:2::/:/usr/bin/nologin\n' +
          'mail:x:8:12::/var/spool/mail:/usr/bin/nologin\n' +
          'ftp:x:14:11::/srv/ftp:/usr/bin/nologin\n' +
          'http:x:33:33::/srv/http:/usr/bin/nologin\n' +
          'nobody:x:65534:65534:Nobody:/:/usr/bin/nologin\n' +
          'dbus:x:81:81:System Message Bus:/:/usr/bin/nologin\n' +
          'systemd-journal-remote:x:988:988:systemd Journal Remote:/:/usr/bin/nologin\n' +
          'systemd-network:x:987:987:systemd Network Management:/:/usr/bin/nologin\n' +
          'systemd-oom:x:986:986:systemd Userspace OOM Killer:/:/usr/bin/nologin\n' +
          'systemd-resolve:x:984:984:systemd Resolver:/:/usr/bin/nologin\n' +
          'systemd-timesync:x:983:983:systemd Time Synchronization:/:/usr/bin/nologin\n' +
          'systemd-coredump:x:982:982:systemd Core Dumper:/:/usr/bin/nologin\n' +
          'uuidd:x:68:68::/:/usr/bin/nologin\n' +
          'avahi:x:980:980:Avahi mDNS/DNS-SD daemon:/:/usr/bin/nologin\n' +
          'named:x:40:40:BIND DNS Server:/:/usr/bin/nologin\n' +
          'brltty:x:979:979:Braille Device Daemon:/var/lib/brltty:/usr/bin/nologin\n' +
          'colord:x:978:978:Color management daemon:/var/lib/colord:/usr/bin/nologin\n' +
          'cups:x:209:209:cups helper user:/:/usr/bin/nologin\n' +
          'dhcpcd:x:977:977:dhcpcd privilege separation:/:/usr/bin/nologin\n' +
          'dnsmasq:x:976:976:dnsmasq daemon:/:/usr/bin/nologin\n' +
          'git:x:975:975:git daemon user:/:/usr/bin/git-shell\n' +
          'mpd:x:45:45::/var/lib/mpd:/usr/bin/nologin\n' +
          'nbd:x:974:974:Network Block Device:/var/empty:/usr/bin/nologin\n' +
          'nm-openvpn:x:973:973:NetworkManager OpenVPN:/:/usr/bin/nologin\n' +
          'nvidia-persistenced:x:143:143:NVIDIA Persistence Daemon:/:/usr/bin/nologin\n' +
          'openvpn:x:972:972:OpenVPN:/:/usr/bin/nologin\n' +
          'partimag:x:110:110:Partimage user:/:/usr/bin/nologin\n' +
          'polkitd:x:102:102:PolicyKit daemon:/:/usr/bin/nologin\n' +
          'rpc:x:32:32:Rpcbind Daemon:/var/lib/rpcbind:/usr/bin/nologin\n' +
          'rtkit:x:133:133:RealtimeKit:/proc:/usr/bin/nologin\n' +
          'sddm:x:971:971:Simple Desktop Display Manager:/var/lib/sddm:/usr/bin/nologin\n' +
          'tss:x:970:970:tss user for tpm2:/:/usr/bin/nologin\n' +
          'usbmux:x:140:140:usbmux user:/:/usr/bin/nologin\n' +
          'moi:x:1000:1000:moi:/home/moi:/bin/zsh\n'), true)
    })
  })

  void describe('getChallengeEnablementStatus', () => {
    const defaultIsEnvironmentFunctions = {
      isDocker: () => false,
      isHeroku: () => false,
      isWindows: () => false
    }

    for (const safetyMode of ['enabled', 'disabled', 'auto'] as const) {
      void it(`challenges without disabledEnv are enabled with safetyMode set to ${safetyMode}`, () => {
        const challenge: ChallengeModel = { disabledEnv: null } as unknown as ChallengeModel

        assert.deepEqual(utils.getChallengeEnablementStatus(challenge, safetyMode, defaultIsEnvironmentFunctions), { enabled: true, disabledBecause: null })
      })
    }

    const testCases = [
      { name: 'Docker', environmentFunction: 'isDocker' },
      { name: 'Heroku', environmentFunction: 'isHeroku' },
      { name: 'Windows', environmentFunction: 'isWindows' }
    ]

    for (const testCase of testCases) {
      void it(`safetyMode: 'enabled': challenge with disabledOnEnv ${testCase.name} should be marked as disabled`, () => {
        const challenge: ChallengeModel = { disabledEnv: testCase.name } as unknown as ChallengeModel

        const isEnvironmentFunctions = { ...defaultIsEnvironmentFunctions, [testCase.environmentFunction]: () => true }
        assert.deepEqual(utils.getChallengeEnablementStatus(challenge, 'enabled', isEnvironmentFunctions), { enabled: false, disabledBecause: testCase.name })
      })

      void it(`safetyMode: 'auto': challenge with disabledOnEnv ${testCase.name} should be marked as disabled`, () => {
        const challenge: ChallengeModel = { disabledEnv: testCase.name } as unknown as ChallengeModel

        const isEnvironmentFunctions = { ...defaultIsEnvironmentFunctions, [testCase.environmentFunction]: () => true }
        assert.deepEqual(utils.getChallengeEnablementStatus(challenge, 'auto', isEnvironmentFunctions), { enabled: false, disabledBecause: testCase.name })
      })

      void it(`safetyMode: 'disabled': challenge with disabledOnEnv ${testCase.name} should be marked as enabled`, () => {
        const challenge: ChallengeModel = { disabledEnv: testCase.name } as unknown as ChallengeModel

        const isEnvironmentFunctions = { ...defaultIsEnvironmentFunctions, [testCase.environmentFunction]: () => true }
        assert.deepEqual(utils.getChallengeEnablementStatus(challenge, 'disabled', isEnvironmentFunctions), { enabled: true, disabledBecause: null })
      })
    }
  })

  void describe('startsWith', () => {
    void it('accepts string starting with another string', () => {
      assert.equal(utils.startsWith('Bla Blubb', 'Bla'), true)
    })

    void it('rejects string not starting with another string', () => {
      assert.equal(utils.startsWith('Bla Blubb', 'Lala'), false)
    })
  })

  void describe('endsWith', () => {
    void it('accepts string ending with another string', () => {
      assert.equal(utils.endsWith('Bla Blubb', 'Blubb'), true)
    })

    void it('rejects string not ending with another string', () => {
      assert.equal(utils.endsWith('Bla Blubb', 'Lala'), false)
    })
  })

  void describe('contains', () => {
    void it('accepts string containing another string', () => {
      assert.equal(utils.contains('Bla Blubb', 'la Bl'), true)
    })

    void it('rejects string containing another string', () => {
      assert.equal(utils.contains('Bla Blubb', 'Lala'), false)
    })
  })

  void describe('toISO8601', () => {
    void it('converts date to ISO 8601 representation', () => {
      assert.equal(utils.toISO8601(new Date('2025-12-15T00:00:00Z')), '2025-12-15')
    })

    void it('prepends single-digit months with a zero', () => {
      assert.equal(utils.toISO8601(new Date('2025-03-15T00:00:00Z')), '2025-03-15')
    })

    void it('prepends single-digit days with a zero', () => {
      assert.equal(utils.toISO8601(new Date('2025-12-01T00:00:00Z')), '2025-12-01')
    })
  })

  void describe('parseJsonCustom', () => {
    void it('parses a simple JSON object', () => {
      const json = '{"key": "value"}'
      const result = utils.parseJsonCustom(json)
      assert.deepEqual(result, [{ key: 'key', value: 'value' }])
    })

    void it('parses a nested JSON object', () => {
      const json = '{"key": {"nested": "value"}}'
      const result = utils.parseJsonCustom(json)
      // clarinet's onkey/onopenobject will produce entries for both keys
      assert.equal(result.length, 2)
      assert.equal(result[0].key, 'key')
      assert.equal(result[1].key, 'nested')
      assert.equal(result[1].value, 'value')
    })
  })

  void describe('unquote', () => {
    void it('removes quotes from quoted string', () => {
      assert.equal(utils.unquote('"test"'), 'test')
    })

    void it('returns unquoted string unchanged', () => {
      assert.equal(utils.unquote('test'), 'test')
    })
  })

  void describe('trunc', () => {
    void it('truncates long string and adds ellipses', () => {
      assert.equal(utils.trunc('1234567890', 5), '1234...')
    })

    void it('returns short string unchanged', () => {
      assert.equal(utils.trunc('123', 5), '123')
    })

    void it('removes newlines', () => {
      assert.equal(utils.trunc('12\n3', 5), '123')
    })
  })

  void describe('diceCoefficient', () => {
    void it('should return 1 for identical strings', () => {
      assert.equal(utils.diceCoefficient('abc', 'abc'), 1)
    })

    void it('should return 1 for identical strings even if they are short', () => {
      assert.equal(utils.diceCoefficient('a', 'a'), 1)
    })

    void it('should return 0 for different strings if at least one is less than 2 characters', () => {
      assert.equal(utils.diceCoefficient('a', 'b'), 0)
      assert.equal(utils.diceCoefficient('a', 'abc'), 0)
    })

    void it('should return 0 for completely different strings', () => {
      assert.equal(utils.diceCoefficient('abc', 'def'), 0)
    })

    void it('should return correct coefficient for partially overlapping strings', () => {
      // 'night' bigrams: ni, ig, gh, ht
      // 'nacht' bigrams: na, ac, ch, ht
      // intersection: ht (1)
      // score: 2 * 1 / (5 + 5 - 2) = 0.25
      assert.equal(utils.diceCoefficient('night', 'nacht'), 0.25)
    })
  })
})
