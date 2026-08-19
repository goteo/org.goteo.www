import type { DefinePlugin, Plugin } from '@hey-api/openapi-ts';

export type UserConfig = Plugin.Name<'operation-paths'> &
  Plugin.Hooks &
  Plugin.UserExports;

export type Config = Plugin.Name<'operation-paths'> &
  Plugin.Hooks &
  Plugin.Exports;

export type OperationPathsPlugin = DefinePlugin<UserConfig, Config>;