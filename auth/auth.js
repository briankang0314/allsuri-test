import { FillTheBody } from '../app.js';
import { KAKAO_APP_KEY } from '../utils/constants.js';
import { GetDeviceToken } from '../api/firebaseService.js';

if (!window.Kakao.isInitialized()) {
    window.Kakao.init(KAKAO_APP_KEY);
    console.log('Kakao SDK initialized:', window.Kakao.isInitialized());
}

export async function LoginByKakao() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
        try {
            console.log('Sending code to backend:', code);

            const deviceToken = await GetDeviceToken();
            if (!deviceToken) {
                console.warn('Unable to obtain device token. Proceeding with login without it.');
            }

            const response = await fetch('https://69qcfumvgb.execute-api.ap-southeast-2.amazonaws.com/KakaoLogin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code: code, deviceToken: deviceToken }),
            });

            const data = await response.json();

            console.log('Response from backend:', data);

            if (response.ok) {
                console.log('Login successful:', data);
                // Store user info and tokens separately in localStorage
                if (data.user) {
                    localStorage.setItem('user', JSON.stringify(data.user));
                    console.log('User:', data.user);
                }
                if (data.tokens) {
                    localStorage.setItem('tokens', JSON.stringify(data.tokens));
                    console.log('Tokens:', data.tokens);
                    // Set the Kakao access token
                    Kakao.Auth.setAccessToken(data.tokens.access_token);
                    // Verify the token status
                    try {
                        const status = await Kakao.Auth.getStatusInfo();
                        if (status.status === 'connected') {
                            console.log('Kakao login verified, token:', Kakao.Auth.getAccessToken());
                            // You can update the UI here if needed
                        } else {
                            console.log('Kakao login not verified, status:', status.status);
                        }
                    } catch (error) {
                        console.error('Error verifying Kakao token:', error);
                        Kakao.Auth.setAccessToken(null);
                    }
                }

                // Redirect to home page
                await FillTheBody('home');
            } else {
                console.error('Login failed:', data);
                await FillTheBody('login');
            }
            window.history.pushState(null, '', '/');
        } catch (error) {
            console.error('Error during login:', error);
            await FillTheBody('login');
        }
    } else {
        console.error('No authorization code found in URL');
        await FillTheBody('login');
    }
}

export async function Logout() {

    const accessToken = GetStoredAccessToken();
    if (!accessToken) {
        console.log('No Kakao access token found, proceeding with local logout');	
    } else {
        console.log('Kakao access token found, initiating Kakao logout...');
        try {
            await Kakao.Auth.logout();
            console.log('Kakao logout successful');
        } catch (error) {
            console.error('Kakao logout failed', error);
        }
    }

    // Proceed with server-side logout
    try {
        const response = await fetch('https://69qcfumvgb.execute-api.ap-southeast-2.amazonaws.com/KakaoLogout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Server-side logout failed: ${errorData.error || response.statusText}`);
        }

        console.log('Server-side logout successful');
    } catch (error) {
        console.error('Error during server-side logout:', error);
    }

    // Clear local storage and update UI
    console.log('Clearing local storage...');
    localStorage.removeItem('user');
    localStorage.removeItem('tokens');
    console.log('Local storage cleared');

    // Redirect to login page
    console.log('Redirecting to login page...');
    await FillTheBody('login');
}

export function GetStoredAccessToken() {
    const tokens = JSON.parse(localStorage.getItem('tokens'));
    return tokens && tokens.access_token ? tokens.access_token : null;
}

export async function RefreshAccessToken() {
    const tokens = JSON.parse(localStorage.getItem('tokens'));
    if (!tokens || !tokens.refresh_token) {
        throw new Error('No refresh token available');
    }

    try {
        const response = await fetch('https://69qcfumvgb.execute-api.ap-southeast-2.amazonaws.com/KakaoTokenRefresh', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh_token: tokens.refresh_token }),
        });

        if (!response.ok) {
            throw new Error('Failed to refresh token');
        }

        const result = await response.json();
        console.log('Token refresh result:', result);
        const newTokens = result.tokens;

        // Update tokens in localStorage
        const updatedTokens = { ...tokens, ...newTokens };
        localStorage.setItem('tokens', JSON.stringify(updatedTokens));

        // Update user object in localStorage
        const user = JSON.parse(localStorage.getItem('user'));
        user.access_token = newTokens.access_token;
        if (newTokens.refresh_token) {
            user.refresh_token = newTokens.refresh_token;
        }
        user.token_expires_at = new Date(Date.now() + newTokens.expires_in * 1000).toISOString();
        if (newTokens.id_token) {
            user.id_token = newTokens.id_token;
        }
        localStorage.setItem('user', JSON.stringify(user));

        return newTokens.access_token;
    } catch (error) {
        console.error('Error refreshing token:', error);
        // If refresh fails, redirect to login
        window.location.href = '/login';
    }
}

export async function GetValidAccessToken() {
    if (IsAccessTokenExpired()) {
        console.log('Access token is expired. Refreshing...');
        const newAccessToken = await RefreshAccessToken();
        if (IsRefreshTokenNearExpiration()) {
            console.log('Refresh token is nearing expiration. User should re-authenticate soon.');
            // You might want to show a notification to the user here
        }
        return newAccessToken;
    } else {
        return JSON.parse(localStorage.getItem('tokens')).access_token;
    }
}

export function IsAccessTokenExpired() {
    const tokens = JSON.parse(localStorage.getItem('tokens'));
    const user = JSON.parse(localStorage.getItem('user'));
    if (!tokens || !user) return true;

    const expiresAt = new Date(user.token_expires_at);
    const now = new Date();
    return now.getTime() > expiresAt.getTime();
}

export function IsRefreshTokenNearExpiration() {
    const tokens = JSON.parse(localStorage.getItem('tokens'));
    if (!tokens || !tokens.refresh_token_expires_in) return false;

    const refreshTokenExpiresAt = new Date(tokens.refresh_token_expires_in * 1000 + Date.now());
    const oneMonthFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    return refreshTokenExpiresAt < oneMonthFromNow;
}