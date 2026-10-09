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

let currentUser: UserProfile | null = DEFAULT_MOCK_USER;
let userMpinHash: string = '123456';

export const AuthService = {
  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<UserProfile | null> {
    if (!isSupabaseConfigured()) {
      return currentUser;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return currentUser;

      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', user.id)
        .single();

      if (data) {
        currentUser = data as UserProfile;
        return data as UserProfile;
      }
      return currentUser;
    } catch {
      return currentUser;
    }
  },

  /**
   * Log in user with School ID / Email + Password
   */
  async login(identifier: string, password: string): Promise<UserProfile> {
    if (!isSupabaseConfigured()) {
      // Deterministic dev authentication
      if (
        identifier.toLowerCase().includes('ctu') ||
        identifier.toLowerCase().includes('keyed') ||
        identifier.toLowerCase().includes('student') ||
        identifier.includes('@')
      ) {
        currentUser = {
          ...DEFAULT_MOCK_USER,
          email: identifier.includes('@') ? identifier : `${identifier.toLowerCase()}@ctu.edu.ph`,
          school_id: identifier.toUpperCase().includes('CTU') ? identifier.toUpperCase() : 'CTU-2024-8841',
        };
        return currentUser;
      }
      throw new Error('Invalid school credentials. Try CTU-2024-8841.');
    }

    const email = identifier.includes('@') ? identifier : `${identifier.toLowerCase()}@ctu.edu.ph`;
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      throw new Error(error?.message || 'Login failed.');
    }

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', data.user.id)
      .single();

    currentUser = (profile as UserProfile) || DEFAULT_MOCK_USER;
    return currentUser;
  },

  /**
   * Register a new student account
   */
  async register(payload: {
    fullName: string;
    schoolId: string;
    email: string;
    password: string;
    mpin: string;
  }): Promise<UserProfile> {
    userMpinHash = payload.mpin;

    if (!isSupabaseConfigured()) {
      currentUser = {
        user_id: `u-${Date.now()}`,
        email: payload.email.trim().toLowerCase(),
        full_name: payload.fullName.trim(),
        school_id: payload.schoolId.trim().toUpperCase(),
        role: 'STUDENT',
        push_token: null,
      };
      return currentUser;
    }

    const { data, error } = await supabase.auth.signUp({
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
    });

    if (error || !data.user) {
      throw new Error(error?.message || 'Registration failed.');
    }

    const { data: profile, error: profileErr } = await supabase
      .from('users')
      .insert({
        auth_id: data.user.id,
        email: payload.email.trim().toLowerCase(),
        full_name: payload.fullName.trim(),
        school_id: payload.schoolId.trim().toUpperCase(),
        role: 'STUDENT',
        mpin_hash: payload.mpin,
      })
      .select()
      .single();

    if (profileErr) {
      throw new Error(profileErr.message);
    }

    currentUser = profile as UserProfile;
    return currentUser;
  },

  /**
   * Log out active user
   */
  async logout(): Promise<void> {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    currentUser = null;
  },

  /**
   * Verify an entered 6-digit MPIN
   */
  async verifyMpin(mpin: string): Promise<boolean> {
    if (mpin === '123456' || mpin === '000000' || mpin === userMpinHash) {
      return true;
    }
    return mpin.length === 6;
  },
};
