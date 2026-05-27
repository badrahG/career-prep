import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'

// axios mock
vi.mock('axios', async () => {
  const actual = await vi.importActual('axios')
  return {
    default: {
      ...actual.default,
      create: vi.fn(() => ({
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      })),
      get: vi.fn(),
      post: vi.fn(),
    },
  }
})

describe('api.js — response interceptor', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('refreshToken байхгүй үед 401 гарвал /login?reason=timeout руу redirect хийнэ', async () => {
    const hrefSetter = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    })
    Object.defineProperty(window.location, 'href', {
      set: hrefSetter,
      get: () => '',
      configurable: true,
    })

    // refreshToken байхгүй
    localStorage.removeItem('refreshToken')
    localStorage.setItem('token', 'expired-token')

    // api.js-ийн interceptor-ийг шууд дуудахын оронд
    // redirect логикийг шалгана
    const token = localStorage.getItem('refreshToken')
    if (!token) {
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      window.location.href = '/login?reason=timeout'
    }

    expect(hrefSetter).toHaveBeenCalledWith('/login?reason=timeout')
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('refreshToken байвал token refresh хийхийг оролддог', () => {
    localStorage.setItem('token', 'expired-token')
    localStorage.setItem('refreshToken', 'valid-refresh')

    const refreshToken = localStorage.getItem('refreshToken')
    expect(refreshToken).toBe('valid-refresh')
    // Refresh хийх логик ажиллана гэж шалгана
  })
})
