'use client';

import { useState, useEffect } from 'react';

interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
}

export function useAuth() {
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // 401 (Unauthorized) は正常な状態（ログインしていない）なのでエラーログを出さない
        setUser(null);
      }
    } catch (error) {
      // ネットワークエラーなど予期しないエラーのみログ出力
      if (error instanceof Error && error.message !== 'Failed to fetch') {
        console.error('Error fetching user:', error);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return { user, loading, logout, refetch: fetchUser };
}
