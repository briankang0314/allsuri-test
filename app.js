// Imports
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js';
import { getMessaging, getToken } from 'https://www.gstatic.com/firebasejs/9.21.0/firebase-messaging.js';
import SendbirdChat from 'https://cdn.jsdelivr.net/npm/@sendbird/chat@4.14.1/+esm';
import { GroupChannelModule } from 'https://cdn.jsdelivr.net/npm/@sendbird/chat@4.14.1/groupChannel.min.js';
/*
Remember these

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js" integrity="sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakxg55G4" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/flatpickr@4.6.13/dist/flatpickr.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/flatpickr/dist/l10n/ko.js"></script>
*/

// Exppoerted functions
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
export async function Start()
{
    if (window.matchMedia('(display-mode: standalone)').matches) // check if running as PWA
    {
        Kakao.init('8cdce0e36a3774e9d3d2a738f2d5192f');
        console.log("Kakao initialized", Kakao);

        // callback setting for kakao login
        if (window.location.pathname === '/oauth/callback')
        {
            await LoginByKakao();
            
            sb = SendbirdChat.init({appId: '9C4825FA-714B-49B2-B75A-72E9E5632578', modules: [new GroupChannelModule()]});

            console.log("Sendbird initialized", sb);    

            try {await ConnectToSendbird(JSON.parse(localStorage.getItem('user')).user_id);} catch(Error) {return;}
            return;
        }

        // check things to start app
        if (Notification.permission != 'granted') {FillTheBody('notification'); return;}

        if (localStorage.getItem('user') == null || localStorage.getItem('tokens') == null)
        {
            await FillTheBody('login');
            return;
        }
        else
        {
            if (!await CheckProfileCompleteness()) {await FillTheBody('my-profile'); ShowIncompleteProfileWarning(); return;}
        }

        await FillTheBody('home');
    }
    else
    {
        // kakao browser: exit
        if (navigator.userAgent.indexOf('KAKAO') >= 0) {location.href = 'kakaotalk://web/openExternal?url=' + encodeURIComponent(location); return;}

        await FillTheBody('landing');
    }
}

// Global Variables
///////////////////////////////////////////////////////////////////////////////////////////////////////////////




let sb = null;

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

let myApplicationsCurrentFilters = {
    status: ''
};

let myApplicationsCurrentSort = 'created_at';

let isLoading = false;

const loadingIndicatorHTML = `
  <div class="loading-overlay">
    <div class="spinner">
      <div class="double-bounce1"></div>
      <div class="double-bounce2"></div>
    </div>
  </div>
`;

const loadingIndicatorCSS = `
  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  }

  .spinner {
    width: 60px;
    height: 60px;
    position: relative;
  }

  .double-bounce1, .double-bounce2 {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #007bff;
    opacity: 0.6;
    position: absolute;
    top: 0;
    left: 0;
    animation: sk-bounce 2.0s infinite ease-in-out;
  }

  .double-bounce2 {
    animation-delay: -1.0s;
  }

  @keyframes sk-bounce {
    0%, 100% { 
      transform: scale(0.0);
    } 50% { 
      transform: scale(1.0);
    }
  }
`;

let loadingIndicator;

let currentPage = 1;
const postsPerPage = 10;

let currentOrderId = null;

const equipmentGroups = [
    // {
    //     name: '전동 공구',
    //     options: ['전동드릴', '전동드라이버', '전동샌더', '전동톱', '전동대패', '전동그라인더', '전동해머', '전동믹서']
    // },
    {
        name: '누수 장비',
        options: ['청음식탐지기', '가스식탐지기', '디지털압력계', '열화상카메라', '상관식탐지기', '수분측정기']
    },
    {
        name: '하수구 장비',
        options: ['관통기', '배관석션기', '플렉스샤프트', '배관내시경', '관로탐지기', '고압세척기']
    },
    // {
    //     name: '페인팅 장비',
    //     options: ['페인트 스프레이건', '롤러', '붓', '페인트 트레이', '마스킹 테이프', '사포', '스크레이퍼']
    // },
    // {
    //     name: '용접 장비',
    //     options: ['아크 용접기', 'MIG 용접기', 'TIG 용접기', '용접 마스크', '용접봉', '그라인더']
    // },
    // {
    //     name: '공조 장비',
    //     options: ['진공펌프', '게이지 매니폴드', '냉매 회수기', '누설 탐지기', '파이프 벤더', '파이프 커터']
    // },
    // {
    //     name: '전기 장비',
    //     options: ['멀티미터', '클램프 미터', '전압 테스터', '와이어 스트리퍼', '압착기', '전선 릴']
    // },
    // {
    //     name: '타일 작업 장비',
    //     options: ['타일 커터', '그라우트 플로트', '노칭 트로웰', '타일 니퍼', '레벨링 시스템', '타일 스페이서']
    // },
    // {
    //     name: '청소 장비',
    //     options: ['고압 세척기', '스팀 클리너', '진공청소기', '바닥 폴리셔', '카펫 클리너', '에어 컴프레서']
    // },
];

let isSubmitting = false;









// let debugLog = [];
   
// function addDebugLog(message) {
//     debugLog.push(`${new Date().toISOString()}: ${message}`);
//     if (debugLog.length > 100) debugLog.shift(); // Keep only last 100 messages
//     updateDebugDisplay();
// }

// function updateDebugDisplay() {
//     const debugArea = document.getElementById('debug-area');
//     if (debugArea) {
//     debugArea.innerHTML = debugLog.join('<br>');
//     }
// }



// // Add a gesture to show/hide debug area
// let tapCount = 0;
// document.addEventListener('touchend', function(e) {
//     if (e.touches.length === 0) {
//     tapCount++;
//     if (tapCount === 5) {
//         const debugArea = document.getElementById('debug-area');
//         debugArea.style.display = debugArea.style.display === 'none' ? 'block' : 'none';
//         tapCount = 0;
//     }
//     }
// });



// Dynamic Content Loading
///////////////////////////////////////////////////////////////////////////////////////////////////////////////









async function ConnectToSendbird(userId)
{
    try {
        const user = await sb.connect(userId);
        console.log('Successfully connected to Sendbird', user);
        console.log('user id: ', userId);
        return user;
    } catch (error) {
        console.error('Error connecting to Sendbird:', error);
        throw error;
    }
}






async function FillTheBody(contentName, params = {}) {
    try {
        if (contentName === 'my-profile') {
            ShowLoading();

            const profile = await FetchUserProfile();
            if (!profile) {
                throw new Error('Failed to fetch user profile');
            }

            // Now fetch and render the page content
            const content = await fetch(`/contents/${contentName}.html`).then(response => response.text());
            document.body.innerHTML = content;

            // Set up the page with the fetched profile data
            SetupMyProfileEventListeners();
            UpdateProfileUI(profile);

            HideLoading();
        } else {
            // For all other pages, proceed as before
            const content = await fetch(`/contents/${contentName}.html`).then(response => response.text());
            document.body.innerHTML = content;
            console.log(`Content loaded for ${contentName}`);

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
                            const allowButton = document.getElementById('button_notification_allow');
                            allowButton.addEventListener('click', async function () {
                                try {
                                    const permission = await Notification.requestPermission();
                                    if (permission === 'granted') {
                                        console.log('Notification permission granted');
                                        allowButton.style.display = 'none';
                                        document.getElementById('device_token').style.display = 'block';

                                        await SaveDeviceToken();
                                        setTimeout(() => {
                                            ShowSuccessMessage('알림 설정이 완료되었습니다. 로그인 해주세요.');
                                            FillTheBody('login');  // Navigate to login page instead of home
                                        }, 2000);
                                    } else {
                                        console.log('Notification permission denied');
                                        document.getElementById('default').style.display = 'none';
                                        document.getElementById('denied').style.display = 'block';
                                    }
                                } catch (error) {
                                    console.error('Error requesting notification permission:', error);
                                    ShowErrorMessage('알림 권한 요청 중 오류가 발생했습니다. 다시 시도해주세요.');
                                }
                            });
                            break;
                        case 'denied':
                            document.getElementById('denied').style.display = 'block';
                            const retryButton = document.getElementById('retry-button');
                            if (retryButton) {
                                retryButton.addEventListener('click', () => {
                                    window.location.reload();
                                });
                            }
                            break;
                        case 'granted':
                            console.log('Notification permission already granted');
                            ShowSuccessMessage('알림 권한이 이미 허용되어 있습니다.');
                            setTimeout(() => {
                                FillTheBody('home');
                            }, 1500);
                            break;
                    }
                    break;
                case 'login':
                    const logoLink = document.getElementById('logo-link');
                    if (logoLink) {
                        logoLink.addEventListener('click', (e) => {
                            e.preventDefault();
                            FillTheBody('home');
                        });
                    }

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
                // case 'user-login-info':
                //     SetupUserLoginInfoPage();
                //     break;
            }
        }
    } catch (error) {
        console.error(`Error loading ${contentName}:`, error);
        ShowErrorMessage(`${contentName} 페이지 로딩 중 오류가 발생했습니다. 다시 시도해주세요.`);
        HideLoading();
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
    // Logo
    const logoLink = document.getElementById('logo-link');
    if (logoLink) {
        logoLink.addEventListener('click', (e) => {
            e.preventDefault();
            FillTheBody('home');
        });
    }

    // Chat button
    const chatBtn = document.getElementById('chat-btn');    
    if (chatBtn) {
        chatBtn.addEventListener('click', () => FillTheBody('chat'));
    }

    // Post Order button
    const postOrderBtn = document.getElementById('post-order-btn');
    if (postOrderBtn) {
        postOrderBtn.addEventListener('click', async () => {
            
            try {
                await FillTheBody('post-order');
            } catch (error) {
                console.error('Error loading post order page:', error);
                ShowErrorMessage('오더 등록 중에 오류가 발생했습니다. 다시 시도해주세요.');
            } finally {
                
            }
        });
    }

    // Settings button
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

    // Refresh button
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', RefreshOrderPosts);
    }

    // Pagination
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
                action: 'get_orders',
                filters: currentFilters,
                sort: currentSort || 'created_at'
            })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch order posts');
        }
        const result = await response.json();
        const orderPosts = result.orders;
        console.log('Fetched order posts:', orderPosts);
        const totalPages = result.totalPages || 1;

        DisplayOrderPosts(orderPosts);
        UpdatePagination(page, totalPages);
    } catch (error) {
        console.error('Error fetching order posts:', error);
        ShowErrorMessage('오더를 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
        HideLoading();
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

            const cardElement = orderCard.querySelector('.order-card');
            if (cardElement) {
                cardElement.addEventListener('click', () => ShowOrderDetails(order, currentUser));
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
        applyForOrderBtn.onclick = async () => {
            const modal = bootstrap.Modal.getInstance(document.getElementById('orderDetailsModal'));
            modal.hide();
            InitializeApplicationForm(order.order_id);
            await FillTheBody('apply-for-order');
        };
    }

    const modal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
    modal.show();
}

function OpenChatInterface() {
    // Implement this function to open your chat UI
    // This might involve fetching chat data from Sendbird,
    // rendering a chat component, etc.
    console.log('Opening chat interface');
    // TODO: Implement chat opening logic
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
    
    try {
        await FetchAndDisplayOrderPosts(1); // Fetch the first page of posts
        ShowSuccessMessage('오더 목록이 새로고침되었습니다.', 3000);
    } catch (error) {
        console.error('Error refreshing order posts:', error);
        ShowErrorMessage('오더 목록 새로고침 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
        
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
    try {
        switch (href) {
            case '#profile':
                FillTheBody('my-profile');
                break;
            case '#my-orders':
                FillTheBody('my-orders');
                break;
            case '#my-applications':
                FillTheBody('my-applications');  // New case for My Applications
                break;
            case '#logout':
                Logout();
                break;
        }
    } catch (error) {
        console.error('Error handling dropdown item click:', error);
        ShowErrorMessage('오류가 발생했습니다. 다시 시도해주세요.');
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

function getStoredAccessToken() {
    const tokens = JSON.parse(localStorage.getItem('tokens'));
    return tokens && tokens.access_token ? tokens.access_token : null;
}

async function Logout() {
    console.log('Logout function initiated');

    const accessToken = getStoredAccessToken();
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









// Chat Page
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function SetupChatPage() {
  // 1. Initialize chat components
  initializeChatComponents();

  // 2. Set up channel list
  const channelCollection = setupChannelList();

  // 3. Set up message list (initially empty)
  const messageCollection = setupMessageList();

  // 4. Set up message input
  setupMessageInput();

  // 5. Set up real-time event handlers
  setupEventHandlers(channelCollection, messageCollection);

  // 6. Set up user presence and profiles
  setupUserPresence();

  // 7. Set up search functionality
  setupSearch();

  // 8. Set up error handling and connection status display
  setupErrorHandlingAndConnectionStatus();

  // 9. Apply responsive design (CSS)
  applyResponsiveDesign();
}

function initializeChatComponents() {
  // Create DOM elements for channel list, message list, and message input
}

function setupChannelList() {
  // Use GroupChannelCollection to fetch and display channels
  // Implement pagination
  // Display unread counts and last message
}

function setupMessageList() {
  // Create MessageCollection (initially empty)
  // Implement infinite scrolling
  // Display messages with sender info and timestamp
}

function setupMessageInput() {
  // Create message input form
  // Implement send message functionality
  // Add file/image upload capability
}

function setupEventHandlers(channelCollection, messageCollection) {
  // Set up channel and message event handlers
  // Update UI in real-time
}

function setupUserPresence() {
  // Fetch and display user online status
  // Show user avatars and basic profile info
}

function setupSearch() {
  // Implement message and channel search
}

function setupErrorHandlingAndConnectionStatus() {
  // Display connection status
  // Show error messages
}

function applyResponsiveDesign() {
  // Apply CSS for responsive layout
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
    const logoLink = document.getElementById('logo-link');
    if (logoLink) {
        logoLink.addEventListener('click', (e) => {
            e.preventDefault();
            FillTheBody('home');
        });
    }

    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => FillTheBody('home'));
    }

    const editProfileBtn = document.getElementById('edit-profile-btn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => FillTheBody('edit-profile'));
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

function ShowIncompleteProfileWarning() {
    const warningElement = document.getElementById('incomplete-profile-warning');
    if (warningElement) {
        warningElement.style.display = 'block';
    }

    const completeProfileBtn = document.getElementById('complete-profile-btn');
    if (completeProfileBtn) {
        completeProfileBtn.addEventListener('click', () => FillTheBody('edit-profile'));
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







// Edit Profile Page
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function SetupEditProfilePage() {
    ShowLoading();
    try {
        console.log("Starting SetupEditProfilePage");

        const logoLink = document.getElementById('logo-link');
        if (logoLink) {
            logoLink.addEventListener('click', (e) => {
                e.preventDefault();
                FillTheBody('home');
            });
        }

        const backBtn = document.getElementById('back-btn');
        console.log("Back button found:", !!backBtn);
        if (backBtn) {
            backBtn.addEventListener('click', () => FillTheBody('my-profile'));
        }

        const saveProfileChangesBtn = document.getElementById('btn-save-profile');
        console.log("Save button found:", !!saveProfileChangesBtn);
        if (saveProfileChangesBtn) {
            saveProfileChangesBtn.addEventListener('click', SaveProfileChanges);
        }

        const phoneInput = document.getElementById('editPhone');
        console.log("Phone input found:", !!phoneInput);
        if (phoneInput) {
            phoneInput.addEventListener('input', function (e) {
                let x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,4})(\d{0,4})/);
                e.target.value = !x[2] ? x[1] : x[1] + '-' + x[2] + (x[3] ? '-' + x[3] : '');
            });
        }

        console.log("Fetching user profile");
        const profile = await FetchUserProfile();
        console.log("Profile fetched:", !!profile);

        if (profile) {
            console.log("Populating edit profile form");
            PopulateEditProfileForm(profile);
        } else {
            console.log("Profile fetch failed");
            ShowErrorMessage('프로필 정보를 불러오는데 실패했습니다.');
        }
    } catch (error) {
        console.error("Error in SetupEditProfilePage:", error);
        ShowErrorMessage('edit-profile 페이지 로딩 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
        HideLoading();
    }
}

function PopulateEditProfileForm(profile) {
    document.getElementById('editNickname').value = profile.nickname ?? '';
    document.getElementById('editPhone').value = profile.phone ?? '';

    PopulateRegions();
    const regionSelect = document.getElementById('region');
    regionSelect.value = regions.find(r => r.name === profile.region)?.id ?? '';
    regionSelect.addEventListener('change', (e) => { PopulateCities(e.target.value); });

    PopulateCities(regionSelect.value);
    document.getElementById('city').value = profile.city ?? '';

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
}

async function SaveProfileChanges() {
    const updatedProfile = {
        nickname: document.getElementById('editNickname').value,
        phone: document.getElementById('editPhone').value,
        region: regions.find(r => r.id == document.getElementById('region').value)?.name,
        city: document.getElementById('region').value == 9 ? '세종시' : document.getElementById('city').value,
        preferred_categories: Array.from(document.querySelectorAll('#categoryCheckboxes input:checked')).map(input => input.value)
    };
    
    console.log('Updated profile:', updatedProfile);

    try {
        console.log('Updating profile...');
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
        console.log('Profile update result:', result);

        if (result.success) {
            ShowSuccessMessage('프로필이 성공적으로 업데이트되었습니다.', 3000);

            let user = JSON.parse(localStorage.getItem('user'));
            user = { ...user, ...updatedProfile };
            localStorage.setItem('user', JSON.stringify(user));

            if (await CheckProfileCompleteness()) {
                console.log('Profile is complete');
                await FillTheBody('my-profile');
            } else {
                console.log('Profile is incomplete');
                await FillTheBody('my-profile');
            }
        } else {
            throw new Error(result.message || '프로필 업데이트에 실패했습니다.');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        ShowErrorMessage('프로필 업데이트에 실패했습니다. 다시 시도해 주세요.');
    }
}

async function CheckProfileCompleteness() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return false;

    const requiredFields = ['phone', 'region', 'city', 'preferred_categories'];
    return requiredFields.every(field => user[field] && user[field].length > 0);
}








// My Orders Page
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
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

async function SetupMyOrdersPage() {
    const logoLink = document.getElementById('logo-link');
    if (logoLink) {
        logoLink.addEventListener('click', (e) => {
            e.preventDefault();
            FillTheBody('home');
        });
    }

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
            PopulateOrderCard(orderCard, '.order-meta', `지원자 ${order.applicants_count || 0}명 • 등록일: ${GetTimeAgo(order.created_at)}`);
            PopulateOrderCard(orderCard, '.order-fee', `${order.fee === -1 ? '수수료 조정 가능' : `${Number(order.fee || 0).toLocaleString()}%`}`);

            const statusBadge = orderCard.querySelector('.order-status');
            if (statusBadge) {
                statusBadge.textContent = order.status === 'open' ? '지원가능' : '마감';
                statusBadge.classList.add(order.status === 'open' ? 'bg-success' : 'bg-danger');
            }

            const cardElement = orderCard.querySelector('.order-card');
            if (cardElement) {
                cardElement.addEventListener('click', (e) => {
                    // Prevent click event when clicking on buttons
                    if (!e.target.closest('.btn-edit-order') && !e.target.closest('.btn-delete-order')) {
                        ShowMyOrderDetails(order);
                    }
                });
            }

            const editOrderBtn = orderCard.querySelector('.btn-edit-order');
            if (editOrderBtn) {
                editOrderBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent card click event
                    EditOrder(order.order_id);
                });
            }

            const deleteOrderBtn = orderCard.querySelector('.btn-delete-order');
            if (deleteOrderBtn) {
                deleteOrderBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent card click event
                    DeleteOrder(order.order_id);
                });
            }

            // Add a data attribute to the order card for easy removal after deletion
            if (cardElement) {
                cardElement.setAttribute('data-order-id', order.order_id);
            }


            container.appendChild(orderCard);
        } catch (error) {
            console.error('Error populating order card:', error);
        }
    });
}

async function RefreshMyOrderPosts() {
    
    try {
        await FetchAndDisplayMyOrderPosts(1); // Fetch the first page of my posts
        ShowSuccessMessage('내 오더 목록이 새로고침되었습니다.', 3000);
    } catch (error) {
        console.error('Error refreshing my order posts:', error);
        ShowErrorMessage('내 오더 목록 새로고침 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
        
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

function ShowMyOrderDetails(order) {
    console.log('ShowMyOrderDetails called with order:', order);
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
        console.log('Setting up viewApplicationsBtn click handler');
        viewApplicationsBtn.onclick = () => {
            console.log('viewApplicationsBtn clicked');
            // Close the current modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('orderDetailsModal'));
            if (modal) {
                console.log('Closing orderDetailsModal');
                modal.hide();
            } else {
                console.error('orderDetailsModal instance not found');
            }
            // Navigate to the new applications page
            console.log('Attempting to navigate to order-applications page');
            FillTheBody('order-applications', { order: order });
        };
    } else {
        console.error('viewApplicationsBtn not found');
    }

    const modal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
    modal.show();
    console.log('orderDetailsModal shown');
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

        ShowSuccessMessage('오더가 정상적으로 삭제됐습니다.', 3000);
    } catch (error) {
        console.error('Error deleting order:', error);
        ShowErrorMessage(error.message || '오더 삭제 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
        
    }
}











// My Applications Page
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function SetupMyApplicationsPage() {
    console.log('Setting up my applications page');

    const logoLink = document.getElementById('logo-link');
    if (logoLink) {
        logoLink.addEventListener('click', (e) => {
            e.preventDefault();
            FillTheBody('home');
        });
    }

    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => FillTheBody('home'));
    }

    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', RefreshMyApplications);
    }

    SetupMyApplicationsFilterAndSort();
    await FetchAndDisplayMyApplications(1);

    const paginationContainer = document.getElementById('pagination-container');
    if (paginationContainer) {
        paginationContainer.addEventListener('click', async (e) => {
            if (e.target.tagName === 'A' && e.target.getAttribute('data-page')) {
                e.preventDefault();
                const page = parseInt(e.target.getAttribute('data-page'));
                await FetchAndDisplayMyApplications(page);
            }
        });
    }

    console.log('My applications page setup complete');
}

async function FetchAndDisplayMyApplications(page = 1) {
    ShowLoading();
    
    try {
        const response = await MakeAuthenticatedRequest('https://69qcfumvgb.execute-api.ap-southeast-2.amazonaws.com/GetMyApplications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                page,
                limit: postsPerPage,
                filters: myApplicationsCurrentFilters || {},
                sort: myApplicationsCurrentSort || 'created_at'
            })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch my applications');
        }

        const result = await response.json();
        console.log('Fetched my applications:', result.applications);
        if (result.success && Array.isArray(result.applications)) {
            DisplayMyApplications(result.applications);
            UpdatePagination(page, result.totalPages || 1);
        } else {
            throw new Error('Invalid response format');
        }
    } catch (error) {
        console.error('Error fetching my applications:', error);
        ShowErrorMessage('내 지원서를 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
        HideLoading();
    }
}

function DisplayMyApplications(applications) {
    const container = document.getElementById('my-applications-container');
    if (!container) {
        console.error('My applications container not found');
        return;
    }

    container.innerHTML = ''; // Clear existing content
    const template = document.getElementById('application-card-template');
    if (!template) {
        console.error('Application card template not found');
        return;
    }

    applications.forEach(application => {
        const applicationCard = template.content.cloneNode(true);

        const PopulateApplicationCard = (element, selector, content) => {
            const el = element.querySelector(selector);
            if (el) {
                el.textContent = content;
            } else {
                console.warn(`Element with selector "${selector}" not found in application card`);
            }
        };

        try {
            PopulateApplicationCard(applicationCard, '.card-title', application.order_title || 'No Title');
            PopulateApplicationCard(applicationCard, '.application-status', GetStatusText(application.status));
            PopulateApplicationCard(applicationCard, '.application-meta', `지원일: ${GetTimeAgo(application.created_at)}`);
            PopulateApplicationCard(applicationCard, '.estimated-completion', `예상 완료 시간: ${application.estimated_completion}`);

            const statusBadge = applicationCard.querySelector('.application-status');
            if (statusBadge) {
                statusBadge.classList.add(GetStatusClass(application.status));
            }

            const viewBtn = applicationCard.querySelector('.view-application');
            if (viewBtn) {
                viewBtn.addEventListener('click', () => ShowMyApplicationDetails(application));
            }

            const withdrawBtn = applicationCard.querySelector('.withdraw-application');
            if (withdrawBtn) {
                if (application.status === 'pending') {
                    withdrawBtn.style.display = 'inline-block';
                    withdrawBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        WithdrawApplication(application.application_id);
                    });
                } else {
                    withdrawBtn.style.display = 'none';
                }
            }

            container.appendChild(applicationCard);
        } catch (error) {
            console.error('Error populating application card:', error);
        }
    });
}

function SetupMyApplicationsFilterAndSort() {
    const statusFilter = document.getElementById('status-filter');
    const sortOption = document.getElementById('sort-option');

    statusFilter.addEventListener('change', async (e) => {
        myApplicationsCurrentFilters.status = e.target.value;
        await FetchAndDisplayMyApplications(1);
    });

    sortOption.addEventListener('change', async (e) => {
        myApplicationsCurrentSort = e.target.value;
        await FetchAndDisplayMyApplications(1);
    });
}

async function RefreshMyApplications() {
    try {
        await FetchAndDisplayMyApplications(1);
        ShowSuccessMessage('내 지원서 목록이 새로고침되었습니다.', 3000);
    } catch (error) {
        console.error('Error refreshing my applications:', error);
        ShowErrorMessage('내 지원서 목록 새로고침 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
}

async function WithdrawApplication(applicationId) {
    if (!confirm('정말로 이 지원을 철회하시겠습니까?')) {
        return;
    }

    ShowLoading();
    try {
        const response = await MakeAuthenticatedRequest('https://69qcfumvgb.execute-api.ap-southeast-2.amazonaws.com/WithdrawApplication', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ application_id: applicationId })
        });

        if (!response.ok) {
            throw new Error('Failed to withdraw application');
        }

        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error || 'Failed to withdraw application');
        }

        ShowSuccessMessage('지원이 성공적으로 철회되었습니다.', 3000);
        await FetchAndDisplayMyApplications(currentPage);
    } catch (error) {
        console.error('Error withdrawing application:', error);
        ShowErrorMessage('지원 철회 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
        HideLoading();
    }
}

function ShowMyApplicationDetails(application) {
    const modalBody = document.getElementById('applicationDetailsModalBody');
    if (!modalBody) {
        console.error('Application details modal body not found');
        ShowErrorMessage('지원서 세부 정보를 표시할 컨테이너를 찾을 수 없습니다.');
        return;
    }

    const availabilityHtml = application.availability.map(slot => {
        return `<div class="d-flex align-items-center mb-2">
                    <i class="bi bi-clock me-2"></i>
                    <span>${slot.date} ${slot.time}</span>
                </div>`;
    }).join('');

    const equipmentHtml = application.equipment.map(eq => `<span class="badge bg-light text-dark me-2 mb-2">${eq}</span>`).join('');

    const questionsHtml = application.questions.map(q => `
        <div class="mb-3">
            <strong class="d-block mb-1">${q.category}</strong>
            <p class="mb-0 text-muted">${q.text}</p>
        </div>
    `).join('');

    modalBody.innerHTML = `
        <div class="mb-4">
            <h5 class="mb-3"><i class="bi bi-briefcase me-2"></i>${application.order_title}</h5>
            <div class="d-flex align-items-center mb-2">
                <span class="me-3"><strong>상태:</strong> <span class="badge ${GetStatusClass(application.status)}">${GetStatusText(application.status)}</span></span>
                <span><strong>예상 완료 시간:</strong> ${application.estimated_completion}</span>
            </div>
            <p class="text-muted">지원일: ${GetTimeAgo(application.created_at)}</p>
        </div>

        <div class="mb-4">
            <h6 class="mb-3"><i class="bi bi-card-text me-2"></i>소개</h6>
            <p class="text-muted">${application.introduction}</p>
        </div>

        <div class="mb-4">
            <h6 class="mb-3"><i class="bi bi-tools me-2"></i>보유 장비</h6>
            <div>${equipmentHtml}</div>
        </div>

        <div class="mb-4">
            <h6 class="mb-3"><i class="bi bi-calendar-check me-2"></i>가능한 시간</h6>
            ${availabilityHtml}
        </div>

        <div>
            <h6 class="mb-3"><i class="bi bi-chat-left-text me-2"></i>질문</h6>
            ${questionsHtml}
        </div>
    `;

    const applicationDetailsModal = new bootstrap.Modal(document.getElementById('applicationDetailsModal'));
    applicationDetailsModal.show();

    // Add withdraw button if the application is still pending
    const modalFooter = document.querySelector('#applicationDetailsModal .modal-footer');
    if (modalFooter) {
        modalFooter.innerHTML = `
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">닫기</button>
            ${application.status === 'pending' ? '<button type="button" class="btn btn-danger" id="withdrawApplicationBtn">지원 철회</button>' : ''}
        `;

        const withdrawBtn = document.getElementById('withdrawApplicationBtn');
        if (withdrawBtn) {
            withdrawBtn.onclick = () => WithdrawApplication(application.application_id);
        }
    }
}












// Order Applications Page
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function SetupOrderApplicationsPage(params) {
    console.log('SetupOrderApplicationsPage called with params:', params);
    if (!params || !params.order) {
        console.error('Invalid params for SetupOrderApplicationsPage');
        ShowErrorMessage('Invalid order information');
        await FillTheBody('my-orders');
        return;
    }

    const order = params.order;
    currentOrderId = order.order_id;
    console.log('Current order ID set:', currentOrderId);

    const logoLink = document.getElementById('logo-link');
    if (logoLink) {
        logoLink.addEventListener('click', (e) => {
            e.preventDefault();
            FillTheBody('home');
        });
    }

    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        console.log('Back button found, setting up event listener');
        backBtn.addEventListener('click', () => FillTheBody('my-orders'));
    } else {
        console.warn('Back button not found');
    }

    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        console.log('Refresh button found, setting up event listener');
        refreshBtn.addEventListener('click', () => FetchAndDisplayApplications(currentOrderId));
    } else {
        console.warn('Refresh button not found');
    }

    // Display order info
    const orderInfoSection = document.getElementById('order-info');
    if (orderInfoSection) {
        console.log('Updating order info section');
        orderInfoSection.innerHTML = `
            <div class="card order-info-card">
                <div class="card-body">
                    <h5 class="card-title">${order.title || 'No Title'}</h5>
                    <h6 class="card-subtitle mb-2 text-muted">${order.location || 'No Location'}</h6>
                    <div class="row mt-3">
                        <div class="col-md-6">
                            <p><strong>상태:</strong> <span class="badge ${order.status === 'open' ? 'bg-success' : 'bg-danger'}">${order.status === 'open' ? '지원가능' : '마감'}</span></p>
                            <p><strong>수수료:</strong> ${order.fee === -1 ? '수수료 조정 가능' : `${Number(order.fee || 0).toLocaleString()}%`}</p>
                            <p><strong>지원자:</strong> ${order.applicants_count || 0}명</p>
                            <p><strong>등록일:</strong> ${GetTimeAgo(order.created_at)}</p>
                        </div>
                    </div>
                    <hr>
                    <h6 class="fw-bold mb-3">오더 내용</h6>
                    <p>${order.description || '상세 설명 없음'}</p>
                </div>
            </div>
        `;
    } else {
        console.error('Order info section not found');
    }

    console.log('Calling FetchAndDisplayApplications');
    await FetchAndDisplayApplications(currentOrderId);
    console.log('SetupOrderApplicationsPage completed');
}

async function FetchAndDisplayApplications(orderId) {
    console.log('FetchAndDisplayApplications called with orderId:', orderId);
    if (!orderId) {
        console.error('Invalid order ID');
        ShowErrorMessage('유효하지 않은 주문 ID입니다.');
        return;
    }

    ShowLoading();

    try {
        console.log('Making API request to fetch applications');
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

        if (!result.success || !result.applications || !Array.isArray(result.applications)) {
            throw new Error('Invalid response format: applications array not found or request unsuccessful');
        }

        console.log('Fetching order status');
        const orderStatus = await FetchOrderStatus(orderId);
        console.log('Order status:', orderStatus);

        console.log('Displaying application list');
        DisplayApplicationList(result.applications, orderStatus);
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
    const container = document.getElementById('applications-list');
    container.innerHTML = '';
    
    const isOrderClosed = orderStatus === 'closed';

    if (applications.length === 0) {
        container.innerHTML = '<p class="text-center">아직 지원서가 없습니다.</p>';
        return;
    }

    applications.forEach(application => {
        const applicationElement = document.createElement('div');
        applicationElement.className = 'application-item mb-3 p-3 border rounded';
        applicationElement.setAttribute('data-application-id', application.application_id);
        applicationElement.innerHTML = `
            <h5>${application.applicant_name || '이름 없음'}</h5>
            <p>예상 완료 시간: ${application.estimated_completion}</p>
            <p>상태: <span class="badge ${GetStatusClass(application.status)}">${GetStatusText(application.status)}</span></p>
            <button class="btn btn-primary btn-sm view-application">상세 보기</button>
        `;
        container.appendChild(applicationElement);

        // Add event listeners
        applicationElement.querySelector('.view-application').addEventListener('click', () => ShowApplicationDetails(application, isOrderClosed));
    });
}

function ShowApplicationDetails(application, isOrderClosed) {
    const modalBody = document.getElementById('applicationDetailsModalBody');
    if (!modalBody) {
        console.error('Application details modal body not found');
        ShowErrorMessage('지원서 세부 정보를 표시할 컨테이너를 찾을 수 없습니다.');
        return;
    }

    const availabilityHtml = application.availability.map(slot => {
        return `<div class="d-flex align-items-center mb-2">
                    <i class="bi bi-clock me-2"></i>
                    <span>${slot.date} ${slot.time}</span>
                </div>`;
    }).join('');

    const equipmentHtml = application.equipment.map(eq => `<span class="badge bg-light text-dark me-2 mb-2">${eq}</span>`).join('');

    const questionsHtml = application.questions.map(q => `
        <div class="mb-3">
            <strong class="d-block mb-1">${q.category}</strong>
            <p class="mb-0 text-muted">${q.text}</p>
        </div>
    `).join('');

    modalBody.innerHTML = `
        <div class="mb-4">
            <h5 class="mb-3"><i class="bi bi-person-circle me-2"></i>${application.applicant_name}</h5>
            <div class="d-flex align-items-center mb-2">
                <span class="me-3"><strong>상태:</strong> <span class="badge ${GetStatusClass(application.status)}">${GetStatusText(application.status)}</span></span>
                <span><strong>예상 완료 시간:</strong> ${application.estimated_completion}</span>
            </div>
        </div>

        <div class="mb-4">
            <h6 class="mb-3"><i class="bi bi-card-text me-2"></i>소개</h6>
            <p class="text-muted">${application.introduction}</p>
        </div>

        <div class="mb-4">
            <h6 class="mb-3"><i class="bi bi-tools me-2"></i>보유 장비</h6>
            <div>${equipmentHtml}</div>
        </div>

        <div class="mb-4">
            <h6 class="mb-3"><i class="bi bi-calendar-check me-2"></i>가능한 시간</h6>
            ${availabilityHtml}
        </div>

        <div>
            <h6 class="mb-3"><i class="bi bi-chat-left-text me-2"></i>질문</h6>
            ${questionsHtml}
        </div>
    `;

    const applicationDetailsModal = new bootstrap.Modal(document.getElementById('applicationDetailsModal'));
    applicationDetailsModal.show();

    const acceptBtn = document.getElementById('acceptApplicationBtn');
    const rejectBtn = document.getElementById('rejectApplicationBtn');

    if (acceptBtn) {
        acceptBtn.onclick = () => AcceptApplication(application.application_id);
        acceptBtn.disabled = isOrderClosed || application.status !== 'pending';
    }

    if (rejectBtn) {
        rejectBtn.onclick = () => RejectApplication(application.application_id);
        rejectBtn.disabled = isOrderClosed || application.status !== 'pending';
    }

    // Update button visibility based on application status
    const buttonContainer = document.querySelector('#applicationDetailsModal .modal-footer');
    if (buttonContainer) {
        buttonContainer.style.display = (isOrderClosed || application.status !== 'pending') ? 'none' : 'flex';
    }
}

async function AcceptApplication(applicationId) {
    console.log(`Initiating application acceptance. Application ID: ${applicationId}, Order ID: ${currentOrderId}`);
    
    if (!confirm('이 지원서를 수락하시겠습니까? 다른 모든 지원서는 자동으로 거절됩니다.')) {
        console.log('User cancelled application acceptance');
        return;
    }

    ShowLoading();
    try {
        console.log('Sending AcceptApplication request to backend');
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

        console.log('Received response from AcceptApplication endpoint:', response);

        if (!response.ok) {
            throw new Error(`Failed to accept application. Status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Parsed response body:', result);

        if (!result.success) {
            throw new Error(result.error || 'Failed to accept application');
        }

        console.log('Application accepted successfully');
        
        if (result.sendbird_channel_url) {
            console.log('Sendbird channel URL received:', result.sendbird_channel_url);
            // You might want to store this URL or use it to redirect to the chat

        }

        ShowSuccessMessage('지원서가 성공적으로 수락되었습니다.', 3000);
        
        // Update UI immediately
        console.log('Updating UI for accepted application');
        UpdateApplicationStatus(applicationId, 'accepted');
        DisableApplicationActions();
        
        // Then refresh the applications list
        console.log('Refreshing applications list');
        await FetchAndDisplayApplications(currentOrderId);
    } catch (error) {
        console.error('Error accepting application:', error);
        ShowErrorMessage('지원서 수락 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
        HideLoading();
        console.log('AcceptApplication process completed');
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

        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error || 'Failed to reject application');
        }

        ShowSuccessMessage('지원서가 성공적으로 거절되었습니다.', 3000);
        
        // Update UI immediately
        UpdateApplicationStatus(applicationId, 'rejected');
        
        // Then refresh the applications list
        await FetchAndDisplayApplications(currentOrderId);
    } catch (error) {
        console.error('Error rejecting application:', error);
        ShowErrorMessage('지원서 거절 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
        HideLoading();
    }
}

async function RejectAllApplications() {
    ShowErrorMessage('일괄 거절 기능은 아직 구현되지 않았습니다.');
}

function DisableApplicationActions() {
    const modal = document.getElementById('applicationDetailsModal');
    if (modal) {
        const acceptBtn = modal.querySelector('#acceptApplicationBtn');
        const rejectBtn = modal.querySelector('#rejectApplicationBtn');
        if (acceptBtn) acceptBtn.disabled = true;
        if (rejectBtn) rejectBtn.disabled = true;
    }
}

function UpdateApplicationStatus(applicationId, status) {
    const applicationElement = document.querySelector(`[data-application-id="${applicationId}"]`);
    if (applicationElement) {
        const statusBadge = applicationElement.querySelector('.badge');
        if (statusBadge) {
            statusBadge.textContent = GetStatusText(status);
            statusBadge.className = `badge ${GetStatusClass(status)}`;
        }
    }
    
    // Close the modal after updating the status
    const modal = bootstrap.Modal.getInstance(document.getElementById('applicationDetailsModal'));
    if (modal) {
        modal.hide();
    }
}









// Post Order Page
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function SetupPostOrderPage() {
    ShowLoading();

    // Set up event listeners
    document.getElementById('post-order-form').addEventListener('submit', SubmitOrder);
    document.getElementById('cancel-post-order').addEventListener('click', () => FillTheBody('home'));
    document.getElementById('baack-btn').addEventListener('click', () => FillTheBody('home'));

    // Populate regions and set up region change listener
    PopulateRegions();
    document.getElementById('region').addEventListener('change', (e) => { PopulateCities(e.target.value); });

    const logoLink = document.getElementById('logo-link');
    if (logoLink) {
        logoLink.addEventListener('click', (e) => {
            e.preventDefault();
            FillTheBody('home');
        });
    }

    // Set up fee type and input handling
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

    HideLoading();
}

async function SubmitOrder(event) {
    event.preventDefault();
    
    if (isSubmitting) {
        console.log('Submission already in progress');
        return;
    }
    
    if (!await CheckProfileCompleteness()) {
        ShowErrorMessage('오더를 등록하려면 프로필을 완성해야 합니다.');
        await FillTheBody('my-profile');
        ShowIncompleteProfileWarning();
        return;
    }

    console.log('SubmitOrder function called');

    const submitButton = event.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    isSubmitting = true;

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
            ShowErrorMessage('유효한 고정 수수료를 입력해주세요. (0-100 사이의 정수)');
            return;
        }
    }

    // Set fee to -1 if 'adjustable', otherwise use the input value
    const fee = feeType === 'adjustable' ? -1 : Number(feeInput.value);

    const clientOrderId = Date.now().toString() + Math.random().toString(36).slice(2, 7);

    const orderData = {
        clientOrderId,
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
        
        ShowSuccessMessage('오더가 성공적으로 제출되었습니다!');
        // Redirect to home page after a short delay
        setTimeout(() => FillTheBody('home'), 2000);
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
        ShowErrorMessage(errorMessage);
    } finally {
        submitButton.disabled = false;
        isSubmitting = false;
    }
}










// Apply For Order Page
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
function cleanupApplicationFormData() {
    localStorage.removeItem('applicationFormData');
}

function InitializeApplicationForm(orderId) {
    const user = JSON.parse(localStorage.getItem('user'));
    let applicationFormData = {
        order_id: orderId,
        applicant_id: user.user_id,
        applicantName: user.nickname || '',
        location: `${user.region || ''} ${user.city || ''}`.trim() || '',
        availability: [],
        estimated_completion: '',
        introduction: '',
        equipment: [],
        questions: [],
        currentStep: 0
    };
    localStorage.setItem('applicationFormData', JSON.stringify(applicationFormData));
    console.log('Application form data initialized:', applicationFormData);
}

async function SetupApplyForOrderPage() {
    let applicationFormData = JSON.parse(localStorage.getItem('applicationFormData'));

    if (!applicationFormData || !applicationFormData.order_id) {
        ShowErrorMessage('지원서 데이터를 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.');
        await FillTheBody('home');
        return;
    }

    const form = document.getElementById('applicationForm');
    const steps = document.querySelectorAll('.step');
    const progressBar = document.querySelector('.progress-bar');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    const backBtn = document.getElementById('back-btn');
    const logoLink = document.getElementById('logo-link');
    if (logoLink) {
        logoLink.addEventListener('click', (e) => {
            e.preventDefault();
            FillTheBody('home');
        });
    }

    let currentStep = 0;
    let calendar;

    function showStep(step) {
        steps.forEach((s, index) => {
            s.classList.toggle('active', index === step);
        });
        updateProgressBar();
        updateButtons();
    
        if (step === 1) {
            initializeCalendar();
        } else if (step === 4) {
            GenerateEquipmentCheckboxes();
        } else if (step === steps.length - 1) {
            updatePreview();
        }
    }

    function initializeCalendar() {
        if (!calendar) {
            calendar = flatpickr("#availabilityCalendar", {
                inline: true,
                mode: "multiple",
                dateFormat: "Y-m-d",
                locale: "ko",
                minDate: "today",  // Set minimum date to today
                onChange: function(selectedDates, dateStr, instance) {
                    updateAvailabilityList(selectedDates);
                },
                onReady: function(selectedDates, dateStr, instance) {
                    // Remove the readonly attribute and the flatpickr-input class
                    const calendarElement = instance.input;
                    calendarElement.parentNode.removeChild(calendarElement);
                }
            });
        }
    }

    function updateAvailabilityList(selectedDates) {
        const availabilityList = document.getElementById('availabilityList');
        const existingSelections = Array.from(availabilityList.querySelectorAll('li')).reduce((acc, li) => {
            const date = li.getAttribute('data-date');
            const times = Array.from(li.querySelectorAll('.time-slot.selected')).map(slot => slot.textContent);
            acc[date] = times;
            return acc;
        }, {});
    
        // Sort the selected dates
        selectedDates.sort((a, b) => a - b);
    
        availabilityList.innerHTML = '';
        selectedDates.forEach(date => {
            const dateString = formatDate(date);
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item';
            listItem.setAttribute('data-date', dateString);
            
            const timeOptions = ['오전', '오후', '저녁'];
            const timeSlots = timeOptions.map(time => {
                const isSelected = existingSelections[dateString] && existingSelections[dateString].includes(time);
                return `
                    <span class="time-slot ${isSelected ? 'selected' : ''}" data-time="${time}">${time}</span>
                `;
            }).join('');
    
            listItem.innerHTML = `
                <div>${dateString}</div>
                <div class="time-slots">
                    ${timeSlots}
                </div>
            `;
            availabilityList.appendChild(listItem);
        });
    
        // Add click event listeners to time slots
        availabilityList.querySelectorAll('.time-slot').forEach(slot => {
            slot.addEventListener('click', function() {
                this.classList.toggle('selected');
                saveProgress();
            });
        });
    
        saveProgress();
    }

    function formatDate(date) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('ko-KR', options);
    }

    function updateProgressBar() {
        const progress = ((currentStep + 1) / steps.length) * 100;
        progressBar.style.width = `${progress}%`;
        progressBar.setAttribute('aria-valuenow', progress);
    }

    function updateButtons() {
        prevBtn.style.display = currentStep > 0 ? 'block' : 'none';
        nextBtn.style.display = currentStep < steps.length - 1 ? 'block' : 'none';
        submitBtn.style.display = currentStep === steps.length - 1 ? 'block' : 'none';
    }

    function validateStep(step) {
        switch(step) {
            case 1: // Availability
                return ValidateAvailability();
            case 2: // Estimated Completion
                return document.getElementById('estimatedCompletion').value !== '';
            case 3: // Self-Introduction
                return document.getElementById('introduction').value.length > 0;
            default:
                return true;
        }
    }

    function saveProgress() {
        const storedData = JSON.parse(localStorage.getItem('applicationFormData'));
        
        let estimatedCompletion = estimatedCompletionSelect.value;
    
        applicationFormData = {
            ...storedData,
            applicantName: document.getElementById('applicantName').value,
            location: document.getElementById('location').value,
            availability: GetAvailabilityData(),
            estimated_completion: estimatedCompletion,
            introduction: introductionTextarea.value,
            equipment: Array.from(document.querySelectorAll('.equipment-group input[type="checkbox"]:checked')).map(cb => cb.value),
            questions: Array.from(questionTextareas.querySelectorAll('textarea')).map(ta => ({
                category: ta.dataset.category,
                text: ta.value
            })),
            currentStep: currentStep
        };
    
        // Ensure that empty string values are stored as null
        for (let key in applicationFormData) {
            if (applicationFormData[key] === '') {
                applicationFormData[key] = null;
            }
        }
    
        localStorage.setItem('applicationFormData', JSON.stringify(applicationFormData));
        // console.log('Saved application form data:', applicationFormData);
    }

    nextBtn.addEventListener('click', function() {
        if (validateStep(currentStep)) {
            if (currentStep < steps.length - 1) {
                currentStep++;
                showStep(currentStep);
                saveProgress();
            }
        } else {
            ShowErrorMessage('모든 필수 항목을 작성해주세요.');
        }
    });

    prevBtn.addEventListener('click', function() {
        if (currentStep > 0) {
            currentStep--;
            showStep(currentStep);
        }
    });

    window.addEventListener('beforeunload', cleanupApplicationFormData);

    backBtn.addEventListener('click', async () => {
        cleanupApplicationFormData();
        await FillTheBody('home');
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (validateAllSteps()) {
            await SubmitApplication();
        } else {
            ShowErrorMessage('모든 필수 항목을 작성해주세요.');
        }
    });

    // New event listeners for improved form elements
    const estimatedCompletionSelect = document.getElementById('estimatedCompletion');
    const introductionTextarea = document.getElementById('introduction');
    const introductionCharCount = document.getElementById('introductionCharCount');
    const questionCategory = document.getElementById('questionCategory');
    const questionTextareas = document.getElementById('questionTextareas');
    const selectedCategories = new Set();

    introductionTextarea.addEventListener('input', function() {
        const currentLength = this.value.length;
        introductionCharCount.textContent = currentLength;
        if (currentLength > 500) {
            this.value = this.value.slice(0, 500);
            introductionCharCount.textContent = 500;
        }
    });

    questionCategory.addEventListener('change', function() {
        const category = this.value;
        if (category && !selectedCategories.has(category)) {
            const textarea = document.createElement('textarea');
            textarea.className = 'form-control mt-2';
            textarea.rows = 3;
            textarea.placeholder = `${this.options[this.selectedIndex].text}에 대한 질문을 입력해주세요.`;
            textarea.dataset.category = category;

            const wrapper = document.createElement('div');
            wrapper.className = 'mb-3 question-wrapper';
            
            const label = document.createElement('label');
            label.textContent = this.options[this.selectedIndex].text;
            label.className = 'form-label';

            const removeBtn = document.createElement('button');
            removeBtn.textContent = '삭제';
            removeBtn.className = 'btn btn-sm btn-outline-danger ms-2';
            removeBtn.type = 'button';
            removeBtn.addEventListener('click', function() {
                wrapper.remove();
                selectedCategories.delete(category);
                questionCategory.querySelector(`option[value="${category}"]`).disabled = false;
                saveProgress();
            });

            wrapper.appendChild(label);
            wrapper.appendChild(removeBtn);
            wrapper.appendChild(textarea);

            questionTextareas.appendChild(wrapper);
            selectedCategories.add(category);
            this.querySelector(`option[value="${category}"]`).disabled = true;
            this.selectedIndex = 0;
            saveProgress();
        }
    });

    function loadProgress() {
        const applicationFormData = JSON.parse(localStorage.getItem('applicationFormData'));
        console.log('Loaded application form data:', applicationFormData);
        if (applicationFormData) {
            // Populate form fields with saved data
            document.getElementById('applicantName').value = applicationFormData.applicantName || '';
            document.getElementById('location').value = applicationFormData.location || '';
    
            // Availability
            if (applicationFormData.availability && applicationFormData.availability.length > 0) {
                initializeCalendar();
                const dates = applicationFormData.availability.map(a => new Date(a.date));
                dates.sort((a, b) => a - b); // Sort the dates
                calendar.setDate(dates);
                updateAvailabilityList(dates);
            }
    
            // Estimated completion
            const estimatedCompletionSelect = document.getElementById('estimatedCompletion');
            estimatedCompletionSelect.value = applicationFormData.estimated_completion || '';
    
            // Introduction
            document.getElementById('introduction').value = applicationFormData.introduction || '';
            document.getElementById('introductionCharCount').textContent = applicationFormData.introduction ? applicationFormData.introduction.length : '0';
    
            // Equipment
            if (applicationFormData.equipment) {
                applicationFormData.equipment.forEach(eq => {
                    const checkbox = document.querySelector(`input[type="checkbox"][value="${eq}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }
    
            // Questions
            if (applicationFormData.questions) {
                const questionTextareas = document.getElementById('questionTextareas');
                applicationFormData.questions.forEach(q => {
                    const wrapper = document.createElement('div');
                    wrapper.className = 'mb-3 question-wrapper';
                    
                    const label = document.createElement('label');
                    label.textContent = questionCategory.querySelector(`option[value="${q.category}"]`).text;
                    label.className = 'form-label';

                    const removeBtn = document.createElement('button');
                    removeBtn.textContent = '삭제';
                    removeBtn.className = 'btn btn-sm btn-outline-danger ms-2';
                    removeBtn.type = 'button';
                    removeBtn.addEventListener('click', function() {
                        wrapper.remove();
                        selectedCategories.delete(q.category);
                        questionCategory.querySelector(`option[value="${q.category}"]`).disabled = false;
                        saveProgress();
                    });

                    const textarea = document.createElement('textarea');
                    textarea.className = 'form-control mt-2';
                    textarea.rows = 3;
                    textarea.value = q.text;
                    textarea.dataset.category = q.category;

                    wrapper.appendChild(label);
                    wrapper.appendChild(removeBtn);
                    wrapper.appendChild(textarea);

                    questionTextareas.appendChild(wrapper);
                    selectedCategories.add(q.category);
                    questionCategory.querySelector(`option[value="${q.category}"]`).disabled = true;
                });
            }
    
            // Set current step
            currentStep = applicationFormData.currentStep || 0;
            showStep(currentStep);
    
            // Update progress bar
            updateProgressBar();
        }
    }

    function validateAllSteps() {
        for (let i = 0; i < steps.length - 1; i++) {
            if (!validateStep(i)) {
                return false;
            }
        }
        return true;
    }

    function editSection(sectionId) {
        const steps = document.querySelectorAll('.step');
        const targetStep = Array.from(steps).findIndex(step => step.id === sectionId);
        if (targetStep !== -1) {
            currentStep = targetStep;
            showStep(currentStep);
        }
    }

    function updatePreview() {
        const previewContent = document.getElementById('previewContent');
        const applicantName = document.getElementById('applicantName').value;
        const location = document.getElementById('location').value;
        const estimatedCompletion = document.getElementById('estimatedCompletion').value;
        const introduction = document.getElementById('introduction').value;
        const equipmentChecked = Array.from(document.querySelectorAll('.equipment-group input[type="checkbox"]:checked')).map(cb => cb.value);
        const questions = Array.from(document.querySelectorAll('#questionTextareas textarea')).map(ta => ({
            category: ta.dataset.category,
            text: ta.value
        }));
    
        const availabilityHtml = GetAvailabilityData().map(slot => {
            return `<div class="d-flex align-items-center mb-2">
                        <i class="bi bi-clock me-2"></i>
                        <span>${slot.date} ${slot.time}</span>
                    </div>`;
        }).join('');
    
        const equipmentHtml = equipmentChecked.map(eq => `<span class="badge bg-light text-dark me-2 mb-2">${eq}</span>`).join('');

        const questionsHtml = questions.map(q => `
            <div class="mb-3">
                <strong class="d-block mb-1">${q.category}</strong>
                <p class="mb-0 text-muted">${q.text}</p>
            </div>
        `).join('');
    
        previewContent.innerHTML = `
            <div class="mb-4">
                <h5 class="mb-3"><i class="bi bi-person-circle me-2"></i>${applicantName}</h5>
                <div class="d-flex align-items-center mb-2">
                    <span class="me-3"><strong>지역:</strong> ${location}</span>
                </div>
            </div>

            <div class="mb-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h6 class="mb-0"><i class="bi bi-calendar-check me-2"></i>가능한 시간</h6>
                    <button class="btn btn-sm btn-outline-primary edit-section" data-section="step2">수정</button>
                </div>
                ${availabilityHtml}
            </div>
    
            <div class="mb-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h6 class="mb-0"><i class="bi bi-clock-history me-2"></i>예상 완료 시간</h6>
                    <button class="btn btn-sm btn-outline-primary edit-section" data-section="step3">수정</button>
                </div>
                <p class="text-muted">${estimatedCompletion}</p>
            </div>

            <div class="mb-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h6 class="mb-0"><i class="bi bi-card-text me-2"></i>소개</h6>
                    <button class="btn btn-sm btn-outline-primary edit-section" data-section="step4">수정</button>
                </div>
                <p class="text-muted">${introduction}</p>
            </div>
    
            <div class="mb-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h6 class="mb-0"><i class="bi bi-tools me-2"></i>보유 장비</h6>
                    <button class="btn btn-sm btn-outline-primary edit-section" data-section="step5">수정</button>
                </div>
                <div>${equipmentHtml}</div>
            </div>
    
            ${questions.length > 0 ? `
                <div>
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h6 class="mb-0"><i class="bi bi-chat-left-text me-2"></i>질문</h6>
                        <button class="btn btn-sm btn-outline-primary edit-section" data-section="step5">수정</button>
                    </div>
                    ${questionsHtml}
                </div>
            ` : ''}
        `;
    
        // Add event listeners to all edit buttons
        const editButtons = previewContent.querySelectorAll('.edit-section');
        editButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const sectionId = this.getAttribute('data-section');
                editSection(sectionId);
            });
        });
    }

    // Initialize the form
    loadProgress();
    showStep(currentStep);

    // Add autosave on input changes
    form.addEventListener('input', saveProgress);
}

function ValidateAvailability() {
    const availabilityList = document.getElementById('availabilityList');
    const availabilitySlots = availabilityList.querySelectorAll('li');
    const errorElement = document.getElementById('availabilityError');

    if (availabilitySlots.length === 0) {
        errorElement.textContent = '최소 하나의 작업 가능 일정을 선택해주세요.';
        errorElement.style.display = 'block';
        return false;
    }

    let isValid = true;
    availabilitySlots.forEach((slot, index) => {
        const selectedTimeSlots = slot.querySelectorAll('.time-slot.selected');

        if (selectedTimeSlots.length === 0) {
            isValid = false;
            errorElement.textContent = `${index + 1}번째 일정의 시간을 최소 하나 선택해주세요.`;
            errorElement.style.display = 'block';
        }
    });

    if (isValid) {
        errorElement.style.display = 'none';
    }

    return isValid;
}

function GetAvailabilityData() {
    const availabilityList = document.getElementById('availabilityList');
    return Array.from(availabilityList.querySelectorAll('li')).flatMap(slot => {
        const date = slot.getAttribute('data-date');
        const times = Array.from(slot.querySelectorAll('.time-slot.selected')).map(timeSlot => timeSlot.textContent);
        return times.map(time => ({ date, time }));
    });
}

function GenerateEquipmentCheckboxes() {
    const equipmentContainer = document.querySelector('.equipment-group');
    equipmentContainer.innerHTML = ''; // Clear existing content

    // Create a row to hold our two columns
    const row = document.createElement('div');
    row.className = 'row g-2';

    // Get current selections from applicationFormData
    const applicationFormData = JSON.parse(localStorage.getItem('applicationFormData'));
    const selectedEquipment = applicationFormData?.equipment || [];

    equipmentGroups.forEach((group, groupIndex) => {
        const col = document.createElement('div');
        col.className = 'col-6';

        const groupDiv = document.createElement('div');
        groupDiv.className = 'card h-100';
        
        const groupHeader = document.createElement('div');
        groupHeader.className = 'card-header clickable';
        groupHeader.id = `heading${groupIndex}`;
        groupHeader.setAttribute('data-bs-toggle', 'collapse');
        groupHeader.setAttribute('data-bs-target', `#collapse${groupIndex}`);
        groupHeader.setAttribute('aria-expanded', 'false');
        groupHeader.setAttribute('aria-controls', `collapse${groupIndex}`);

        const groupTitle = document.createElement('h5');
        groupTitle.className = 'mb-0';
        groupTitle.textContent = group.name;

        groupHeader.appendChild(groupTitle);
        groupDiv.appendChild(groupHeader);

        const collapseDiv = document.createElement('div');
        collapseDiv.id = `collapse${groupIndex}`;
        collapseDiv.className = 'collapse';
        collapseDiv.setAttribute('aria-labelledby', `heading${groupIndex}`);

        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';

        group.options.forEach((option, index) => {
            const checkboxDiv = document.createElement('div');
            checkboxDiv.className = 'form-check';

            const input = document.createElement('input');
            input.className = 'form-check-input';
            input.type = 'checkbox';
            input.value = option;
            input.id = `equipment-${group.name.replace(/\s+/g, '-')}-${index}`;
            input.setAttribute('aria-label', option);
            
            if (selectedEquipment.includes(option)) {
                input.checked = true;
            }

            const label = document.createElement('label');
            label.className = 'form-check-label';
            label.htmlFor = input.id;
            label.textContent = option;

            checkboxDiv.appendChild(input);
            checkboxDiv.appendChild(label);
            cardBody.appendChild(checkboxDiv);
        });

        collapseDiv.appendChild(cardBody);
        groupDiv.appendChild(collapseDiv);
        col.appendChild(groupDiv);
        row.appendChild(col);
    });

    equipmentContainer.appendChild(row);

    // Expand the first group with a selected item
    const collapsibles = equipmentContainer.querySelectorAll('.collapse');
    collapsibles.forEach((collapse, index) => {
        const hasCheckedItems = collapse.querySelector('input:checked');
        if (hasCheckedItems) {
            collapse.classList.add('show');
            const header = collapse.previousElementSibling;
            header.setAttribute('aria-expanded', 'true');
            return false; // Break the loop after expanding the first group with checked items
        }
    });
}


async function SubmitApplication() {
    if (!await CheckProfileCompleteness()) {
        ShowErrorMessage('오더를 지원하려면 프로필을 완성해야 합니다.');
        await FillTheBody('my-profile');
        ShowIncompleteProfileWarning();
        return;
    }

    const applicationFormData = JSON.parse(localStorage.getItem('applicationFormData'));

    if (!applicationFormData || !applicationFormData.order_id) {
        ShowErrorMessage('애플리케이션 데이터가 존재하지 않습니다.');
        await FillTheBody('home');
        return;
    }

    if (!ValidateAvailability()) {
        ShowErrorMessage('최소 하나의 작업 가능 일정을 추가해주세요.');
        return;
    }

    try {
        ShowLoading();

        const response = await MakeAuthenticatedRequest('https://69qcfumvgb.execute-api.ap-southeast-2.amazonaws.com/SubmitApplication', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(applicationFormData)
        });

        const result = await response.json();

        if (response.ok) {
            ShowSuccessMessage('지원이 성공적으로 제출되었습니다.', 3000);
            cleanupApplicationFormData();
            await FillTheBody('home');
        } else if (response.status === 400 && result.message === 'You have already applied to this order.') {
            ShowErrorMessage('이미 이 오더에 지원하셨습니다.', 3000);
            await FillTheBody('home');
        } else {
            throw new Error(result.error || result.message || '지원 제출에 실패했습니다.');
        }
    } catch (error) {
        console.error('Error submitting application:', error);
        ShowErrorMessage('지원 제출 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
        HideLoading();
    }
}


















// Utility Functions
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
function CreateLoadingIndicator() {
    if (!loadingIndicator) {
      loadingIndicator = document.createElement('div');
      loadingIndicator.innerHTML = loadingIndicatorHTML;
  
      const style = document.createElement('style');
      style.textContent = loadingIndicatorCSS;
      document.head.appendChild(style);
    }
    return loadingIndicator;
  }
  
function ShowLoading() {
    const indicator = CreateLoadingIndicator();
    document.body.appendChild(indicator);
}
  
function HideLoading() {
    if (loadingIndicator && document.body.contains(loadingIndicator)) {
        document.body.removeChild(loadingIndicator);
    }
}

function ShowErrorMessage(message, duration = 5000) {
    showMessage(message, duration, '#ff6b6b');
}

function ShowSuccessMessage(message, duration = 5000) {
    showMessage(message, duration, '#28a745');
}

function showMessage(message, duration, backgroundColor) {
    // Create message container
    const messageContainer = document.createElement('div');
    messageContainer.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: ${backgroundColor};
        color: white;
        padding: 15px 25px;
        border-radius: 5px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        transition: opacity 0.5s ease-in-out;
        text-align: center;
        max-width: 80%;
    `;

    // Create message text
    const messageText = document.createElement('p');
    messageText.style.margin = '0';
    messageText.style.fontSize = '16px';
    messageText.style.lineHeight = '1.4';
    messageText.textContent = message;

    // Append message to container
    messageContainer.appendChild(messageText);

    // Append container to body
    document.body.appendChild(messageContainer);

    // Set a timeout to remove the message
    setTimeout(() => {
        messageContainer.style.opacity = '0';
        setTimeout(() => {
            if (document.body.contains(messageContainer)) {
                document.body.removeChild(messageContainer);
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

function GetStatusText(status) {
    switch (status) {
        case 'pending': return '대기중';
        case 'accepted': return '수락됨';
        case 'rejected': return '거절됨';
        default: return '알 수 없음';
    }
}

function GetStatusClass(status) {
    switch (status) {
        case 'pending': return 'bg-secondary';
        case 'accepted': return 'bg-success';
        case 'rejected': return 'bg-danger';
        default: return 'bg-secondary';
    }
}



































// User Login Info button
    // const loginInfoBtn = document.getElementById('user-login-info-btn');
    // if (loginInfoBtn) {
    //     loginInfoBtn.addEventListener('click', async () => {
    //         
    //         try {
    //             await FillTheBody('user-login-info');
    //         } catch (error) {
    //             console.error('Error loading user login info:', error);
    //             ShowErrorMessage('유저 정보 불러오기에 실패했습니다. 다시 시도해주세요.');
    //         } finally {
    //             
    //         }
    //     });
    // }