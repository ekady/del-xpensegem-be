import { ConfigService } from '@nestjs/config';
import { credential } from 'firebase-admin';
import { initializeApp } from 'firebase-admin/app';

export const setupFirebase = (config: ConfigService) => {
  const privateKey = JSON.parse(config.get<string>('FIREBASE_PRIVATE_KEY'));
  const credentialJson = JSON.parse(config.get<string>('FIREBASE_JSON'));
  credentialJson.private_key = privateKey.private_key?.replace(/\\n/g, '\n');

  initializeApp({
    credential: credential.cert(credentialJson),
  });
};
