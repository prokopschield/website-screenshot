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

import { performance } from 'perf_hooks';
import puppeteer from 'puppeteer';

export interface PagePreview {
    error?: Error;
    screenshots: Map<string, Buffer>;
    URLs: Set<string>;
    load_time_ms: number;
    size: number;
    html: string;
    resources: Map<string, Buffer>;
}

export interface Resolution {
    x: number;
    y: number;
    renderFullPage?: boolean;
    resolutionAlias?: string;
}

export interface Options {
    imgFormat?: 'jpeg' | 'png' | 'webp';
    imgQuality?: number;
}

export async function screenshot(
    url: string,
    resolutions: Resolution[] = [
        {
            x: 1920,
            y: 1080,
            renderFullPage: true,
            resolutionAlias: 'full',
        },
    ],
    options: Options = {}
): Promise<PagePreview> {
    const preview: PagePreview = {
        URLs: new Set<string>(),
        screenshots: new Map<string, Buffer>(),
        load_time_ms: 0,
        size: 0,
        html: '',
        resources: new Map<string, Buffer>(),
    };

    const browser = await puppeteer.launch({
        headless: true,
    });

    try {
        const page = await browser.newPage();

        page.setRequestInterception(true);

        page.on('request', (request) => {
            preview.URLs.add(request.url());

            return request.continue();
        });

        page.on('response', async (response) => {
            try {
                const url = response.url();

                preview.URLs.add(url);

                const buffer = await response.buffer();

                preview.resources.set(url, buffer);

                preview.size += buffer.length;
            } catch {
                // no need to do anything here
                // prefetch requests are expected to throw
            }
        });

        const load_start = performance.now();

        await page
            .goto(url, { waitUntil: 'networkidle0' })
            .catch((error) => (preview.error = error));
        const load_end = performance.now();

        preview.load_time_ms = load_end - load_start;

        for (const { x, y, renderFullPage, resolutionAlias } of resolutions) {
            await page.setViewport({ width: x, height: y });

            let element =
                (await page.$('body')) ||
                ((await page.$('*')) as puppeteer.ElementHandle<Element>);

            while (element) {
                const oneChild = await element.evaluate((element) => {
                    const childNodes = element.childNodes;

                    if (childNodes.length === 1) {
                        return true;
                    } else {
                        return false;
                    }
                });

                if (!oneChild) {
                    break;
                }

                const childElement = await element.$('*');

                if (childElement) {
                    element = childElement;
                } else {
                    break;
                }
            }

            const screenshot = (await element.screenshot({
                captureBeyondViewport: renderFullPage,
                fullPage: renderFullPage,
                type: options.imgFormat || 'webp',
                quality:
                    options.imgFormat === 'png'
                        ? undefined
                        : options.imgQuality || 100,
                encoding: 'binary',
            })) as Buffer; // encoding:binary yields Buffer

            preview.screenshots.set(
                resolutionAlias || `${x}x${y}${renderFullPage ? '_full' : ''}`,
                screenshot
            );
        }

        preview.html = await page.content();

        await page.close();
    } catch (error) {
        if (error instanceof Error) {
            preview.error = error;
        }
    }

    await browser.close();

    return preview;
}
