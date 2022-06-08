#!/usr/bin/env node

/***************************************************************************
/* @prokopschield/website-screenshot
/* Copyright (C) 2O22 Prokop Schield
/*
/* This program is free software: you can redistribute it and/or modify
/* it under the terms of the GNU General Public License as published by
/* the Free Software Foundation, either version 3 of the License, or
/*  (at your option) any later version.
/*
/* This program is distributed in the hope that it will be useful,
/*  but WITHOUT ANY WARRANTY; without even the implied warranty of
/* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
/* GNU General Public License for more details.
/*
/* You should have received a copy of the GNU General Public License
/* along with this program.  If not, see <https://www.gnu.org/licenses/>.
/*
/***************************************************************************/

import argv from '@prokopschield/argv';

import { screenshot } from './screenshot';

async function main() {
    argv.alias('page', 'site', 'p', 's')
        .alias('resolution', 'res', 'r')
        .alias('format', 'type', 'f', 't')
        .alias('quality', 'q');

    const { page, resolution, format, quality } = argv.expect(
        ['page', 'resolution', 'format', 'quality'],
        {
            page: '',
            resolution: '',
            format: 'webp',
            quality: '100',
        }
    );

    if (!page) {
        return console.error(`Usage: ${argv.execScript} PAGE`);
    }

    const resolution_array = [];

    if (resolution) {
        const [x, y] = resolution.split('x').map(Number);

        if (x && y) {
            resolution_array.push({ x, y });
        }
    }

    if (format !== 'jpeg' && format !== 'png' && format !== 'webp') {
        return console.error(`Unsupported format: ${format}`);
    }

    const preview = await screenshot(page, resolution_array, {
        imgFormat: format,
        imgQuality: Number(quality) || 100,
    });

    if (preview.error) {
        return console.error(preview.error);
    }

    for (const value of preview.screenshots.values()) {
        return process.stdout.write(value);
    }
}

main().catch(console.error);
