import { GetValidAccessToken, RefreshAccessToken } from '../auth/auth.js';
import { ShowErrorMessage } from '../utils/helpers.js';

export async function MakeAuthenticatedRequest(url, options = {}) {
    console.log('MakeAuthenticatedRequest called with URL:', url);
    const accessToken = await GetValidAccessToken();
    console.log('Access token obtained:', accessToken);

    const headers = new Headers(options.headers || {});
    headers.set('Authorization', `Bearer ${accessToken}`);

    console.log('Full Authorization header:', headers.get('Authorization'));

    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        // Instead of throwing an error, return the response object
        return response;
    } catch (error) {
        console.error('Error in MakeAuthenticatedRequest:', error);
        throw error;
    }
}

export async function MakeRequest(url, options = {}) {
    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            // Extract error message from response if available
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.error || response.statusText;
            throw new Error(`Request failed: ${errorMessage}`);
        }

        return response;
    } catch (error) {
        console.error('MakeRequest error:', error);
        throw error;
    }
}