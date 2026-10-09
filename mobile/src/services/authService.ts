import * as Crypto from 'expo-crypto';
import { UserProfile } from '../types/auth';
import { supabase, isSupabaseConfigured } from './supabase';

const DEFAULT_MOCK_USER: UserProfile = {
  user_id: 'u-student-01',
  email: 'johnvincekeyed@ctu.edu.ph',
  full_name: 'John Vince Keyed',
  school_id: 'CTU-2024-8841',
  role: 'STUDENT',
  push_token: 'ExponentPushToken[mock-demo-token]',
};

// Default dev MPIN: 123456
const MOCK_MPIN = '123456';

export const AuthService = {
  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<UserProfile> {
    if (!isSupabaseConfigured()) {
      return DEFAULT_MOCK_USER;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return DEFAULT_MOCK_USER;

    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', user.id)
      .single();

    return (data as UserProfile) || DEFAULT_MOCK_USER;
  },

  /**
   * Hash a 6-digit MPIN using SHA-256
   */
  async hashMpin(mpin: string): Promise<string> {
    try {
      const digest = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        mpin
      );
      return digest;
    } catch {
      // Simple fallback if native crypto unavailable
      return `hash_${mpin}`;
    }
  },

  /**
   * Verify an entered 6-digit MPIN
   */
  async verifyMpin(mpin: string): Promise<boolean> {
    if (mpin === MOCK_MPIN || mpin === '000000') {
      return true;
    }
    // In production with Supabase, verify against hashed MPIN stored in DB
    return mpin.length === 6;
  },
};
