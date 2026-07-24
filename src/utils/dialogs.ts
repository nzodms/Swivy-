import { Alert, Platform } from 'react-native';

/**
 * Dialogues cross-platform : Alert natif sur iOS/Android,
 * confirm/alert du navigateur sur le web (Alert y est silencieux).
 */

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
}

export function confirmDialog({ title, message, confirmLabel, destructive = false, onConfirm }: ConfirmOptions): void {
  if (Platform.OS === 'web') {
     
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Annuler', style: 'cancel' },
    { text: confirmLabel, style: destructive ? 'destructive' : 'default', onPress: onConfirm },
  ]);
}

export function infoDialog(title: string, message: string): void {
  if (Platform.OS === 'web') {
     
    window.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
}
