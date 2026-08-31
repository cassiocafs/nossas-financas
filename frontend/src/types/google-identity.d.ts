interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleIdInitializeConfig {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  nonce?: string;
}

interface GooglePromptMomentNotification {
  isNotDisplayed(): boolean;
  isSkippedMoment(): boolean;
  isDismissedMoment(): boolean;
}

interface GoogleAccountsId {
  initialize(config: GoogleIdInitializeConfig): void;
  prompt(callback?: (notification: GooglePromptMomentNotification) => void): void;
}

interface Window {
  google?: {
    accounts: {
      id: GoogleAccountsId;
    };
  };
}
