import { firebaseConfig, firebaseVapidKey } from "../utils/constants";

export async function GetDeviceToken() {
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