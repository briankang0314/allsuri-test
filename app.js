// Imports
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
import { FillTheBody } from './app.js';

// Import page setup functions
import { SetupLandingPage } from './pages/landingPage.js';
import { SetupNotificationsPage } from './pages/notificationsPage.js';
import { SetupHomePage } from './pages/homePage.js';
import { SetupLoginPage } from './pages/loginPage.js';
import { SetupEditProfilePage } from './pages/editProfilePage.js';
import { SetupPostOrderPage } from './pages/postOrderPage.js';
import { SetupApplyForOrderPage } from './pages/applyForOrderPage.js';
import { SetupMyOrdersPage } from './pages/myOrdersPage.js';
import { SetupOrderApplicationsPage } from './pages/orderApplicationsPage.js';
import { SetupMyApplicationsPage } from './pages/myApplicationsPage.js';
import { SetupChatPage } from './pages/chatPage.js';
import { FetchUserProfile, SetupMyProfileEventListeners } from './pages/userProfilePage.js';

// Import utility functions
import { ShowErrorMessage } from './utils/helpers.js';

export async function FillTheBody(contentName, params = {}) {
    try {
        if (contentName === 'my-profile') {

            const profile = await FetchUserProfile();
            if (!profile) {
                throw new Error('Failed to fetch user profile');
            }

            // Fetch and render the page content
            const content = await fetch(`/contents/${contentName}.html`).then(response => response.text());
            document.body.innerHTML = content;

            // Set up the page with the fetched profile data
            SetupMyProfileEventListeners();
            UpdateProfileUI(profile); // Assume this function is defined in userProfilePage.js
        } else {
            // Fetch and render the page content
            const content = await fetch(`/contents/${contentName}.html`).then(response => response.text());
            document.body.innerHTML = content;

            // Delegate page-specific setup
            switch (contentName) {
                case 'landing':
                    await SetupLandingPage();
                    break;
                case 'notification':
                    await SetupNotificationsPage();
                    break;
                case 'login':
                    await SetupLoginPage();
                    break;
                case 'home':
                    await SetupHomePage();
                    break;
                case 'edit-profile':
                    await SetupEditProfilePage();
                    break;
                case 'post-order':
                    await SetupPostOrderPage();
                    break;
                case 'apply-for-order':
                    await SetupApplyForOrderPage();
                    break;
                case 'my-orders':
                    await SetupMyOrdersPage();
                    break;
                case 'order-applications':
                    await SetupOrderApplicationsPage(params);
                    break;
                case 'my-applications':
                    await SetupMyApplicationsPage();
                    break;
                case 'chat':
                    await SetupChatPage();
                    break;
                default:
                    console.error(`Unknown content name: ${contentName}`);
            }
        }
    } catch (error) {
        console.error(`Error loading ${contentName}:`, error);
        ShowErrorMessage(`${contentName} 페이지 로딩 중 오류가 발생했습니다. 다시 시도해주세요.`);
    }
}