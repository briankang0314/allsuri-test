// Global Variables
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
console.time('app-initialization');
const regions = [
    { id: 1, name: '서울' }, { id: 2, name: '인천' }, { id: 3, name: '경기' },
    { id: 4, name: '부산' }, { id: 5, name: '대구' }, { id: 6, name: '광주' },
    { id: 7, name: '대전' }, { id: 8, name: '울산' }, { id: 9, name: '세종' },
    { id: 10, name: '강원' }, { id: 11, name: '충북' }, { id: 12, name: '충남' },
    { id: 13, name: '전북' }, { id: 14, name: '전남' }, { id: 15, name: '경북' },
    { id: 16, name: '경남' }, { id: 17, name: '제주' }
];

const cities = {
    1: ['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'],
    2: ['강화군', '계양구', '남동구', '중구', '동구', '미추홀구', '부평구', '서구', '연수구', '옹진군'],
    3: ['가평군', '고양시', '과천시', '광명시', '광주시', '구리시', '군포시', '김포시', '남양주시', '동두천시', '부천시', '성남시', '수원시', '시흥시', '안산시', '안성시', '안양시', '양주시', '양평군', '여주시', '연천군', '오산시', '용인시', '의왕시', '의정부시', '이천시', '파주시', '평택시', '포천시', '하남시', '화성시'],
    4: ['강서구', '금정구', '기장군', '남구', '동구', '동래구', '부산진구', '북구', '사상구', '사하구', '서구', '수영구', '연제구', '영도구', '중구', '해운대구'],
    5: ['남구', '달서구', '달성군', '동구', '북구', '서구', '수성구', '중구', '군위군'],
    6: ['광산구', '남구', '동구', '북구', '서구'],
    7: ['동구', '중구', '서구', '유성구', '대덕구'],
    8: ['남구', '동구', '북구', '울주군', '중구'],
    9: [], // 세종특별자치시는 구/군 구분이 없습니다.
    10: ['강릉시', '고성군', '동해시', '삼척시', '속초시', '양구군', '양양군', '영월군', '원주시', '인제군', '정선군', '철원군', '춘천시', '태백시', '평창군', '홍천군', '화천군', '횡성군'],
    11: ['제천시', '청주시', '충주시', '진천군', '음성군', '단양군', '증평군', '괴산군', '옥천군', '영동군', '보은군'],
    12: ['천안시', '공주시', '보령시', '아산시', '서산시', '논산시', '계룡시', '당진시', '금산군', '부여군', '서천군', '청양군', '홍성군', '예산군', '태안군'],
    13: ['전주시', '군산시', '익산시', '정읍시', '남원시', '김제시', '완주군', '진안군', '무주군', '장수군', '임실군', '순창군', '고창군', '부안군'],
    14: ['목포시', '여수시', '순천시', '나주시', '광양시', '담양군', '곡성군', '구례군', '고흥군', '보성군', '화순군', '장흥군', '강진군', '해남군', '영암군', '무안군', '함평군', '영광군', '장성군', '완도군', '진도군', '신안군'],
    15: ['경산시', '경주시', '고령군', '구미시', '김천시', '문경시', '봉화군', '상주시', '성주군', '안동시', '영덕군', '영양군', '영주시', '영천시', '예천군', '울릉군', '울진군', '의성군', '청도군', '청송군', '칠곡군', '포항시'],
    16: ['거제시', '거창군', '고성군', '김해시', '남해군', '마산시', '밀양시', '사천시', '산청군', '양산시', '의령군', '진주시', '창녕군', '창원시', '통영시', '하동군', '함안군', '함양군', '합천군'],
    17: ['제주시', '서귀포시']
};

const allCategories = ['누수', '방수', '하수구', '리모델링', '동파/해빙', '수도설비', '기타'];

let currentFilters = {
    region: '',
    city: '',
    status: ''
};
let currentSort = 'created_at';

let myOrdersCurrentFilters = {
    region: '',
    city: '',
    status: ''
};
let myOrdersCurrentSort = 'created_at';

let isLoading = false;

const loadingIndicator = document.createElement('div');
loadingIndicator.innerHTML = `
  <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 9999;">
    <div style="background: white; padding: 20px; border-radius: 5px;">
      <p>로딩중...</p>
    </div>
  </div>
`;

let currentPage = 1;
const postsPerPage = 10;

let currentOrderId = null;




///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Check if running in KakaoTalk browser
// if (navigator.userAgent.indexOf('KAKAO') >= 0) {
//     console.log('Running in KakaoTalk browser, redirecting...');
//     // Redirect to external browser
//     window.location.href = 'kakaotalk://web/openExternal?url=' + encodeURIComponent(window.location.href);
//     return; // Stop further execution
// }

// // Check if not running as PWA
// if (!window.matchMedia('(display-mode: standalone)').matches) {
//     console.log('Not running as PWA, showing landing page');
//     await FillTheBody('landing');
//     return; // Stop further execution
// }
///////////////////////////////////////////////////////////////////////////////////////////////////////////////





console.timeEnd('app-initialization');
// Initialization
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js';
import { getMessaging, getToken } from 'https://www.gstatic.com/firebasejs/9.21.0/firebase-messaging.js';
import { APP_VERSION } from './version.js';

export async function Start() {
    console.time('Start-function');
    console.log('Start function called');

    if (navigator.userAgent.indexOf('KAKAO') >= 0) {
        console.log('Running in KakaoTalk browser, redirecting...');
        location.href = 'kakaotalk://web/openExternal?url=' + encodeURIComponent(location);
        return;
    }

    // Perform version check
    // try {
    //     const updateRequired = await CheckForUpdates();
    //     if (updateRequired) {
    //         console.log('Update required. Reloading app...');
    //         await clearAppCache();
    //         window.location.reload(true);
    //         return;
    //     }
    // } catch (error) {
    //     console.error('Error checking for updates:', error);
    // }

    try {
        // Initialize Kakao SDK
        if (!Kakao.isInitialized()) {
            Kakao.init("8cdce0e36a3774e9d3d2a738f2d5192f");
        }
        console.log('Kakao SDK initialized');
    } catch (error) {
        console.error('Error initializing Kakao SDK:', error);
    }

    // Check if this is a Kakao callback
    if (window.location.pathname === '/oauth/callback') {
        console.log('Detected OAuth callback, handling Kakao login');
        await LoginByKakao();
        return;
    }

    // check if notification not granted: the permission cannot be denied I think it's a bug
    if (Notification.permission != 'granted') {
        FillTheBody('notification');
        console.log('Notification permission not granted, showing notification page');
        return;
    }

    // Check if user is logged in
    if (localStorage.getItem('user') !== null && localStorage.getItem('tokens') !== null) {
        const isProfileComplete = await CheckProfileCompleteness();
        if (!isProfileComplete) {
            await FillTheBody('my-profile');
            ShowIncompleteProfileWarning();
        } else {
            await FillTheBody('home');
        }
        history.pushState(null, '', '/');
    } else {
        await FillTheBody('login');
    }
    console.timeEnd('Start-function');
}

async function CheckForUpdates() {
    const currentVersion = APP_VERSION;
    console.log('Checking for updates. Current version:', currentVersion);

    try {
        const response = await fetch('https://69qcfumvgb.execute-api.ap-southeast-2.amazonaws.com/CheckVersion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ version: currentVersion })
        });

        if (!response.ok) {
            throw new Error('Failed to check for updates');
        }

        const data = await response.json();

        if (data.requiresUpdate) {
            console.log('Update required. New version:', data.latestVersion);

            if (data.actions.includes("signOut")) {
                await Logout();
            }

            return true;
        } else {
            console.log('App is up to date.');
            return false;
        }
    } catch (error) {
        console.error('Error checking for updates:', error);
        throw error;
    }
}

async function clearAppCache() {
    if ('caches' in window) {
        try {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => caches.delete(name)));
            console.log('App cache cleared');
        } catch (error) {
            console.error('Failed to clear app cache:', error);
        }
    }
}


// Dynamic Content Loading
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function FillTheBody(contentName) {
    console.time(`FillTheBody-${contentName}`);
    ShowLoading();

    try {
        if (contentName === 'my-profile') {
            console.time('FetchUserProfile');
            const profile = await FetchUserProfile();
            console.timeEnd('FetchUserProfile');
            if (!profile) {
                throw new Error('Failed to fetch user profile');
            }

            // Now fetch and render the page content
            console.time('FetchPageContent');
            const content = await fetch(`/contents/${contentName}.html`).then(response => response.text());
            console.timeEnd('FetchPageContent');
            document.body.innerHTML = content;

            // Set up the page with the fetched profile data
            SetupMyProfileEventListeners();
            UpdateProfileUI(profile);
            SetupEditProfileModal(profile);
        } else {
            // For all other pages, proceed as before
            const content = await fetch(`/contents/${contentName}.html`).then(response => response.text());
            document.body.innerHTML = content;

            switch (contentName) {
                case 'landing':
                    const isIOS = /iP(ad|od|hone)/i.test(navigator.userAgent) && !!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/);
                    const elementToShow = isIOS ? 'iphone_install' : 'android_install';
                    document.getElementById(elementToShow).style.display = 'block';

                    break;
                case 'notification':
                    document.getElementById('default').style.display = 'none';
                    document.getElementById('denied').style.display = 'none';

                    switch (Notification.permission) {
                        case 'default':
                            document.getElementById('default').style.display = 'block';
                            document.getElementById('button_notification_allow').addEventListener('click', async function () {
                                try {
                                    const permission = await Notification.requestPermission();
                                    if (permission === 'granted') {
                                        console.log('Notification permission granted');
                                        // Optionally, you can update the UI here to reflect the new permission status
                                        FillTheBody('notification');  // Refresh the notification page
                                    } else {
                                        console.log('Notification permission denied');
                                        // Optionally, you can update the UI here to reflect the denied status
                                    }
                                } catch (error) {
                                    console.error('Error requesting notification permission:', error);
                                    ShowErrorMessage('알림 권한 요청 중 오류가 발생했습니다. 다시 시도해주세요.');
                                }
                            });

                            break;
                        case 'denied':
                            document.getElementById('denied').style.display = 'block';
                            break;
                    }

                    break;
                case 'login':
                    const kakaoLoginBtn = document.getElementById('kakao-login-btn');
                    if (kakaoLoginBtn) {
                        kakaoLoginBtn.addEventListener('click', function() {
                            console.log('Attempting Kakao login');
                            Kakao.Auth.authorize({
                                redirectUri: 'https://allsuri-test.netlify.app/oauth/callback',
                            });
                        });
                    }

                    const backButton = document.getElementById('back-btn');
                    if (backButton) {
                        backButton.addEventListener('click', () => FillTheBody('home'));
                    }

                    break;
                case 'home':
                    await SetupHomePage();
                    break;
                case 'post-order':
                    document.getElementById('post-order-form').addEventListener('submit', SubmitOrder);
                    document.getElementById('cancel-post-order').addEventListener('click', () => FillTheBody('home'));
                    document.getElementById('baack-btn').addEventListener('click', () => FillTheBody('home'));

                    PopulateRegions();
                    document.getElementById('region').addEventListener('change', (e) => { PopulateCities(e.target.value); });

                    const feeType = document.getElementById('fee-type');
                    const feeInputContainer = document.getElementById('fee-input-container');
                    const feeInput = document.getElementById('fee');

                    feeType.addEventListener('change', function () {
                        if (this.value === 'fixed') {
                            feeInputContainer.style.display = 'block';
                            feeInput.required = true;
                        } else {
                            feeInputContainer.style.display = 'none';
                            feeInput.required = false;
                            feeInput.value = '';
                            feeInput.classList.remove('is-invalid');
                        }
                    });

                    feeInput.addEventListener('input', function () {
                        const value = this.value;
                        if (value === '' || isNaN(value) || value < 0 || value > 100 || !Number.isInteger(Number(value))) {
                            this.classList.add('is-invalid');
                        } else {
                            this.classList.remove('is-invalid');
                        }
                    });

                    break;
                case 'my-orders':
                    await SetupMyOrdersPage();
                    break;
                // case 'user-login-info':
                //     SetupUserLoginInfoPage();
                //     break;
            }
        }
    } catch (error) {
        console.error(`Error loading ${contentName}:`, error);
        ShowErrorMessage(`${contentName} 페이지 로딩 중 오류가 발생했습니다. 다시 시도해주세요.`);
    } finally {
        HideLoading();
        console.timeEnd(`FillTheBody-${contentName}`);
    }
}






// Backend API Requests
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function MakeAuthenticatedRequest(url, options = {}) {
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






// User Authentication
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function RefreshAccessToken() {
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

async function GetValidAccessToken() {
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

function IsAccessTokenExpired() {
    const tokens = JSON.parse(localStorage.getItem('tokens'));
    const user = JSON.parse(localStorage.getItem('user'));
    if (!tokens || !user) return true;

    const expiresAt = new Date(user.token_expires_at);
    const now = new Date();
    return now.getTime() > expiresAt.getTime();
}

function IsRefreshTokenNearExpiration() {
    const tokens = JSON.parse(localStorage.getItem('tokens'));
    if (!tokens || !tokens.refresh_token_expires_in) return false;

    const refreshTokenExpiresAt = new Date(tokens.refresh_token_expires_in * 1000 + Date.now());
    const oneMonthFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    return refreshTokenExpiresAt < oneMonthFromNow;
}






// User Login-Info Page
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
function SetupUserLoginInfoPage() {
    const user = JSON.parse(localStorage.getItem('user'));
    const tokens = JSON.parse(localStorage.getItem('tokens'));
    const userInfo = document.getElementById('user-info');
    const tokensInfo = document.getElementById('tokens');
    const deviceTokenInfo = document.getElementById('device-token');
    const logoutBtn = document.getElementById('logout-btn');
    const homeBtn = document.getElementById('home-btn');

    if (user) {
        // Direct access to properties without nested objects
        document.getElementById('profile-image').src = user.profile_image_url ?? 'path/to/default/image.png'.replace('http://', 'https://');
        document.getElementById('user-nickname').textContent = user.nickname ?? '정보 없음';
        document.getElementById('user-email').textContent = user.email ?? '정보 없음';
        document.getElementById('user-id').textContent = user.user_id ?? '정보 없음';

        const connectedDate = new Date(user.created_at || new Date());
        const formattedDate = connectedDate.toLocaleString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        document.getElementById('connected-at').textContent = formattedDate;

        userInfo.style.display = 'block';
    } else {
        userInfo.style.display = 'none';
    }

    if (tokens) {
        document.getElementById('access-token').textContent = tokens.access_token ?? '정보 없음';
        document.getElementById('refresh-token').textContent = tokens.refresh_token ?? '정보 없음';
        document.getElementById('id-token').textContent = tokens.id_token ?? '정보 없음';

        const expiresDate = new Date(Date.now() + tokens.expires_in * 1000);
        document.getElementById('token-expires').textContent = expiresDate.toLocaleString('ko-KR');

        tokensInfo.style.display = 'block';
    } else {
        tokensInfo.style.display = 'none';
    }

    const deviceToken = localStorage.getItem('DeviceToken');
    if (deviceToken) {
        document.getElementById('device-token-value').textContent = deviceToken;
        deviceTokenInfo.style.display = 'block';
    } else {
        deviceTokenInfo.style.display = 'none';
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', Logout);
    }

    if (homeBtn) {
        homeBtn.addEventListener('click', () => FillTheBody('home'));
    }
}








// Login Page
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function LoginByKakao() {
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

async function GetDeviceToken() {
    let deviceToken = localStorage.getItem('DeviceToken');
    if (!deviceToken) {
        try {
            deviceToken = await SaveDeviceToken();
        } catch (error) {
            console.error('Failed to get new device token:', error);
            return null;
        }
    }
    return deviceToken;
}

async function SaveDeviceToken() {
    const firebaseConfig = { apiKey: "AIzaSyC31o_5NeICP4lmMM-siuiL0FpnT2bxHxc", authDomain: "allsuri-test-e2c8f.firebaseapp.com", projectId: "allsuri-test-e2c8f", storageBucket: "allsuri-test-e2c8f.appspot.com", messagingSenderId: "1018254528358", appId: "1:1018254528358:web:e76064107baac031b982a7", measurementId: "G-GL43C8EQCL" };
    const firebaseVapidKey = "BCqZ54Dgg6pEqMHIIRrS1zm5x-frIlYikBsFb6mKiS_p1P7gkUI9HVmRKFU7-ANI6zxiR6zUWC8uRtzndJvufWk";
    try {
        const deviceToken = await getToken((getMessaging(initializeApp(firebaseConfig))), { firebaseVapidKey });

        if (deviceToken) {
            localStorage.setItem('DeviceToken', deviceToken);
            console.log('New device token obtained and saved');
            return deviceToken;
        } else {
            throw new Error('Failed to obtain new device token');
        }
    } catch (error) {
        console.error('Error saving device token:', error);
        throw error;
    }
}






// Home Page
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function SetupHomePage() {
    console.log('Setting up home page');

    SetupHomePageEventListeners();
    SetupFilterAndSort();

    await FetchAndDisplayOrderPosts(1);

    console.log('Home page setup complete');
}

function SetupHomePageEventListeners() {
    // Post Order button
    const postOrderBtn = document.getElementById('post-order-btn');
    if (postOrderBtn) {
        postOrderBtn.addEventListener('click', async () => {
            ShowLoading();
            try {
                await FillTheBody('post-order');
            } catch (error) {
                console.error('Error loading post order page:', error);
                ShowErrorMessage('오더 등록 중에 오류가 발생했습니다. 다시 시도해주세요.');
            } finally {
                HideLoading();
            }
        });
    }

    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        // Listen for Bootstrap's shown.bs.dropdown event
        settingsBtn.addEventListener('show.bs.dropdown', function () {
            OpenSettingsDropdown();
        });
    }

    // Dropdown menu items
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    dropdownItems.forEach(item => {
        item.addEventListener('click', HandleDropdownItemClick);
    });

    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', RefreshOrderPosts);
    }

    const paginationContainer = document.getElementById('pagination-container');
    if (paginationContainer) {
        paginationContainer.addEventListener('click', async (e) => {
            if (e.target.tagName === 'A' && e.target.getAttribute('data-page')) {
                e.preventDefault();
                const page = parseInt(e.target.getAttribute('data-page'));
                await FetchAndDisplayOrderPosts(page);
            }
        });
    }
}

async function FetchAndDisplayOrderPosts(page = 1) {
    console.time('FetchAndDisplayOrderPosts');
    ShowLoading();
    try {
        console.time('MakeAuthenticatedRequest-GetOrders');
        const response = await MakeAuthenticatedRequest('https://69qcfumvgb.execute-api.ap-southeast-2.amazonaws.com/GetOrders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                page,
                limit: postsPerPage,
                action: 'get_orders',
                filters: currentFilters,
                sort: currentSort || 'created_at'
            })
        });
        console.timeEnd('MakeAuthenticatedRequest-GetOrders');

        if (!response.ok) {
            throw new Error('Failed to fetch order posts');
        }

        console.time('ParseJSONResponse');
        const result = await response.json();
        console.timeEnd('ParseJSONResponse');
        const orderPosts = result.orders;
        console.log('Fetched order posts:', orderPosts);
        console.log('Fetched order posts:', orderPosts);
        const totalPages = result.totalPages || 1;

        console.time('DisplayOrderPosts');
        DisplayOrderPosts(orderPosts);
        console.timeEnd('DisplayOrderPosts');
        UpdatePagination(page, totalPages);
    } catch (error) {
        console.error('Error fetching order posts:', error);
        ShowErrorMessage('오더를 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
        HideLoading();
        console.timeEnd('FetchAndDisplayOrderPosts');
    }
}

function DisplayOrderPosts(orderPosts) {
    const container = document.getElementById('order-posts-container');
    if (!container) {
        console.error('Order posts container not found');
        return;
    }

    container.innerHTML = ''; // Clear existing content
    const template = document.getElementById('order-card-template');
    if (!template) {
        console.error('Order card template not found');
        return;
    }

    const currentUser = JSON.parse(localStorage.getItem('user'));

    orderPosts.forEach(order => {
        const orderCard = template.content.cloneNode(true);

        const PopulateOrderCard = (element, selector, content) => {
            const el = element.querySelector(selector);
            if (el) {
                el.textContent = content;
            } else {
                console.warn(`Element with selector "${selector}" not found in order card`);
            }
        };

        try {
            PopulateOrderCard(orderCard, '.card-title', order.title || 'No Title');
            PopulateOrderCard(orderCard, '.card-subtitle', order.location || 'No Location');
            PopulateOrderCard(orderCard, '.order-meta', `지원자 ${order.applicants_count || 0}명 • ${GetTimeAgo(order.created_at)}`);
            
            const statusElement = orderCard.querySelector('.order-status');
            if (statusElement) {
                statusElement.textContent = order.status === 'open' ? '지원가능' : '마감';
                statusElement.classList.add(order.status === 'open' ? 'bg-success' : 'bg-danger');
            }

            const feeElement = orderCard.querySelector('.order-fee');
            if (feeElement) {
                if (order.fee === -1) {
                    feeElement.textContent = '수수료 조정 가능';
                } else {
                    feeElement.textContent = `수수료 ${Number(order.fee || 0).toLocaleString()}%`;
                }
            }

            const viewDetailsBtn = orderCard.querySelector('.view-details');
            if (viewDetailsBtn) {
                viewDetailsBtn.addEventListener('click', () => ShowOrderDetails(order, currentUser));
            }

            // Show "내가 올린 오더" badge if the order is posted by the current user
            const myOrderBadge = orderCard.querySelector('.my-order-badge');
            if (myOrderBadge && order.user_id === currentUser.user_id) {
                myOrderBadge.style.display = 'inline-block';
            }

            container.appendChild(orderCard);
        } catch (error) {
            console.error('Error populating order card:', error);
        }
    });
}

function ShowOrderDetails(order, currentUser) {
    currentOrderId = order.order_id;
    const modalTitle = document.getElementById('orderDetailsModalLabel');
    const modalBody = document.getElementById('orderDetailsModalBody');
    const applyForOrderBtn = document.getElementById('applyForOrderBtn');

    modalTitle.textContent = order.title || 'Order Details';

    modalBody.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <h6 class="fw-bold mb-3">오더 정보</h6>
                <p><strong>위치:</strong> ${order.location || 'No Location'}</p>
                <p><strong>상태:</strong> <span class="badge ${order.status === 'open' ? 'bg-success' : 'bg-danger'}">${order.status === 'open' ? '지원가능' : '마감'}</span></p>
                <p><strong>수수료:</strong> ${order.fee === -1 ? '수수료 조정 가능' : `${Number(order.fee || 0).toLocaleString()}%`}</p>
                <p><strong>지원자:</strong> ${order.applicants_count || 0}명</p>
                <p><strong>등록일:</strong> ${GetTimeAgo(order.created_at)}</p>
            </div>
        </div>
        <hr>
        <h6 class="fw-bold mb-3">오더 내용</h6>
        <p>${order.description || '상세 설명 없음'}</p>
    `;

    if (order.user_id === currentUser.user_id) {
        applyForOrderBtn.style.display = 'none';
    } else {
        applyForOrderBtn.style.display = 'block';
        applyForOrderBtn.disabled = order.status !== 'open';
        applyForOrderBtn.onclick = OpenApplicationForm;
    }

    const modal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
    modal.show();
}

function SetupFilterAndSort() {
    const regionFilter = document.getElementById('region-filter');
    const cityFilter = document.getElementById('city-filter');
    const statusFilter = document.getElementById('status-filter');
    const sortOption = document.getElementById('sort-option');

    PopulateRegionFilter(regionFilter);

    regionFilter.addEventListener('change', async (e) => {
        currentFilters.region = e.target.value;
        currentFilters.city = '';
        PopulateCityFilter(cityFilter, e.target.value);
        await FetchAndDisplayOrderPosts(1);
    });

    cityFilter.addEventListener('change', async (e) => {
        currentFilters.city = e.target.value;
        await FetchAndDisplayOrderPosts(1);
    });

    statusFilter.addEventListener('change', async (e) => {
        currentFilters.status = e.target.value;
        await FetchAndDisplayOrderPosts(1);
    });

    sortOption.addEventListener('change', async (e) => {
        currentSort = e.target.value;
        await FetchAndDisplayOrderPosts(1);
    });
}

async function RefreshOrderPosts() {
    ShowLoading();
    try {
        await FetchAndDisplayOrderPosts(1); // Fetch the first page of posts
        ShowErrorMessage('오더 목록이 새로고침되었습니다.', 3000);
    } catch (error) {
        console.error('Error refreshing order posts:', error);
        ShowErrorMessage('오더 목록 새로고침 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
        HideLoading();
    }
}

function OpenSettingsDropdown() {
    // Add any additional logic here that you want to occur when the dropdown is about to open
    // For example, you could update the dropdown content dynamically here if needed
}

function HandleDropdownItemClick(e) {
    e.preventDefault();
    const href = e.target.getAttribute('href');

    // Close the dropdown using Bootstrap's API
    const dropdownEl = document.querySelector('#settings-btn');
    const dropdown = bootstrap.Dropdown.getInstance(dropdownEl);
    if (dropdown) {
        dropdown.hide();
    }

    // Handle the click action
    ShowLoading();
    try {
        switch (href) {
            case '#profile':
                FillTheBody('my-profile');
                break;
            case '#my-orders':
                FillTheBody('my-orders');
                break;
            case '#logout':
                Logout();
                break;
        }
    } catch (error) {
        console.error('Error handling dropdown item click:', error);
        ShowErrorMessage('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
        HideLoading();
    }
}

function UpdatePagination(currentPage, totalPages) {
    const paginationContainer = document.getElementById('pagination-container');
    if (!paginationContainer) return;

    paginationContainer.innerHTML = '';

    // Previous button
    paginationContainer.appendChild(CreatePaginationItem('이전', currentPage > 1, currentPage - 1));

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        paginationContainer.appendChild(CreatePaginationItem(i.toString(), true, i, i === currentPage));
    }

    // Next button
    paginationContainer.appendChild(CreatePaginationItem('다음', currentPage < totalPages, currentPage + 1));
}

function CreatePaginationItem(text, isEnabled, pageNumber, isActive = false) {
    const li = document.createElement('li');
    li.className = `page-item ${isActive ? 'active' : ''} ${!isEnabled ? 'disabled' : ''}`;

    const a = document.createElement('a');
    a.className = 'page-link';
    a.href = '#';
    a.textContent = text;
    a.setAttribute('data-page', pageNumber);

    li.appendChild(a);
    return li;
}

function PopulateRegionFilter(selectElement) {
    regions.forEach(region => {
        const option = document.createElement('option');
        option.value = region.name;
        option.textContent = region.name;
        selectElement.appendChild(option);
    });
}

function PopulateCityFilter(selectElement, selectedRegion) {
    selectElement.innerHTML = '<option value="">도시 선택</option>';
    const regionId = regions.find(r => r.name === selectedRegion)?.id;
    if (regionId && cities[regionId]) {
        cities[regionId].forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            selectElement.appendChild(option);
        });
    }
}

async function Logout() {
    console.log('Logout function initiated');

    const accessToken = Kakao.Auth.getAccessToken();
    if (!accessToken) {
        console.log('No Kakao access token found, proceeding with local logout');
        // Proceed with clearing local storage and UI update
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
    console.log('Redirection to login page complete');
}









// My Profile Page
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function FetchUserProfile() {
    try {
        const response = await MakeAuthenticatedRequest('https://69qcfumvgb.execute-api.ap-southeast-2.amazonaws.com/GetProfile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'get_profile' })
        });
        return await response.json();
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
}

function SetupMyProfileEventListeners() {
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => FillTheBody('home'));
    }

    const editProfileBtn = document.getElementById('edit-profile-btn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', OpenEditProfileModal);
    }

    const phoneInput = document.getElementById('editPhone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function (e) {
            let x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,4})(\d{0,4})/);
            e.target.value = !x[2] ? x[1] : x[1] + '-' + x[2] + (x[3] ? '-' + x[3] : '');
        });
    }

    InitializeAnimations();
}

function CalculateProfileCompletion(profile) {
    const requiredFields = ['nickname', 'email', 'phone', 'region', 'city', 'profile_image_url'];
    const completedFields = requiredFields.filter(field => profile[field]).length;
    return Math.round((completedFields / requiredFields.length) * 100);
}

function UpdateProfileUI(profile) {
    // profile image
    document.getElementById('profile-image').src = profile.profile_image_url ?? '/contents/_icon.png';

    // user info
    document.getElementById('user-nickname').textContent = profile.nickname ?? '정보 없음';
    document.getElementById('user-email').textContent = profile.email ?? '정보 없음';

    // Format dates
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('ko-KR');
    document.getElementById('created-at').textContent = profile.created_at ? formatDate(profile.created_at) : '알 수 없음';
    document.getElementById('last-login').textContent = profile.last_login ? formatDate(profile.last_login) : '알 수 없음';

    // New fields
    document.getElementById('account-type').textContent = profile.account_type ?? '일반 사용자';
    document.getElementById('user-phone').textContent = profile.phone ?? '정보 없음';
    document.getElementById('user-location').textContent = `${profile.region || ''} ${profile.city || ''}`.trim() || '정보 없음';

    // Profile completion
    const completionPercentage = CalculateProfileCompletion(profile);
    UpdateProfileCompletionBar(completionPercentage);

    // Rating and orders
    document.getElementById('user-rating').textContent = profile.average_rating ? `${profile.average_rating.toFixed(1)}/5.0` : '아직 평가 없음';
    document.getElementById('completed-orders').textContent = profile.completed_orders ?? '0';

    // Account statistics
    const statItems = [
        { id: 'total-orders', value: profile.total_orders ?? '0' },
        { id: 'completed-orders-count', value: profile.completed_orders ?? '0' },
        { id: 'cancellation-rate', value: profile.cancellation_rate?.toFixed(1) ?? '0.0' }
    ];

    statItems.forEach((item, index) => {
        const element = document.getElementById(item.id);
        if (element) {
            setTimeout(() => {
                element.textContent = item.value;
                element.style.opacity = 1;
            }, 100 * index);
        }
    });

    // Preferred categories
    UpdatePreferredCategories(profile.preferred_categories);

    // // Badges and achievements
    // UpdateBadges(profile.badges);

    // Notification preferences
    // document.getElementById('notification-preferences').textContent = profile.notification_preferences ?? '알림 설정 정보 없음';
}

function UpdateProfileCompletionBar(percentage) {
    const completionBar = document.getElementById('profile-completion');
    const progressBarContainer = document.getElementById('profile-completion-section');

    if (percentage === 100) {
        progressBarContainer.style.display = 'none';
    } else {
        progressBarContainer.style.display = 'block';
        completionBar.style.width = `${percentage}%`;
        completionBar.setAttribute('aria-valuenow', percentage);
        completionBar.textContent = `${percentage}%`;
    }
}

function UpdatePreferredCategories(categories) {
    const categoriesContainer = document.getElementById('preferred-categories');
    categoriesContainer.innerHTML = '';
    (categories ?? []).forEach(category => {
        const badge = document.createElement('span');
        badge.className = 'badge bg-secondary me-2 mb-2';
        badge.textContent = category;
        categoriesContainer.appendChild(badge);
    });
}

function OpenEditProfileModal() {
    const modal = new bootstrap.Modal(document.getElementById('editProfileModal'));
    modal.show();

    const saveProfileChangesBtn = document.getElementById('saveProfileChanges');
    if (saveProfileChangesBtn) {
        saveProfileChangesBtn.addEventListener('click', SaveProfileChanges);
    }
}

function SetupEditProfileModal(profile) {
    // Set up input fields
    document.getElementById('editNickname').value = profile.nickname ?? '';
    document.getElementById('editPhone').value = profile.phone ?? '';

    // Populate regions using the existing function
    PopulateRegions();
    document.getElementById('region').addEventListener('change', (e) => { PopulateCities(e.target.value); });

    // Set up category checkboxes
    const categoryCheckboxes = document.getElementById('categoryCheckboxes');
    categoryCheckboxes.innerHTML = '';
    allCategories.forEach(category => {
        const div = document.createElement('div');
        div.className = 'form-check mb-2';
        div.innerHTML = `
            <input class="form-check-input" type="checkbox" value="${category}" id="category-${category}" 
                ${profile.preferred_categories?.includes(category) ? 'checked' : ''}>
            <label class="form-check-label" for="category-${category}">${category}</label>
        `;
        categoryCheckboxes.appendChild(div);
    });

    // Set up save changes button
    const saveProfileChangesBtn = document.getElementById('saveProfileChanges');
    if (saveProfileChangesBtn) {
        saveProfileChangesBtn.addEventListener('click', () => SaveProfileChanges(profile.user_id));
    }
}

async function SaveProfileChanges(userId) {
    ShowLoading();
    const updatedProfile = {
        user_id: userId,
        nickname: document.getElementById('editNickname').value,
        phone: document.getElementById('editPhone').value,
        region: regions.find(r => r.id == document.getElementById('region').value)?.name,
        city: document.getElementById('region').value == 9 ? '세종시' : document.getElementById('city').value,
        preferred_categories: Array.from(document.querySelectorAll('#categoryCheckboxes input:checked')).map(input => input.value)
    };    

    try {
        const response = await MakeAuthenticatedRequest('https://69qcfumvgb.execute-api.ap-southeast-2.amazonaws.com/UpdateProfile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'update_profile',
                profile_data: updatedProfile
            })
        });

        const result = await response.json();
        if (result.success) {
            ShowErrorMessage('프로필이 성공적으로 업데이트되었습니다.', 3000);

            let user = JSON.parse(localStorage.getItem('user'));
            user = { ...user, ...updatedProfile };
            localStorage.setItem('user', JSON.stringify(user));

            if (CheckProfileCompleteness(user)) {
                const incompleteProfileWarning = document.getElementById('incomplete-profile-warning');
                if (incompleteProfileWarning) {
                    incompleteProfileWarning.style.display = 'none';
                }
                await FillTheBody('home');
            } else {
                UpdateProfileUI(user);
            }

            const modalElement = document.getElementById('editProfileModal');
            if (modalElement) {
                const modalInstance = bootstrap.Modal.getInstance(modalElement);
                if (modalInstance) {
                    modalInstance.hide();
                } else {
                    console.warn('Modal instance not found, unable to hide modal');
                }
            } else {
                console.warn('Modal element not found');
            }
        } else {
            throw new Error(result.message || '프로필 업데이트에 실패했습니다.');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        ShowErrorMessage('프로필 업데이트에 실패했습니다. 다시 시도해 주세요.');
    } finally {
        HideLoading();
    }
}

async function CheckProfileCompleteness() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return false;

    const requiredFields = ['phone', 'region', 'city', 'preferred_categories'];
    return requiredFields.every(field => user[field] && user[field].length > 0);
}

function ShowIncompleteProfileWarning() {
    const warningElement = document.getElementById('incomplete-profile-warning');
    if (warningElement) {
        warningElement.style.display = 'block';
    }

    const completeProfileBtn = document.getElementById('complete-profile-btn');
    if (completeProfileBtn) {
        completeProfileBtn.addEventListener('click', OpenEditProfileModal);
    }
}

function InitializeAnimations() {
    const statItems = document.querySelectorAll('.stat-item');
    statItems.forEach((item, index) => {
        item.style.opacity = 0;
        setTimeout(() => {
            item.style.opacity = 1;
        }, 100 * index);
    });
}










// Profile Management
///////////////////////////////////////////////////////////////////////////////////////////////////////////////



// My Orders Page
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function RefreshMyOrderPosts() {
    ShowLoading();
    try {
        await FetchAndDisplayMyOrderPosts(1); // Fetch the first page of my posts
        ShowErrorMessage('내 오더 목록이 새로고침되었습니다.', 3000);
    } catch (error) {
        console.error('Error refreshing my order posts:', error);
        ShowErrorMessage('내 오더 목록 새로고침 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
        HideLoading();
    }
}

function SetupMyOrdersFilterAndSort() {
    const regionFilter = document.getElementById('region-filter');
    const cityFilter = document.getElementById('city-filter');
    const statusFilter = document.getElementById('status-filter');
    const sortOption = document.getElementById('sort-option');

    PopulateRegionFilter(regionFilter);

    regionFilter.addEventListener('change', async (e) => {
        myOrdersCurrentFilters.region = e.target.value;
        myOrdersCurrentFilters.city = '';
        PopulateCityFilter(cityFilter, e.target.value);
        await FetchAndDisplayMyOrderPosts(1);
    });

    cityFilter.addEventListener('change', async (e) => {
        myOrdersCurrentFilters.city = e.target.value;
        await FetchAndDisplayMyOrderPosts(1);
    });

    statusFilter.addEventListener('change', async (e) => {
        myOrdersCurrentFilters.status = e.target.value;
        await FetchAndDisplayMyOrderPosts(1);
    });

    sortOption.addEventListener('change', async (e) => {
        myOrdersCurrentSort = e.target.value;
        await FetchAndDisplayMyOrderPosts(1);
    });
}







// Order Management
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function SubmitOrder(event) {
    if (!await CheckProfileCompleteness()) {
        ShowErrorMessage('오더를 등록하려면 프로필을 완성해야 합니다.');
        await FillTheBody('my-profile');
        ShowIncompleteProfileWarning();
        return;
    }

    event.preventDefault();
    ShowLoading();
    console.log('SubmitOrder function called');

    const title = document.getElementById('title').value;
    const category = document.getElementById('category').value;
    const regionId = document.getElementById('region').value;
    const city = document.getElementById('city').value;
    const description = document.getElementById('description').value;
    const feeType = document.getElementById('fee-type').value;
    const feeInput = document.getElementById('fee');

    // Validate fee input if fixed fee is selected
    if (feeType === 'fixed') {
        const feeValue = feeInput.value;
        if (feeValue === '' || isNaN(feeValue) || feeValue < 0 || feeValue > 100 || !Number.isInteger(Number(feeValue))) {
            feeInput.classList.add('is-invalid');
            HideLoading();
            return;
        }
    }

    // Set fee to -1 if 'adjustable', otherwise use the input value
    const fee = feeType === 'adjustable' ? -1 : Number(feeInput.value);

    const orderData = {
        title,
        category,
        region: regions.find(r => r.id == regionId).name,
        city: regionId == 9 ? '세종시' : city,  // Use '세종시' for Sejong
        fee: Number(fee),
        description
    };

    console.log('Order data:', orderData);

    try {
        console.log('Attempting to make authenticated request');
        const response = await MakeAuthenticatedRequest('https://69qcfumvgb.execute-api.ap-southeast-2.amazonaws.com/SubmitOrder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });

        console.log('Response received:', response);
        const result = await response.json();
        console.log('Order submitted successfully:', result);
        // Redirect to home page or show success message
        FillTheBody('home');
    } catch (error) {
        console.error('Error submitting order:', error);
        let errorMessage = '예상치 못한 오류가 발생했습니다. 다시 시도해주세요.';
        if (error.message.includes('401') || error.message.includes('403')) {
            errorMessage = '인증되지 않았습니다. 다시 로그인해주세요.';
            // Optionally, redirect to login page or refresh the token
            // RefreshToken(); // You would need to implement this function
        } else if (error.message.includes('400')) {
            errorMessage = '오더를 제출하는 중 오류가 발생했습니다. 모든 필드를 채워주세요.';
        }
        // Show error message to user
        alert(errorMessage);
    } finally {
        HideLoading();
    }
}

async function SetupMyOrdersPage() {
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => FillTheBody('home'));
    }

    const newOrderBtn = document.getElementById('new-order-btn');
    if (newOrderBtn) {
        newOrderBtn.addEventListener('click', () => FillTheBody('post-order'));
    }

    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', RefreshMyOrderPosts);
    }

    SetupMyOrdersFilterAndSort();
    await FetchAndDisplayMyOrderPosts(1);

    const paginationContainer = document.getElementById('pagination-container');
    if (paginationContainer) {
        paginationContainer.addEventListener('click', async (e) => {
            if (e.target.tagName === 'A' && e.target.getAttribute('data-page')) {
                e.preventDefault();
                const page = parseInt(e.target.getAttribute('data-page'));
                await FetchAndDisplayMyOrderPosts(page);
            }
        });
    }
}

async function FetchAndDisplayMyOrderPosts(page = 1) {
    ShowLoading();
    try {
        const response = await MakeAuthenticatedRequest('https://69qcfumvgb.execute-api.ap-southeast-2.amazonaws.com/GetOrders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                page,
                limit: postsPerPage,
                action: 'get_my_orders',
                filters: myOrdersCurrentFilters,
                sort: myOrdersCurrentSort
            })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch my orders');
        }

        const result = await response.json();
        console.log('Fetched my orders:', result.orders);
        if (result.success && Array.isArray(result.orders)) {
            DisplayMyOrderPosts(result.orders);
            UpdatePagination(page, result.totalPages || 1);
        } else {
            throw new Error('Invalid response format');
        }
    } catch (error) {
        console.error('Error fetching my orders:', error);
        ShowErrorMessage('내 오더를 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
        HideLoading();
    }
}

function DisplayMyOrderPosts(myOrders) {
    const container = document.getElementById('my-orders-container');
    if (!container) {
        console.error('My orders container not found');
        return;
    }

    container.innerHTML = ''; // Clear existing content
    const template = document.getElementById('order-card-template');
    if (!template) {
        console.error('Order card template not found');
        return;
    }

    myOrders.forEach(order => {
        const orderCard = template.content.cloneNode(true);

        const PopulateOrderCard = (element, selector, content) => {
            const el = element.querySelector(selector);
            if (el) {
                el.textContent = content;
            } else {
                console.warn(`Element with selector "${selector}" not found in order card`);
            }
        };

        try {
            PopulateOrderCard(orderCard, '.card-title', order.title || 'No Title');
            PopulateOrderCard(orderCard, '.card-subtitle', order.location || 'No Location');
            PopulateOrderCard(orderCard, '.order-meta', `상태: ${order.status === 'open' ? '지원가능' : '마감'} • 지원자 ${order.applicants_count || 0}명 • 등록일: ${GetTimeAgo(order.created_at)}`);

            const viewDetailsBtn = orderCard.querySelector('.view-details');
            if (viewDetailsBtn) {
                viewDetailsBtn.addEventListener('click', () => ShowMyOrderDetails(order));
            }

            const editOrderBtn = orderCard.querySelector('.btn-edit-order');
            if (editOrderBtn) {
                editOrderBtn.addEventListener('click', () => EditOrder(order.order_id));
            }

            const deleteOrderBtn = orderCard.querySelector('.btn-delete-order');
            if (deleteOrderBtn) {
                deleteOrderBtn.addEventListener('click', () => DeleteOrder(order.order_id));
            }

            // Add a data attribute to the order card for easy removal after deletion
            const orderCardElement = orderCard.querySelector('.order-card');
            if (orderCardElement) {
                orderCardElement.setAttribute('data-order-id', order.order_id);
            }


            container.appendChild(orderCard);
        } catch (error) {
            console.error('Error populating order card:', error);
        }
    });
}

function ShowMyOrderDetails(order) {
    currentOrderId = order.order_id;
    const modalTitle = document.getElementById('orderDetailsModalLabel');
    const modalBody = document.getElementById('orderDetailsModalBody');

    if (!modalTitle || !modalBody) {
        console.error('Modal elements not found');
        return;
    }

    modalTitle.textContent = order.title || 'Order Details';

    modalBody.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <h6 class="fw-bold mb-3">오더 정보</h6>
                <p><strong>위치:</strong> ${order.location || 'No Location'}</p>
                <p><strong>상태:</strong> <span class="badge ${order.status === 'open' ? 'bg-success' : 'bg-danger'}">${order.status === 'open' ? '지원가능' : '마감'}</span></p>
                <p><strong>수수료:</strong> ${order.fee === -1 ? '수수료 조정 가능' : `${Number(order.fee || 0).toLocaleString()}%`}</p>
                <p><strong>지원자:</strong> ${order.applicants_count || 0}명</p>
                <p><strong>등록일:</strong> ${GetTimeAgo(order.created_at)}</p>
            </div>
        </div>
        <hr>
        <h6 class="fw-bold mb-3">오더 내용</h6>
        <p>${order.description || '상세 설명 없음'}</p>
    `;

    const editBtn = document.getElementById('btn-edit-order');
    if (editBtn) {
        editBtn.onclick = () => EditOrder(order.order_id);
    }

    const viewApplicationsBtn = document.getElementById('btn-view-applications');
    if (viewApplicationsBtn) {
        viewApplicationsBtn.onclick = () => FetchAndDisplayApplications(order.order_id);
    }

    const modal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
    modal.show();
}

function EditOrder(orderId) {
    // Placeholder function for editing an order
    console.log(`Editing order with ID: ${orderId}`);
    alert('오더 수정 기능은 아직 구현되지 않았습니다.');
}

async function DeleteOrder(orderId) {
    if (!confirm('정말로 이 오더를 삭제하시겠습니까?')) {
        return;
    }

    ShowLoading();
    try {
        const response = await MakeAuthenticatedRequest('https://69qcfumvgb.execute-api.ap-southeast-2.amazonaws.com/DeleteOrder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ order_id: orderId })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete order');
        }

        // Remove the deleted order from the UI
        const orderElement = document.querySelector(`[data-order-id="${orderId}"]`);
        if (orderElement) {
            orderElement.remove();
        }

        ShowErrorMessage('오더가 정상적으로 삭제됐습니다.', 3000);
    } catch (error) {
        console.error('Error deleting order:', error);
        ShowErrorMessage(error.message || '오더 삭제 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
        HideLoading();
    }
}








// Application Handling
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function OpenApplicationForm() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        alert('로그인이 필요합니다.');
        return;
    }

    try {
        ShowLoading(); // Show loading indicator

        // Fetch user profile
        const profile = await FetchUserProfile();

        // Populate form with user data and make fields read-only
        document.getElementById('applicantName').value = profile.nickname || '';
        document.getElementById('contactNumber').value = profile.phone || '';
        document.getElementById('location').value = `${profile.region || ''} ${profile.city || ''}`.trim() || '정보 없음';

        // Clear and initialize other fields
        document.getElementById('yearsOfExperience').value = '';
        document.getElementById('estimatedCompletion').value = '';
        document.getElementById('introduction').value = '';
        document.getElementById('resources').value = '';
        document.getElementById('questions').value = '';

        // Initialize availability container
        const availabilityContainer = document.getElementById('availabilityContainer');
        availabilityContainer.innerHTML = '';
        AddAvailabilitySlot();

        // Close order details modal
        const orderDetailsModal = bootstrap.Modal.getInstance(document.getElementById('orderDetailsModal'));
        if (orderDetailsModal) {
            orderDetailsModal.hide();
        }

        // Show application form modal
        const applicationFormModal = new bootstrap.Modal(document.getElementById('applicationFormModal'));
        applicationFormModal.show();

        // Add event listener for submit button
        const submitApplicationBtn = document.getElementById('submitApplicationBtn');
        if (submitApplicationBtn) {
            submitApplicationBtn.onclick = SubmitApplication;
        }

        // Add event listener for add availability button
        const addAvailabilityBtn = document.getElementById('addAvailabilityBtn');
        if (addAvailabilityBtn) {
            addAvailabilityBtn.onclick = AddAvailabilitySlot;
        }
    } catch (error) {
        console.error('Error opening application form:', error);
        alert('지원 양식을 열 수 없습니다. 다시 시도해 주세요.');
    } finally {
        HideLoading(); // Hide loading indicator
    }
}

async function SubmitApplication() {
    if (!await CheckProfileCompleteness()) {
        ShowErrorMessage('오더를 등록하려면 프로필을 완성해야 합니다.');
        await FillTheBody('my-profile');
        ShowIncompleteProfileWarning();
        return;
    }

    if (!ValidateAvailability()) {
        return; // Stop submission if validation fails
    }

    const availabilitySlots = document.querySelectorAll('.availability-slot');
    const availability = Array.from(availabilitySlots).map(slot => {
        const date = slot.querySelector('.availability-date').value;
        const time = slot.querySelector('.availability-time').value;
        return { date, time };
    });

    const applicationData = {
        order_id: currentOrderId,
        applicant_id: JSON.parse(localStorage.getItem('user')).user_id,
        years_of_experience: parseInt(document.getElementById('yearsOfExperience').value),
        availability: availability,
        estimated_completion: parseInt(document.getElementById('estimatedCompletion').value) || 1,
        introduction: document.getElementById('introduction').value,
        resources: document.getElementById('resources').value,
        questions: document.getElementById('questions').value
    };

    try {
        ShowLoading(); // Show loading indicator

        const response = await MakeAuthenticatedRequest('https://69qcfumvgb.execute-api.ap-southeast-2.amazonaws.com/SubmitApplication', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(applicationData)
        });

        const result = await response.json();

        if (response.ok) {
            alert('지원이 성공적으로 제출되었습니다.');
            CloseAllModals();
            await FetchAndDisplayOrderPosts(currentPage);
        } else if (response.status === 400 && result.message === 'You have already applied to this order.') {
            alert('이미 이 오더에 지원하셨습니다.');
            CloseAllModals();
        } else {
            throw new Error(result.error || result.message || '지원 제출에 실패했습니다.');
        }
    } catch (error) {
        console.error('Error submitting application:', error);
        alert('지원 제출 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
        HideLoading(); // Hide loading indicator
    }
}

function AddAvailabilitySlot() {
    const container = document.getElementById('availabilityContainer');
    const slotIndex = container.children.length;
    const slotHtml = `
        <div class="availability-slot mb-2">
            <div class="row">
                <div class="col-md-4 mb-2">
                    <input type="date" class="form-control availability-date" required>
                </div>
                <div class="col-md-6 mb-2">
                    <select class="form-select availability-time" required>
                        <option value="">시간대 선택</option>
                        <option value="morning">오전</option>
                        <option value="afternoon">오후</option>
                        <option value="evening">저녁</option>
                    </select>
                </div>
                <div class="col-md-2 mb-2">
                    <button type="button" class="btn btn-danger btn-sm remove-slot" ${slotIndex === 0 ? 'style="display:none;"' : ''}>삭제</button>
                </div>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', slotHtml);

    // Add event listener for remove button
    const removeBtn = container.lastElementChild.querySelector('.remove-slot');
    removeBtn.onclick = function() {
        if (container.children.length > 1) {
            this.closest('.availability-slot').remove();
        }
        // Show all remove buttons if there's more than one slot
        if (container.children.length === 1) {
            container.querySelector('.remove-slot').style.display = 'none';
        }
    };
}

function ValidateAvailability() {
    const availabilityContainer = document.getElementById('availabilityContainer');
    const availabilitySlots = availabilityContainer.querySelectorAll('.availability-slot');
    const errorElement = document.getElementById('availabilityError');

    if (availabilitySlots.length === 0) {
        errorElement.textContent = '최소 하나의 작업 가능 일정을 추가해주세요.';
        errorElement.style.display = 'block';
        return false;
    }

    let isValid = true;
    availabilitySlots.forEach((slot, index) => {
        const dateInput = slot.querySelector('.availability-date');
        const timeInput = slot.querySelector('.availability-time');

        if (!dateInput.value || !timeInput.value) {
            isValid = false;
            errorElement.textContent = `${index + 1}번째 일정의 날짜와 시간을 모두 선택해주세요.`;
            errorElement.style.display = 'block';
        }
    });

    if (isValid) {
        errorElement.style.display = 'none';
    }

    return isValid;
}

async function FetchAndDisplayApplications(orderId) {
    if (!orderId) {
        console.error('Invalid order ID');
        ShowErrorMessage('유효하지 않은 주문 ID입니다.');
        return;
    }

    ShowLoading();
    try {
        const response = await MakeAuthenticatedRequest('https://69qcfumvgb.execute-api.ap-southeast-2.amazonaws.com/GetOrderApplications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ order_id: orderId })
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch order applications: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        console.log('API Response:', result);

        if (!result.applications || !Array.isArray(result.applications)) {
            throw new Error('Invalid response format: applications array not found');
        }

        // Fetch the current order status
        const orderStatus = await FetchOrderStatus(orderId);

        DisplayApplicationList(result.applications, orderStatus);

        // Show the applications modal
        const applicationListModal = new bootstrap.Modal(document.getElementById('applicationListModal'));
        applicationListModal.show();
    } catch (error) {
        console.error('Error fetching order applications:', error);
        ShowErrorMessage('지원서를 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
        HideLoading();
    }
}

async function FetchOrderStatus(orderId) {
    try {
        const response = await MakeAuthenticatedRequest('https://69qcfumvgb.execute-api.ap-southeast-2.amazonaws.com/GetOrderStatus', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ order_id: orderId })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch order status');
        }

        const result = await response.json();
        return result.status;
    } catch (error) {
        console.error('Error fetching order status:', error);
        return 'unknown';
    }
}

function DisplayApplicationList(applications, orderStatus) {
    const container = document.getElementById('applicationListContainer');
    container.innerHTML = '';
    
    if (applications.length === 0) {
        container.innerHTML = '<p>아직 지원서가 없습니다.</p>';
        return;
    }
    
    const isOrderClosed = orderStatus === 'closed';

    applications.forEach(application => {
        const applicationElement = document.createElement('div');
        applicationElement.className = 'application-item mb-3 p-3 border rounded';
        applicationElement.setAttribute('data-application-id', application.application_id);
        applicationElement.innerHTML = `
            <h5>${application.applicant_name || '이름 없음'}</h5>
            <p>경력: ${application.years_of_experience} 년</p>
            <p>예상 완료 시간: ${application.estimated_completion} 시간</p>
            <p>상태: <span class="badge ${application.status === 'rejected' ? 'bg-danger' : 'bg-secondary'} application-status">${application.status === 'rejected' ? '거절됨' : '대기중'}</span></p>
            <button class="btn btn-primary btn-sm view-application">상세 보기</button>
            <button class="btn btn-success btn-sm accept-application" ${isOrderClosed || application.status === 'rejected' ? 'disabled' : ''}>수락</button>
            <button class="btn btn-danger btn-sm reject-application" ${isOrderClosed || application.status === 'rejected' ? 'disabled' : ''}>거절</button>
        `;
        container.appendChild(applicationElement);

        // Add event listeners
        applicationElement.querySelector('.view-application').addEventListener('click', () => ShowApplicationDetails(application));
        if (!isOrderClosed && application.status !== 'rejected') {
            applicationElement.querySelector('.accept-application').addEventListener('click', () => AcceptApplication(application.application_id));
            applicationElement.querySelector('.reject-application').addEventListener('click', () => RejectApplication(application.application_id));
        }
    });

    // Add event listener for "Reject All" button
    const rejectAllBtn = document.getElementById('rejectAllBtn');
    if (rejectAllBtn) {
        rejectAllBtn.disabled = isOrderClosed || applications.every(app => app.status === 'rejected');
        if (!isOrderClosed) {
            rejectAllBtn.addEventListener('click', RejectAllApplications);
        }
    }
}

function ShowApplicationDetails(application) {
    // console.log('Showing details for application:', application);
    
    const timeTranslations = {
        'morning': '오전',
        'afternoon': '오후',
        'evening': '저녁'
    };

    const modalBody = document.getElementById('applicationDetailsModalBody');
    if (!modalBody) {
        console.error('Application details modal body not found');
        ShowErrorMessage('지원서 세부 정보를 표시할 컨테이너를 찾을 수 없습니다.');
        return;
    }

    const availabilityHtml = application.availability.map(slot => {
        const translatedTime = timeTranslations[slot.time] || slot.time; // Translate or use the original if not found
        return `<li>${slot.date} ${translatedTime}</li>`;
    }).join('');

    modalBody.innerHTML = `
        <h5>지원자: ${application.applicant_name}</h5>
        <p><strong>경력:</strong> ${application.years_of_experience}년</p>
        <p><strong>예상 완료 시간:</strong> ${application.estimated_completion}시간</p>
        <p><strong>소개:</strong> ${application.introduction}</p>
        <p><strong>보유 장비:</strong> ${application.resources}</p>
        <p><strong>질문:</strong> ${application.questions}</p>
        <h6>가능한 시간:</h6>
        <ul>
            ${availabilityHtml}
        </ul>
    `;
    // console.log('Application details modal body:', modalBody);

    const applicationDetailsModal = new bootstrap.Modal(document.getElementById('applicationDetailsModal'));
    // console.log('Showing application details modal');
    applicationDetailsModal.show();

    // Hide the application list modal
    const applicationListModal = bootstrap.Modal.getInstance(document.getElementById('applicationListModal'));
    // console.log('Hiding application list modal');
    if (applicationListModal) {
        applicationListModal.hide();
    } else {
        console.warn('Application list modal instance not found');
    }
}

async function AcceptApplication(applicationId) {
    if (!confirm('이 지원서를 수락하시겠습니까? 다른 모든 지원서는 자동으로 거절됩니다.')) {
        return;
    }

    ShowLoading();
    try {
        const response = await MakeAuthenticatedRequest('https://69qcfumvgb.execute-api.ap-southeast-2.amazonaws.com/AcceptApplication', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                order_id: currentOrderId,
                application_id: applicationId
            })
        });

        if (!response.ok) {
            throw new Error('Failed to accept application');
        }

        ShowErrorMessage('지원서가 성공적으로 수락되었습니다.', 3000);
        
        // Disable all action buttons in the application list
        DisableApplicationActions();
        
        // Close the application list modal
        const applicationListModal = bootstrap.Modal.getInstance(document.getElementById('applicationListModal'));
        if (applicationListModal) {
            applicationListModal.hide();
        }

        // Refresh the my orders list
        await FetchAndDisplayMyOrderPosts(currentPage);
    } catch (error) {
        console.error('Error accepting application:', error);
        ShowErrorMessage('지원서 수락 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
        HideLoading();
    }
}

async function RejectApplication(applicationId) {
    if (!confirm('이 지원서를 거절하시겠습니까?')) {
        return;
    }

    ShowLoading();
    try {
        const response = await MakeAuthenticatedRequest('https://69qcfumvgb.execute-api.ap-southeast-2.amazonaws.com/RejectApplication', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                order_id: currentOrderId,
                application_id: applicationId
            })
        });

        if (!response.ok) {
            throw new Error('Failed to reject application');
        }

        ShowErrorMessage('지원서가 성공적으로 거절되었습니다.', 3000);
        
        // Update the UI to reflect the rejected application
        UpdateApplicationStatus(applicationId, 'rejected');
        
        // Close all modals
        CloseAllModals();
        
        try {
            // Refresh the applications list
            await FetchAndDisplayApplications(currentOrderId);
        } catch (error) {
            console.error('Error refreshing applications:', error);
            ShowErrorMessage('지원서 목록을 새로고치는 중 오류가 발생했습니다.');
        }
    } catch (error) {
        console.error('Error rejecting application:', error);
        ShowErrorMessage('지원서 거절 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
        HideLoading();
    }
}

async function RejectAllApplications() {
    ShowErrorMessage('일괄 거절 기능은 아직 구현되지 않았습니다.');
    // if (!confirm('모든 지원서를 거절하시겠습니까?')) {
    //     return;
    // }

    // ShowLoading();
    // try {
    //     const response = await MakeAuthenticatedRequest('https://69qcfumvgb.execute-api.ap-southeast-2.amazonaws.com/RejectAllApplications', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({
    //             order_id: currentOrderId
    //         })
    //     });

    //     if (!response.ok) {
    //         throw new Error('Failed to reject all applications');
    //     }

    //     ShowErrorMessage('모든 지원서가 성공적으로 거절되었습니다.', 3000);
        
    //     // Refresh the applications list
    //     await FetchAndDisplayApplications(currentOrderId);
    // } catch (error) {
    //     console.error('Error rejecting all applications:', error);
    //     ShowErrorMessage('지원서 일괄 거절 중 오류가 발생했습니다. 다시 시도해주세요.');
    // } finally {
    //     HideLoading();
    // }
}

function DisableApplicationActions() {
    const container = document.getElementById('applicationListContainer');
    const actionButtons = container.querySelectorAll('.accept-application, .reject-application');
    actionButtons.forEach(button => {
        button.disabled = true;
    });
    
    const rejectAllBtn = document.getElementById('rejectAllBtn');
    if (rejectAllBtn) {
        rejectAllBtn.disabled = true;
    }
}

function UpdateApplicationStatus(applicationId, status) {
    const applicationElement = document.querySelector(`[data-application-id="${applicationId}"]`);
    if (applicationElement) {
        const statusBadge = applicationElement.querySelector('.application-status');
        if (statusBadge) {
            statusBadge.textContent = status === 'rejected' ? '거절됨' : '대기중';
            statusBadge.className = `badge ${status === 'rejected' ? 'bg-danger' : 'bg-secondary'} application-status`;
        }
        
        const acceptButton = applicationElement.querySelector('.accept-application');
        const rejectButton = applicationElement.querySelector('.reject-application');
        if (acceptButton) acceptButton.disabled = status === 'rejected';
        if (rejectButton) rejectButton.disabled = status === 'rejected';
    }
}

















// Utility Functions
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
function ShowLoading() {
    isLoading = true;
    document.body.appendChild(loadingIndicator);
}

function HideLoading() {
    isLoading = false;
    if (document.body.contains(loadingIndicator)) {
        document.body.removeChild(loadingIndicator);
    }
}

function ShowErrorMessage(message, duration = 5000) {
    // Create error message container
    const errorContainer = document.createElement('div');
    errorContainer.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #ff6b6b;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        transition: opacity 0.5s ease-in-out;
    `;

    // Create message text
    const messageText = document.createElement('p');
    messageText.style.margin = '0';
    messageText.textContent = message;

    // Append message to container
    errorContainer.appendChild(messageText);

    // Append container to body
    document.body.appendChild(errorContainer);

    // Set a timeout to remove the error message
    setTimeout(() => {
        errorContainer.style.opacity = '0';
        setTimeout(() => {
            if (document.body.contains(errorContainer)) {
                document.body.removeChild(errorContainer);
            }
        }, 500);
    }, duration);
}

function GetTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = diffTime / (1000 * 60 * 60 * 24); // Calculate the difference in days

    if (diffDays < 1) {
        return "오늘"; // Return "오늘" if the difference is less than 1 day
    } else if (diffDays >= 1 && diffDays < 2) {
        return "어제"; // Return "어제" if the difference is between 1 and 2 days
    } else {
        return `${Math.ceil(diffDays)}일 전`; // Return the difference in days if 2 or more days
    }
}

function PopulateRegions() {
    const regionSelect = document.getElementById('region');
    regions.forEach(region => {
        const option = document.createElement('option');
        option.value = region.id;
        option.textContent = region.name;
        regionSelect.appendChild(option);
    });
}

function PopulateCities(regionId) {
    const citySelect = document.getElementById('city');
    citySelect.innerHTML = '<option value="">도시 선택</option>';
    
    if (regionId == 9) {  // Sejong
        const option = document.createElement('option');
        option.value = '세종시';
        option.textContent = '세종시';
        citySelect.appendChild(option);
        citySelect.disabled = true;  // Disable selection as there's only one option
    } else {
        cities[regionId].forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });
        citySelect.disabled = false;  // Enable selection for other regions
    }
}

function CloseAllModals() {
    // Close all modals
    const modals = ['applicationFormModal', 'orderDetailsModal', 'applicationListModal', 'applicationDetailsModal'];
    modals.forEach(modalId => {
        const modalElement = document.getElementById(modalId);
        if (modalElement) {
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) {
                modalInstance.hide();
            }
        }
    });

    // Remove modal backdrops
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());

    // Reset body
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
}



































// User Login Info button
    // const loginInfoBtn = document.getElementById('user-login-info-btn');
    // if (loginInfoBtn) {
    //     loginInfoBtn.addEventListener('click', async () => {
    //         ShowLoading();
    //         try {
    //             await FillTheBody('user-login-info');
    //         } catch (error) {
    //             console.error('Error loading user login info:', error);
    //             ShowErrorMessage('유저 정보 불러오기에 실패했습니다. 다시 시도해주세요.');
    //         } finally {
    //             HideLoading();
    //         }
    //     });
    // }