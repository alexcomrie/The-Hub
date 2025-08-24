import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const DEVICE_ID_KEY = 'thehub_device_id';

export const useDeviceId = () => {
  const [deviceId, setDeviceId] = useState<string>('');

  useEffect(() => {
    // Try to get existing device ID from localStorage
    let storedDeviceId = localStorage.getItem(DEVICE_ID_KEY);

    // If no device ID exists, create a new one
    if (!storedDeviceId) {
      storedDeviceId = uuidv4();
      localStorage.setItem(DEVICE_ID_KEY, storedDeviceId);
    }

    setDeviceId(storedDeviceId);
  }, []);

  return deviceId;
};