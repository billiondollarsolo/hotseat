/**
 * Tests for configuration management
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, rm, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  getConfigPath,
  validateConfig,
  loadConfig,
  saveConfig,
  getDefaultConfig,
  createDefaultConfig,
  type HotseatConfig,
} from './config.js';

describe('config', () => {
  let testDir: string;

  beforeEach(async () => {
    // Create a unique temp directory for each test
    testDir = join(tmpdir(), `hotseat-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    // Clean up temp directory
    await rm(testDir, { recursive: true, force: true });
  });

  describe('getConfigPath', () => {
    it('returns correct path for given base directory', () => {
      const path = getConfigPath('/some/project');
      expect(path).toBe('/some/project/hotseat/config.yaml');
    });

    it('uses current directory when no base specified', () => {
      const path = getConfigPath();
      expect(path).toContain('hotseat/config.yaml');
    });
  });

  describe('getDefaultConfig', () => {
    it('returns default configuration', () => {
      const config = getDefaultConfig();
      expect(config).toEqual({
        defaultProvider: 'claude',
        outputDirectory: './hotseat',
      });
    });

    it('returns a new object each time', () => {
      const config1 = getDefaultConfig();
      const config2 = getDefaultConfig();
      expect(config1).not.toBe(config2);
      expect(config1).toEqual(config2);
    });
  });

  describe('validateConfig', () => {
    it('accepts valid configuration', () => {
      const config: HotseatConfig = {
        defaultProvider: 'claude',
        outputDirectory: './hotseat',
      };
      const errors = validateConfig(config);
      expect(errors).toEqual([]);
    });

    it('accepts all valid providers', () => {
      const providers = ['claude', 'opencode', 'cursor', 'codex', 'copilot'] as const;
      for (const provider of providers) {
        const config: HotseatConfig = {
          defaultProvider: provider,
          outputDirectory: './output',
        };
        const errors = validateConfig(config);
        expect(errors).toEqual([]);
      }
    });

    it('rejects null config', () => {
      const errors = validateConfig(null);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toEqual({ field: 'root', message: 'Config must be an object' });
    });

    it('rejects non-object config', () => {
      const errors = validateConfig('invalid');
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('root');
    });

    it('rejects missing defaultProvider', () => {
      const errors = validateConfig({ outputDirectory: './hotseat' });
      expect(errors.some((e) => e.field === 'defaultProvider')).toBe(true);
    });

    it('rejects invalid provider name', () => {
      const errors = validateConfig({
        defaultProvider: 'invalid-provider',
        outputDirectory: './hotseat',
      });
      expect(errors.some((e) => e.field === 'defaultProvider')).toBe(true);
      expect(errors[0].message).toContain('must be one of');
    });

    it('rejects non-string defaultProvider', () => {
      const errors = validateConfig({
        defaultProvider: 123,
        outputDirectory: './hotseat',
      });
      expect(errors.some((e) => e.field === 'defaultProvider')).toBe(true);
    });

    it('rejects missing outputDirectory', () => {
      const errors = validateConfig({ defaultProvider: 'claude' });
      expect(errors.some((e) => e.field === 'outputDirectory')).toBe(true);
    });

    it('rejects non-string outputDirectory', () => {
      const errors = validateConfig({
        defaultProvider: 'claude',
        outputDirectory: 123,
      });
      expect(errors.some((e) => e.field === 'outputDirectory')).toBe(true);
    });

    it('rejects empty outputDirectory', () => {
      const errors = validateConfig({
        defaultProvider: 'claude',
        outputDirectory: '',
      });
      expect(errors.some((e) => e.field === 'outputDirectory')).toBe(true);
      expect(errors[0].message).toContain('cannot be empty');
    });

    it('collects multiple errors', () => {
      const errors = validateConfig({});
      expect(errors.length).toBeGreaterThan(1);
    });
  });

  describe('createDefaultConfig', () => {
    it('creates config file at specified path', async () => {
      const configPath = join(testDir, 'hotseat', 'config.yaml');
      await createDefaultConfig(configPath);

      const content = await readFile(configPath, 'utf-8');
      expect(content).toContain('defaultProvider: claude');
      expect(content).toContain('outputDirectory: ./hotseat');
    });

    it('creates parent directories if needed', async () => {
      const configPath = join(testDir, 'deep', 'nested', 'hotseat', 'config.yaml');
      await createDefaultConfig(configPath);

      const content = await readFile(configPath, 'utf-8');
      expect(content).toContain('defaultProvider');
    });

    it('includes helpful comments', async () => {
      const configPath = join(testDir, 'hotseat', 'config.yaml');
      await createDefaultConfig(configPath);

      const content = await readFile(configPath, 'utf-8');
      expect(content).toContain('# Hotseat CLI Configuration');
      expect(content).toContain('auto-generated');
    });
  });

  describe('loadConfig', () => {
    it('creates default config if not exists', async () => {
      const result = await loadConfig(testDir);

      expect(result.wasCreated).toBe(true);
      expect(result.config).toEqual({
        defaultProvider: 'claude',
        outputDirectory: './hotseat',
      });
      expect(result.configPath).toBe(join(testDir, 'hotseat', 'config.yaml'));
    });

    it('loads existing config file', async () => {
      // Create config file first
      const configDir = join(testDir, 'hotseat');
      await mkdir(configDir, { recursive: true });
      await writeFile(
        join(configDir, 'config.yaml'),
        'defaultProvider: opencode\noutputDirectory: ./output\n'
      );

      const result = await loadConfig(testDir);

      expect(result.wasCreated).toBe(false);
      expect(result.config).toEqual({
        defaultProvider: 'opencode',
        outputDirectory: './output',
      });
    });

    it('throws on invalid config', async () => {
      // Create invalid config file
      const configDir = join(testDir, 'hotseat');
      await mkdir(configDir, { recursive: true });
      await writeFile(
        join(configDir, 'config.yaml'),
        'defaultProvider: invalid\noutputDirectory: ./hotseat\n'
      );

      await expect(loadConfig(testDir)).rejects.toThrow('Invalid configuration');
    });

    it('throws on corrupted yaml', async () => {
      // Create corrupted config file
      const configDir = join(testDir, 'hotseat');
      await mkdir(configDir, { recursive: true });
      await writeFile(join(configDir, 'config.yaml'), 'this is not: valid: yaml: [');

      await expect(loadConfig(testDir)).rejects.toThrow();
    });
  });

  describe('saveConfig', () => {
    it('saves valid config to disk', async () => {
      const config: HotseatConfig = {
        defaultProvider: 'opencode',
        outputDirectory: './custom-output',
      };

      await saveConfig(config, testDir);

      const content = await readFile(join(testDir, 'hotseat', 'config.yaml'), 'utf-8');
      expect(content).toContain('defaultProvider: opencode');
      expect(content).toContain('outputDirectory: ./custom-output');
    });

    it('creates directory if not exists', async () => {
      const config: HotseatConfig = {
        defaultProvider: 'claude',
        outputDirectory: './hotseat',
      };

      await saveConfig(config, join(testDir, 'new-project'));

      const content = await readFile(
        join(testDir, 'new-project', 'hotseat', 'config.yaml'),
        'utf-8'
      );
      expect(content).toContain('defaultProvider: claude');
    });

    it('throws on invalid config', async () => {
      const invalidConfig = {
        defaultProvider: 'invalid',
        outputDirectory: './hotseat',
      } as HotseatConfig;

      await expect(saveConfig(invalidConfig, testDir)).rejects.toThrow(
        'Cannot save invalid configuration'
      );
    });

    it('includes helpful comments', async () => {
      const config: HotseatConfig = {
        defaultProvider: 'claude',
        outputDirectory: './hotseat',
      };

      await saveConfig(config, testDir);

      const content = await readFile(join(testDir, 'hotseat', 'config.yaml'), 'utf-8');
      expect(content).toContain('# Hotseat CLI Configuration');
      expect(content).toContain('Options: claude, opencode, cursor, codex, copilot');
    });
  });
});
