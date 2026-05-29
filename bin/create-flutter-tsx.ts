#!/usr/bin/env bun
import { runInit } from '../src/index.js';

await runInit(process.argv.slice(2));
