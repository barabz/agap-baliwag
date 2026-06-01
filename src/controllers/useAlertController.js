import { useState } from 'react';
import { initialAlerts } from '../models/alertModel';

export const useAlertController = () => {
  const [alerts, setAlerts] = useState(initialAlerts);

  const assignTeam = (alertId) => {
    // Logic for Team Formation (Path A in your diagram)
    console.log(`Assigning team to alert: ${alertId}`);
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'Dispatching' } : a));
  };

  return { alerts, assignTeam };
};