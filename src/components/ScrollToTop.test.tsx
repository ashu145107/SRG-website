/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

jest.mock('../services/baseApi', () => ({
  baseApi: {
    reducerPath: 'srgApi',
    reducer: (state: unknown = {}) => state,
    middleware: () => (next: any) => (action: any) => next(action),
  },
  getApiBaseUrl: () => '',
}));

jest.mock('react-router-dom', () => {
  const util = require('util');
  (global as any).TextEncoder = (global as any).TextEncoder || util.TextEncoder;
  (global as any).TextDecoder = (global as any).TextDecoder || util.TextDecoder;
  return jest.requireActual('react-router-dom');
});

import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, renderWithProviders } from '../test/test-utils';
import { ScrollToTop } from './ScrollToTop';

describe('ScrollToTop', () => {
  let scrollSpy: jest.SpyInstance;

  beforeEach(() => {
    scrollSpy = jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });

  afterEach(() => {
    scrollSpy.mockRestore();
  });

  it('scrolls to the top on render', () => {
    renderWithProviders(<ScrollToTop />, { route: '/dashboard' });

    expect(scrollSpy).toHaveBeenCalledTimes(1);
    expect(scrollSpy).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'auto' });
  });

  it('does not scroll when navigation targets a section', () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/', state: { scrollTo: 'about' } }]}>
        <ScrollToTop />
      </MemoryRouter>
    );

    expect(scrollSpy).not.toHaveBeenCalled();
  });

  it('renders nothing', () => {
    const { container } = renderWithProviders(<ScrollToTop />);
    expect(container).toBeEmptyDOMElement();
  });
});
